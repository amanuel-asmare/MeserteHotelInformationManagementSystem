const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // Email is required, but unique check needs to handle social logins properly
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        // Password is NOT required if user logs in via social media
        required: function() { return !this.provider; }
    },
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
    roomNumber: { type: String },
    salary: { type: Number, default: 0, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    education: {
        level: { type: String, enum: ['9-12', 'diploma', 'degree', 'master', 'phd'] },
        field: { type: String },
        institution: { type: String }
    },
    shift: { start: String, end: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // --- NEW FIELDS FOR SOCIAL LOGIN ---
    provider: { type: String, default: 'local' }, // local, google, facebook, github
    providerId: { type: String },

    // Reset Password Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, { timestamps: true });

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

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
    roomNumber: { type: String }, // <-- NEW: Added roomNumber to User model
    salary: { type: Number, default: 0, min: 0 },
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