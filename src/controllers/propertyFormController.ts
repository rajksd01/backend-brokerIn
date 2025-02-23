import { Request, Response } from 'express';
import PropertyForm from '../models/PropertyForm';
import { AuthRequest } from '../interfaces/Request'; // Assuming you have an AuthRequest interface
import mongoose from 'mongoose'; // Import mongoose to use ObjectId

// Create a new property form entry
export const createPropertyForm = async (req: AuthRequest, res: Response) => {
  try {
    const propertyFormData = {
      id: new mongoose.Types.ObjectId().toString(), // Generate a unique ID for the form
      property_id: req.body.property_id, // Reference to the property ID
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      message: req.body.message,
      userId: req.userId ? req.userId : undefined // Include userId if logged in
    };

    const propertyForm = new PropertyForm(propertyFormData);
    await propertyForm.save();
    res.status(201).json({ message: "Property form created", property_details: propertyForm });
  } catch (error) {
    res.status(500).json({ message: 'Error creating property form', error });
  }
};

// Get all property forms
export const getPropertyForms = async (req: Request, res: Response) => {
  try {
    const propertyForms = await PropertyForm.find();
    res.status(200).json(propertyForms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property forms', error });
  }
};

// Update a property form entry
export const updatePropertyForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const propertyForm = await PropertyForm.findByIdAndUpdate(id, updateData, { new: true });
    if (!propertyForm) {
      return res.status(404).json({ message: 'Property form not found' });
    }
    res.status(200).json({ message: 'Property form updated', property_details: propertyForm });
  } catch (error) {
    res.status(500).json({ message: 'Error updating property form', error });
  }
};

// Delete a property form entry
export const deletePropertyForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const propertyForm = await PropertyForm.findByIdAndDelete(id);
    if (!propertyForm) {
      return res.status(404).json({ message: 'Property form not found' });
    }
    res.status(200).json({ message: 'Property form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property form', error });
  }
};