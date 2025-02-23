import mongoose, { Schema, Document } from 'mongoose';
import { IProperty } from '../interfaces/Property';

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

// Modify the pre-save middleware to handle property_id generation
PropertySchema.pre('save', async function(next) {
  try {
    if (!this.property_id) {
      const currentYear = new Date().getFullYear();
      const count = await mongoose.model('Property').countDocuments();
      this.property_id = `PROP-${currentYear}-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IProperty>('Property', PropertySchema); 