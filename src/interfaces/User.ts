import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  password: string;
  profilePicture: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  refreshToken: string | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 