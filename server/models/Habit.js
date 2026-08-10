import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Habit description cannot exceed 500 characters'],
    default: '',
  },
  category: {
    type: String,
    default: 'Study',
  },
  icon: {
    type: String,
    default: 'BookOpen',
  },
  color: {
    type: String,
    default: 'indigo',
  },
  goalType: {
    type: String,
    default: 'Daily',
  },
  measurementType: {
    type: String,
    default: 'checkbox',
  },
  targetValue: {
    type: Number,
    default: 1,
  },
  customUnit: {
    type: String,
    default: '',
  },
  repeat: {
    type: String,
    default: 'daily',
  },
  specificDays: {
    type: [String],
    default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  priority: {
    type: String,
    default: 'Medium',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  logs: {
    type: Map,
    of: new mongoose.Schema({
      completed: Boolean,
      value: Number,
    }, { _id: false }),
    default: {},
  }
}, {
  timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
