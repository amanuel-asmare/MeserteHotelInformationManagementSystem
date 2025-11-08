//Auto - cleanup finished bookings // backend/src/utils/cleanup.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');

const cleanupFinishedBookings = async() => {
    const now = new Date();
    const finished = await Booking.find({
        status: { $in: ['confirmed', 'completed'] },
        checkOut: { $lt: now }
    }).populate('room');

    for (const b of finished) {
        b.status = 'completed';
        const room = b.room;
        if (room && !room.availability) {
            room.availability = true;
            await room.save();
        }
        await b.save();
    }
};

module.exports = { cleanupFinishedBookings };