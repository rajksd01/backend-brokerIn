import { Request, Response } from 'express';
import Property, { IProperty } from '../models/Property';

export const createProperty = async (req: Request, res: Response) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    
    // Apply filters
    if (req.query.propertyType) query.propertyType = req.query.propertyType;
    if (req.query.listingType) query.listingType = req.query.listingType;
    if (req.query.city) query['location.city'] = req.query.city;
    if (req.query.minPrice) query['price.amount'] = { $gte: req.query.minPrice };
    if (req.query.maxPrice) {
      query['price.amount'] = { 
        ...query['price.amount'],
        $lte: req.query.maxPrice 
      };
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 