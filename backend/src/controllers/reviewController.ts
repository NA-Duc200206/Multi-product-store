import { Request, Response } from 'express';
import { reviewService } from '../services/reviewService';

export const reviewController = {
  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const data = await reviewService.getProductReviews(productId as string);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve reviews.',
        error: error.message
      });
    }
  },

  async addReview(req: any, res: Response) {
    try {
      const { productId, rating, comment } = req.body;
      const review = await reviewService.addReview(req.user._id, productId, Number(rating), comment);
      return res.status(201).json({ message: 'Review submitted successfully.', review });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to submit review.',
        error: error.message
      });
    }
  },

  async deleteReview(req: any, res: Response) {
    try {
      const { id } = req.params;
      await reviewService.deleteReview(id as string, req.user._id, req.user.role === 'admin');
      return res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to delete review.',
        error: error.message
      });
    }
  }
};

