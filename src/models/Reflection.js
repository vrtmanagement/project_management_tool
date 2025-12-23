import mongoose from 'mongoose';

const ReflectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topPriorities: {
    type: [String],
    default: ['', '', ''],
    validate: {
      validator: function(v) {
        return v.length === 3;
      },
      message: 'Top Priorities must have exactly 3 items',
    },
  },
  goalsOfTheDay: {
    type: [String],
    default: Array(10).fill(''),
    validate: {
      validator: function(v) {
        return v.length === 10;
      },
      message: 'Goals of the Day must have exactly 10 items',
    },
  },
  schedule: {
    type: [{
      time: String,
      activity: String,
    }],
    default: [
      { time: '08:00 AM', activity: '' },
      { time: '09:00 AM', activity: '' },
      { time: '10:00 AM', activity: '' },
      { time: '11:00 AM', activity: '' },
      { time: '12:00 PM', activity: '' },
      { time: '01:00 PM', activity: '' },
      { time: '02:00 PM', activity: '' },
      { time: '03:00 PM', activity: '' },
      { time: '04:00 PM', activity: '' },
      { time: '05:00 PM', activity: '' },
      { time: '06:00 PM', activity: '' },
      { time: '07:00 PM', activity: '' },
      { time: '08:00 PM', activity: '' },
      { time: '09:00 PM', activity: '' },
      { time: '10:00 PM', activity: '' },
      { time: '11:00 PM', activity: '' },
    ],
  },
  reflection: {
    type: [String],
    default: Array(5).fill(''),
    validate: {
      validator: function(v) {
        return v.length === 5;
      },
      message: 'Reflection must have exactly 5 items',
    },
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

// Ensure unique reflection per user per date
ReflectionSchema.index({ user: 1, date: 1 }, { unique: true });

ReflectionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Delete the model if it exists (for hot reloading in development)
if (mongoose.models.Reflection) {
  delete mongoose.models.Reflection;
}

export default mongoose.model('Reflection', ReflectionSchema);

