/*const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'drinks'], default: 'breakfast' },
    image: { type: String, default: '/uploads/menu/default-menu.png' },
    tags: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);*/
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    // Store Name in both languages
    // name: {
    //     en: { type: String, required: true },
    //     am: { type: String, required: true }
    // },
    // // Store Description in both languages
    // description: {
    //     en: { type: String },
    //     am: { type: String }
    // },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'drinks'], default: 'breakfast' },
    image: { type: String, default: '/uploads/menu/default-menu.png' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);