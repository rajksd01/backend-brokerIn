import { Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  features: string[];
  type: 'apartment' | 'house' | 'villa' | 'commercial';
  status: 'available' | 'sold' | 'rented';
  images: string[];
  area: number;
  bedrooms: number;
  bathrooms: number;
  isDiscounted: boolean;
  createdBy: string;
  updatedBy: string;
} 