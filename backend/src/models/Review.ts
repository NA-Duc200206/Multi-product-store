import { Schema, model, Document } from 'mongoose';

export interface IReview extends Document {
  productId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Avoid duplicate reviews from same user on same product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model<IReview>('Review', ReviewSchema);

