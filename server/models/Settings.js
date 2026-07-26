import mongoose from 'mongoose';

const notificationsSchema = new mongoose.Schema({
  focusAlerts: { type: Boolean, default: true },
  breakAlerts: { type: Boolean, default: true },
  dailyReminders: { type: Boolean, default: true },
  achievementBadges: { type: Boolean, default: true }
}, { _id: false });

const timerSettingsSchema = new mongoose.Schema({
  focusDuration: { type: Number, default: 25, min: 1 },
  shortBreak: { type: Number, default: 5, min: 1 },
  longBreak: { type: Number, default: 15, min: 1 },
  autoStartBreak: { type: Boolean, default: false },
  autoStartNextSession: { type: Boolean, default: false }
}, { _id: false });

const ambientSoundSchema = new mongoose.Schema({
  volume: { type: Number, default: 0.5, min: 0, max: 1 },
  activeTrack: { type: String, default: null }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    unique: true, // One settings profile per user
    index: true,
  },
  theme: {
    type: String,
    enum: {
      values: ['light', 'dark', 'system'],
      message: 'Theme must be light, dark, or system',
    },
    default: 'dark',
  },
  accentColor: {
    type: String,
    default: 'indigo',
  },
  notifications: {
    type: notificationsSchema,
    default: () => ({})
  },
  timerSettings: {
    type: timerSettingsSchema,
    default: () => ({})
  },
  ambientSound: {
    type: ambientSoundSchema,
    default: () => ({})
  },
  language: {
    type: String,
    default: 'en',
  },
  focusShield: {
    blockedWebsites: {
      type: [String],
      default: ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com']
    },
    isEnabled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
