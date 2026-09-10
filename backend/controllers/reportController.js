const WeeklyReport = require('../models/WeeklyReport');
const ReviewLog = require('../models/ReviewLog');
const ReportVersion = require('../models/ReportVersion');

// @desc    Create a new weekly report
// @route   POST /api/reports
// @access  Private (Team Member)
const createReport = async (req, res) => {
  try {
    const { projectId, weekStartDate, weekEndDate, status, tasks, plannedNextWeek, blockers, achievements, hoursBreakdown, notes } = req.body;

    const report = await WeeklyReport.create({
      user: req.user._id,
      project: projectId,
      weekStartDate,
      weekEndDate,
      status: status || 'Draft',
      tasks,
      plannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's reports
// @route   GET /api/reports/my-reports
// @access  Private (Team Member)
const getMyReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ user: req.user._id })
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (Owner or Manager/Admin)
const getReportById = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate('user', 'name email')
      .populate('project', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // RBAC: Ensure team members can only view their own reports
    if (req.user.role === 'team_member' && report.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
  try {
    // 1. Find the existing report first to check its current state
    const existingReport = await WeeklyReport.findById(req.params.id);

    if (!existingReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Ensure the user owns the report (optional but recommended for security)
    if (existingReport.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    // 2. Version Increment Logic
    let newVersion = existingReport.currentVersion || 1;
    
    // If it was returned for corrections, and the user is submitting it again, bump the version
    if (existingReport.status === 'Needs Correction' && req.body.status === 'Submitted') {
      newVersion += 1;
    }

    // 3. Update the report with the new data and the calculated version
    const updatedReport = await WeeklyReport.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        currentVersion: newVersion 
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error('Update Report Error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

// @desc    Manager review action (Approve or Request Changes)
// @route   POST /api/reports/:id/review
// @access  Private (Manager/Admin)
const reviewReport = async (req, res) => {
  try {
    const { action, comment } = req.body; 
    const report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'Submitted') {
      return res.status(400).json({ message: 'Can only review Submitted reports' });
    }

    if (!report.currentVersion) {
      report.currentVersion = 1;
    }

    // Save a snapshot of the report content if changes are requested
    if (action === 'Needs Correction') {
      await ReportVersion.create({
        reportId: report._id,
        versionNumber: report.currentVersion,
        tasks: report.tasks,
        plannedNextWeek: report.plannedNextWeek,
        blockers: report.blockers,
        achievements: report.achievements,
        hoursBreakdown: report.hoursBreakdown,
        notes: report.notes,
        latestReviewComment: comment
      });
      // REMOVED: report.currentVersion += 1; 
      // The version will now only increment when the user resubmits via updateReport
    }

    // Update report status and save the manager's comment
    report.status = action;
    report.latestReviewComment = comment || '';
    await report.save();

    // Log the review action
    await ReviewLog.create({
      report: report._id,
      reviewer: req.user._id,
      action,
      comment,
      versionNumber: report.currentVersion 
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports (Manager Dashboard)
// @route   GET /api/reports
// @access  Private (Manager/Admin)
const getAllReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({})
      .populate('user', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  reviewReport,
  getAllReports
};