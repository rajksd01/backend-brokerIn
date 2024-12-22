import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceBooking extends Document {
  user: mongoose.Types.ObjectId;
  services: {
    service: mongoose.Types.ObjectId;
    quantity?: number;
  }[];
  property?: mongoose.Types.ObjectId;  // Optional, if booking is related to a property
  scheduledDate: Date;
  scheduledTimeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount?: number;
  requiresEstimate: boolean;
  notes?: string;
  contactDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

const ServiceBookingSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  services: [{
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: Number
  }],
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  scheduledDate: { type: Date, required: true },
  scheduledTimeSlot: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: Number,
  requiresEstimate: { type: Boolean, default: false },
  notes: String,
  contactDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  }
}, {
  timestamps: true
});

export default mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema); 