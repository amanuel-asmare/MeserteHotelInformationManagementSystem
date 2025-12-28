// backend/src/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['room', 'food', 'service', 'general'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: String,
        enum: ['all', 'admin', 'manager', 'receptionist', 'cashier'],
        default: 'all'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    // --- ADD THIS FIELD ---
    notificationRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);