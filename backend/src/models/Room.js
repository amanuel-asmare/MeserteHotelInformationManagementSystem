/*const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['single', 'double', 'triple', 'family'], required: true },
    price: { type: Number, required: true },
    amenities: [String],
    status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
    image: String
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);*/
// backend/src/models/room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: {
            values: ['single', 'double', 'triple'],
            message: 'Invalid room type. Must be single, double, or triple'
        },

        required: [true, 'Room type is required']
    },
    // --- DYNAMIC TRANSLATION FIELD ---
    // type: {
    //     en: { type: String, required: true }, // e.g., "Single"
    //     am: { type: String, required: true } // e.g., "ነጠላ"
    // },

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    availability: {
        type: Boolean,
        default: true
    },
    floorNumber: {
        type: Number,
        required: [true, 'Floor number is required'],
        min: [0, 'Floor number cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters']
    },
    // --- DYNAMIC TRANSLATION FIELD ---
    // description: {
    //     en: { type: String, required: true },
    //     am: { type: String, required: true }
    // },
    images: {
        type: [String],
        validate: [arrayLimit, 'Maximum 3 images allowed']
    },
    status: {
        type: String,
        enum: {
            values: ['clean', 'dirty', 'maintenance'],
            message: 'Invalid status'
        },
        default: 'clean'
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    amenities: {
        type: [String],
        default: []
    },
    numberOfBeds: {
        type: Number,
        required: [true, 'Number of beds is required'],
        min: [1, 'At least one bed is required']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [1, 'At least one bathroom is required']
    }
}, { timestamps: true });

// Validator for max 3 images
function arrayLimit(val) {
    return val.length <= 3;
}

module.exports = mongoose.model('Room', roomSchema);