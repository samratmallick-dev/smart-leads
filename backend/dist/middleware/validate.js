"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = schema.parse(source === 'body' ? req.body : req.query);
            if (source === 'body') {
                req.body = data;
            }
            else {
                req.query = data;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: messages.join('; '),
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
