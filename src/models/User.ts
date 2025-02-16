import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../interfaces/User';

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  nationality: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'default-profile.png' },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  isVerified: { type: Boolean, default: true },
  refreshToken: { type: String, default: null },
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);