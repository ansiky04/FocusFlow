import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Event description cannot exceed 500 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  startTime: {
    type: String, // format "HH:MM" e.g. "09:00"
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String, // format "HH:MM" e.g. "10:30"
    required: [true, 'End time is required'],
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Priority must be Low, Medium, or High',
    },
    default: 'Medium',
  },
  category: {
    type: String,
    enum: {
      values: ['Study', 'Exam', 'Assignment', 'Personal'],
      message: 'Category must be Study, Exam, Assignment, or Personal',
    },
    required: [true, 'Category is required'],
  },
  reminderOffset: {
    type: String,
    enum: {
      values: ['none', 'at_time', '5_min', '10_min', '30_min', '1_hour', '1_day'],
      message: 'Reminder offset is invalid',
    },
    default: 'none',
  }
}, {
  timestamps: true
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
