const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

exports.getBookingReport = async(req, res) => {
    const count = await Reservation.countDocuments();
    res.json({ totalBookings: count });
};

exports.getFinancialReport = async(req, res) => {
    const paid = await Reservation.find({ paymentStatus: 'paid' });
    const total = paid.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    res.json({ revenue: total });
};

exports.getOccupancyReport = async(req, res) => {
    const booked = await Room.countDocuments({ status: 'booked' });
    const total = await Room.countDocuments();
    res.json({ occupancy: total > 0 ? (booked / total) * 100 : 0 });
};

exports.getFoodOrderReport = async(req, res) => {
    res.json({ message: 'Food report placeholder' });
};