"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadQuerySchema = exports.updateLeadSchema = exports.createLeadSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../types/index.js");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password cannot exceed 128 characters'),
    role: zod_1.z.nativeEnum(index_js_1.UserRole).optional().default(index_js_1.UserRole.Sales),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.createLeadSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    status: zod_1.z.nativeEnum(index_js_1.LeadStatus).optional().default(index_js_1.LeadStatus.New),
    source: zod_1.z.nativeEnum(index_js_1.LeadSource, {
        errorMap: () => ({ message: 'Source must be Website, Instagram, or Referral' }),
    }),
});
exports.updateLeadSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim()
        .optional(),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim().optional(),
    status: zod_1.z.nativeEnum(index_js_1.LeadStatus).optional(),
    source: zod_1.z.nativeEnum(index_js_1.LeadSource).optional(),
});
exports.leadQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(index_js_1.LeadStatus).optional(),
    source: zod_1.z.nativeEnum(index_js_1.LeadSource).optional(),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
