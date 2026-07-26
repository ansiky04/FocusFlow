import mongoose from 'mongoose';

const blockSiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID mapping is required'],
    index: true,
  },
  website: {
    type: String,
    required: [true, 'Website domain is required'],
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'General'
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// A user should not have duplicate entries for the same website domain
blockSiteSchema.index({ userId: 1, website: 1 }, { unique: true });

const BlockSite = mongoose.model('BlockSite', blockSiteSchema);
export default BlockSite;
