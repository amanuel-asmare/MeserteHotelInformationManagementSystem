//import { View, Alert } from 'react-native';
// backend/src/controllers/dashboardController.js
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Helper to get start and end of today in UTC to ensure database consistency
const getDayRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
};

exports.getAdminDashboardStats = async(req, res) => {
    try {
        const { start, end } = getDayRange();

        // --- 1. OCCUPIED ROOMS ---
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ availability: false });

        // --- 2. TODAY'S CHECK-INS ---
        const todaysCheckIns = await Booking.countDocuments({
            checkIn: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'pending', 'completed'] }
        });

        // --- 3. FEEDBACK COUNT ---
        const totalFeedback = await Feedback.countDocuments();

        // --- 4. REVENUE CALCULATION (ROBUST FIX) ---

        // A. Booking Revenue
        // We fetch all bookings that have paymentStatus 'completed' and were interacting with today
        const bookingRevenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    $or: [
                        { createdAt: { $gte: start, $lte: end } },
                        { updatedAt: { $gte: start, $lte: end } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        const bookingRevenue = (bookingRevenueResult.length > 0) ? bookingRevenueResult[0].total : 0;

        // B. Food Order Revenue
        const orderRevenueResult = await Order.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    $or: [
                        { createdAt: { $gte: start, $lte: end } },
                        { updatedAt: { $gte: start, $lte: end } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const orderRevenue = (orderRevenueResult.length > 0) ? orderRevenueResult[0].total : 0;

        // Total Combined Revenue
        const totalRevenue = bookingRevenue + orderRevenue;

        // --- 5. RECENT ACTIVITY (Recent Bookings) ---
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber type');

        // Send Response
        res.json({
            occupiedRooms,
            totalRooms,
            todaysCheckIns,
            pendingFeedback: totalFeedback,
            totalRevenue,
            recentBookings
        });

    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
};

// --- CASHIER DASHBOARD ---
exports.getCashierDashboardData = async(req, res) => {
    try {
        const { start, end } = getDayRange();

        // --- 1. Revenue (Same Logic as Admin) ---
        const completedBookingsToday = await Booking.find({
            paymentStatus: 'completed',
            $or: [
                { createdAt: { $gte: start, $lte: end } },
                { updatedAt: { $gte: start, $lte: end } }
            ]
        });

        const completedOrdersToday = await Order.find({
            paymentStatus: 'completed',
            $or: [
                { createdAt: { $gte: start, $lte: end } },
                { updatedAt: { $gte: start, $lte: end } }
            ]
        });

        const todaysRevenue =
            completedBookingsToday.reduce((sum, b) => sum + b.totalPrice, 0) +
            completedOrdersToday.reduce((sum, o) => sum + o.totalAmount, 0);

        const completedTransactions = completedBookingsToday.length + completedOrdersToday.length;

        // --- 2. Refunds ---
        const refundedBookingsToday = await Booking.find({
            paymentStatus: 'refunded',
            updatedAt: { $gte: start, $lte: end }
        });
        const refundsIssued = refundedBookingsToday.length;

        // --- 3. Pending ---
        const pendingBookingsCount = await Booking.countDocuments({ paymentStatus: 'pending' });
        const pendingOrdersCount = await Order.countDocuments({ paymentStatus: 'pending' });
        const pendingPayments = pendingBookingsCount + pendingOrdersCount;

        // --- 4. Recent Transactions ---
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
// ... (keep existing imports and helper functions)

// --- NEW: Manager Dashboard Stats ---
exports.getManagerDashboardStats = async(req, res) => {
    try {
        const { start, end } = getDayRange();

        // 1. Occupied Rooms
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ availability: false });

        // 2. Today's Revenue (Bookings + Orders)
        const bookingRevenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    $or: [
                        { createdAt: { $gte: start, $lte: end } },
                        { updatedAt: { $gte: start, $lte: end } }
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // ✅ FIX: Use standard array length check instead of optional chaining
        const bookingRevenue = (bookingRevenueResult.length > 0) ? bookingRevenueResult[0].total : 0;

        const orderRevenueResult = await Order.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    $or: [
                        { createdAt: { $gte: start, $lte: end } },
                        { updatedAt: { $gte: start, $lte: end } }
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // ✅ FIX: Use standard array length check instead of optional chaining
        const orderRevenue = (orderRevenueResult.length > 0) ? orderRevenueResult[0].total : 0;

        const totalRevenue = bookingRevenue + orderRevenue;

        // 3. Pending Orders (Kitchen/Bar workflow)
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing'] }
        });

        // 4. Staff On Duty (Active staff count)
        const staffOnDuty = await User.countDocuments({
            role: { $in: ['receptionist', 'cashier', 'manager'] },
            isActive: true
        });

        // 5. Recent Activity (Orders)
        const recentOrders = await Order.find()
            .sort({ orderedAt: -1 })
            .limit(5)
            .populate('items.menuItem', 'name');

        res.json({
            occupiedRooms,
            totalRooms,
            totalRevenue,
            pendingOrders,
            staffOnDuty,
            recentOrders
        });

    } catch (err) {
        console.error('Manager Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch manager stats' });
    }
};
// --- RECEPTIONIST DASHBOARD STATS (FIXED) ---
exports.getReceptionistDashboardData = async(req, res) => {
    try {
        // Date Helpers
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 1. CHECKED-IN TODAY
        // Logic: Any booking where checkIn date is TODAY, regardless of when it was booked.
        // Status must be active (confirmed/checked-in).
        // This covers both:
        // a) Receptionist assigning a room for "Now"
        // b) Customer booking ahead and arriving today
        const checkedInToday = await Booking.find({
                checkIn: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['confirmed', 'pending', 'checked-in', 'completed'] }
            })
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone');

        // 2. TODAY'S REVENUE (Bookings Only for Receptionist View)
        // Logic: Sum of payments made TODAY.
        // a) Cash payment made today (createdAt if status confirmed immediately)
        // b) Online payment completed today (updatedAt)
        const revenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    $or: [
                        { createdAt: { $gte: startOfDay, $lte: endOfDay } }, // Cash today
                        { updatedAt: { $gte: startOfDay, $lte: endOfDay } } // Online today
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const todayRevenue = (revenueResult.length > 0) ? revenueResult[0].total : 0;

        // 3. ROOM STATS
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ availability: true, status: 'clean' });
        const occupiedRooms = await Room.countDocuments({ availability: false });
        const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

        // 4. RECENT CUSTOMERS (Last 10)
        const recentCustomers = await User.find({ role: 'customer' })
            .select('firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(10);

        // 5. ALL ROOMS (For live status view)
        const allRooms = await Room.find({}).select('roomNumber type availability status');

        // 6. ACTIVE BOOKINGS (For the "Currently Checked-in" List)
        // This includes anyone currently in the hotel, not just those who arrived today.
        const currentActiveBookings = await Booking.find({
                status: { $in: ['confirmed', 'checked-in'] },
                checkIn: { $lte: endOfDay }, // Arrived already
                checkOut: { $gte: startOfDay } // Hasn't left yet (or leaving today)
            })
            .populate('room', 'roomNumber type')
            .populate('user', 'firstName lastName email phone')
            .sort({ checkIn: -1 });


        res.json({
            checkedInToday, // For "Checked-in Today" Stat Card
            todayRevenue, // For "Today's Revenue" Stat Card
            totalRooms,
            availableRooms,
            occupiedRooms,
            maintenanceRooms,
            recentCustomers,
            rooms: allRooms,
            bookings: currentActiveBookings // For the Main List "Currently Checked-in Guests"
        });

    } catch (err) {
        console.error('Receptionist Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to load dashboard data' });
    }
};
// ... existing imports
// backend/src/controllers/dashboardController.js

// --- NEW: Dismiss/Delete Notification ---
exports.dismissNotification = async (req, res) => {
    try {
        const { id } = req.params; // Format: "book-123" or "order-456"
        const [type, docId] = id.split('-');

        if (type === 'book') {
            // Update the booking so it's no longer considered "New" for notifications
            // We can add a hidden field or just use the 'read' status if you have a Notification model
            await Booking.findByIdAndUpdate(docId, { notificationRead: true });
        } else if (type === 'order') {
            await Order.findByIdAndUpdate(docId, { notificationRead: true });
        }

        res.json({ message: 'Notification dismissed permanently' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to dismiss notification' });
    }
};

// --- Update your getNotifications to EXCLUDE read ones ---
exports.getNotifications = async (req, res) => {
    try {
        const notifications = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch ONLY bookings where notificationRead is NOT true
        const newBookings = await Booking.find({
            createdAt: { $gte: today },
            status: 'confirmed',
            notificationRead: { $ne: true } // EXCLUDE READ ONES
        }).populate('user', 'firstName lastName').populate('room', 'roomNumber').limit(5);

        newBookings.forEach(b => {
            notifications.push({
                id: `book-${b._id}`,
                title: 'New Room Booking',
                message: `Room ${b.room?.roomNumber || 'N/A'} confirmed by ${b.user?.firstName || 'Guest'}`,
                detail: `A new booking has been confirmed for Room ${b.room?.roomNumber}. Check-in: ${new Date(b.checkIn).toLocaleDateString()}.`,
                time: 'Recently',
                type: 'success',
                read: false
            });
        });

        // Same logic for Orders...
        const pendingOrders = await Order.find({ 
            status: 'pending', 
            notificationRead: { $ne: true } 
        }).limit(5);
        
        pendingOrders.forEach(order => {
            notifications.push({
                id: `order-${order._id}`,
                title: 'Pending Food Order',
                message: `Order ${order.orderNumber} is waiting`,
                detail: `Order ${order.orderNumber} for ${order.customer.name} requires attention.`,
                time: 'Action Required',
                type: 'warning',
                read: false
            });
        });

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// // --- GET NOTIFICATIONS (Dynamic) ---
// exports.getNotifications = async(req, res) => {
//     try {
//         const notifications = [];
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // 1. New Bookings Today (Info)
//         const newBookings = await Booking.find({
//             createdAt: { $gte: today },
//             status: 'confirmed'
//         }).populate('user', 'firstName lastName').limit(5);

//         newBookings.forEach(b => {
//             notifications.push({
//                 id: `book-${b._id}`,
//                 title: 'New Booking Confirmed',
//                 message: `Room ${b.room ? b.room : 'Unknown'} - ${b.user ? b.user.firstName : 'Guest'}`,
//                 time: 'Today',
//                 type: 'success',
//                 read: false
//             });
//         });

//         // 2. Pending Orders (Warning)
//         const pendingOrders = await Order.countDocuments({ status: 'pending' });
//         if (pendingOrders > 0) {
//             notifications.push({
//                 id: 'orders-pending',
//                 title: 'Kitchen Alert',
//                 message: `${pendingOrders} orders are waiting for preparation`,
//                 time: 'Now',
//                 type: 'warning',
//                 read: false
//             });
//         }

//         // 3. Maintenance Rooms (Alert)
//         const maintenanceCount = await Room.countDocuments({ status: 'maintenance' });
//         if (maintenanceCount > 0) {
//             notifications.push({
//                 id: 'room-maint',
//                 title: 'Maintenance Required',
//                 message: `${maintenanceCount} rooms are marked for maintenance`,
//                 time: 'Ongoing',
//                 type: 'info',
//                 read: false
//             });
//         }

//         // 4. New Feedback (Success)
//         const recentFeedback = await Feedback.find({ createdAt: { $gte: today } }).limit(3);
//         recentFeedback.forEach(f => {
//             notifications.push({
//                 id: `feed-${f._id}`,
//                 title: 'New Feedback Received',
//                 message: `${f.rating} Stars - ${f.category}`,
//                 time: 'Today',
//                 type: 'success',
//                 read: true
//             });
//         });

//         res.json(notifications);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to fetch notifications' });
//     }
// };

// ... (keep existing exports)
/*// backend/src/controllers/dashboardController.js
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const User = require('../models/User');
const Room = require('../models/Room');
const Feedback = require('../models/Feedback');
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



exports.getAdminDashboardStats = async(req, res) => {
    try {
        // Date Helpers
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // --- 1. OCCUPIED ROOMS ---
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ availability: false });

        // --- 2. TODAY'S CHECK-INS ---
        const todaysCheckIns = await Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'pending', 'completed'] }
        });

        // --- 3. FEEDBACK COUNT ---
        const totalFeedback = await Feedback.countDocuments();

        // --- 4. REVENUE CALCULATION (Bookings + Orders) ---

        // A. Booking Revenue
        const bookingRevenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const bookingRevenue = (bookingRevenueResult.length > 0) ? bookingRevenueResult[0].total : 0;

        // B. Food Order Revenue
        const orderRevenueResult = await Order.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const orderRevenue = (orderRevenueResult.length > 0) ? orderRevenueResult[0].total : 0;

        const totalRevenue = bookingRevenue + orderRevenue;

        // --- 5. RECENT ACTIVITY ---
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber type');

        res.json({
            occupiedRooms,
            totalRooms,
            todaysCheckIns,
            pendingFeedback: totalFeedback,
            totalRevenue,
            recentBookings
        });

    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
};*/
/*
exports.getAdminDashboardStats = async(req, res) => {
    try {
        // Date Helpers
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // --- 1. OCCUPIED ROOMS ---
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ availability: false });

        // --- 2. TODAY'S CHECK-INS ---
        const todaysCheckIns = await Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'pending', 'completed'] }
        });

        // --- 3. FEEDBACK COUNT ---
        const totalFeedback = await Feedback.countDocuments();

        // --- 4. REVENUE CALCULATION (Bookings + Orders) ---

        // A. Booking Revenue
        const bookingRevenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const bookingRevenue = (bookingRevenueResult.length > 0) ? bookingRevenueResult[0].total : 0;

        // B. Food Order Revenue
        const orderRevenueResult = await Order.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const orderRevenue = (orderRevenueResult.length > 0) ? orderRevenueResult[0].total : 0;

        const totalRevenue = bookingRevenue + orderRevenue;

        // --- 5. RECENT ACTIVITY ---
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber type');

        res.json({
            occupiedRooms,
            totalRooms,
            todaysCheckIns,
            pendingFeedback: totalFeedback,
            totalRevenue,
            recentBookings
        });

    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
}; */
/*exports.getAdminDashboardStats = async(req, res) => {
    try {
        // Date Helpers
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // --- 1. OCCUPIED ROOMS ---
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ availability: false });

        // --- 2. TODAY'S CHECK-INS ---
        const todaysCheckIns = await Booking.countDocuments({
            checkIn: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'pending', 'completed'] }
        });

        // --- 3. FEEDBACK COUNT ---
        const totalFeedback = await Feedback.countDocuments();

        // --- 4. REVENUE CALCULATION (Bookings + Orders) ---

        // A. Booking Revenue
        const bookingRevenueResult = await Booking.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const bookingRevenue = (bookingRevenueResult.length > 0) ? bookingRevenueResult[0].total : 0;

        // B. Food Order Revenue
        const orderRevenueResult = await Order.aggregate([{
                $match: {
                    paymentStatus: 'completed',
                    updatedAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // FIX: Removed '?.' and used standard array check
        const orderRevenue = (orderRevenueResult.length > 0) ? orderRevenueResult[0].total : 0;

        const totalRevenue = bookingRevenue + orderRevenue;

        // --- 5. RECENT ACTIVITY ---
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber type');

        res.json({
            occupiedRooms,
            totalRooms,
            todaysCheckIns,
            pendingFeedback: totalFeedback,
            totalRevenue,
            recentBookings
        });

    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
}; */