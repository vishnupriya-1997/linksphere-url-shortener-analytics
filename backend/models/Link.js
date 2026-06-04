const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Destination URL is required'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  clickLimit: {
    type: Number,
    default: null
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  isPublicStats: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Link', LinkSchema);
