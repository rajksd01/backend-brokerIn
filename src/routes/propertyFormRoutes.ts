import { Router } from 'express';
import { createPropertyForm, getPropertyForms, updatePropertyForm, deletePropertyForm } from '../controllers/propertyFormController';
import { authenticateToken } from '../middleware/auth'; // Assuming you have an authentication middleware

const router = Router();

// Public routes
router.post('/', createPropertyForm); // Create a property form
router.get('/', getPropertyForms); // Get all property forms
router.put('/:id', authenticateToken, updatePropertyForm); // Update a property form
router.delete('/:id', authenticateToken, deletePropertyForm); // Delete a property form

export default router;