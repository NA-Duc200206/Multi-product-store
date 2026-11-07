import { Request, Response } from 'express';
import { productService } from '../services/productService';

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const result = await productService.getAll(req.query);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve products.',
        error: error.message
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await productService.getById(id);
      return res.status(200).json({ product: result });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve product details.',
        error: error.message
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      return res.status(201).json({ message: 'Product added successfully.', product });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to add product.',
        error: error.message
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await productService.update(id, req.body);
      return res.status(200).json({ message: 'Product updated successfully.', product });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to update product.',
        error: error.message
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await productService.delete(id);
      return res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to delete product.',
        error: error.message
      });
    }
  }
};
