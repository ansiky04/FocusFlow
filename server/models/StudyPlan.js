import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  }
}, { _id: false });

const studyDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  tasks: [studyTaskSchema]
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required'],
  },
  availableStudyHours: {
    type: Number,
    required: [true, 'Available study hours per day is required'],
  },
  subjects: {
    type: [String],
    default: [],
  },
  difficultyLevel: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  revisionDays: {
    type: Number,
    default: 0,
  },
  breakDays: {
    type: Number,
    default: 0,
  },
  days: [studyDaySchema]
}, {
  timestamps: true
});

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
