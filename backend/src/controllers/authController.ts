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
  },

  async updateProfile(req: any, res: Response) {
    try {
      const updated = await authService.updateProfile(req.user, req.body);
      return res.status(200).json({ message: 'Profile updated successfully.', user: updated });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to update profile.',
        error: error.message
      });
    }
  },

  async changePassword(req: any, res: Response) {
    try {
      await authService.changePassword(req.user, req.body);
      return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to change password.',
        error: error.message
      });
    }
  },

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await authService.getAllUsers();
      return res.status(200).json({ users });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve users.',
        error: error.message
      });
    }
  },

  async updateUserRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const user = await authService.updateUserRole(id, role);
      return res.status(200).json({ message: 'User role updated successfully.', user });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to update user role.',
        error: error.message
      });
    }
  }
};
