const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['single', 'double', 'triple', 'family'], required: true },
    price: { type: Number, required: true },
    amenities: [String],
    status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
    image: String
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);