import express from 'express';
import { 
  createService, 
  getServices, 
  bookService, 
  getServiceBookings 
} from '../controllers/service.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags: [Services]
 *     summary: Create a new service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: Get all services
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (e.g. price)
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 */
router.get('/', getServices);

/**
 * @swagger
 * /api/services/book:
 *   post:
 *     tags: [Services]
 *     summary: Book a service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service booked successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/book', authenticate, bookService);

/**
 * @swagger
 * /api/services/bookings:
 *   get:
 *     tags: [Services]
 *     summary: Get user's service bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of service bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service:
 *                     type: object
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/bookings', authenticate, getServiceBookings);

export default router;