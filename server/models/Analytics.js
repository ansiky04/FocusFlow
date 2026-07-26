import mongoose from 'mongoose';

const weeklyDataSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    default: 0,
    min: 0,
  }
}, { _id: false });

const monthlyDataSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    default: 0,
    min: 0,
  }
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    unique: true, // One analytics profile per user
    index: true,
  },
  totalFocusHours: {
    type: Number,
    default: 0,
    min: [0, 'Total focus hours cannot be negative'],
  },
  completedTasks: {
    type: Number,
    default: 0,
    min: [0, 'Completed tasks counter cannot be negative'],
  },
  productivityScore: {
    type: Number,
    default: 0,
    min: [0, 'Productivity score must be at least 0'],
    max: [100, 'Productivity score cannot exceed 100'],
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: [0, 'Current streak counter cannot be negative'],
  },
  weeklyData: {
    type: [weeklyDataSchema],
    default: [
      { day: 'Mon', hours: 0 },
      { day: 'Tue', hours: 0 },
      { day: 'Wed', hours: 0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 0 },
      { day: 'Sat', hours: 0 },
      { day: 'Sun', hours: 0 }
    ]
  },
  monthlyData: {
    type: [monthlyDataSchema],
    default: [
      { week: 'Week 1', hours: 0 },
      { week: 'Week 2', hours: 0 },
      { week: 'Week 3', hours: 0 },
      { week: 'Week 4', hours: 0 }
    ]
  }
}, {
  timestamps: true
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
