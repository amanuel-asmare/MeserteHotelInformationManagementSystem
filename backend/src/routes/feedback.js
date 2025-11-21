/*// backend/src/routes/feedback.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createFeedback, getFeedback } = require('../controllers/feedbackController');

router.route('/')
    // A logged-in customer can POST feedback
    .post(protect, authorize('customer'), createFeedback)
    // Logged-in staff can GET feedback
    .get(protect, authorize('admin', 'manager', 'receptionist', 'cashier'), getFeedback);

module.exports = router;*/ // backend/src/routes/feedback.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createFeedback, getFeedback, getMyFeedback } = require('../controllers/feedbackController');

// ✅ --- NEW ROUTE ADDED --- ✅
// This route allows a logged-in customer to get their own feedback history.
router.route('/my')
    .get(protect, authorize('customer'), getMyFeedback);


// --- Existing Routes ---
router.route('/')
    // A logged-in customer can POST feedback
    .post(protect, authorize('customer'), createFeedback)
    // Logged-in staff can GET feedback
    .get(protect, authorize('admin', 'manager', 'receptionist', 'cashier'), getFeedback);

module.exports = router;