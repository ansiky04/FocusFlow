import mongoose from 'mongoose';

const focusAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FocusSession',
    default: null, // Null if there is no active session matching
  },
  website: {
    type: String,
    required: [true, 'Website domain name is required'],
    trim: true,
    lowercase: true,
  },
  time: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

const FocusAttempt = mongoose.model('FocusAttempt', focusAttemptSchema);
export default FocusAttempt;
