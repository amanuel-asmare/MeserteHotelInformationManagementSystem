const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getComprehensiveReport,
    saveComprehensiveReport, // NEW: Import the save controller
    getReportsHistory
} = require('../controllers/reportCashierController');

// This route GETS (generates) the report data. Accessible by all relevant roles.
router.get(
    '/comprehensive',
    protect,
    authorize('cashier', 'manager', 'admin'),
    getComprehensiveReport
);

// NEW: This route POSTS (saves) the report data. Only accessible by a cashier.
router.post(
    '/comprehensive/save',
    protect,
    authorize('cashier'),
    saveComprehensiveReport
);

// This route for viewing history remains for managers and admins only.
router.get(
    '/history',
    protect,
    authorize('manager', 'admin'),
    getReportsHistory
);

module.exports = router;
/*// backend/src/routes/reportCashierRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getComprehensiveReport } = require('../controllers/reportCashierController');

// Only Managers and Admins can access reports
const canViewReports = authorize('manager', 'admin');

router.get('/comprehensive', protect, canViewReports, getComprehensiveReport);

module.exports = router;*/