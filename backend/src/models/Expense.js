const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g. "Generator Diesel"
    category: {
        type: String,
        required: true,
        enum: [
            'Utilities (Water/Elec/Internet)',
            'Rent & Licenses',
            'Maintenance & Repair',
            'Generator Fuel & Oil',
            'Staff Costs (Uniform/Transport)',
            'Food & Beverage Cost',
            'Housekeeping Supplies',
            'Marketing & Promo',
            'Office & Admin',
            'Taxes & Government Fees',
            'Guest Amenities (Coffee/Decor)',
            'Miscellaneous'
        ]
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    payee: { type: String }, // e.g., "Total Gas Station", "EthioTelecom"
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Check', 'Telebirr/CBE Birr', 'Credit'],
        default: 'Cash'
    },
    referenceNumber: { type: String }, // Receipt # or Check #
    description: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);