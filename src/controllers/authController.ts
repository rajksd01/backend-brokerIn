import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config/config';
import { OAuth2Client } from 'google-auth-library';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { FileRequest } from '../interfaces/Request';
import crypto from 'node:crypto';

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const signup = async (req: FileRequest, res: Response) => {
  try {
    logger.info('Attempting user signup', { username: req.body.username });
    
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
      logger.warn('Signup failed - User already exists', { username });
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Create new user
    const user = new User({
      fullName,
      username,
      email,
      phoneNumber,
      nationality,
      password,
      profilePicture: req.file ? path.basename(req.file.path) : 'default-profile.png'
    });

    await user.save();

    // Generate tokens
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info('User signup successful', { username });
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token,
      refreshToken
    });
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error in signup', { error, username: req.body.username });
    return res.status(500).json({ message: 'Error creating user' });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    logger.info('Attempting signin', { identifier });

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      logger.warn('Signin failed - User not found', { identifier });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Signin failed - Invalid password', { identifier });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Update refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info('Signin successful', { identifier });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Error in signin', { error, identifier: req.body.identifier });
    return res.status(500).json({ message: 'Error during login' });
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
    if (!payload || !payload.name) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    let user = await User.findOne({ 
      $or: [{ email: payload.email }, { username: payload.name }] 
    });

    if (!user) {
      user = new User({
        fullName: payload.name,
        username: payload.name,
        email: payload.email,
        phoneNumber: '',
        nationality: '',
        password: crypto.randomBytes(16).toString('hex')
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

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('Error in Google authentication', { error });
    return res.status(500).json({ message: 'Error during Google authentication' });
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

    return res.status(200).json({ token: accessToken });
  } catch (error) {
    logger.error('Error in token refresh', { error });
    return res.status(401).json({ message: 'Invalid refresh token' });
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