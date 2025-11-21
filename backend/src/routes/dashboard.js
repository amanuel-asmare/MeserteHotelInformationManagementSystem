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
const { getCashierDashboardData } = require('../controllers/dashboardController');

router.get('/receptionist', protect, authorize('receptionist'), async(req, res) => {
    try {
        // ---------- DATE HELPERS ----------
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        // ---------- 1. CHECKED-IN TODAY (for dashboard stat, based on _today's_ check-ins) ----------
        // This array represents bookings that *checked in* on today's date.
        const checkedInToday = await Booking.find({
                checkIn: { $gte: today, $lt: tomorrow },
                status: { $in: ['confirmed', 'pending'] } // Could also filter for 'completed' if check-in is marked completed same day
            })
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone');

        // Note: The frontend `actualCheckedInGuests` derived from `allBookings` will be more accurate
        // for guests *currently staying* at the hotel, which is what "Currently Checked-in Guests" implies.
        // `checkedInToday` as returned by backend is specifically those whose check-in date is today.

        // ---------- 2. TODAY'S REVENUE (if + safe) ----------
        const revenueResult = await Booking.aggregate([{
                $match: {
                    checkIn: { $gte: today, $lt: tomorrow }, // Revenue from bookings checked in today
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
            availability: true, // Assuming `availability: true` means it's free
            status: 'clean' // And it's clean for immediate use
        });
        const occupiedRooms = totalRooms - availableRooms; // Simple calculation, might need refinement based on exact room status logic
        const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

        // ---------- 4. RECENT CUSTOMERS (not currently used in your provided frontend, but kept) ----------
        const recentCustomers = await User.find({ role: 'customer' })
            .select('firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(10);

        // ---------- 5. ALL ROOMS (for UI, if needed to map through rooms) ----------
        const allRooms = await Room.find({}).select('roomNumber type availability status');

        // ---------- 6. ALL BOOKINGS (Crucial for frontend to determine 'currently checked-in', 'upcoming', 'departing') ----------
        // Fetch all relevant bookings for the frontend to filter based on current date
        const allBookings = await Booking.find({
                $or: [
                    { status: { $in: ['confirmed', 'pending'] }, checkOut: { $gt: today } }, // Confirmed/pending bookings not yet checked out
                    { status: { $in: ['confirmed', 'pending'] }, checkIn: { $lte: tomorrow } } // Include arrivals up to tomorrow
                ]
            })
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone');


        // ---------- RESPONSE ----------
        res.json({
            checkedInToday, // This is specifically for the 'checked-in today' stat
            todayRevenue,
            totalRooms,
            availableRooms,
            occupiedRooms,
            maintenanceRooms,
            recentCustomers,
            rooms: allRooms,
            bookings: allBookings // Frontend will process this to get actual currently checked-in guests
        });
    } catch (err) {
        console.error('Receptionist Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to load dashboard data' });
    }
});

// This single endpoint will provide all data for the cashier dashboard
router.get('/cashier', protect, authorize('cashier', 'manager', 'admin'), getCashierDashboardData);
module.exports = router;