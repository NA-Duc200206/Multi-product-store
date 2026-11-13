import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

export const aiController = {
  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required.' });
      }

      const result = await aiService.chat(message);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: 'AI Assistant currently unavailable.',
        error: error.message
      });
    }
  }
};

