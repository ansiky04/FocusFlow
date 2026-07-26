import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  duration: {
    type: Number, // Duration in seconds
    required: [true, 'Focus session duration (in seconds) is required'],
    min: [1, 'Session duration must be at least 1 second'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endedAt: {
    type: Date,
  },
  sessionType: {
    type: String,
    enum: {
      values: ['Focus', 'Short Break', 'Long Break'],
      message: 'Session type must be Focus, Short Break, or Long Break',
    },
    required: [true, 'Session type category is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'paused', 'completed', 'cancelled'],
      message: 'Status must be active, paused, completed, or cancelled',
    },
    default: 'active',
  },
  remainingTime: {
    type: Number,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  }
}, {
  timestamps: true
});

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
