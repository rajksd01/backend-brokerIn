import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3030,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/flat-brokerage',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
};