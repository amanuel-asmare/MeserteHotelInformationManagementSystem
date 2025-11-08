// backend/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const axios = require('axios');

// Helper to calculate total price
const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
};

// Create Booking
exports.createBooking = async(req, res) => {
    const { roomId, checkIn, checkOut, guests } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!room.availability) return res.status(400).json({ message: 'Room is not available' });

        const totalPrice = calculateTotalPrice(room.price, checkIn, checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(checkIn) < today || new Date(checkOut) <= new Date(checkIn)) {
            return res.status(400).json({ message: 'Invalid dates' });
        }

        const existingBooking = await Booking.findOne({
            room: roomId,
            $or: [
                { checkIn: { $lte: checkOut, $gte: checkIn } },
                { checkOut: { $lte: checkOut, $gte: checkIn } },
                { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
            ],
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Room is booked for the selected dates' });
        }

        const booking = await Booking.create({
            user: req.user.id,
            room: roomId,
            checkIn,
            checkOut,
            totalPrice,
            guests,
            status: 'pending'
        });

        room.availability = false;
        await room.save();

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Initiate Chapa Payment
exports.initiatePayment = async(req, res) => {
    const { bookingId } = req.body;

    if (!process.env.CHAPA_SECRET_KEY) {
        return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    try {
        const booking = await Booking.findById(bookingId).populate('user room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        const tx_ref = `MESERET-${booking._id}-${Date.now()}`;

        const chapaResponse = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize', {
                amount: booking.totalPrice,
                currency: 'ETB',
                email: booking.user.email,
                first_name: booking.user.firstName,
                last_name: booking.user.lastName,
                tx_ref,
                callback_url: `${process.env.API_URL}/api/bookings/verify-payment`,
                return_url: `${process.env.CLIENT_URL}/customer/bookings`
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        booking.paymentId = chapaResponse.data.data.tx_ref;
        await booking.save();

        res.json({ checkoutUrl: chapaResponse.data.data.checkout_url });
    } catch (err) {
        // SAFE ERROR LOGGING - NO ?. OR ? .
        console.error('=== CHAPA PAYMENT ERROR ===');
        console.error('Message:', err.message);
        console.error('Code:', err.code || 'N/A');
        console.error('Response Status:', err.response ? err.response.status : 'No response');
        console.error('Response Data:', err.response ? err.response.data : 'No data');
        console.error('Request Config:', err.config ? err.config.url : 'N/A');
        console.error('==========================');

        let errorDetails = 'Unknown error';
        if (err.response && err.response.data) {
            errorDetails = typeof err.response.data === 'string' ?
                err.response.data :
                (err.response.data.message || JSON.stringify(err.response.data));
        } else if (err.message) {
            errorDetails = err.message;
        }

        res.status(500).json({
            message: 'Payment initiation failed',
            details: errorDetails
        });
    }
};

// Verify Payment (Webhook or Callback)
exports.verifyPayment = async(req, res) => {
    const { tx_ref } = req.body;

    try {
        const booking = await Booking.findOne({ paymentId: tx_ref }).populate('room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        });

        if (response.data.status === 'success') {
            booking.paymentStatus = 'completed';
            booking.status = 'confirmed';
            await booking.save();
            res.json({ message: 'Payment verified and booking confirmed' });
        } else {
            booking.paymentStatus = 'failed';
            booking.status = 'cancelled';
            booking.room.availability = true;
            await booking.room.save();
            await booking.save();
            res.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (err) {
        console.error('Verify Payment Error:', err.message || err);
        res.status(500).json({ message: err.message || 'Verification failed' });
    }
};

// Get Customer Bookings
exports.getCustomerBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate({
                path: 'room',
                select: 'roomNumber type price images'
            })
            .sort({ createdAt: -1 });

        const API_BASE = process.env.API_URL || 'http://localhost:5000';
        const formattedBookings = bookings.map(booking => {
            const b = booking.toObject();
            if (b.room && b.room.images) {
                b.room.images = b.room.images.map(img => {
                    if (img.startsWith('http')) return img;
                    return `${API_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
                });
            }
            return b;
        });

        res.json(formattedBookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel Booking
exports.cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        if (booking.paymentStatus === 'completed') {
            const refundAmount = booking.totalPrice * 0.95;
            await axios.post('https://api.chapa.co/v1/refunds', {
                tx_ref: booking.paymentId,
                amount: refundAmount,
                reason: 'Booking cancellation'
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                }
            });
            booking.paymentStatus = 'refunded';
        }

        booking.status = 'cancelled';
        const room = await Room.findById(booking.room);
        room.availability = true;
        await room.save();
        await booking.save();

        res.json({ message: 'Booking cancelled successfully. Refund initiated if applicable.' });
    } catch (err) {
        console.error('Cancel Booking Error:', err.message || err);
        res.status(500).json({ message: err.message || 'Cancellation failed' });
    }
};
/*const Booking = require('../models/Booking');
const Room = require('../models/Room');
const axios = require('axios');

// Helper to calculate total price
const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
};

// Create Booking
exports.createBooking = async(req, res) => {
    const { roomId, checkIn, checkOut, guests } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!room.availability) return res.status(400).json({ message: 'Room is not available' });

        const totalPrice = calculateTotalPrice(room.price, checkIn, checkOut);

        // Validate dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(checkIn) < today || new Date(checkOut) <= new Date(checkIn)) {
            return res.status(400).json({ message: 'Invalid dates' });
        }

        // Check for overlapping bookings
        const existingBooking = await Booking.findOne({
            room: roomId,
            $or: [
                { checkIn: { $lte: checkOut, $gte: checkIn } },
                { checkOut: { $lte: checkOut, $gte: checkIn } },
                { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
            ],
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Room is booked for the selected dates' });
        }

        const booking = await Booking.create({
            user: req.user.id,
            room: roomId,
            checkIn,
            checkOut,
            totalPrice,
            guests,
            status: 'pending'
        });

        // Update room availability
        room.availability = false;
        await room.save();

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Initiate Chapa Payment
exports.initiatePayment = async(req, res) => {
    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('user room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
            amount: booking.totalPrice,
            currency: 'ETB',
            email: booking.user.email,
            first_name: booking.user.firstName,
            last_name: booking.user.lastName,
            tx_ref: `MESERET-${booking._id}-${Date.now()}`,
            callback_url: `${process.env.API_URL}/api/bookings/verify-payment`,
            return_url: 'http://localhost:3000/customer/bookings'
        }, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        });

        booking.paymentId = chapaResponse.data.data.checkout_url.split('/').pop();
        await booking.save();

        res.json({ checkoutUrl: chapaResponse.data.data.checkout_url });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify Payment
exports.verifyPayment = async(req, res) => {
    const { tx_ref } = req.body;

    try {
        const booking = await Booking.findOne({ paymentId: tx_ref }).populate('room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        });

        if (response.data.status === 'success') {
            booking.paymentStatus = 'completed';
            booking.status = 'confirmed';
            await booking.save();
            res.json({ message: 'Payment verified and booking confirmed' });
        } else {
            booking.paymentStatus = 'failed';
            booking.status = 'cancelled';
            booking.room.availability = true;
            await booking.room.save();
            await booking.save();
            res.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Customer Bookings
exports.getCustomerBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('room', 'roomNumber type price images')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel Booking
exports.cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        booking.paymentStatus = 'failed';
        const room = await Room.findById(booking.room);
        room.availability = true;
        await room.save();
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/