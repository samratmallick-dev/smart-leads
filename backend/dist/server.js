"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_js_1 = require("./config/env.js");
const cors_js_1 = require("./config/cors.js");
const db_js_1 = __importDefault(require("./config/db.js"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const leadRoutes_js_1 = __importDefault(require("./routes/leadRoutes.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)(cors_js_1.corsOptions));
app.options('*', (0, cors_1.default)(cors_js_1.corsOptions));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/leads', leadRoutes_js_1.default);
app.use(errorHandler_js_1.notFoundHandler);
app.use(errorHandler_js_1.errorHandler);
const startServer = async () => {
    await (0, db_js_1.default)();
    app.listen(env_js_1.config.port, () => {
        console.log(`\n🚀 Server running on http://localhost:${env_js_1.config.port}`);
        console.log(`📝 Environment: ${env_js_1.config.nodeEnv}\n`);
    });
};
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
