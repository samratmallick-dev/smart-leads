import mongoose, { Schema, Model } from 'mongoose';
import { ILeadDocument, LeadStatus, LeadSource } from '../types/index.js';

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.New,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      required: [true, 'Lead source is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ name: 'text', email: 'text' });

const Lead: Model<ILeadDocument> = mongoose.model<ILeadDocument>('Lead', leadSchema);
export default Lead;
