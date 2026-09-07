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

// @desc    Update a report (Draft or Resubmit)
// @route   PUT /api/reports/:id
// @access  Private (Team Member - Owner only)
const updateReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Enforce workflow: Cannot edit Approved or Submitted reports
    if (report.status === 'Approved' || report.status === 'Submitted') {
      return res.status(400).json({ message: `Cannot edit a report in ${report.status} status` });
    }

    const updatedReport = await WeeklyReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // FIX: Ensure currentVersion has a valid numerical baseline before any math
    if (!report.currentVersion) {
      report.currentVersion = 1;
    }

    // Save a snapshot of the report content if changes are requested (Bonus Requirement)
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
        managerComment: comment
      });
      report.currentVersion += 1; // Now this will safely equal 2
    }

    // Update report status
    report.status = action;
    report.latestReviewComment = comment || '';
    await report.save();

    // Log the review action
    await ReviewLog.create({
      report: report._id,
      reviewer: req.user._id,
      action,
      comment,
      // Safely calculate the logged version number based on the action taken
      versionNumber: report.currentVersion - (action === 'Needs Correction' ? 1 : 0)
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