import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
    default: 'planning',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['manager', 'member', 'viewer'],
      default: 'member',
    },
  }],
  color: {
    type: String,
    default: '#3b82f6',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Delete the model if it exists (for hot reloading in development)
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export default mongoose.model('Project', ProjectSchema);