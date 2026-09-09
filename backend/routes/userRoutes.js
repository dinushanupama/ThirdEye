const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserRole, deleteUser, updateUser } = require('../controllers/userController');

// Import your existing auth middleware
const { protect } = require('../middleware/authMiddleware'); 

// Create a quick Admin middleware to ensure only admins can hit these routes
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Map the routes and protect them with both standard auth and admin auth
router.route('/')
  .get(protect, admin, getUsers);

router.route('/register')
  .post(protect, admin, createUser);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

 

module.exports = router;