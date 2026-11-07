import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket?.remoteAddress || '';
      const result = await authService.login(email, password, ipAddress);

      return res.status(200).json({
        message: 'Login successful.',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Login failed.',
        error: error.message
      });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket?.remoteAddress || '';
      const result = await authService.register(name, email, password, ipAddress);

      return res.status(201).json({
        message: 'Registration successful.',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Registration failed.',
        error: error.message
      });
    }
  },

  async getProfile(req: any, res: Response) {
    try {
      const formattedUser = await authService.getProfile(req.user);
      return res.status(200).json({ user: formattedUser });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve profile.',
        error: error.message
      });
    }
  },

  async syncCart(req: any, res: Response) {
    try {
      const { cart } = req.body;
      await authService.syncCart(req.user, cart);
      return res.status(200).json({ message: 'Cart synchronized successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to sync cart.',
        error: error.message
      });
    }
  }
};
