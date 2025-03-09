import { Router } from 'express';
import { createPropertyForm, getPropertyForms, updatePropertyForm, deletePropertyForm } from '../controllers/propertyFormController';
import { authenticateToken } from '../middleware/auth'; // Assuming you have an authentication middleware
import { isAdmin } from '../middleware/adminAuth';

const router = Router();

// Public routes
router.post('/', createPropertyForm); // Create a property form
router.get('/', authenticateToken,isAdmin, getPropertyForms); // Get all property forms
router.put('/:id', authenticateToken, updatePropertyForm); // Update a property form
router.delete('/properties/:property_id', authenticateToken, isAdmin, deletePropertyForm); // Delete a property form

export default router;