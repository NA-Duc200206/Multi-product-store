import crypto from 'crypto';
import qs from 'qs';
import { Order, Product } from '../models';

function sortObject(obj: any) {
  const sorted: any = {};
  const str: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
  }
  return sorted;
}

function generateHmacSha512(secret: string, data: string) {
  const hmac = crypto.createHmac('sha512', secret);
  return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
}

function getVnpayDateFormat(date: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1).toString() +
    pad(date.getDate()).toString() +
    pad(date.getHours()).toString() +
    pad(date.getMinutes()).toString() +
    pad(date.getSeconds()).toString()
  );
}

export const paymentService = {
  async createPaymentUrl(orderId: string, ipAddr: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error: any = new Error('Order does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (order.paymentStatus === 'paid') {
      const error: any = new Error('This order has already been paid.');
      error.statusCode = 400;
      throw error;
    }

    const tmnCode = process.env.VNPAY_TMN_CODE || 'mock_tmn_code';
    const secretKey = process.env.VNPAY_HASH_SECRET || 'mock_hash_secret';
    const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment-result';

    const date = new Date();
    const createDate = getVnpayDateFormat(date);
    const txnRef = `${order._id}-${date.getTime()}`;

    order.vnpayTxnRef = txnRef;
    await order.save();

    const amount = Math.round(order.totalAmount * 100);

    let cleanIp = ipAddr || '127.0.0.1';
    if (typeof cleanIp === 'string' && cleanIp.includes('::ffff:')) {
      cleanIp = cleanIp.replace('::ffff:', '');
    }

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'en';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = `Payment for order #${order._id}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = Array.isArray(cleanIp) ? cleanIp[0] : cleanIp;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const secureHash = generateHmacSha512(secretKey, signData);

    vnp_Params['vnp_SecureHash'] = secureHash;
    const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  },

  async verifyPayment(queryParams: any) {
    let vnp_Params = { ...queryParams };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNPAY_HASH_SECRET || 'mock_hash_secret';
    const signData = qs.stringify(vnp_Params, { encode: false });
    const checkHash = generateHmacSha512(secretKey, signData);

    if (secureHash !== checkHash) {
      const error: any = new Error('Checksum verification failed.');
      error.statusCode = 400;
      throw error;
    }

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const orderId = txnRef.split('-')[0];

    const order = await Order.findById(orderId);
    if (!order) {
      const error: any = new Error('Corresponding order not found.');
      error.statusCode = 404;
      throw error;
    }

    if (responseCode === '00') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.statusHistory.push({ status: 'confirmed', timestamp: new Date(), note: 'Payment verified via frontend callback.' });
      await order.save();
      return { success: true, orderId: order._id, message: 'Payment completed successfully.' };
    } else {
      if (order.status !== 'cancelled') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: `Payment failed (VNPAY code: ${responseCode}).` });
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }
      return { success: false, orderId: order._id, message: 'Payment failed.' };
    }
  },

  async handleIpn(queryParams: any) {
    let vnp_Params = { ...queryParams };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNPAY_HASH_SECRET || 'mock_hash_secret';
    const signData = qs.stringify(vnp_Params, { encode: false });
    const checkHash = generateHmacSha512(secretKey, signData);

    if (secureHash !== checkHash) {
      return { RspCode: '97', Message: 'Checksum failed' };
    }

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const orderId = txnRef.split('-')[0];

    const order = await Order.findById(orderId);
    if (!order) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    const callbackAmount = parseInt(vnp_Params['vnp_Amount']);
    const dbAmount = Math.round(order.totalAmount * 100);
    if (callbackAmount !== dbAmount) {
      return { RspCode: '04', Message: 'Amount invalid' };
    }

    if (order.paymentStatus === 'paid') {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    if (responseCode === '00') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.statusHistory.push({ status: 'confirmed', timestamp: new Date(), note: 'Payment verified via IPN callback.' });
      await order.save();
    } else {
      if (order.status !== 'cancelled') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: `Payment failed via IPN callback (code: ${responseCode}).` });
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }
    }

    return { RspCode: '00', Message: 'Confirm Success' };
  }
};
