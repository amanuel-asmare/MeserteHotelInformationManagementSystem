const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'hotel_config' }, // Singleton
    hotelName: { type: String, default: 'Meseret Hotel' },
    logoUrl: { type: String, default: '/default-logo.png' }, // Default fallback
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);