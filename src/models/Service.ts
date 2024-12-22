import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: 'furniture' | 'interior' | 'painting' | 'cleaning' | 'plumbing' | 'electrical' | 'moving' | 'ac';
  description?: string;
  pricing: {
    type: 'fixed' | 'estimate' | 'range';
    amount?: number;
    minAmount?: number;
    maxAmount?: number;
    unit?: string;
  };
  features?: string[];
  images?: string[];
  isAvailable: boolean;
  estimateRequired: boolean;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['furniture', 'interior', 'painting', 'cleaning', 'plumbing', 'electrical', 'moving', 'ac']
  },
  description: String,
  pricing: {
    type: { type: String, required: true, enum: ['fixed', 'estimate', 'range'] },
    amount: Number,
    minAmount: Number,
    maxAmount: Number,
    unit: String
  },
  features: [String],
  images: [String],
  isAvailable: { type: Boolean, default: true },
  estimateRequired: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IService>('Service', ServiceSchema); 