import express from 'express';
import { serviceBookingController } from '../controllers/serviceBookingController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminAuth';

const router = express.Router();

/**
 * @swagger
 * /api/service-bookings:
 *   post:
 *     summary: Create a new service booking
 *     tags: [ServiceBookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - services
 *               - scheduledDate
 *               - scheduledTimeSlot
 *               - contactDetails
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               scheduledTimeSlot:
 *                 type: string
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/', serviceBookingController.createBooking);

/**
 * @swagger
 * /api/service-bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags: [ServiceBookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', authenticateToken,isAdmin, serviceBookingController.getBookings);

router.get('/:id', authenticateToken, serviceBookingController.getBookingById);
router.put('/:id/status', authenticateToken, serviceBookingController.updateBookingStatus);
router.put('/:id/cancel', authenticateToken,serviceBookingController.cancelBooking);

export default router; 