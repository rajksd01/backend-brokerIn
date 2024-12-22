import express, { Router } from 'express';
import * as authController from '../controllers/authController';
import { upload } from '../utils/fileUpload';

const router: Router = express.Router();

router.post('/signup', upload.single('profilePicture'), authController.signup as express.RequestHandler);
router.post('/signin', authController.signin as express.RequestHandler);
router.get('/verify-email/:token', authController.verifyEmail as express.RequestHandler);
router.post('/google-auth', authController.googleAuth as express.RequestHandler);
router.post('/refresh-token', authController.refreshToken as express.RequestHandler);
router.post('/forgot-password', authController.forgotPassword as express.RequestHandler);
router.post('/reset-password', authController.resetPassword as express.RequestHandler);
router.get('/profile-picture/:filename', authController.getProfilePicture as express.RequestHandler);

export default router; 