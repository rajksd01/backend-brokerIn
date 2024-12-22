import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger/config.swagger';
import { config } from './config/config';
import authRoutes from './routes/authRoutes';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled Error:', {
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
  });

// Start server
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
}); 