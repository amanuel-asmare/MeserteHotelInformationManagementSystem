/*// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

router.get('/receptionist', protect, authorize('receptionist'), async(req, res) => {
    try {
        // ---------- DATE HELPERS ----------
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // ---------- 1. CHECKED-IN TODAY ----------
        const checkedInToday = await Booking.find({
                checkIn: { $gte: today, $lt: tomorrow },
                status: { $in: ['confirmed', 'pending'] }
            })
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone');

        // ---------- 2. TODAY'S REVENUE (if + safe) ----------
        const revenueResult = await Booking.aggregate([{
                $match: {
                    checkIn: { $gte: today, $lt: tomorrow },
                    paymentStatus: 'completed',
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        let todayRevenue = 0;
        if (revenueResult && revenueResult.length > 0 && revenueResult[0].total !== undefined) {
            todayRevenue = revenueResult[0].total;
        }

        // ---------- 3. ROOM STATS ----------
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({
            availability: true,
            status: 'clean'
        });
        const occupiedRooms = totalRooms - availableRooms;
        const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

        // ---------- 4. RECCUSTOMERS ----------
        const recentCustomers = await User.find({ role: 'customer' })
            .select('firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(10);

        // ---------- 5. ALL ROOMS (for UI) ----------
        const allRooms = await Room.find({}).select('roomNumber type availability status');

        // ---------- 6. ALL BOOKINGS (for UI filters) ----------
        const allBookings = await Booking.find({})
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone');

        // ---------- RESPONSE ----------
        res.json({
            checkedInToday,
                todayRevenue,
                totalRooms,
            avai    lableRooms,
                occupiedRooms,
                maintenanceRooms,
            recentCustomers,
            rooms: allRooms,
            bookings: allBookings
        });
    } catch (err) {
        console.error('Receptionist Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to load dashboard data' });
    }
});

module.exports = router;*/ // backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const {
    getCashierDashboardData,
    getAdminDashboardStats,
    getManagerDashboardStats,
    getReceptionistDashboardData,
    getNotifications
} = require('../controllers/dashboardController');


// Receptionist Dashboard
router.get('/receptionist', protect, authorize('receptionist'), getReceptionistDashboardData);
// Admin Dashboard Route
router.get('/admin', protect, authorize('admin', 'manager'), getAdminDashboardStats);
// This single endpoint will provide all data for the cashier dashboard
router.get('/cashier', protect, authorize('cashier', 'manager', 'admin'), getCashierDashboardData);
router.get('/manager', protect, authorize('manager', 'admin'), getManagerDashboardStats);
router.get('/notifications', protect, getNotifications);
module.exports = router;