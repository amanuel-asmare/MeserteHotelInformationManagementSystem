// backend/src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    checkIn,
    checkOut,
    getMyAttendance,
    getStaffAttendanceByDate,
    updateAttendance,
    createStaffAttendance,
    getStaffAttendanceHistory
} = require('../controllers/attendanceController');

// Staff-specific routes (Cashier, Receptionist)
router.post('/check-in', protect, authorize('receptionist', 'cashier'), checkIn);
router.post('/check-out', protect, authorize('receptionist', 'cashier'), checkOut);

// FIX: Define two routes for optional date parameter
router.get('/my', protect, authorize('receptionist', 'cashier'), getMyAttendance); // Route without date
router.get('/my/:date', protect, authorize('receptionist', 'cashier'), getMyAttendance); // Route with date

// Manager/Admin routes
router.get('/manager/date/:date', protect, authorize('admin', 'manager'), getStaffAttendanceByDate);
router.put('/manager/:attendanceId', protect, authorize('admin', 'manager'), updateAttendance);
router.post('/manager', protect, authorize('admin', 'manager'), createStaffAttendance);
router.get('/manager/history/:userId', protect, authorize('admin', 'manager'), getStaffAttendanceHistory);


module.exports = router;