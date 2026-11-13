import { Order, Product, Coupon } from '../models';
import { emitEvent } from '../config/socket';
import { emailService } from './emailService';

export const orderService = {
  async createOrder(userId: string, data: { items: any[]; shippingAddress: any; paymentMethod?: string; couponCode?: string }) {
    const { items, shippingAddress, paymentMethod, couponCode } = data;

    if (!items || items.length === 0) {
      const error: any = new Error('Your cart is empty.');
      error.statusCode = 400;
      throw error;
    }
    if (!shippingAddress) {
      const error: any = new Error('Shipping address is required.');
      error.statusCode = 400;
      throw error;
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        const error: any = new Error('Product not found.');
        error.statusCode = 400;
        throw error;
      }
      if (product.stock < item.quantity) {
        const error: any = new Error(`Product "${product.name}" has insufficient stock (available: ${product.stock}).`);
        error.statusCode = 400;
        throw error;
      }

      const itemPrice = product.price;
      const itemQuantity = parseInt(item.quantity.toString());
      subtotal += itemPrice * itemQuantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: itemPrice,
        image: product.image,
        quantity: itemQuantity,
        color: item.color || undefined,
        size: item.size || undefined
      });
    }

    // Apply Coupon if supplied
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isDeleted: false });
      const now = new Date();
      if (coupon && now >= coupon.startDate && now <= coupon.endDate && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        if (discountAmount > subtotal) discountAmount = subtotal;

        // Increase coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        appliedCoupon = coupon.code;
      }
    }

    const shippingFee = subtotal > 1000000 ? 0 : 30000;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      userId,
      shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      items: orderItems as any,
      totalAmount,
      statusHistory: [{ status: 'pending', timestamp: new Date(), note: `Order placed successfully.${appliedCoupon ? ` (Coupon: ${appliedCoupon})` : ''}` }]
    } as any);

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image');

    const obj = populatedOrder ? (populatedOrder as any).toObject() : order.toObject();
    const result = {
      ...obj,
      id: obj._id
    };

    // Real-time broadcast and email notification
    emitEvent('order:created', result);
    if (populatedOrder && (populatedOrder as any).userId?.email) {
      emailService.sendOrderConfirmation({
        orderId: obj._id.toString(),
        customerEmail: (populatedOrder as any).userId.email,
        customerName: (populatedOrder as any).userId.name || 'Valued Customer',
        totalAmount: obj.totalAmount,
        items: obj.items,
        shippingAddress: obj.shippingAddress
      });
    }

    return result;
  },

  async getMyOrders(userId: string) {
    const orders = await Order.find({ userId: userId as any })
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });

    return orders.map(order => {
      const obj = order.toObject();
      return {
        ...obj,
        id: obj._id
      };
    });
  },

  async getOrderById(id: string, userId: string, userRole: string) {
    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image');

    if (!order) {
      const error: any = new Error('Order does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (order.userId.toString() !== userId.toString() && userRole !== 'admin') {
      const error: any = new Error('You do not have permission to view this order.');
      error.statusCode = 403;
      throw error;
    }

    const obj = order.toObject();
    return {
      ...obj,
      id: obj._id
    };
  },

  async getAllOrders() {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });

    return orders.map(order => {
      const obj = order.toObject();
      return {
        ...obj,
        id: obj._id,
        user: obj.userId
      };
    });
  },

  async updateOrderStatus(id: string, status?: string, paymentStatus?: string) {
    const order = await Order.findById(id);
    if (!order) {
      const error: any = new Error('Order does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = order.status;

    if (status) {
      order.status = status as any;
      order.statusHistory.push({ status: status as any, timestamp: new Date(), note: 'Status updated by Admin.' });

      if (status === 'completed' || status === 'shipping') {
        order.paymentStatus = 'paid';
      }

      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      } else if (previousStatus === 'cancelled' && status !== 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus as any;
    }

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image');

    const obj = populatedOrder ? (populatedOrder as any).toObject() : order.toObject();
    const result = {
      ...obj,
      id: obj._id,
      user: obj.userId
    };

    emitEvent('order:updated', result);
    if (populatedOrder && (populatedOrder as any).userId?.email && status) {
      emailService.sendOrderStatusUpdate((populatedOrder as any).userId.email, obj._id.toString(), status);
    }

    return result;
  },

  async cancelOrder(id: string, userId: string) {
    const order = await Order.findById(id);
    if (!order) {
      const error: any = new Error('Order does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (order.userId.toString() !== userId.toString()) {
      const error: any = new Error('You do not have permission to cancel this order.');
      error.statusCode = 403;
      throw error;
    }

    if (order.status !== 'pending') {
      const error: any = new Error(`Cannot cancel order in "${order.status}" status.`);
      error.statusCode = 400;
      throw error;
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: 'Order cancelled by customer.' });

    // Restock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image');

    const obj = populatedOrder ? (populatedOrder as any).toObject() : order.toObject();
    const result = {
      ...obj,
      id: obj._id
    };

    // Real-time broadcast and email notification
    emitEvent('order:cancelled', result);
    if (populatedOrder && (populatedOrder as any).userId?.email) {
      emailService.sendOrderStatusUpdate((populatedOrder as any).userId.email, obj._id.toString(), 'cancelled');
    }

    return result;
  }
};
