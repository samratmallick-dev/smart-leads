"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const mapMongooseError = (err) => {
    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        return { statusCode: 409, message: `An account with this ${field} already exists` };
    }
    if (err.name === 'ValidationError' && err.errors) {
        const messages = Object.values(err.errors).map((e) => e.message);
        return { statusCode: 400, message: messages[0] ?? 'Validation failed' };
    }
    if (err.name === 'CastError') {
        return { statusCode: 400, message: 'Invalid ID format' };
    }
    if (err.name === 'JsonWebTokenError') {
        return { statusCode: 401, message: 'Invalid token — please log in again' };
    }
    if (err.name === 'TokenExpiredError') {
        return { statusCode: 401, message: 'Your session has expired — please log in again' };
    }
    return { statusCode: 500, message: 'An unexpected error occurred' };
};
const errorHandler = (err, _req, res, _next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    const { statusCode, message } = mapMongooseError(err);
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
