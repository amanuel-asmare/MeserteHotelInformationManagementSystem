// backend/src/controllers/billingController.js
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Order = require('../models/orderModel'); // To include food charges

// Helper function to create or find an invoice for a booking
const findOrCreateInvoice = async(bookingId) => {
    let invoice = await Invoice.findOne({ booking: bookingId });

    if (!invoice) {
        const booking = await Booking.findById(bookingId).populate('user room');
        if (!booking) throw new Error('Booking not found');

        // Initial line item for the room stay
        const nights = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
        const roomCharge = {
            description: `Room Stay (${booking.room.roomNumber}) - ${nights} night(s)`,
            quantity: nights,
            unitPrice: booking.room.price,
            total: booking.totalPrice,
        };

        invoice = await Invoice.create({
            booking: booking._id,
            user: booking.user._id,
            room: booking.room._id,
            lineItems: [roomCharge]
        });
    }
    return invoice;
};


// GET /api/billing/active - Fetch all open bills for currently checked-in guests
exports.getActiveBills = async(req, res) => {
    try {
        const activeBookings = await Booking.find({ status: 'confirmed' })
            .populate('user', 'firstName lastName profileImage')
            .populate('room', 'roomNumber');

        const bills = await Promise.all(activeBookings.map(async(booking) => {
            const invoice = await findOrCreateInvoice(booking._id);
            return {
                _id: invoice._id,
                booking,
                totalAmount: invoice.totalAmount,
            };
        }));

        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/billing/history - Fetch paid invoices with pagination
exports.getInvoiceHistory = async(req, res) => {
    try {
        const invoices = await Invoice.find({ status: 'paid' })
            .populate('user', 'firstName lastName')
            .populate('room', 'roomNumber')
            .sort({ paidAt: -1 })
            .limit(50); // Simple limit for now

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/billing/:invoiceId - Get details for a single bill
exports.getBillDetails = async(req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId)
            .populate({
                path: 'booking',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate('room', 'roomNumber');

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // Dynamically add unpaid food orders to the bill details
        const foodOrders = await Order.find({
            'customer.roomNumber': invoice.room.roomNumber,
            paymentStatus: 'pending' // Only show unpaid orders
        });

        const foodLineItems = foodOrders.flatMap(order =>
            order.items.map(item => ({
                description: `Food: ${item.name}`,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.quantity * item.price,
                isFood: true // Flag to distinguish
            }))
        );

        res.json({ invoice, foodLineItems });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// POST /api/billing/:invoiceId/items - Add a miscellaneous charge
exports.addCharge = async(req, res) => {
    try {
        const { description, quantity, unitPrice } = req.body;
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        invoice.lineItems.push({
            description,
            quantity,
            unitPrice,
            total: quantity * unitPrice
        });
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// POST /api/billing/checkout/:invoiceId - Process final payment and check-out
exports.processCheckout = async(req, res) => {
    try {
        const { paymentMethod } = req.body;
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        if (invoice.status === 'paid') return res.status(400).json({ message: 'Invoice already paid' });

        // Mark invoice as paid
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paymentMethod = paymentMethod;

        // Mark associated booking as completed
        const booking = await Booking.findById(invoice.booking);
        if (booking) {
            booking.status = 'completed';
            await booking.save();
        }

        // Make room available and clean
        const room = await Room.findById(invoice.room);
        if (room) {
            room.availability = true;
            room.status = 'dirty'; // Set to dirty for housekeeping
            await room.save();
        }

        // Mark associated food orders as completed
        await Order.updateMany({ 'customer.roomNumber': room.roomNumber, paymentStatus: 'pending' }, { $set: { paymentStatus: 'completed' } });

        await invoice.save();
        res.json({ message: 'Checkout successful!', invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};