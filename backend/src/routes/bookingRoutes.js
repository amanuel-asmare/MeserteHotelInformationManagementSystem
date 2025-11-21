const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createBooking,
    initiatePayment,
    verifyPayment,
    getCustomerBookings,
    cancelBooking,
    createBookingByReceptionist,
    getAllBookings,
    markBookingAsCompleted
} = require('../controllers/bookingController');

router.post('/', protect, authorize('customer', ), createBooking);
router.post('/payment', protect, authorize('customer', ), initiatePayment);
router.post('/verify-payment', verifyPayment); // Public endpoint for Chapa callback

router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);
// backend/src/routes/bookings.js
router.get('/my-bookings', protect, authorize('customer'), getCustomerBookings);

// Optional: Allow guest view (remove auth for demo)
router.get('/guest-bookings', async(req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('room', 'roomNumber type price images')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); // RECEPTIONIST ONLY
router.post(
    '/receptionist',
    protect,
    authorize('receptionist', 'admin', 'manager'),
    createBookingByReceptionist
);
// <--- ADD THIS NEW ROUTE FOR RECEPTIONISTS TO VIEW ALL BOOKINGS
router.get(
    '/receptionist/all-bookings',
    protect,
    authorize('receptionist', 'admin', 'manager', 'cahier'),
    getAllBookings // This will be the new controller function
);
// New: Mark Booking as Completed
router.put(
    '/receptionist/:id/complete',
    protect,
    authorize('receptionist', 'admin', 'manager'),
    markBookingAsCompleted
);
module.exports = router;