const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['Daily', 'Occupancy', 'Revenue', 'Guest', 'Comprehensive Cashier']
    },
    reportData: {
        type: mongoose.Schema.Types.Mixed,
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
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
/*//`backend/src/models/Report.js`

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['Daily', 'Occupancy', 'Revenue', 'Guest']
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);*/