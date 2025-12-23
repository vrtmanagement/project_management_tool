import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

WorkspaceSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Delete the model if it exists (for hot reloading in development)
if (mongoose.models.Workspace) {
  delete mongoose.models.Workspace;
}

export default mongoose.model('Workspace', WorkspaceSchema);