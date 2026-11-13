import { Response } from 'express';
import { orderService } from '../services/orderService';

export const orderController = {
  async create(req: any, res: Response) {
    try {
      const order = await orderService.createOrder(req.user._id, req.body);
      return res.status(201).json({
        message: 'Order placed successfully.',
        order
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to place order.',
        error: error.message
      });
    }
  },

  async getMyOrders(req: any, res: Response) {
    try {
      const orders = await orderService.getMyOrders(req.user._id);
      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve order history.',
        error: error.message
      });
    }
  },

  async getById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id, req.user._id, req.user.role);
      return res.status(200).json({ order });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve order details.',
        error: error.message
      });
    }
  },

  async getAll(req: any, res: Response) {
    try {
      const orders = await orderService.getAllOrders();
      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve all orders.',
        error: error.message
      });
    }
  },

  async updateStatus(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      const order = await orderService.updateOrderStatus(id, status, paymentStatus);
      return res.status(200).json({
        message: 'Order status updated successfully.',
        order
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to update order status.',
        error: error.message
      });
    }
  },

  async cancelOrder(req: any, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.cancelOrder(id, req.user._id);
      return res.status(200).json({
        message: 'Order cancelled successfully.',
        order
      });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({
        message: error.message || 'Failed to cancel order.',
        error: error.message
      });
    }
  }
};
