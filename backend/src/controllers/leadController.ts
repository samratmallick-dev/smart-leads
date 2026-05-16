import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import Lead from '../models/Lead.js';
import { AuthRequest, ApiResponse, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { FilterQuery, SortOrder } from 'mongoose';

type LeadFilter = FilterQuery<typeof Lead>;

const buildFilterQuery = (req: AuthRequest): LeadFilter => {
  const filter: LeadFilter = {};

  if (req.user?.role === UserRole.Sales) {
    filter.user = req.user.userId;
  }
  if (req.query.status) filter.status = req.query.status as string;
  if (req.query.source) filter.source = req.query.source as string;
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return filter;
};

export const createLead = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const { name, email, source } = req.body;
  if (!name || !email || !source) {
    throw new AppError('Name, email, and source are required', 400);
  }

  let lead;
  try {
    lead = await Lead.create({ ...req.body, user: req.user.userId });
  } catch (err) {
    console.error('[createLead] Lead.create error:', err);
    throw err; 
  }

  res.status(201).json({ success: true, data: lead, message: 'Lead created successfully' });
});

export const getLeads = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const filter = buildFilterQuery(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  const sortOrder: SortOrder = (req.query.sort as string) === 'asc' ? 1 : -1;

  let data, total;
  try {
    [data, total] = await Promise.all([
      Lead.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);
  } catch (err) {
    console.error('[getLeads] query error:', err);
    throw new AppError('Failed to retrieve leads', 500);
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

export const getLeadById = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  let lead;
  try {
    lead = await Lead.findById(req.params.id).populate('user', 'name email');
  } catch (err) {
    console.error('[getLeadById] findById error:', err);
    throw new AppError('Invalid lead ID', 400);
  }

  if (!lead) throw new AppError('Lead not found', 404);

  if (req.user.role === UserRole.Sales && lead.user._id.toString() !== req.user.userId) {
    throw new AppError('You do not have permission to view this lead', 403);
  }

  res.status(200).json({ success: true, data: lead });
});

export const updateLead = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  let lead;
  try {
    lead = await Lead.findById(req.params.id);
  } catch (err) {
    console.error('[updateLead] findById error:', err);
    throw new AppError('Invalid lead ID', 400);
  }

  if (!lead) throw new AppError('Lead not found', 404);

  if (req.user.role === UserRole.Sales && lead.user.toString() !== req.user.userId) {
    throw new AppError('You do not have permission to update this lead', 403);
  }

  let updatedLead;
  try {
    updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
  } catch (err) {
    console.error('[updateLead] findByIdAndUpdate error:', err);
    throw err; 
  }

  res.status(200).json({ success: true, data: updatedLead, message: 'Lead updated successfully' });
});

export const deleteLead = asyncHandler(async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);

  let lead;
  try {
    lead = await Lead.findById(req.params.id);
  } catch (err) {
    console.error('[deleteLead] findById error:', err);
    throw new AppError('Invalid lead ID', 400);
  }

  if (!lead) throw new AppError('Lead not found', 404);

  if (req.user.role === UserRole.Sales && lead.user.toString() !== req.user.userId) {
    throw new AppError('You do not have permission to delete this lead', 403);
  }

  try {
    await Lead.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.error('[deleteLead] findByIdAndDelete error:', err);
    throw new AppError('Failed to delete lead', 500);
  }

  res.status(200).json({ success: true, message: 'Lead deleted successfully' });
});

export const exportLeadsCSV = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const filter = buildFilterQuery(req);
  const sortOrder: SortOrder = (req.query.sort as string) === 'asc' ? 1 : -1;

  let leads;
  try {
    leads = await Lead.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: sortOrder })
      .lean();
  } catch (err) {
    console.error('[exportLeadsCSV] query error:', err);
    throw new AppError('Failed to fetch leads for export', 500);
  }

  try {
    const parser = new Parser({
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
  } catch (err) {
    console.error('[exportLeadsCSV] CSV parse error:', err);
    throw new AppError('Failed to generate CSV', 500);
  }
});
