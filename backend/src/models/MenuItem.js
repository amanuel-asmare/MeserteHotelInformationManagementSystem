const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'beverages'], required: true },
    price: { type: Number, required: true },
    description: String,
    available: { type: Boolean, default: true },
    image: String
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);