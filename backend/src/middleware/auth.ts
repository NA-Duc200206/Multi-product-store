import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token not found. Please log in.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_glowstore_2026', async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Authentication token is invalid or expired.' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User does not exist.' });
      }

      req.user = user;
      next();
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'System authentication error.', error: error.message });
  }
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Administrator only.' });
  }
};

export const isCustomer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied.' });
  }
};
