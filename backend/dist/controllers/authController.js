"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = __importDefault(require("../models/User.js"));
const env_js_1 = require("../config/env.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_js_1.config.jwtSecret, {
        expiresIn: env_js_1.config.jwtExpiresIn,
    });
};
exports.register = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        throw new errorHandler_js_1.AppError('Name, email, and password are required', 400);
    }
    let existingUser;
    try {
        existingUser = await User_js_1.default.findOne({ email });
    }
    catch (err) {
        console.error('[register] findOne error:', err);
        throw new errorHandler_js_1.AppError('Database error while checking email', 500);
    }
    if (existingUser) {
        throw new errorHandler_js_1.AppError('An account with this email already exists', 409);
    }
    let user;
    try {
        user = await User_js_1.default.create({ name, email, password, role });
    }
    catch (err) {
        console.error('[register] User.create error:', err);
        throw err;
    }
    const tokenPayload = {
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
exports.login = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_js_1.AppError('Email and password are required', 400);
    }
    let user;
    try {
        user = await User_js_1.default.findOne({ email }).select('+password');
    }
    catch (err) {
        console.error('[login] findOne error:', err);
        throw new errorHandler_js_1.AppError('Database error during login', 500);
    }
    if (!user) {
        throw new errorHandler_js_1.AppError('Invalid email or password', 401);
    }
    let isPasswordValid;
    try {
        isPasswordValid = await user.comparePassword(password);
    }
    catch (err) {
        console.error('[login] comparePassword error:', err);
        throw new errorHandler_js_1.AppError('Authentication error', 500);
    }
    if (!isPasswordValid) {
        throw new errorHandler_js_1.AppError('Invalid email or password', 401);
    }
    const tokenPayload = {
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
exports.getMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    if (!req.user) {
        throw new errorHandler_js_1.AppError('Not authenticated', 401);
    }
    let user;
    try {
        user = await User_js_1.default.findById(req.user.userId);
    }
    catch (err) {
        console.error('[getMe] findById error:', err);
        throw new errorHandler_js_1.AppError('Database error fetching user', 500);
    }
    if (!user) {
        throw new errorHandler_js_1.AppError('User not found', 404);
    }
    res.status(200).json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});
