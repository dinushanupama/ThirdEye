const WeeklyReport = require('../models/WeeklyReport');
const ReviewLog = require('../models/ReviewLog');
const ReportVersion = require('../models/ReportVersion');
const sendEmail = require('../utils/sendEmail');

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

// // @desc    Manager review action (Approve or Request Changes)
// // @route   POST /api/reports/:id/review
// // @access  Private (Manager/Admin)
// const reviewReport = async (req, res) => {
//   try {
//     const { action, comment } = req.body; 
//     const report = await WeeklyReport.findById(req.params.id);

//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }

//     if (report.status !== 'Submitted') {
//       return res.status(400).json({ message: 'Can only review Submitted reports' });
//     }

//     if (!report.currentVersion) {
//       report.currentVersion = 1;
//     }

//     // Save a snapshot of the report content if changes are requested
//     if (action === 'Needs Correction') {
//       await ReportVersion.create({
//         reportId: report._id,
//         versionNumber: report.currentVersion,
//         tasks: report.tasks,
//         plannedNextWeek: report.plannedNextWeek,
//         blockers: report.blockers,
//         achievements: report.achievements,
//         hoursBreakdown: report.hoursBreakdown,
//         notes: report.notes,
//         latestReviewComment: comment
//       });
//       // REMOVED: report.currentVersion += 1; 
//       // The version will now only increment when the user resubmits via updateReport
//     }

//     // Update report status and save the manager's comment
//     report.status = action;
//     report.latestReviewComment = comment || '';
//     await report.save();

//     // Log the review action
//     await ReviewLog.create({
//       report: report._id,
//       reviewer: req.user._id,
//       action,
//       comment,
//       versionNumber: report.currentVersion 
//     });

//     res.json(report);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Manager review action (Approve or Request Changes)
// @route   POST /api/reports/:id/review
// @access  Private (Manager/Admin)
const reviewReport = async (req, res) => {
  try {
    const { action, comment } = req.body;
    
    // 2. Populate user to get name and email, and project for report context
    const report = await WeeklyReport.findById(req.params.id)
      .populate('user', 'name email')
      .populate('project', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'Submitted') {
      return res.status(400).json({ message: 'Can only review Submitted reports' });
    }

    if (!report.currentVersion) {
      report.currentVersion = 1;
    }

    // Save snapshot of the report before modification
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
    }

    // Update report status and review comment
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

    // 3. Trigger email if action is 'Needs Correction'
    if (action === 'Needs Correction' && report.user?.email) {
      const projectName = report.project?.name || 'Assigned Project';
      const recipientName = report.user.name || 'Team Member';

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
          <h2 style="color: #d97706; margin-top: 0;">Weekly Report - Corrections Requested</h2>
          <p>Hi <strong>${recipientName}</strong>,</p>
          <p>Your weekly report for <strong>${projectName}</strong> has been reviewed by your manager and marked as <strong>Needs Correction</strong>.</p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Manager Feedback:</p>
            <p style="margin: 6px 0 0 0; color: #78350f; font-style: italic;">"${comment || 'Please update your report details and resubmit.'}"</p>
          </div>

          <p>Please log in to your dashboard to make the requested revisions and submit your updated report.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            This is an automated notification from WeeklyStatus. Please do not reply directly to this email.
          </div>
        </div>
      `;

      // Non-blocking call so email latency doesn't delay the API response
      sendEmail({
        to: report.user.email,
        subject: `Action Required: Changes Requested for ${projectName} Report`,
        html: emailHtml
      });
    }

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