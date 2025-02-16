import { Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  password: string;
  profilePicture?: string;
  role: UserRole;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdmin: boolean;
}