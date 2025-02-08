import { Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/Request';
import  {UserRole}  from '../interfaces/User';
import User from '../models/User';
import logger from '../utils/logger';

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.userId);
    
    if (!user || user.role !== UserRole.ADMIN) {
      logger.warn('Unauthorized admin access attempt', { userId: req.userId });
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Error in admin authentication:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 