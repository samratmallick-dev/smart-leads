"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_js_1.AppError('Access denied — no token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errorHandler_js_1.AppError('Access denied — malformed token', 401);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.config.jwtSecret);
            req.user = decoded;
            next();
        }
        catch (jwtErr) {
            if (jwtErr instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_js_1.AppError('Your session has expired — please log in again', 401);
            }
            if (jwtErr instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_js_1.AppError('Invalid token — please log in again', 401);
            }
            throw new errorHandler_js_1.AppError('Authentication failed', 401);
        }
    }
    catch (error) {
        console.error('[AUTH]', error instanceof Error ? error.message : error);
        next(error instanceof errorHandler_js_1.AppError ? error : new errorHandler_js_1.AppError('Authentication failed', 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Authentication required', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_js_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.authorize = authorize;
