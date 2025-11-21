// backend/src/controllers/dashboardController.js
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const User = require('../models/User');

exports.getCashierDashboardData = async(req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // --- 1. Calculate Stats ---

        // ✅ FIXED REVENUE CALCULATION
        // We now query for documents that were UPDATED today with a completed payment status.
        // This correctly captures payments made today, regardless of when the booking was created.
        const completedBookingsToday = await Booking.find({
            paymentStatus: 'completed',
            updatedAt: { $gte: today, $lt: tomorrow }
        });

        const completedOrdersToday = await Order.find({
            paymentStatus: 'completed',
            updatedAt: { $gte: today, $lt: tomorrow }
        });

        const todaysRevenue =
            completedBookingsToday.reduce((sum, b) => sum + b.totalPrice, 0) +
            completedOrdersToday.reduce((sum, o) => sum + o.totalAmount, 0);

        // This calculation is for the STAT CARD "Completed Today". It should count transactions completed today.
        const completedTransactions = completedBookingsToday.length + completedOrdersToday.length;

        // This calculation for REFUNDS should also use updatedAt.
        const refundedBookingsToday = await Booking.find({
            paymentStatus: 'refunded',
            updatedAt: { $gte: today, $lt: tomorrow }
        });
        const refundsIssued = refundedBookingsToday.length;


        // Fetch all pending payments (this logic remains correct as it's a total count)
        const pendingBookingsCount = await Booking.countDocuments({ paymentStatus: 'pending' });
        const pendingOrdersCount = await Order.countDocuments({ paymentStatus: 'pending' });
        const pendingPayments = pendingBookingsCount + pendingOrdersCount;

        // --- 2. Get Recent Transactions (this logic remains correct) ---
        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName');
        const recentOrders = await Order.find().sort({ orderedAt: -1 }).limit(10);

        const formattedBookings = recentBookings.map(b => ({
            id: `book-${b._id}`,
            type: 'Room Booking',
            customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Guest User',
            date: b.createdAt,
            amount: b.totalPrice,
            status: b.paymentStatus
        }));

        const formattedOrders = recentOrders.map(o => ({
            id: `order-${o._id}`,
            type: 'Food Order',
            customerName: o.customer.name,
            date: o.orderedAt,
            amount: o.totalAmount,
            status: o.paymentStatus
        }));

        const recentTransactions = [...formattedBookings, ...formattedOrders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        // --- 3. Send consolidated data ---
        res.json({
            stats: {
                revenue: todaysRevenue,
                pending: pendingPayments,
                completed: completedTransactions,
                refunds: refundsIssued,
            },
            transactions: recentTransactions,
        });

    } catch (error) {
        console.error("Error fetching cashier dashboard data:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data." });
    }
};
/*// backend/src/controllers/dashboardController.js
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const User = require('../models/User');

exports.getCashierDashboardData = async(req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's bookings and orders
        const todaysBookings = await Booking.find({
            createdAt: { $gte: today, $lt: tomorrow }
        }).populate('user', 'firstName lastName');

        const todaysOrders = await Order.find({
            orderedAt: { $gte: today, $lt: tomorrow }
        });

        // --- 1. Calculate Stats ---
        const todaysRevenue =
            todaysBookings.filter(b => b.paymentStatus === 'completed').reduce((sum, b) => sum + b.totalPrice, 0) +
            todaysOrders.filter(o => o.paymentStatus === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);

        const completedTransactions =
            todaysBookings.filter(b => b.paymentStatus === 'completed').length +
            todaysOrders.filter(o => o.paymentStatus === 'completed').length;

        const refundsIssued = todaysBookings.filter(b => b.paymentStatus === 'refunded').length;

        // Fetch all pending payments (not just today's)
        const pendingBookingsCount = await Booking.countDocuments({ paymentStatus: 'pending' });
        const pendingOrdersCount = await Order.countDocuments({ paymentStatus: 'pending' });
        const pendingPayments = pendingBookingsCount + pendingOrdersCount;

        // --- 2. Get Recent Transactions ---
        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName');
        const recentOrders = await Order.find().sort({ orderedAt: -1 }).limit(10);

        const formattedBookings = recentBookings.map(b => ({
            id: `book-${b._id}`,
            type: 'Room Booking',
            customerName: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Guest User',
            date: b.createdAt,
            amount: b.totalPrice,
            status: b.paymentStatus
        }));

        const formattedOrders = recentOrders.map(o => ({
            id: `order-${o._id}`,
            type: 'Food Order',
            customerName: o.customer.name,
            date: o.orderedAt,
            amount: o.totalAmount,
            status: o.paymentStatus
        }));

        const recentTransactions = [...formattedBookings, ...formattedOrders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        // --- 3. Send consolidated data ---
        res.json({
            stats: {
                revenue: todaysRevenue,
                pending: pendingPayments,
                completed: completedTransactions,
                refunds: refundsIssued,
            },
            transactions: recentTransactions,
        });

    } catch (error) {
        console.error("Error fetching cashier dashboard data:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data." });
    }
};*/