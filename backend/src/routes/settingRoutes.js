const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { uploadLogo } = require('../middleware/upload'); // Use the centralized middleware

// Public get
router.get('/', getSettings);

// Admin only update
router.put('/', protect, authorize('admin'), uploadLogo.single('logo'), updateSettings);

module.exports = router;