const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All authenticated users can view projects
router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('manager', 'admin'), createProject);

router.route('/:id')
  .put(protect, authorize('manager', 'admin'), updateProject)
  .delete(protect, authorize('manager', 'admin'), deleteProject);

module.exports = router;