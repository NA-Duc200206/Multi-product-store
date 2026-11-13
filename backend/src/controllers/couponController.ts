import { Request, Response } from 'express';
import { couponService } from '../services/couponService';

export const couponController = {
  async getActiveCoupons(req: Request, res: Response) {
    try {
      const coupons = await couponService.getActiveCoupons();
      return res.status(200).json({ coupons });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve active coupons.',
        error: error.message
      });
    }
  },

  async validateCoupon(req: any, res: Response) {
    try {
      const { code, orderAmount } = req.body;
      const result = await couponService.validateCoupon(code, Number(orderAmount), req.user?._id?.toString());
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Invalid coupon code.',
        error: error.message
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const coupons = await couponService.getAll();
      return res.status(200).json({ coupons });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve coupons.',
        error: error.message
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const coupon = await couponService.create(req.body);
      return res.status(201).json({ message: 'Coupon created successfully.', coupon });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to create coupon.',
        error: error.message
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const coupon = await couponService.update(id, req.body);
      return res.status(200).json({ message: 'Coupon updated successfully.', coupon });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to update coupon.',
        error: error.message
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await couponService.delete(id);
      return res.status(200).json({ message: 'Coupon deleted successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to delete coupon.',
        error: error.message
      });
    }
  }
};

