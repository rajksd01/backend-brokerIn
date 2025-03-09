import { Router } from 'express';
import { createPropertyForm, getPropertyForms, updatePropertyForm, deletePropertyForm } from '../controllers/propertyFormController';
import { checkPropertyExists } from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth'; // Assuming you have an authentication middleware
import { isAdmin } from '../middleware/adminAuth';

const router = Router();

// Public routes
router.post('/',checkPropertyExists, createPropertyForm); // Create a property form
router.get('/', authenticateToken,isAdmin, getPropertyForms);
router.get('/:id', authenticateToken, getPropertyForms);  // Get all property forms
router.put('/:id', authenticateToken, isAdmin,updatePropertyForm); // Update a property form
router.delete('/:id', authenticateToken, isAdmin, deletePropertyForm); // Delete a property form

export default router;