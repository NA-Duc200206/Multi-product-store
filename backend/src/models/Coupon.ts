import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, required: true, min: 0, default: 0 },
  maxDiscountAmount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true, default: 100 },
  usedCount: { type: Number, required: true, default: 0 },
  perUserLimit: { type: Number, required: true, default: 1 },
  isDeleted: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

export const Coupon = model<ICoupon>('Coupon', CouponSchema);
