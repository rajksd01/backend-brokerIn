import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { config } from '../config/config';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/emailService';
import { OAuth2Client } from 'google-auth-library';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { FileRequest } from '../interfaces/Request';

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const signup = async (req: FileRequest, res: Response) => {
  try {
    logger.info('Attempting user signup', { email: req.body.email });
    
    const { fullName, username, email, phoneNumber, nationality, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      // Delete uploaded file if user exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      logger.warn('Signup failed - User already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      fullName,
      username,
      email,
      phoneNumber,
      nationality,
      password,
      verificationToken,
      profilePicture: req.file ? path.basename(req.file.path) : 'default-profile.png'
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    logger.info('User signed up successfully', { email });
    res.status(201).json({ 
      message: 'User created successfully. Please verify your email.',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error in signup', { error, email: req.body.email });
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in', error });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        fullName: payload.name,
        email: payload.email,
        username: payload.email.split('@')[0],
        phoneNumber: '',
        nationality: '',
        password: crypto.randomBytes(32).toString('hex'),
        isVerified: true
      });
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Error with Google authentication', error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    await sendResetPasswordEmail(email, otp);

    res.json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset password email', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

export const getProfilePicture = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../../uploads/profile-pictures', filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.sendFile(path.join(__dirname, '../../uploads/profile-pictures/default-profile.png'));
    }
  } catch (error) {
    logger.error('Error serving profile picture', { error });
    res.status(500).json({ message: 'Error serving profile picture' });
  }
}; 