import { Review } from '../models/Review';
import { Product } from '../models/Product';

export const reviewService = {
  async getProductReviews(productId: string) {
    const reviews: any[] = await Review.find({ productId: productId as any, isDeleted: false })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r: any) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1))
      : 5.0;

    return {
      totalReviews,
      averageRating,
      reviews: reviews.map((r: any) => {
        const obj = typeof r.toObject === 'function' ? r.toObject() : r;
        return {
          ...obj,
          id: obj._id,
          user: obj.userId
        };
      })
    };
  },

  async addReview(userId: string, productId: string, rating: number, comment: string) {
    if (!rating || rating < 1 || rating > 5) {
      const error: any = new Error('Rating must be between 1 and 5 stars.');
      error.statusCode = 400;
      throw error;
    }
    if (!comment || !comment.trim()) {
      const error: any = new Error('Review comment cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      const error: any = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    const existing: any = await Review.findOne({ productId: productId as any, userId: userId as any });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment.trim();
      existing.isDeleted = false;
      await existing.save();
      return existing;
    }

    const review = await Review.create({
      productId: productId as any,
      userId: userId as any,
      rating,
      comment: comment.trim()
    } as any);

    return review;
  },

  async deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
    const review: any = await Review.findById(reviewId);
    if (!review) {
      const error: any = new Error('Review not found.');
      error.statusCode = 404;
      throw error;
    }

    if (review.userId.toString() !== userId.toString() && !isAdmin) {
      const error: any = new Error('Not authorized to delete this review.');
      error.statusCode = 403;
      throw error;
    }

    review.isDeleted = true;
    await review.save();
    return true;
  }
};
