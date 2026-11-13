import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';

export const aiService = {
  async chat(userMessage: string) {
    const text = userMessage.trim().toLowerCase();
    
    // 1. Fetch active coupons
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).limit(2);

    // 2. Search relevant products from DB
    const keywords = text.split(/\s+/).filter(w => w.length > 2);
    let matchedProducts: any[] = [];

    if (keywords.length > 0) {
      const regexPattern = keywords.map(k => `(?=.*${k})`).join('');
      matchedProducts = await Product.find({
        isDeleted: false,
        $or: [
          { name: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      })
      .populate('category', 'name')
      .limit(3);
    }

    if (matchedProducts.length === 0) {
      // Fallback to top rated / featured products
      matchedProducts = await Product.find({ isDeleted: false })
        .populate('category', 'name')
        .sort({ rating: -1, stock: -1 })
        .limit(3);
    }

    // 3. Format response
    let responseText = '';
    const couponNotice = activeCoupons.length > 0 
      ? `\n\n💡 Pro tip: You can use code "${activeCoupons[0].code}" for an instant ${activeCoupons[0].discountType === 'percentage' ? `${activeCoupons[0].discountValue}% discount` : `${activeCoupons[0].discountValue.toLocaleString('vi-VN')} VND off`} at checkout!` 
      : '';

    if (text.includes('ship') || text.includes('giao hang') || text.includes('delivery')) {
      responseText = `We provide nationwide expedited delivery across Vietnam. Orders above 1,000,000 VND enjoy 100% free shipping, and standard delivery arrives within 1-3 business days with real-time tracking.${couponNotice}`;
    } else if (text.includes('payment') || text.includes('thanh toan') || text.includes('vnpay') || text.includes('cod')) {
      responseText = `UCONEXT supports Cash On Delivery (COD) as well as secure instant payments via VNPAY QR, domestic ATM cards, Visa, and Mastercard.${couponNotice}`;
    } else if (text.includes('return') || text.includes('doi tra') || text.includes('warranty') || text.includes('bao hanh')) {
      responseText = `All products at UCONEXT are 100% certified authentic and backed by a 30-day transparent exchange warranty policy.${couponNotice}`;
    } else if (matchedProducts.length > 0) {
      const names = matchedProducts.map(p => `"${p.name}"`).join(', ');
      responseText = `Based on your interest, here are our recommended top-rated picks in our catalog: ${names}. Check them out below:${couponNotice}`;
    } else {
      responseText = `Welcome to UCONEXT! Feel free to ask about tech gadgets, minimalist apparel, skincare collections, or exclusive promotions.${couponNotice}`;
    }

    return {
      message: responseText,
      products: matchedProducts.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: (p.category as any)?.name || 'Product',
        stock: p.stock
      })),
      coupons: activeCoupons.map(c => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue
      }))
    };
  }
};

