import express from 'express';
import { contactController } from '../controllers/contactController';
import { isAdmin } from '../middleware/adminAuth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public route for submitting contact form
router.post('/', contactController.createContact);

// Protected admin routes
router.get('/', authenticateToken, isAdmin, contactController.getContacts);
router.get('/:id', authenticateToken, isAdmin, contactController.getContactById);
router.patch('/:id/status', authenticateToken, isAdmin, contactController.updateContactStatus);
router.delete('/:id', authenticateToken, isAdmin, contactController.deleteContact);

export default router; 