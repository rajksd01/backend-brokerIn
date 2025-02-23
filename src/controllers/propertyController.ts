import { Request, Response } from 'express';
import Property from '../models/Property';
import { AuthRequest } from '../interfaces/Request';
import {IProperty} from '../interfaces/Property';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import mongoose, { Schema } from 'mongoose'; // Ensure mongoose is imported

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

    const photos = (req.files as Express.Multer.File[])?.map(file => file.filename) || [];

    const property = new Property({
      property_id: req.body.property_id,
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
      photos,
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
    const photos = (req.files as Express.Multer.File[])?.map(file => file.filename);

    // Fetch existing property first
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Validate price updates based on listing_type
    if (req.body.listing_type) {
      if (req.body.listing_type === 'Rent' && !req.body.price?.rent_monthly) {
        return res.status(400).json({ message: 'Rent amount is required for rental properties' });
      }
      if (req.body.listing_type === 'Sell' && !req.body.price?.sell_price) {
        return res.status(400).json({ message: 'Selling price is required for sale properties' });
      }
    }

    const updateData: Partial<IProperty> = {
      updatedBy: req.userId,
      ...req.body
    };

    // Handle nested address updates
    if (req.body.address) {
      updateData.address = {
        ...existingProperty.address,
        ...req.body.address
      };
    }

    // Handle photo updates and cleanup old photos
    if (photos?.length) {
      updateData.photos = photos;
      // Cleanup old photos
      existingProperty.photos.forEach(photo => {
        const photoPath = path.join(__dirname, '../../uploads/properties', photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      });
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

    // Store photo paths before deletion
    const photoPaths = property.photos.map(photo => 
      path.join(__dirname, '../../uploads/properties', photo)
    );

    // Delete the property
    await Property.deleteOne({ property_id });

    // Delete associated files only after successful DB operation
    photoPaths.forEach(photoPath => {
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    });

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