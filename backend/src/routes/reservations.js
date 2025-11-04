// backend/src/routes/reservations.js
const express = require('express');
const router = express.Router();
const {
    createReservation,
    getReservations,
    getReservation,
    updateReservation,
    cancelReservation,
    checkIn,
    checkOut
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('customer'), createReservation);
router.get('/', authorize('receptionist', 'manager', 'cashier'), getReservations);
router.get('/my', authorize('customer'), getReservations); // Customer's own

router.route('/:id')
    .get(authorize('customer', 'receptionist', 'manager'), getReservation)
    .put(authorize('customer', 'receptionist'), updateReservation)
    .delete(authorize('customer', 'receptionist'), cancelReservation);

// Staff actions
router.post('/:id/checkin', authorize('receptionist'), checkIn);
router.post('/:id/checkout', authorize('receptionist', 'cashier'), checkOut);

module.exports = router;