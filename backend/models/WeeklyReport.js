const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  plannedPercent: { type: Number, default: 0 },
  actualPercent: { type: Number, default: 0 },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed', 'Blocked'], default: 'To Do' },
  plannedHours: { type: Number, default: 0 },
  spentHours: { type: Number, default: 0 },
  deliverable: { type: String, default: '' }
}); //[cite: 1]

const weeklyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project' // We will create this model later
  },
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Needs Correction', 'Approved'],
    default: 'Draft'
  }, //[cite: 1]
  currentVersion: { type: Number, default: 1 },
  tasks: [taskSchema], //[cite: 1]
  plannedNextWeek: { type: String, default: '' }, //[cite: 1]
  blockers: [{
    description: String,
    isKeyIssue: { type: Boolean, default: false }
  }], //[cite: 1]
  achievements: [{
    description: String,
    isKeyAchievement: { type: Boolean, default: false }
  }], //[cite: 1]
  hoursBreakdown: {
    development: { type: Number, default: 0 },
    testing: { type: Number, default: 0 },
    meetings: { type: Number, default: 0 },
    documentation: { type: Number, default: 0 }
  }, //[cite: 1]
  notes: { type: String, default: '' },
  latestReviewComment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);