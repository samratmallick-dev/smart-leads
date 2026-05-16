import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types/index.js';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied — no token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Access denied — malformed token', 401);
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as unknown as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtErr) {
      if (jwtErr instanceof jwt.TokenExpiredError) {
        throw new AppError('Your session has expired — please log in again', 401);
      }
      if (jwtErr instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token — please log in again', 401);
      }
      throw new AppError('Authentication failed', 401);
    }
  } catch (error) {
    console.error('[AUTH]', error instanceof Error ? error.message : error);
    next(error instanceof AppError ? error : new AppError('Authentication failed', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
