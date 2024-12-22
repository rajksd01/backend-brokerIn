import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminAuth';
import { upload } from '../utils/fileUpload';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, isAdmin);

router.post('/properties', upload.array('images', 10), adminController.addProperty);
router.put('/properties/:id', upload.array('images', 10), adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);
router.post('/properties/:id/discount', adminController.setDiscount);

export default router; 