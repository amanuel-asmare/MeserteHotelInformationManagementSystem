/*//`backend/src/routes/reports.js` **

const express = require('express');
const router = express.Router();
const {
    getDailyReport,
    getOccupancyReport,
    getRevenueReport,
    getGuestReport,
    getReportsHistory, // NEW
    getSingleReport, // NEW
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth'); // Assuming you have these middleware

// Apply protection and authorization middleware to all report routes
router.use(protect);

// Report Routes for Receptionist, Manager, Admin to GENERATE
router.get('/daily', authorize('receptionist', 'manager', 'admin'), getDailyReport);
router.get('/occupancy', authorize('receptionist', 'manager', 'admin'), getOccupancyReport);
router.get('/revenue', authorize('receptionist', 'manager', 'admin'), getRevenueReport);
router.get('/guests', authorize('receptionist', 'manager', 'admin'), getGuestReport);

// NEW: Report History and Single Report for Manager, Admin (and Receptionist for their own report)
router.get('/history', authorize('manager', 'admin'), getReportsHistory); // Only managers and admins can view history
router.get('/:id', authorize('receptionist', 'manager', 'admin'), getSingleReport); // Anyone can view a report if authorized by ID

module.exports = router;*/
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
    // Receptionist Report Generators
    getDailyReport,
    getOccupancyReport,
    getRevenueReport,
    getGuestReport,
    // Cashier Report Generators
    getComprehensiveReport,
    saveComprehensiveReport,
    // Shared/Management Functions
    getReportsHistory,
    getSingleReport,
} = require('../controllers/reportController');

// Apply authentication middleware to all routes in this file
router.use(protect);

// --- RECEPTIONIST REPORT ROUTES ---
router.get('/daily', authorize('receptionist', 'manager', 'admin'), getDailyReport);
router.get('/occupancy', authorize('receptionist', 'manager', 'admin'), getOccupancyReport);
router.get('/revenue', authorize('receptionist', 'manager', 'admin'), getRevenueReport);
router.get('/guests', authorize('receptionist', 'manager', 'admin'), getGuestReport);

// --- CASHIER REPORT ROUTES ---
router.get('/comprehensive', authorize('cashier', 'manager', 'admin'), getComprehensiveReport);
router.post('/comprehensive/save', authorize('cashier'), saveComprehensiveReport);

// --- MANAGEMENT & HISTORY ROUTES ---
router.get('/history', authorize('manager', 'admin'), getReportsHistory);
router.get('/:id', authorize('receptionist', 'manager', 'admin', 'cashier'), getSingleReport);

module.exports = router;
/*const express = require('express');
const router = express.Router();
const {
    getDailyReport,
    getOccupancyReport,
    getRevenueReport,
    getGuestReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth'); // Assuming you have these middleware

// Apply protection and authorization middleware to all report routes
router.use(protect);
router.use(authorize('receptionist', 'manager', 'admin')); // Adjust roles as needed

// Report Routes
router.get('/daily', getDailyReport);
router.get('/occupancy', getOccupancyReport);
router.get('/revenue', getRevenueReport);
router.get('/guests', getGuestReport);

module.exports = router;*/