const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getTeamMembers // <-- Import the new function
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('manager', 'admin'), createProject);

// NEW ROUTE: Must be above /:id
router.route('/users')
  .get(protect, authorize('manager', 'admin'), getTeamMembers);

router.route('/:id')
  .put(protect, authorize('manager', 'admin'), updateProject)
  .delete(protect, authorize('manager', 'admin'), deleteProject);

module.exports = router;