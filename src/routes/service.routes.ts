import express from 'express';
import { 
  createService, 
  getServices, 
  bookService, 
  getServiceBookings 
} from '../controllers/service.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createService);
router.get('/', getServices);
router.post('/book', authenticate, bookService);
router.get('/bookings', authenticate, getServiceBookings);

export default router; 