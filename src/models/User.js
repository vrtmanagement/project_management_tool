import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Delete the model if it exists (for hot reloading in development)
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);