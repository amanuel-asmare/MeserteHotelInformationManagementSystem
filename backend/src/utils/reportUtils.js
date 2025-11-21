const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Order = require('../models/orderModel');
const Report = require('../models/Report');

const formatDate = (date) => date.toISOString().split('T')[0];

const saveReport = async(reportType, reportData, generatedBy, note) => {
    try {
        await Report.create({ reportType, reportData, generatedBy, note });
    } catch (error) {
        console.error('Error saving report:', error);
    }
};

const generateDailyReport = async(date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ availability: false });
    const availableRooms = await Room.countDocuments({ availability: true, status: 'clean' });
    const roomsOccupiedByGuests = await Room.countDocuments({ availability: false, status: { $ne: 'maintenance' } });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const operationalRooms = totalRooms - maintenanceRooms;
    const occupancyRate = operationalRooms > 0 ? ((roomsOccupiedByGuests / operationalRooms) * 100).toFixed(2) + '%' : '0.00%';

    const checkIns = await Booking.countDocuments({ checkIn: { $gte: startOfDay, $lte: endOfDay }, status: 'confirmed' });
    const checkOuts = await Booking.countDocuments({ checkOut: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' });
    const newBookings = await Booking.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const dailyRevenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalRevenueToday = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;

    return {
        reportDate: formatDate(date),
        newCheckIns: checkIns,
        newCheckOuts: checkOuts,
        newBookingsToday: newBookings,
        totalRevenueToday: totalRevenueToday,
        occupancyRate: occupancyRate,
        availableRooms: availableRooms,
        occupiedRooms: occupiedRooms,
        totalRooms: totalRooms
    };
};

const generateOccupancyReport = async(startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // --- THIS IS THE KEY FIX ---
    // If the report is for a single day, it now calls the corrected daily report logic to guarantee the numbers match.
    if (formatDate(start) === formatDate(end)) {
        const dailyData = await generateDailyReport(startDate);
        return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            totalRooms: dailyData.totalRooms,
            occupiedRooms: dailyData.occupiedRooms,
            availableRooms: dailyData.availableRooms,
            occupancyRate: dailyData.occupancyRate,
        };
    }

    // This logic runs for multi-day reports.
    const totalRooms = await Room.countDocuments();
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const operationalRooms = totalRooms - maintenanceRooms;

    const overlappingBookings = await Booking.find({
        room: { $ne: null },
        status: { $in: ['confirmed', 'completed'] },
        checkIn: { $lt: end },
        checkOut: { $gt: start }
    });

    let totalOccupiedRoomDays = 0;
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const currentDay = new Date(d);
        const occupiedOnThisDay = overlappingBookings.filter(b => {
            const checkInDate = new Date(b.checkIn);
            const checkOutDate = new Date(b.checkOut);
            return checkInDate <= currentDay && checkOutDate > currentDay;
        }).length;
        totalOccupiedRoomDays += occupiedOnThisDay;
    }

    const averageOccupiedRooms = numberOfDays > 0 ? totalOccupiedRoomDays / numberOfDays : 0;
    const occupancyRateValue = operationalRooms > 0 && numberOfDays > 0 ? (totalOccupiedRoomDays / (operationalRooms * numberOfDays)) * 100 : 0;

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        totalRooms: totalRooms,
        occupiedRooms: Math.round(averageOccupiedRooms),
        availableRooms: Math.round(operationalRooms - averageOccupiedRooms),
        occupancyRate: occupancyRateValue.toFixed(2) + '%',
    };
};

const generateRevenueReport = async(startDate, endDate) => {
    const revenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'completed' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, averageOrder: { $avg: '$totalAmount' }, totalOrders: { $sum: 1 } } }]);
    const roomRevenueResult = await Booking.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $in: ['completed', 'confirmed'] } } }, { $group: { _id: null, totalRoomRevenue: { $sum: '$totalPrice' } } }]);
    const foodBeverageRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const roomBookingRevenue = roomRevenueResult.length > 0 ? roomRevenueResult[0].totalRoomRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 && revenueResult[0].averageOrder !== undefined ? revenueResult[0].averageOrder.toFixed(2) : 0;
    const numberOfOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), totalOverallRevenue: foodBeverageRevenue + roomBookingRevenue, foodBeverageRevenue: foodBeverageRevenue, roomBookingRevenue: roomBookingRevenue, averageOrderValue: averageOrderValue, numberOfOrders: numberOfOrders };
};

const generateGuestReport = async(startDate, endDate) => {
    const newGuestsInDateRange = await User.countDocuments({ role: 'customer', createdAt: { $gte: startDate, $lte: endDate } });
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(endOfDay);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newGuestsInLast7Days = await User.countDocuments({ role: 'customer', createdAt: { $gte: sevenDaysAgo, $lte: endOfDay } });
    const totalGuests = await User.countDocuments({ role: 'customer' });
    const recentGuests = await User.find({ role: 'customer' }).select('firstName lastName email phone createdAt').sort({ createdAt: -1 }).limit(10);
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        newGuestsInDateRange: newGuestsInDateRange,
        newGuestsInLast7Days: newGuestsInLast7Days,
        totalRegisteredGuests: totalGuests,
        recentGuestSignups: recentGuests.map(guest => ({
            id: guest._id,
            firstName: guest.firstName || '',
            lastName: guest.lastName || '',
            email: guest.email,
            phone: guest.phone || 'N/A',
            registeredOn: formatDate(guest.createdAt)
        }))
    };
};

const getReportsHistory = async() => {
    return Report.find({}).populate('generatedBy', 'firstName lastName role').sort({ createdAt: -1 });
};

const getSingleReportById = async(reportId) => {
    return Report.findById(reportId).populate('generatedBy', 'firstName lastName role');
};

module.exports = {
    generateDailyReport,
    generateOccupancyReport,
    generateRevenueReport,
    generateGuestReport,
    saveReport,
    getReportsHistory,
    getSingleReportById,
};
/*const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Order = require('../models/orderModel');
const Report = require('../models/Report');

const formatDate = (date) => date.toISOString().split('T')[0];

const saveReport = async(reportType, reportData, generatedBy, note) => {
    try {
        await Report.create({ reportType, reportData, generatedBy, note });
    } catch (error) {
        console.error('Error saving report:', error);
    }
};

const generateDailyReport = async(date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const checkIns = await Booking.countDocuments({ checkIn: { $gte: startOfDay, $lte: endOfDay }, status: 'confirmed' });
    const checkOuts = await Booking.countDocuments({ checkOut: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' });
    const newBookings = await Booking.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const dailyRevenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalRevenueToday = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;
    const occupancyData = await generateOccupancyReport(date, date);
    return { reportDate: formatDate(date), newCheckIns: checkIns, newCheckOuts: checkOuts, newBookingsToday: newBookings, totalRevenueToday: totalRevenueToday, occupancyRate: occupancyData.occupancyRate, availableRooms: occupancyData.availableRooms, occupiedRooms: occupancyData.occupiedRooms, totalRooms: occupancyData.totalRooms };
};

const generateOccupancyReport = async(startDate, endDate) => {
    const totalRooms = await Room.countDocuments();
    const overlappingBookings = await Booking.find({ $or: [{ checkIn: { $lte: endDate }, checkOut: { $gte: startDate } }, { checkIn: { $gte: startDate, $lte: endDate } }], status: { $in: ['confirmed', 'completed'] } });
    const occupiedRoomIds = new Set();
    overlappingBookings.forEach(booking => { if (booking.room) { occupiedRoomIds.add(booking.room.toString()); } });
    const occupiedRooms = occupiedRoomIds.size;
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), totalRooms, occupiedRooms, availableRooms, occupancyRate: occupancyRate.toFixed(2) + '%' };
};

const generateRevenueReport = async(startDate, endDate) => {
    const revenueResult = await Order.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'completed' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, averageOrder: { $avg: '$totalAmount' }, totalOrders: { $sum: 1 } } }]);
    const roomRevenueResult = await Booking.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $in: ['completed', 'confirmed'] } } }, { $group: { _id: null, totalRoomRevenue: { $sum: '$totalPrice' } } }]);
    const foodBeverageRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const roomBookingRevenue = roomRevenueResult.length > 0 ? roomRevenueResult[0].totalRoomRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 && revenueResult[0].averageOrder !== undefined ? revenueResult[0].averageOrder.toFixed(2) : 0;
    const numberOfOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;
    return { startDate: formatDate(startDate), endDate: formatDate(endDate), totalOverallRevenue: foodBeverageRevenue + roomBookingRevenue, foodBeverageRevenue: foodBeverageRevenue, roomBookingRevenue: roomBookingRevenue, averageOrderValue: averageOrderValue, numberOfOrders: numberOfOrders };
};

const generateGuestReport = async(startDate, endDate) => {
    // === THE FIX IS APPLIED HERE ===

    // 1. Calculate the number of new guests within the report's specified date range.
    const newGuestsInDateRange = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    // 2. Separately, calculate the number of new guests in the last 7 days from the report's end date.
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(endOfDay);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newGuestsInLast7Days = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: sevenDaysAgo, $lte: endOfDay }
    });

    // 3. Get the total and recent guests as before.
    const totalGuests = await User.countDocuments({ role: 'customer' });
    const recentGuests = await User.find({ role: 'customer' })
        .select('firstName lastName email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        newGuestsInDateRange: newGuestsInDateRange, // Data for the historical period
        newGuestsInLast7Days: newGuestsInLast7Days, // Data for the "Last 7 Days" card
        totalRegisteredGuests: totalGuests,
        recentGuestSignups: recentGuests.map(guest => ({
            id: guest._id,
            firstName: guest.firstName || '',
            lastName: guest.lastName || '',
            email: guest.email,
            phone: guest.phone || 'N/A',
            registeredOn: formatDate(guest.createdAt)
        }))
    };
};

const getReportsHistory = async() => {
    return Report.find({}).populate('generatedBy', 'firstName lastName role').sort({ createdAt: -1 });
};

const getSingleReportById = async(reportId) => {
    return Report.findById(reportId).populate('generatedBy', 'firstName lastName role');
};

module.exports = {
    generateDailyReport,
    generateOccupancyReport,
    generateRevenueReport,
    generateGuestReport,
    saveReport,
    getReportsHistory,
    getSingleReportById,
};
*/



/*const Booking = require('../models/Booking'); // Assuming you have a Booking model
const Room = require('../models/Room'); // Assuming you have a Room model
const User = require('../models/User'); // Assuming User model for guests
const Order = require('../models/orderModel'); // Corrected to match your project structure
const Report = require('../models/Report'); // NEW: Report model

// Helper to format date for daily reports
const formatDate = (date) => date.toISOString().split('T')[0];

// NEW: Function to save a generated report
const saveReport = async(reportType, reportData, generatedBy, note) => {
    try {
        const newReport = await Report.create({
            reportType,
            reportData,
            generatedBy,
            note
        });
        console.log(`Report saved: ${reportType} by ${generatedBy}`);
        return newReport;
    } catch (error) {
        console.error('Error saving report:', error);
        throw new Error('Could not save report');
    }
};

const generateDailyReport = async(date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const checkIns = await Booking.countDocuments({
        checkIn: { $gte: startOfDay, $lte: endOfDay }, // Assumes 'checkIn' field from Booking model
        status: { $in: ['confirmed'] }
    });

    const checkOuts = await Booking.countDocuments({
        checkOut: { $gte: startOfDay, $lte: endOfDay }, // Assumes 'checkOut' field
        status: 'completed'
    });

    const newBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const dailyRevenueResult = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenueToday = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;

    const occupancyData = await generateOccupancyReport(date, date);

    return {
        reportDate: formatDate(date),
        newCheckIns: checkIns,
        newCheckOuts: checkOuts,
        newBookingsToday: newBookings,
        totalRevenueToday: totalRevenueToday,
        occupancyRate: occupancyData.occupancyRate,
        availableRooms: occupancyData.availableRooms,
        occupiedRooms: occupancyData.occupiedRooms,
        totalRooms: occupancyData.totalRooms
    };
};

const generateOccupancyReport = async(startDate, endDate) => {
    const totalRooms = await Room.countDocuments();

    const overlappingBookings = await Booking.find({
        $or: [
            { checkIn: { $lte: endDate }, checkOut: { $gte: startDate } },
            { checkIn: { $gte: startDate, $lte: endDate } }
        ],
        status: { $in: ['confirmed', 'completed'] }
    });

    const occupiedRoomIds = new Set();
    overlappingBookings.forEach(booking => {
        if (booking.room) {
            occupiedRoomIds.add(booking.room.toString());
        }
    });

    const occupiedRooms = occupiedRoomIds.size;
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate: occupancyRate.toFixed(2) + '%'
    };
};

const generateRevenueReport = async(startDate, endDate) => {
    const revenueResult = await Order.aggregate([{
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                paymentStatus: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                averageOrder: { $avg: '$totalAmount' },
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    const roomRevenueResult = await Booking.aggregate([{
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $in: ['completed', 'confirmed'] }
            }
        },
        {
            $group: {
                _id: null,
                totalRoomRevenue: { $sum: '$totalPrice' }
            }
        }
    ]);

    const foodBeverageRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const roomBookingRevenue = roomRevenueResult.length > 0 ? roomRevenueResult[0].totalRoomRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 && revenueResult[0].averageOrder !== undefined ? revenueResult[0].averageOrder.toFixed(2) : 0;
    const numberOfOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        totalOverallRevenue: foodBeverageRevenue + roomBookingRevenue,
        foodBeverageRevenue: foodBeverageRevenue,
        roomBookingRevenue: roomBookingRevenue,
        averageOrderValue: averageOrderValue,
        numberOfOrders: numberOfOrders
    };
};

const generateGuestReport = async(startDate, endDate) => {
    const newGuests = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalGuests = await User.countDocuments({ role: 'customer' });

    // Fetch recent guests within the date range, or just the most recent if the range is large
    const recentGuests = await User.find({ role: 'customer' })
        .select('firstName lastName email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        newGuestsRegistered: newGuests,
        totalRegisteredGuests: totalGuests,
        recentGuestSignups: recentGuests.map(guest => ({
            id: guest._id,
            // *** FIX STARTS HERE ***
            // Provide a fallback (empty string) in case the fields don't exist on the document
            firstName: guest.firstName || '',
            lastName: guest.lastName || '',
            // *** FIX ENDS HERE ***
            email: guest.email,
            phone: guest.phone || 'N/A', // Also add a fallback for phone
            registeredOn: formatDate(guest.createdAt)
        }))
    };
};

// NEW: Fetch all reports from history
const getReportsHistory = async(roles = ['receptionist', 'manager', 'admin']) => {
    try {
        const reports = await Report.find({})
            .populate('generatedBy', 'firstName lastName role')
            .sort({ createdAt: -1 }); // Sort by newest first
        return reports;
    } catch (error) {
        console.error('Error fetching reports history:', error);
        throw new Error('Failed to fetch reports history');
    }
};

// NEW: Get a single report by ID
const getSingleReportById = async(reportId) => {
    try {
        const report = await Report.findById(reportId)
            .populate('generatedBy', 'firstName lastName role');
        return report;
    } catch (error) {
        console.error('Error fetching single report:', error);
        throw new Error('Failed to fetch single report');
    }
};


module.exports = {
    generateDailyReport,
    generateOccupancyReport,
    generateRevenueReport,
    generateGuestReport,
    saveReport, // NEW
    getReportsHistory, // NEW
    getSingleReportById, // NEW
};*/