// backend/src/routes/feedback.js
const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getFeedbacks,
    respondToFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), submitFeedback);
router.get('/', protect, authorize('manager', 'receptionist'), getFeedbacks);
router.post('/:id/respond', protect, authorize('manager'), respondToFeedback);

module.exports = router;