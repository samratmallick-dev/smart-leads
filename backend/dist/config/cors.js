"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const allowedOrigins = () => {
    const defaultOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
    ];
    const envOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : [];
    return [...new Set([...defaultOrigins, ...envOrigins])];
};
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const origins = allowedOrigins();
        if (origins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cache-Control',
        'Expires',
        'Pragma',
        'X-Requested-With',
        'x-internal-key',
    ],
    exposedHeaders: ['X-Cache', 'Content-Disposition'],
};
