import { Request, Response } from 'express';
import Property from '../models/Property';
import { AuthRequest } from '../interfaces/Request';
import {IProperty} from '../interfaces/Property';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import mongoose, { Schema } from 'mongoose'; // Ensure mongoose is imported
import cloudinary from '../utils/cloudinary';

// Public endpoints
export const getProperties = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query: any = {};
    
    // Sanitize and validate query parameters
    if (req.query.propertyType && ['Residential', 'Commercial', 'PG Hostel'].includes(req.query.propertyType as string)) {
      query.property_type = req.query.propertyType;
    }
    if (req.query.listingType && ['Rent', 'Sell'].includes(req.query.listingType as string)) {
      query.listing_type = req.query.listingType;
    }
    if (req.query.city) {
      query['address.city'] = new RegExp(req.query.city as string, 'i');
    }
    
    // Validate numeric filters
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v'); // Exclude version key

    res.json({
      properties,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    logger.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property' });
  }
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File, propertyName: string, index: number) => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Generate filename based on property name
    const sanitizedName = propertyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${sanitizedName}-${index + 1}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'properties',
      public_id: filename,
      resource_type: 'auto'
    });
    
    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Admin endpoints
export const addProperty = async (req: AuthRequest, res: Response) => {
  try {
    // Validate price structure based on listing_type
    if (req.body.listing_type === 'Rent' && !req.body.price?.rent_monthly) {
      return res.status(400).json({ message: 'Rent amount is required for rental properties' });
    }
    if (req.body.listing_type === 'Sell' && !req.body.price?.sell_price) {
      return res.status(400).json({ message: 'Selling price is required for sale properties' });
    }

    // Upload photos to Cloudinary
    const photoUrls = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file, index) => uploadToCloudinary(file, req.body.name, index)
      );
      photoUrls.push(...await Promise.all(uploadPromises));
    }

    const property = new Property({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      size: req.body.size,
      furnishing: req.body.furnishing,
      availability: req.body.availability,
      building_type: req.body.building_type,
      bhk: req.body.bhk,
      bathrooms: req.body.bathrooms,
      bedrooms: req.body.bedrooms,
      listing_type: req.body.listing_type,
      parking: req.body.parking,
      property_type: req.body.property_type,
      location: req.body.location,
      price: req.body.price,
      photos: photoUrls,
      amenities: req.body.amenities,
      status: req.body.status,
      society: req.body.society,
      added_by: req.userId,
      zipcode: req.body.zipcode,
      pets_allowed: req.body.pets_allowed || false,
      location_coordinates: {
        latitude: req.body.location_coordinates?.latitude,
        longitude: req.body.location_coordinates?.longitude,
      },
      createdBy: req.userId,
      updatedBy: req.userId,
      address: {
        street: req.body.address?.street,
        city: req.body.address?.city,
        state: req.body.address?.state,
        country: req.body.address?.country
      },
    });

    // Validate complete address if location is provided
    if (req.body.location && (!property.address?.street || !property.address?.city || !property.address?.state || !property.address?.country)) {
      return res.status(400).json({ message: 'Complete address details are required' });
    }

    await property.save();
    logger.info('Property added successfully', { propertyId: property._id });
    res.status(201).json({message:"property added", property_details:property});
  } catch (error:any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    logger.error('Error adding property:', error);
    res.status(500).json({ message: 'Error adding property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch existing property first
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Upload new photos if provided
    let photoUrls = existingProperty.photos;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file, index) => uploadToCloudinary(file, existingProperty.name, index)
      );
      photoUrls = await Promise.all(uploadPromises);
    }

    const updateData: Partial<IProperty> = {
      updatedBy: req.userId,
      ...req.body,
      photos: photoUrls
    };

    // Handle nested address updates
    if (req.body.address) {
      updateData.address = {
        ...existingProperty.address,
        ...req.body.address
      };
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    logger.info('Property updated successfully', { propertyId: id });
    return res.status(200).json(property);
  } catch (error:any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    logger.error('Update property error:', error);
    return res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { property_id } = req.params;
    const property = await Property.findOne({ property_id });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete images from Cloudinary
    for (const photoUrl of property.photos) {
      const publicId = photoUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`properties/${publicId}`);
    }

    // Delete the property
    await Property.deleteOne({ property_id });

    await session.commitTransaction();
    logger.info('Property deleted successfully', { propertyId: property_id });
    return res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    logger.error('Delete property error:', error);
    return res.status(500).json({ message: 'Error deleting property' });
  } finally {
    session.endSession();
  }
};

export const setDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { discountedPrice } = req.body;

    const property = await Property.findByIdAndUpdate(
      id,
      { 
        discountedPrice,
        isDiscounted: !!discountedPrice
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    logger.info('Property discount updated', { propertyId: id });
    return res.status(200).json({ message: 'Discount set successfully' });
  } catch (error) {
    logger.error('Set discount error:', error);
    return res.status(500).json({ message: 'Error setting discount' });
  }
}; 