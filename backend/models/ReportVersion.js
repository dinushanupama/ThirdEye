const mongoose = require('mongoose');

// This schema mirrors the content fields of the WeeklyReport 
// to freeze them in time as a historical snapshot.
const reportVersionSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WeeklyReport'
  },
  versionNumber: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  // Snapshot data below
  tasks: Array, 
  plannedNextWeek: String,
  blockers: Array,
  achievements: Array,
  hoursBreakdown: Object,
  notes: String,
  managerComment: String 
}, { timestamps: true });

module.exports = mongoose.model('ReportVersion', reportVersionSchema);