import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthRequest, ApiResponse, JwtPayload } from '../types/index.js';
import { config } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const register = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.error('[register] findOne error:', err);
    throw new AppError('Database error while checking email', 500);
  }

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  let user;
  try {
    user = await User.create({ name, email, password, role });
  } catch (err) {
    console.error('[register] User.create error:', err);
    throw err; 
  }

  const tokenPayload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);

  res.status(201).json({
    success: true,
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
    message: 'Registration successful',
  });
});

export const login = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  let user;
  try {
    user = await User.findOne({ email }).select('+password');
  } catch (err) {
    console.error('[login] findOne error:', err);
    throw new AppError('Database error during login', 500);
  }

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  let isPasswordValid;
  try {
    isPasswordValid = await user.comparePassword(password);
  } catch (err) {
    console.error('[login] comparePassword error:', err);
    throw new AppError('Authentication error', 500);
  }

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenPayload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);

  res.status(200).json({
    success: true,
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
    message: 'Login successful',
  });
});

export const getMe = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  let user;
  try {
    user = await User.findById(req.user.userId);
  } catch (err) {
    console.error('[getMe] findById error:', err);
    throw new AppError('Database error fetching user', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
