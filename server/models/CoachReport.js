import mongoose from 'mongoose';

const coachReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  weekStartDate: {
    type: Date,
    required: [true, 'Week start date is required'],
    default: () => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
  },
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  bestStudyTimings: {
    type: [String],
    default: [],
  },
  suggestedBlockedWebsites: {
    type: [String],
    default: [],
  },
  weeklyProductivitySummary: {
    type: String,
    required: [true, 'Weekly productivity summary is required'],
  },
  motivationalFeedback: {
    type: String,
    required: [true, 'Motivational feedback is required'],
  }
}, {
  timestamps: true
});

const CoachReport = mongoose.model('CoachReport', coachReportSchema);
export default CoachReport;
