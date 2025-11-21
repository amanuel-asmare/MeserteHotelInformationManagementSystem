// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String, default: '/default-avatar.png' },
    address: {
        country: { type: String, default: 'Ethiopia' },
        city: { type: String },
        kebele: { type: String }
    },
    role: {
        type: String,
        enum: ['customer', 'receptionist', 'cashier', 'manager', 'admin'],
        default: 'customer'
    },
    roomNumber: { type: String }, // <-- NEW: Added roomNumber to User model
    salary: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    education: {
        level: { type: String, enum: ['9-12', 'diploma', 'degree', 'master', 'phd'] },
        field: { type: String },
        institution: { type: String }
    },
    shift: { start: String, end: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
/*// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String, default: '/default-avatar.png' },
    address: {
        country: { type: String, default: 'Ethiopia' },
        city: { type: String },
        kebele: { type: String }
    },
    role: {
        type: String,
        enum: ['customer', 'receptionist', 'cashier', 'manager', 'admin'],
        default: 'customer'
    },
    salary: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    education: {
        level: { type: String, enum: ['9-12', 'diploma', 'degree', 'master', 'phd'] },
        field: { type: String },
        institution: { type: String }
    },
    shift: { start: String, end: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);*/