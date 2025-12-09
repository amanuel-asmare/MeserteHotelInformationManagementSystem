const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    // --- NEW FIELD: Order Type ---
    orderType: {
        type: String,
        enum: ['room', 'table', 'delivery'],
        required: true,
        default: 'room'
    },
    customer: {
        name: { type: String, required: true },
        roomNumber: { type: String },
        tableNumber: { type: String },
        phone: { type: String, required: true }, // Phone is mandatory for all orders

        // --- NEW FIELD: Delivery Address ---
        deliveryAddress: {
            street: { type: String },
            houseNumber: { type: String },
            landmark: { type: String },
            city: { type: String, default: 'woldia' }
        }
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    // Delivery Fee
    deliveryFee: { type: Number, default: 0 },

    status: {
        type: String,
        enum: {
            values: ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
            message: 'Invalid order status'
        },
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    notes: { type: String, default: '' },
    orderedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
/*// backend/src/models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        name: { type: String, required: true },
        // Make roomNumber and tableNumber optional, but one must be present
        roomNumber: { type: String },
        tableNumber: { type: String }, // NEW
        phone: { type: String }
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: {
            values: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
            message: 'Invalid order status'
        },
        default: 'pending'
    },
    paymentStatus: { // NEW
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    notes: { type: String, default: '' },
    orderedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);*/