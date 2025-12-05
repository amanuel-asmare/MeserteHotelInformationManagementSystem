const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    supplier: { type: String, required: true }, // e.g., "Fresh Foods Ltd", "Addis Furniture"
    referenceNo: { type: String }, // Invoice number from supplier
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'received', 'cancelled'],
        default: 'received'
    },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'check', 'credit'], default: 'cash' },

    // VAT Logic
    hasVat: { type: Boolean, default: true },
    vatRate: { type: Number, default: 15 }, // Standard Ethiopian VAT is 15%

    items: [{
        name: { type: String, required: true }, // e.g., "Teff Flour", "Detergent", "Table"
        category: {
            type: String,
            enum: ['Food & Beverage', 'Housekeeping', 'Furniture', 'Electronics', 'Linens', 'Maintenance Material'],
            required: true
        },
        quantity: { type: Number, required: true, min: 1 },
        unit: { type: String, default: 'pcs' }, // kg, liter, pcs, box
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],

    subTotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);