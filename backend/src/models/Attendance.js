// backend/src/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        // Ensures only one attendance record per user per day
        unique: false, // We will handle uniqueness with a compound index
    },
    checkIn: {
        type: Date,
        default: null, // Can be null if only checked out
    },
    checkOut: {
        type: Date,
        default: null, // Can be null if only checked in
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave', 'half-day', 'pending', 'approved'],
        default: 'pending', // Initial status when marked by staff, or manager marks
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Null if self-marked, otherwise manager/admin ID
    },
    notes: {
        type: String,
        maxlength: 500,
    },
}, { timestamps: true });


attendanceSchema.index({ user: 1, date: 1 }, { unique: true });


module.exports = mongoose.model('Attendance', attendanceSchema);