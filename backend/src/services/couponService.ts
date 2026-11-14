import { Coupon } from '../models';

export const couponService = {
  async getActiveCoupons() {
    const now = new Date();
    return Coupon.find({
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    }).select('-__v');
  },

  async validateCoupon(code: string, orderAmount: number, userId?: string) {
    if (!code) {
      const error: any = new Error('Please enter a coupon code.');
      error.statusCode = 400;
      throw error;
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isDeleted: false });

    if (!coupon) {
      const error: any = new Error('Coupon code does not exist or has been removed.');
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();
    if (now < coupon.startDate) {
      const error: any = new Error('Coupon is not yet active.');
      error.statusCode = 400;
      throw error;
    }

    if (now > coupon.endDate) {
      const error: any = new Error('Coupon has expired.');
      error.statusCode = 400;
      throw error;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      const error: any = new Error('Coupon usage limit has been reached.');
      error.statusCode = 400;
      throw error;
    }

    if (orderAmount < coupon.minOrderAmount) {
      const error: any = new Error(`Order minimum of ${coupon.minOrderAmount.toLocaleString('vi-VN')} ₫ required for this coupon.`);
      error.statusCode = 400;
      throw error;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount
      }
    };
  },

  async getAll() {
    return Coupon.find({ isDeleted: false }).sort({ createdAt: -1 });
  },

  async create(data: any) {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, perUserLimit } = data;

    if (!code || !discountType || discountValue === undefined) {
      const error: any = new Error('Coupon code, discount type, and value are required.');
      error.statusCode = 400;
      throw error;
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase(), isDeleted: false });
    if (existing) {
      const error: any = new Error('A coupon with this code already exists.');
      error.statusCode = 400;
      throw error;
    }

    return Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: Number(usageLimit) || 100,
      perUserLimit: Number(perUserLimit) || 1
    });
  },

  async update(id: string, data: any) {
    const coupon = await Coupon.findById(id);
    if (!coupon || coupon.isDeleted) {
      const error: any = new Error('Coupon not found.');
      error.statusCode = 404;
      throw error;
    }

    if (data.code) coupon.code = data.code.trim().toUpperCase();
    if (data.discountType) coupon.discountType = data.discountType;
    if (data.discountValue !== undefined) coupon.discountValue = Number(data.discountValue);
    if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Number(data.minOrderAmount);
    if (data.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined;
    if (data.startDate) coupon.startDate = new Date(data.startDate);
    if (data.endDate) coupon.endDate = new Date(data.endDate);
    if (data.usageLimit !== undefined) coupon.usageLimit = Number(data.usageLimit);
    if (data.perUserLimit !== undefined) coupon.perUserLimit = Number(data.perUserLimit);

    await coupon.save();
    return coupon;
  },

  async delete(id: string) {
    const coupon = await Coupon.findById(id);
    if (!coupon || coupon.isDeleted) {
      const error: any = new Error('Coupon not found.');
      error.statusCode = 404;
      throw error;
    }
    coupon.isDeleted = true;
    await coupon.save();
    return true;
  }
};

