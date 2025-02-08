import express, { Router } from 'express';
import * as authController from '../controllers/authController';
import { upload } from '../utils/fileUpload';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         nationality:
 *           type: string
 *         profilePicture:
 *           type: string
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Creates a new user account
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - phoneNumber
 *               - nationality
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: johndoe123
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john@example.com
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               nationality:
 *                 type: string
 *                 description: User's nationality
 *                 example: "US"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *                 example: "StrongPass123!"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: User's profile picture
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Server error
 */
router.post('/signup', upload.single('profilePicture'), authController.signup as express.RequestHandler);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Authenticate user using email/username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username of the user
 *                 example: "john@example.com or johndoe123"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/signin', authController.signin as express.RequestHandler);

/**
 * @swagger
 * /api/auth/google-auth:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate with Google
 *     description: Sign in or sign up using Google OAuth token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
router.post('/google-auth', authController.googleAuth as express.RequestHandler);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh JWT token
 *     description: Get new access token using refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh-token', authController.refreshToken as express.RequestHandler);

/**
 * @swagger
 * /api/auth/profile-picture/{filename}:
 *   get:
 *     tags: [Authentication]
 *     summary: Get user profile picture
 *     description: Retrieve user's profile picture by filename
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile picture filename
 *     responses:
 *       200:
 *         description: Profile picture
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Profile picture not found
 */
router.get('/profile-picture/:filename', authController.getProfilePicture as express.RequestHandler);

export default router;