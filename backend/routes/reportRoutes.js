const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  reviewReport,
  getAllReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Static Routes (Must come first)
router.route('/')
  .post(protect, authorize('team_member'), createReport);

router.route('/my-reports')
  .get(protect, authorize('team_member'), getMyReports);

router.route('/all')
  .get(protect, authorize('manager', 'admin'), getAllReports);

// 2. Dynamic Routes (Using :id)
router.route('/:id')
  .get(protect, getReportById) 
  .put(protect, authorize('team_member'), updateReport);

router.route('/:id/review')
  .post(protect, authorize('manager', 'admin'), reviewReport);

module.exports = router;