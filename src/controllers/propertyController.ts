import { Request, Response } from 'express';
import Property from '../models/Property';
import { AuthRequest } from '../interfaces/Request';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Public endpoints
export const getProperties = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    
    // Apply filters
    if (req.query.propertyType) query.propertyType = req.query.propertyType;
    if (req.query.listingType) query.listingType = req.query.listingType;
    if (req.query.city) query['location.city'] = req.query.city;
    if (req.query.minPrice) query['price.amount'] = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      query['price.amount'] = { 
        ...query['price.amount'],
        $lte: Number(req.query.maxPrice) 
      };
    }

    const properties = await Property.find(query);
    res.json(properties);
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
    const propertyData = req.body;
    const photos = (req.files as Express.Multer.File[])?.map(file => file.filename) || [];

    const property = new Property({
      ...propertyData,
      photos,
      createdBy: req.userId,
      updatedBy: req.userId
    });

    await property.save();
    logger.info('Property added successfully', { propertyId: property._id });
    res.status(201).json(property);
  } catch (error) {
    logger.error('Error adding property:', error);
    res.status(500).json({ message: 'Error adding property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const photos = (req.files as Express.Multer.File[])?.map(file => file.filename);

    if (photos?.length) {
      updateData.photos = photos;
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedBy: req.userId 
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    logger.info('Property updated successfully', { propertyId: id });
    return res.status(200).json(property);
  } catch (error) {
    logger.error('Update property error:', error);
    return res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete property images
    if (property.photos && property.photos.length) {
      property.photos.forEach(image => {
        const imagePath = path.join(__dirname, '../../uploads/properties', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    logger.info('Property deleted successfully', { propertyId: id });
    return res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    logger.error('Delete property error:', error);
    return res.status(500).json({ message: 'Error deleting property' });
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