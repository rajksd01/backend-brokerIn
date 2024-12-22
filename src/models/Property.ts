import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  code?: string;                 // Society/Complex code
  title: string;
  propertyType: 'residential' | 'commercial' | 'pg';
  listingType: 'sale' | 'rent';
  location: {
    address?: string;
    locality?: string;
    city?: string;
    pinCode?: string;
  };
  price: {
    amount: number;
    securityDeposit?: number;
    isNegotiable?: boolean;
  };
  area?: {
    totalArea?: number;
    unitOfMeasurement?: 'sqft' | 'sqm';
  };
  details?: {
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    totalFloors?: number;
    floorNumber?: number;
    ageOfProperty?: number;
    furnishingStatus?: 'unfurnished' | 'semifurnished' | 'furnished';
  };
  description?: string;
  amenities?: string[];
  images?: string[];
  floorPlan?: string;
  status: 'available' | 'underContract' | 'sold' | 'rented';
  contact: {
    name: string;
    email?: string;
    phone: string;
    userType: 'owner' | 'agent';
  };
  // Additional fields for Commercial Properties
  commercial?: {
    buildingType?: 'office' | 'retail' | 'warehouse' | 'industrial';
    floorPlanType?: 'open' | 'partitioned' | 'mixed';
  };
  // Additional fields for PG Properties
  pg?: {
    type?: 'men' | 'women' | 'coLiving';
    roomType?: 'shared' | 'private';
    availableBeds?: number;
    foodIncluded?: boolean;
    mealTypes?: string[];
    rules?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  isPremiumListing?: boolean;
  requestedServices?: {
    service: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'completed';
  }[];
}

const PropertySchema: Schema = new Schema({
  code: { type: String },
  title: { type: String, required: true },
  propertyType: { type: String, required: true, enum: ['residential', 'commercial', 'pg'] },
  listingType: { type: String, required: true, enum: ['sale', 'rent'] },
  location: {
    address: String,
    locality: String,
    city: String,
    pinCode: String
  },
  price: {
    amount: { type: Number, required: true },
    securityDeposit: Number,
    isNegotiable: { type: Boolean, default: false }
  },
  area: {
    totalArea: Number,
    unitOfMeasurement: { type: String, enum: ['sqft', 'sqm'] }
  },
  details: {
    bedrooms: Number,
    bathrooms: Number,
    balconies: Number,
    totalFloors: Number,
    floorNumber: Number,
    ageOfProperty: Number,
    furnishingStatus: { type: String, enum: ['unfurnished', 'semifurnished', 'furnished'] }
  },
  description: String,
  amenities: [String],
  images: [String],
  floorPlan: String,
  status: { 
    type: String, 
    required: true, 
    enum: ['available', 'underContract', 'sold', 'rented'],
    default: 'available'
  },
  contact: {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    userType: { type: String, required: true, enum: ['owner', 'agent'] }
  },
  commercial: {
    buildingType: { type: String, enum: ['office', 'retail', 'warehouse', 'industrial'] },
    floorPlanType: { type: String, enum: ['open', 'partitioned', 'mixed'] }
  },
  pg: {
    type: { type: String, enum: ['men', 'women', 'coLiving'] },
    roomType: { type: String, enum: ['shared', 'private'] },
    availableBeds: Number,
    foodIncluded: Boolean,
    mealTypes: [String],
    rules: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiryDate: Date,
  isPremiumListing: { type: Boolean, default: false },
  requestedServices: [{
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'completed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IProperty>('Property', PropertySchema); 