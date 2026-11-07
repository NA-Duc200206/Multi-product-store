import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  async getDashboard(req: Request, res: Response) {
    try {
      const data = await analyticsService.getDashboardStats();
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve dashboard stats.',
        error: error.message
      });
    }
  }
};
