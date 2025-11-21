const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['Daily', 'Occupancy', 'Revenue', 'Guest', 'Comprehensive Cashier'] // Added new type
    },
    reportData: {
        type: mongoose.Schema.Types.Mixed, // Stores the full report object
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        maxlength: 500,
        default: ''
    },
    // Adding date range for easier querying of comprehensive reports
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ReportCashier', reportSchema);