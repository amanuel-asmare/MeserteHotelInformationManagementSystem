// backend/src/controllers/reservationController.js
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const moment = require('moment');

// Helper: Calculate total price
const calculateTotalPrice = async(roomId, checkIn, checkOut) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    const nights = moment(checkOut).diff(moment(checkIn), 'days');
    if (nights <= 0) throw new Error('Invalid dates');

    return room.price * nights;
};

// @desc    Create reservation (customer)
// @route   POST /api/reservations
exports.createReservation = async(req, res) => {
    const { room, checkIn, checkOut, guests } = req.body;
    const customer = req.user.id;

    try {
        // Validate room
        const roomDoc = await Room.findById(room);
        if (!roomDoc) return res.status(404).json({ message: 'Room not found' });
        if (roomDoc.status !== 'available') {
            return res.status(400).json({ message: 'Room not available' });
        }

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Check-out must be after check-in' });
        }

        // Check for conflicting reservations
        const conflict = await Reservation.findOne({
            room,
            status: { $in: ['pending', 'confirmed', 'checked-in'] },
            $or: [
                { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Room already booked for selected dates' });
        }

        // Calculate price
        const totalPrice = await calculateTotalPrice(room, checkIn, checkOut);

        // Create reservation
        const reservation = await Reservation.create({
            customer,
            room,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests || 1,
            totalPrice,
            status: 'pending'
        });

        // Update room status
        await Room.findByIdAndUpdate(room, { status: 'booked' });

        const populated = await Reservation.findById(reservation._id)
            .populate('room', 'roomNumber type price')
            .populate('customer', 'fullName email phone');

        res.status(201).json({
            message: 'Reservation created',
            reservation: populated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all reservations (staff)
// @route   GET /api/reservations
exports.getReservations = async(req, res) => {
    try {
        const query = req.user.role === 'customer' ?
            { customer: req.user.id } :
            {};

        const reservations = await Reservation.find(query)
            .populate('room', 'roomNumber type')
            .populate('customer', 'fullName email')
            .sort({ checkIn: -1 });

        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
exports.getReservation = async(req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('room', 'roomNumber type price')
            .populate('customer', 'fullName email phone');

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Customer can only see their own
        if (req.user.role === 'customer' && reservation.customer._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update reservation (customer or receptionist)
// @route   PUT /api/reservations/:id
exports.updateReservation = async(req, res) => {
    const { room, checkIn, checkOut, guests } = req.body;

    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Not found' });

        if (reservation.status !== 'pending') {
            return res.status(400).json({ message: 'Can only update pending reservations' });
        }

        // Validate new dates
        const checkInDate = checkIn ? new Date(checkIn) : reservation.checkIn;
        const checkOutDate = checkOut ? new Date(checkOut) : reservation.checkOut;
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Invalid dates' });
        }

        // Check room availability if changed
        if (room && room !== reservation.room.toString()) {
            const newRoom = await Room.findById(room);
            if (!newRoom || newRoom.status !== 'available') {
                return res.status(400).json({ message: 'New room not available' });
            }

            // Check conflict
            const conflict = await Reservation.findOne({
                room,
                _id: { $ne: reservation._id },
                status: { $in: ['pending', 'confirmed', 'checked-in'] },
                $or: [
                    { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
                ]
            });

            if (conflict) {
                return res.status(400).json({ message: 'Room already booked' });
            }

            // Revert old room
            await Room.findByIdAndUpdate(reservation.room, { status: 'available' });
            // Book new room
            await Room.findByIdAndUpdate(room, { status: 'booked' });
            reservation.room = room;
        }

        // Update fields
        reservation.checkIn = checkInDate;
        reservation.checkOut = checkOutDate;
        reservation.guests = guests || reservation.guests;
        reservation.totalPrice = await calculateTotalPrice(reservation.room, checkInDate, checkOutDate);

        await reservation.save();

        const updated = await Reservation.findById(reservation._id)
            .populate('room customer');

        res.json({ message: 'Updated', reservation: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
exports.cancelReservation = async(req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Not found' });

        if (!['pending', 'confirmed'].includes(reservation.status)) {
            return res.status(400).json({ message: 'Cannot cancel this reservation' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        // Free room
        await Room.findByIdAndUpdate(reservation.room, { status: 'available' });

        res.json({ message: 'Reservation cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Check-in (receptionist)
// @route   POST /api/reservations/:id/checkin
exports.checkIn = async(req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Not found' });

        if (reservation.status !== 'confirmed') {
            return res.status(400).json({ message: 'Reservation not confirmed' });
        }

        reservation.status = 'checked-in';
        await reservation.save();

        res.json({ message: 'Guest checked in' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Check-out (receptionist/cashier)
// @route   POST /api/reservations/:id/checkout
exports.checkOut = async(req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Not found' });

        if (reservation.status !== 'checked-in') {
            return res.status(400).json({ message: 'Guest not checked in' });
        }

        reservation.status = 'checked-out';
        reservation.paymentStatus = 'paid';
        await reservation.save();

        // Free room
        await Room.findByIdAndUpdate(reservation.room, { status: 'available' });

        res.json({ message: 'Guest checked out' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};