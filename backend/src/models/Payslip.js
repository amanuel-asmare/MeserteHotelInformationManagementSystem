// backend/src/models/Payslip.js
const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    pension: { // Employee contribution (e.g., 7%)
        type: Number,
        required: true
    },
    netPay: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paidAt: { type: Date },
    notes: { type: String },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Ensure a user can only have one payslip per month/year to prevent duplicates
payslipSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);