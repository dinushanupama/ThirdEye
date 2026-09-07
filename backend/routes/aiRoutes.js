const express = require('express');
const router = express.Router();
const { generateResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, generateResponse);

module.exports = router;