// backend/src/routes/reports.js
const express = require('express');
const router = express.Router();
const {
    getBookingReport,
    getFinancialReport,
    getOccupancyReport,
    getFoodOrderReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('manager', 'cashier'));

router.get('/booking', getBookingReport);
router.get('/financial', getFinancialReport);
router.get('/occupancy', getOccupancyReport);
router.get('/food', getFoodOrderReport);

module.exports = router;