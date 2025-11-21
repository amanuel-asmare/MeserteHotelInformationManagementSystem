/*//Auto - cleanup finished bookings // backend/src/utils/cleanup.js
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

module.exports = { cleanupFinishedBookings };*/
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { isPast } = require('date-fns'); // Use date-fns for robust date comparisons

/**
 * Periodically checks for bookings that have passed their checkout date
 * and updates their status and room availability if necessary.
 */
async function cleanupFinishedBookings() {
    console.log('[Cleanup] Starting automated booking cleanup...');
    try {
        const now = new Date();
        const bookingsToProcess = await Booking.find({
            checkOut: { $lte: now }, // Checkout date is today or in the past
            status: { $in: ['confirmed', 'pending'] } // Only process active bookings
        }).populate('room'); // Populate room to update its availability

        if (bookingsToProcess.length === 0) {
            console.log('[Cleanup] No active bookings found with past checkout dates.');
            return;
        }

        for (const booking of bookingsToProcess) {
            // Check again to be absolutely sure the checkout is past, and not already completed/cancelled
            if (isPast(new Date(booking.checkOut)) &&
                booking.status !== 'completed' &&
                booking.status !== 'cancelled') {

                console.log(`[Cleanup] Processing booking ${booking._id} (Room: ${booking.room ? booking.room.roomNumber : 'N/A'}) - Checkout date ${booking.checkOut.toISOString()} is past.`);

                // Mark booking as completed
                booking.status = 'completed';
                // Assuming payment is considered completed if customer checked out and it wasn't cancelled
                booking.paymentStatus = 'completed';
                await booking.save();

                // Make the room available
                if (booking.room) {
                    booking.room.availability = true;
                    await booking.room.save();
                    console.log(`[Cleanup] Room ${booking.room.roomNumber} availability set to true.`);
                } else {
                    console.warn(`[Cleanup] Room not found for booking ${booking._id}.`);
                }
            }
        }
        console.log(`[Cleanup] Finished processing ${bookingsToProcess.length} bookings.`);
    } catch (error) {
        console.error('[Cleanup] Error during automated booking cleanup:', error);
    }
}

module.exports = { cleanupFinishedBookings };