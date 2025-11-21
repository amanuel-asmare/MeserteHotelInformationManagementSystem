const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const Room = require('../models/Room');
const Report = require('../models/ReportCashier');
const { startOfDay, endOfDay, eachDayOfInterval } = require('date-fns');

// This utility function remains the same, it correctly generates the data
const generateComprehensiveData = async(start, end) => {
    const completedBookings = await Booking.find({ status: 'completed', updatedAt: { $gte: start, $lte: end } });
    const completedOrders = await Order.find({ paymentStatus: 'completed', updatedAt: { $gte: start, $lte: end } });
    const roomRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const orderRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = roomRevenue + orderRevenue;
    const newBookingsCount = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const totalRooms = await Room.countDocuments();
    const dateInterval = eachDayOfInterval({ start, end });
    const occupancyTrend = [];
    for (const day of dateInterval) {
        const occupiedCount = await Booking.countDocuments({
            status: { $in: ['confirmed', 'completed'] },
            checkIn: { $lte: endOfDay(day) },
            checkOut: { $gt: startOfDay(day) }
        });
        const rate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;
        occupancyTrend.push({ date: day.toISOString().split('T')[0], rate: parseFloat(rate.toFixed(1)) });
    }
    const avgOccupancy = occupancyTrend.reduce((sum, day) => sum + day.rate, 0) / (occupancyTrend.length || 1);
    const topMenuItems = await Order.aggregate([
        { $match: { paymentStatus: 'completed', updatedAt: { $gte: start, $lte: end } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', quantitySold: { $sum: '$items.quantity' } } },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', quantitySold: 1, _id: 0 } }
    ]);
    const bookingTrend = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', bookings: '$count', _id: 0 } }
    ]);
    return {
        summary: { totalRevenue: totalRevenue.toFixed(2), avgOccupancy: (avgOccupancy || 0).toFixed(1), newBookings: newBookingsCount, totalGuests: completedBookings.reduce((sum, b) => sum + b.guests, 0) },
        revenueBreakdown: { roomRevenue: roomRevenue.toFixed(2), orderRevenue: orderRevenue.toFixed(2) },
        occupancyTrend,
        topMenuItems,
        bookingTrend
    };
};

// FIX: This controller now ONLY generates the report. No saving logic.
exports.getComprehensiveReport = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }
        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));
        const reportData = await generateComprehensiveData(start, end);
        res.json(reportData);
    } catch (error) {
        console.error("Report generation error:", error);
        res.status(500).json({ message: 'Failed to generate report data.' });
    }
};

// NEW: A dedicated controller for SAVING the report.
exports.saveComprehensiveReport = async(req, res) => {
    try {
        const { reportData, note, startDate, endDate } = req.body;

        if (!reportData) {
            return res.status(400).json({ message: 'Report data is required to save.' });
        }

        await Report.create({
            reportType: 'Comprehensive Cashier',
            reportData,
            generatedBy: req.user.id,
            note: note || '',
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        res.status(201).json({ message: 'Report saved successfully.' });

    } catch (error) {
        console.error("Report saving error:", error);
        res.status(500).json({ message: 'Failed to save the report to the database.' });
    }
};

// This function for managers/admins to view history remains unchanged.
exports.getReportsHistory = async(req, res) => {
    try {
        const reports = await Report.find({})
            .populate('generatedBy', 'firstName lastName role')
            .sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching report history:', error);
        res.status(500).json({ message: 'Error fetching report history' });
    }
};
/*// backend/src/controllers/reportController.js
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const Room = require('../models/Room');
const { startOfDay, endOfDay, eachDayOfInterval } = require('date-fns');

exports.getComprehensiveReport = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));

        // --- 1. Key Performance Indicators (KPIs) ---
        const completedBookings = await Booking.find({ status: 'completed', updatedAt: { $gte: start, $lte: end } });
        const completedOrders = await Order.find({ paymentStatus: 'completed', updatedAt: { $gte: start, $lte: end } });

        const roomRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const orderRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalRevenue = roomRevenue + orderRevenue;
        const newBookingsCount = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });

        // --- 2. Occupancy Trend Calculation ---
        const totalRooms = await Room.countDocuments();
        const dateInterval = eachDayOfInterval({ start, end });
        const occupancyTrend = [];

        for (const day of dateInterval) {
            const occupiedCount = await Booking.countDocuments({
                status: 'confirmed',
                checkIn: { $lte: endOfDay(day) },
                checkOut: { $gt: startOfDay(day) }
            });
            const rate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;
            occupancyTrend.push({ date: day.toISOString().split('T')[0], rate: parseFloat(rate.toFixed(1)) });
        }
        const avgOccupancy = occupancyTrend.reduce((sum, day) => sum + day.rate, 0) / occupancyTrend.length;


        // --- 3. Top Selling Menu Items (Aggregation) ---
        const topMenuItems = await Order.aggregate([
            { $match: { paymentStatus: 'completed', updatedAt: { $gte: start, $lte: end } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', quantitySold: { $sum: '$items.quantity' } } },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
            { $project: { name: '$_id', quantitySold: 1, _id: 0 } }
        ]);

        // --- 4. Booking vs. Cancellation Trend ---
        const bookingTrend = await Booking.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', bookings: '$count', _id: 0 } }
        ]);

        res.json({
            summary: {
                totalRevenue: totalRevenue.toFixed(2),
                avgOccupancy: (avgOccupancy || 0).toFixed(1),
                newBookings: newBookingsCount,
                totalGuests: completedBookings.reduce((sum, b) => sum + b.guests, 0)
            },
            revenueBreakdown: {
                roomRevenue: roomRevenue.toFixed(2),
                orderRevenue: orderRevenue.toFixed(2),
            },
            occupancyTrend,
            topMenuItems,
            bookingTrend
        });

    } catch (error) {
        console.error("Report generation error:", error);
        res.status(500).json({ message: 'Failed to generate report.' });
    }
};*/