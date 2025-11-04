/*// backend/src/models/Menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'drinks'],
        required: true
    },
    image: { type: String, default: null }, // ✅ No default
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

menuSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('Menu', menuSchema);*/
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'drinks'], default: 'breakfast' },
    image: { type: String, default: '/uploads/menu/default-menu.png' },
    tags: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);