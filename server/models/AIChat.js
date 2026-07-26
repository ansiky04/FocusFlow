import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const aiChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  title: {
    type: String,
    default: 'New Chat',
    trim: true,
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

const AIChat = mongoose.model('AIChat', aiChatSchema);
export default AIChat;
