"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeadsCSV = exports.deleteLead = exports.updateLead = exports.getLeadById = exports.getLeads = exports.createLead = void 0;
const json2csv_1 = require("json2csv");
const Lead_js_1 = __importDefault(require("../models/Lead.js"));
const index_js_1 = require("../types/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const buildFilterQuery = (req) => {
    const filter = {};
    if (req.user?.role === index_js_1.UserRole.Sales) {
        filter.user = req.user.userId;
    }
    if (req.query.status)
        filter.status = req.query.status;
    if (req.query.source)
        filter.source = req.query.source;
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    return filter;
};
exports.createLead = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    if (!req.user)
        throw new errorHandler_js_1.AppError('Authentication required', 401);
    const { name, email, source } = req.body;
    if (!name || !email || !source) {
        throw new errorHandler_js_1.AppError('Name, email, and source are required', 400);
    }
    let lead;
    try {
        lead = await Lead_js_1.default.create({ ...req.body, user: req.user.userId });
    }
    catch (err) {
        console.error('[createLead] Lead.create error:', err);
        throw err;
    }
    res.status(201).json({ success: true, data: lead, message: 'Lead created successfully' });
});
exports.getLeads = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    const filter = buildFilterQuery(req);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    let data, total;
    try {
        [data, total] = await Promise.all([
            Lead_js_1.default.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Lead_js_1.default.countDocuments(filter),
        ]);
    }
    catch (err) {
        console.error('[getLeads] query error:', err);
        throw new errorHandler_js_1.AppError('Failed to retrieve leads', 500);
    }
    res.status(200).json({
        success: true,
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        message: 'Leads retrieved successfully',
    });
});
exports.getLeadById = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    if (!req.user)
        throw new errorHandler_js_1.AppError('Authentication required', 401);
    let lead;
    try {
        lead = await Lead_js_1.default.findById(req.params.id).populate('user', 'name email');
    }
    catch (err) {
        console.error('[getLeadById] findById error:', err);
        throw new errorHandler_js_1.AppError('Invalid lead ID', 400);
    }
    if (!lead)
        throw new errorHandler_js_1.AppError('Lead not found', 404);
    if (req.user.role === index_js_1.UserRole.Sales && lead.user._id.toString() !== req.user.userId) {
        throw new errorHandler_js_1.AppError('You do not have permission to view this lead', 403);
    }
    res.status(200).json({ success: true, data: lead });
});
exports.updateLead = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    if (!req.user)
        throw new errorHandler_js_1.AppError('Authentication required', 401);
    let lead;
    try {
        lead = await Lead_js_1.default.findById(req.params.id);
    }
    catch (err) {
        console.error('[updateLead] findById error:', err);
        throw new errorHandler_js_1.AppError('Invalid lead ID', 400);
    }
    if (!lead)
        throw new errorHandler_js_1.AppError('Lead not found', 404);
    if (req.user.role === index_js_1.UserRole.Sales && lead.user.toString() !== req.user.userId) {
        throw new errorHandler_js_1.AppError('You do not have permission to update this lead', 403);
    }
    let updatedLead;
    try {
        updatedLead = await Lead_js_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('user', 'name email');
    }
    catch (err) {
        console.error('[updateLead] findByIdAndUpdate error:', err);
        throw err;
    }
    res.status(200).json({ success: true, data: updatedLead, message: 'Lead updated successfully' });
});
exports.deleteLead = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    if (!req.user)
        throw new errorHandler_js_1.AppError('Authentication required', 401);
    let lead;
    try {
        lead = await Lead_js_1.default.findById(req.params.id);
    }
    catch (err) {
        console.error('[deleteLead] findById error:', err);
        throw new errorHandler_js_1.AppError('Invalid lead ID', 400);
    }
    if (!lead)
        throw new errorHandler_js_1.AppError('Lead not found', 404);
    if (req.user.role === index_js_1.UserRole.Sales && lead.user.toString() !== req.user.userId) {
        throw new errorHandler_js_1.AppError('You do not have permission to delete this lead', 403);
    }
    try {
        await Lead_js_1.default.findByIdAndDelete(req.params.id);
    }
    catch (err) {
        console.error('[deleteLead] findByIdAndDelete error:', err);
        throw new errorHandler_js_1.AppError('Failed to delete lead', 500);
    }
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
});
exports.exportLeadsCSV = (0, asyncHandler_js_1.asyncHandler)(async (req, res, _next) => {
    const filter = buildFilterQuery(req);
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    let leads;
    try {
        leads = await Lead_js_1.default.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: sortOrder })
            .lean();
    }
    catch (err) {
        console.error('[exportLeadsCSV] query error:', err);
        throw new errorHandler_js_1.AppError('Failed to fetch leads for export', 500);
    }
    try {
        const parser = new json2csv_1.Parser({
            fields: [
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Status', value: 'status' },
                { label: 'Source', value: 'source' },
                { label: 'Created By', value: 'user.name' },
                { label: 'Created At', value: 'createdAt' },
            ],
        });
        const csv = parser.parse(leads);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leads-export-${Date.now()}.csv`);
        res.status(200).send(csv);
    }
    catch (err) {
        console.error('[exportLeadsCSV] CSV parse error:', err);
        throw new errorHandler_js_1.AppError('Failed to generate CSV', 500);
    }
});
