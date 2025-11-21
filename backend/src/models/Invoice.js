// backend/src/models/Invoice.js
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    status: {
        type: String,
        enum: ['open', 'paid', 'void'],
        default: 'open'
    },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ['cash', 'chapa', 'card'] }
}, { timestamps: true });

// Middleware to calculate totals before saving
invoiceSchema.pre('save', function(next) {
    this.subtotal = this.lineItems.reduce((acc, item) => acc + item.total, 0);
    // Assuming a simple 15% tax for example purposes
    this.tax = this.subtotal * 0.15;
    this.totalAmount = this.subtotal + this.tax;
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);