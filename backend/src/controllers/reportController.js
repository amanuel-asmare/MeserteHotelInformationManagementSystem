/*const {
    generateDailyReport,
    generateOccupancyReport,
    generateRevenueReport,
    generateGuestReport
} = require('../utils/reportUtils');

// Helper to parse date from query params
const parseDateParam = (dateString, defaultDate = new Date()) => {
    return dateString ? new Date(dateString) : defaultDate;
};

// @desc    Generate Daily Report
// @route   GET /api/reports/daily
// @access  Private (Receptionist, Manager, Admin)
exports.getDailyReport = async(req, res) => {
    try {
        const date = parseDateParam(req.query.date, new Date()); // Default to today
        const report = await generateDailyReport(date);
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({ message: 'Error generating daily report', error: error.message });
    }
};

// @desc    Generate Occupancy Report
// @route   GET /api/reports/occupancy
// @access  Private (Receptionist, Manager, Admin)
exports.getOccupancyReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date());
        const endDate = parseDateParam(req.query.endDate, new Date());
        const report = await generateOccupancyReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating occupancy report:', error);
        res.status(500).json({ message: 'Error generating occupancy report', error: error.message });
    }
};

// @desc    Generate Revenue Report
// @route   GET /api/reports/revenue
// @access  Private (Receptionist, Manager, Admin)
exports.getRevenueReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date(new Date().setDate(1))); // Default to start of month
        const endDate = parseDateParam(req.query.endDate, new Date()); // Default to today
        const report = await generateRevenueReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ message: 'Error generating revenue report', error: error.message });
    }
};

// @desc    Generate Guest Report
// @route   GET /api/reports/guests
// @access  Private (Receptionist, Manager, Admin)
exports.getGuestReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date(0)); // Default to epoch for all time
        const endDate = parseDateParam(req.query.endDate, new Date()); // Default to today
        const report = await generateGuestReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating guest report:', error);
        res.status(500).json({ message: 'Error generating guest report', error: error.message });
    }
};*/

/*//`backend/src/controllers/reportController.js` **


const {
    generateDailyReport,
    generateOccupancyReport,
    generateRevenueReport,
    generateGuestReport,
    saveReport, // NEW
    getReportsHistory, // NEW
    getSingleReportById, // NEW
} = require('../utils/reportUtils');

// Helper to parse date from query params
const parseDateParam = (dateString, defaultDate = new Date()) => {
    return dateString ? new Date(dateString) : defaultDate;
};

// @desc    Generate Daily Report
// @route   GET /api/reports/daily
// @access  Private (Receptionist, Manager, Admin)
exports.getDailyReport = async(req, res) => {
    try {
        const date = parseDateParam(req.query.date, new Date()); // Default to today
        const report = await generateDailyReport(date);

        // NEW: Save report if requested by the receptionist (only receptionist can send 'save=true')
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await saveReport('Daily', report, req.user.id, req.query.note || '');
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({ message: 'Error generating daily report', error: error.message });
    }
};

// @desc    Generate Occupancy Report
// @route   GET /api/reports/occupancy
// @access  Private (Receptionist, Manager, Admin)
exports.getOccupancyReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date());
        const endDate = parseDateParam(req.query.endDate, new Date());
        const report = await generateOccupancyReport(startDate, endDate);

        // NEW: Save report if requested
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await saveReport('Occupancy', report, req.user.id, req.query.note || '');
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating occupancy report:', error);
        res.status(500).json({ message: 'Error generating occupancy report', error: error.message });
    }
};

// @desc    Generate Revenue Report
// @route   GET /api/reports/revenue
// @access  Private (Receptionist, Manager, Admin)
exports.getRevenueReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date(new Date().setDate(1))); // Default to start of month
        const endDate = parseDateParam(req.query.endDate, new Date()); // Default to today
        const report = await generateRevenueReport(startDate, endDate);

        // NEW: Save report if requested
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await saveReport('Revenue', report, req.user.id, req.query.note || '');
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ message: 'Error generating revenue report', error: error.message });
    }
};

// @desc    Generate Guest Report
// @route   GET /api/reports/guests
// @access  Private (Receptionist, Manager, Admin)
exports.getGuestReport = async(req, res) => {
    try {
        const startDate = parseDateParam(req.query.startDate, new Date(0)); // Default to epoch for all time
        const endDate = parseDateParam(req.query.endDate, new Date()); // Default to today
        const report = await generateGuestReport(startDate, endDate);

        // NEW: Save report if requested
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await saveReport('Guest', report, req.user.id, req.query.note || '');
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating guest report:', error);
        res.status(500).json({ message: 'Error generating guest report', error: error.message });
    }
};

// NEW: @desc    Get all generated reports (history)
// @route   GET /api/reports/history
// @access  Private (Manager, Admin)
exports.getReportsHistory = async(req, res) => {
    try {
        // Ensure only manager or admin can access this history
        if (req.user.role !== 'manager' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const reports = await getReportsHistory();
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports history:', error);
        res.status(500).json({ message: 'Error fetching reports history', error: error.message });
    }
};

// NEW: @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (Manager, Admin, Receptionist if it's their own report)
exports.getSingleReport = async(req, res) => {
    try {
        const reportId = req.params.id;
        const report = await getSingleReportById(reportId);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Authorization: Only manager/admin or the original generator can view
        if (req.user.role !== 'manager' && req.user.role !== 'admin' && report.generatedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error fetching single report:', error);
        res.status(500).json({ message: 'Error fetching single report', error: error.message });
    }
};*/
const Report = require('../models/Report');
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const Room = require('../models/Room');
const User = require('../models/User');
const { startOfDay, endOfDay, eachDayOfInterval } = require('date-fns');

// --- UTILITY FUNCTIONS ---
const parseDateParam = (dateString, defaultDate) => {
    return dateString ? new Date(dateString) : defaultDate;
};
const formatDate = (date) => date.toISOString().split('T')[0];

// --- RECEPTIONIST REPORT GENERATION LOGIC ---

const generateDailyReport = async(date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ availability: false });
    const availableRooms = totalRooms - occupiedRooms;
    const checkIns = await Booking.countDocuments({ checkIn: { $gte: startOfDay, $lte: endOfDay } });
    const checkOuts = await Booking.countDocuments({ checkOut: { $gte: startOfDay, $lte: endOfDay } });
    const newBookings = await Booking.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const dailyRevenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalRevenueToday = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) + '%' : '0.00%';
    return { reportDate: formatDate(date), newCheckIns: checkIns, newCheckOuts: checkOuts, newBookingsToday: newBookings, totalRevenueToday, occupancyRate, availableRooms, occupiedRooms, totalRooms };
};

const generateOccupancyReport = async(startDate, endDate) => {
    const totalRooms = await Room.countDocuments();
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const operationalRooms = totalRooms - maintenanceRooms;
    let totalOccupiedRoomDays = 0;
    const numberOfDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) || 1;
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
        const occupiedOnThisDay = await Booking.countDocuments({
            status: { $in: ['confirmed', 'completed'] },
            checkIn: { $lte: endOfDay(d) },
            checkOut: { $gt: startOfDay(d) }
        });
        totalOccupiedRoomDays += occupiedOnThisDay;
    }
    const averageOccupiedRooms = totalOccupiedRoomDays / numberOfDays;
    const occupancyRateValue = operationalRooms > 0 ? (totalOccupiedRoomDays / (operationalRooms * numberOfDays)) * 100 : 0;
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), totalRooms, occupiedRooms: Math.round(averageOccupiedRooms), availableRooms: Math.round(operationalRooms - averageOccupiedRooms), occupancyRate: occupancyRateValue.toFixed(2) + '%' };
};

const generateRevenueReport = async(startDate, endDate) => {
    const revenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'completed' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, averageOrder: { $avg: '$totalAmount' }, totalOrders: { $sum: 1 } } }]);
    const roomRevenueResult = await Booking.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $in: ['completed', 'confirmed'] } } }, { $group: { _id: null, totalRoomRevenue: { $sum: '$totalPrice' } } }]);
    const foodBeverageRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const roomBookingRevenue = roomRevenueResult.length > 0 ? roomRevenueResult[0].totalRoomRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 ? (revenueResult[0].averageOrder || 0).toFixed(2) : 0;
    const numberOfOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), totalOverallRevenue: foodBeverageRevenue + roomBookingRevenue, foodBeverageRevenue, roomBookingRevenue, averageOrderValue, numberOfOrders };
};

const generateGuestReport = async(startDate, endDate) => {
    const newGuestsInDateRange = await User.countDocuments({ role: 'customer', createdAt: { $gte: startDate, $lte: endDate } });
    const totalGuests = await User.countDocuments({ role: 'customer' });
    const recentGuests = await User.find({ role: 'customer' }).select('firstName lastName email phone createdAt').sort({ createdAt: -1 }).limit(10);
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), newGuestsInDateRange, totalRegisteredGuests: totalGuests, recentGuestSignups: recentGuests };
};

// --- CASHIER REPORT GENERATION LOGIC ---

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
        const occupiedCount = await Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] }, checkIn: { $lte: endOfDay(day) }, checkOut: { $gt: startOfDay(day) } });
        const rate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;
        occupancyTrend.push({ date: day.toISOString().split('T')[0], rate: parseFloat(rate.toFixed(1)) });
    }
    const avgOccupancy = occupancyTrend.reduce((sum, day) => sum + day.rate, 0) / (occupancyTrend.length || 1);
    const topMenuItems = await Order.aggregate([
        { $match: { paymentStatus: 'completed', updatedAt: { $gte: start, $lte: end } } }, { $unwind: '$items' }, { $group: { _id: '$items.name', quantitySold: { $sum: '$items.quantity' } } }, { $sort: { quantitySold: -1 } }, { $limit: 5 }, { $project: { name: '$_id', quantitySold: 1, _id: 0 } }
    ]);
    const bookingTrend = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { date: '$_id', bookings: '$count', _id: 0 } }
    ]);
    return {
        summary: { totalRevenue: totalRevenue.toFixed(2), avgOccupancy: (avgOccupancy || 0).toFixed(1), newBookings: newBookingsCount, totalGuests: completedBookings.reduce((sum, b) => sum + b.guests, 0) },
        revenueBreakdown: { roomRevenue: roomRevenue.toFixed(2), orderRevenue: orderRevenue.toFixed(2) },
        occupancyTrend,
        topMenuItems,
        bookingTrend
    };
};

// --- EXPORTED CONTROLLER FUNCTIONS ---

// RECEPTIONIST REPORTS
exports.getDailyReport = async(req, res) => {
    try {
        const report = await generateDailyReport(parseDateParam(req.query.date, new Date()));
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await Report.create({ reportType: 'Daily', reportData: report, generatedBy: req.user.id, note: req.query.note || '' });
        }
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ message: 'Error generating daily report' }); }
};

exports.getOccupancyReport = async(req, res) => {
    try {
        const report = await generateOccupancyReport(parseDateParam(req.query.startDate, new Date()), parseDateParam(req.query.endDate, new Date()));
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await Report.create({ reportType: 'Occupancy', reportData: report, generatedBy: req.user.id, note: req.query.note || '' });
        }
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ message: 'Error generating occupancy report' }); }
};

exports.getRevenueReport = async(req, res) => {
    try {
        const report = await generateRevenueReport(parseDateParam(req.query.startDate, new Date(new Date().setDate(1))), parseDateParam(req.query.endDate, new Date()));
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await Report.create({ reportType: 'Revenue', reportData: report, generatedBy: req.user.id, note: req.query.note || '' });
        }
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ message: 'Error generating revenue report' }); }
};

exports.getGuestReport = async(req, res) => {
    try {
        const report = await generateGuestReport(parseDateParam(req.query.startDate, new Date(0)), parseDateParam(req.query.endDate, new Date()));
        if (req.query.save === 'true' && req.user.role === 'receptionist') {
            await Report.create({ reportType: 'Guest', reportData: report, generatedBy: req.user.id, note: req.query.note || '' });
        }
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ message: 'Error generating guest report' }); }
};

// CASHIER REPORTS
exports.getComprehensiveReport = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Start date and end date are required.' });
        const reportData = await generateComprehensiveData(startOfDay(new Date(startDate)), endOfDay(new Date(endDate)));
        res.json(reportData);
    } catch (error) { res.status(500).json({ message: 'Failed to generate report data.' }); }
};

exports.saveComprehensiveReport = async(req, res) => {
    try {
        const { reportData, note, startDate, endDate } = req.body;
        if (!reportData) return res.status(400).json({ message: 'Report data is required to save.' });
        await Report.create({
            reportType: 'Comprehensive Cashier',
            reportData,
            generatedBy: req.user.id,
            note: note || '',
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        res.status(201).json({ message: 'Report saved successfully.' });
    } catch (error) { res.status(500).json({ message: 'Failed to save the report to the database.' }); }
};

// UNIFIED HISTORY & SINGLE REPORT VIEW
exports.getReportsHistory = async(req, res) => {
    try {
        const { category } = req.query;
        let filter = {}; // Default to no filter

        // Apply a filter ONLY if a category is specified
        if (category === 'receptionist') {
            filter.reportType = { $in: ['Daily', 'Occupancy', 'Revenue', 'Guest'] };
        } else if (category === 'cashier') {
            filter.reportType = 'Comprehensive Cashier';
        }

        const reports = await Report.find(filter) // The filter is applied here
            .populate('generatedBy', 'firstName lastName role')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching report history:', error); // Better logging
        res.status(500).json({ message: 'Error fetching report history' });
    }
};

exports.getSingleReport = async(req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('generatedBy', 'firstName lastName role');
        if (!report) return res.status(404).json({ message: 'Report not found' });
        if (req.user.role !== 'manager' && req.user.role !== 'admin' && report.generatedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ message: 'Error fetching single report' }); }
};