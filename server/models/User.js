import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [50, 'Full name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  avatar: {
    type: String,
    default: 'indigo',
  },
  studyGoal: {
    type: Number,
    default: 30.0,
    min: [0, 'Study goal cannot be negative'],
  },
  dailyGoal: {
    type: Number,
    default: 6.0,
    min: [0, 'Daily study goal cannot be negative'],
  },
  weeklyGoal: {
    type: Number,
    default: 30.0,
    min: [0, 'Weekly study goal cannot be negative'],
  },
  monthlyGoal: {
    type: Number,
    default: 120.0,
    min: [0, 'Monthly study goal cannot be negative'],
  },
  streak: {
    type: Number,
    default: 0,
    min: [0, 'Streak count cannot be negative'],
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);
export default User;
