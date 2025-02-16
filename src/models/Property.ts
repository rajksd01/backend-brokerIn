import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  property_id: string;
  name: string;
  description: string;
  type: string;
  size: number;
  furnishing: 'Full' | 'Semi' | 'None';
  availability: 'Immediate' | 'Within 15 Days' | 'Within 30 Days' | 'After 30 Days';
  building_type: 'Apartment' | 'Villa' | 'Independent House' | 'Pent House' | 'Plot';
  bhk: number;
  bathrooms: number;
  bedrooms: number;
  listing_type: 'Rent' | 'Sell';
  parking: 'Public' | 'Reserved';
  property_type: 'Residential' | 'Commercial' | 'PG Hostel';
  location: string;
  price: {
    rent_monthly?: number;
    sell_price?: number;
    deposit?: number;
  };
  photos: string[];
  amenities: string[];
  status: 'Available' | 'Sold';
  society: string;
  added_by: Schema.Types.ObjectId;
  zipcode: string;
  pets_allowed: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  location_coordinates: {
    latitude: number;
    longitude: number;
  };
}

const PropertySchema = new Schema<IProperty>({
  property_id: {
    type: String,
    unique: true,
    // Will be auto-generated in pre-save middleware
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
  society: { type: String, required: true },
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

// Add pre-save middleware to generate property_id
PropertySchema.pre('save', async function(next) {
  if (!this.property_id) {
    // Generate a unique property ID (e.g., PROP-2024-001)
    const count = await mongoose.model('Property').countDocuments();
    this.property_id = `PROP-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model<IProperty>('Property', PropertySchema); 