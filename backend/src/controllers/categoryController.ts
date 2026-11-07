import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';

export const categoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      return res.status(200).json({ categories });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to retrieve categories.',
        error: error.message
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.create(name, description);
      return res.status(201).json({ message: 'Category created successfully.', category });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to create category.',
        error: error.message
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, description } = req.body;
      const category = await categoryService.update(id, name, description);
      return res.status(200).json({ message: 'Category updated successfully.', category });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to update category.',
        error: error.message
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await categoryService.delete(id);
      return res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        message: error.message || 'Failed to delete category.',
        error: error.message
      });
    }
  }
};
