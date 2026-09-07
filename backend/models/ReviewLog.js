const mongoose = require('mongoose');

const reviewLogSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WeeklyReport'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['Approved', 'Needs Correction'],
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  versionNumber: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ReviewLog', reviewLogSchema);