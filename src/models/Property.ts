import mongoose, { Schema, Document } from 'mongoose';
import { IProperty } from '../interfaces/Property';
import crypto from 'crypto';

const PropertySchema = new Schema<IProperty>({
  property_id: { 
    type: String, 
    required: false,
    unique: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  furnishing: { 
    type: String, 
    enum: ['Full', 'Semi', 'None'],
    required: true 
  },
  availability: {
    type: String,
    enum: ['Immediate', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'],
    required: true
  },
  building_type: {
    type: String,
    enum: ['Apartment', 'Villa', 'Independent House', 'Pent House', 'Plot'],
    required: true
  },
  bhk: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  listing_type: { 
    type: String, 
    enum: ['Rent', 'Sell'],
    required: true 
  },
  parking: { 
    type: String, 
    enum: ['Public', 'Reserved'],
    required: true 
  },
  property_type: {
    type: String,
    enum: ['Residential', 'Commercial', 'PG Hostel'],
    required: true
  },
  location: { type: String, required: true },
  price: {
    rent_monthly: { type: Number },
    sell_price: { type: Number },
    deposit: { type: Number }
  },
  photos: [{ type: String }],
  amenities: [{ type: String }],
  status: { 
    type: String, 
    enum: ['Available', 'Sold'],
    default: 'Available' 
  },
  society: { type: String },
  added_by: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  zipcode: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{6}$/.test(v); // Validates 6-digit Indian postal code
      },
      message: 'Zipcode must be a valid 6-digit number'
    }
  },
  pets_allowed: {
    type: Boolean,
    default: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String
  },
  location_coordinates: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate property_id
PropertySchema.pre('save', function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Format: PROP-2024-0319-A1B2C3
    this.property_id = `PROP-${year}-${month}${day}-${randomString}`;
  }
  next();
});

export default mongoose.model<IProperty>('Property', PropertySchema); 