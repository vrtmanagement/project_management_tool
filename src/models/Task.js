import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'completed', 'cancelled'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  tags: [{
    type: String,
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  completedAt: {
    type: Date,
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

TaskSchema.pre('save', function() {
  this.updatedAt = Date.now();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
});

// Delete the model if it exists (for hot reloading in development)
if (mongoose.models.Task) {
  delete mongoose.models.Task;
}

export default mongoose.model('Task', TaskSchema);