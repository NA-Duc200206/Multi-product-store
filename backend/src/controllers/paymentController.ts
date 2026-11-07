import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';

export const paymentController = {
  async createPaymentUrl(req: any, res: Response) {
    try {
      const { id } = req.params;
      const ipAddr = req.headers['x-forwarded-for'] ||
                     req.connection?.remoteAddress ||
                     req.socket?.remoteAddress ||
                     '127.0.0.1';
      const paymentUrl = await paymentService.createPaymentUrl(id, ipAddr as string);
      return res.status(200).json({ paymentUrl });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to create VNPAY payment link.',
        error: error.message
      });
    }
  },

  async verifyPayment(req: Request, res: Response) {
    try {
      const result = await paymentService.verifyPayment(req.query);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to verify payment.',
        error: error.message
      });
    }
  },

  async vnpayIpn(req: Request, res: Response) {
    try {
      const result = await paymentService.handleIpn(req.query);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(200).json({ RspCode: '99', Message: 'Input error: ' + error.message });
    }
  }
};
