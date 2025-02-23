import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyForm extends Document {
  id: string; // Unique identifier for the property form
  property_id: string; // ID of the related property
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  userId?: Schema.Types.ObjectId; // Optional, if user is logged in
}

const PropertyFormSchema = new Schema<IPropertyForm>({
  id: { type: String, required: true, unique: true }, // Unique ID for property form
  property_id: { type: String, required: true }, // ID of the related property
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false } // Reference to User model
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Middleware to generate a unique id before saving
PropertyFormSchema.pre<IPropertyForm>('save', function(next) {
  if (!this.id) {
    this.id = new mongoose.Types.ObjectId().toString(); // Generate a unique ID
  }
  next();
});

const PropertyForm = mongoose.model<IPropertyForm>('PropertyForm', PropertyFormSchema);
export default PropertyForm;