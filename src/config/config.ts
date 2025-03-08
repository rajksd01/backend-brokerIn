import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  PORT: parseInt(getEnv('PORT'), 10) || 3030,
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  NODEMAILER_PASSWORD: getEnv('NODEMAILER_PASSWORD'),
  NODEMAILER_EMAIL: getEnv('NODEMAILER_EMAIL')
};