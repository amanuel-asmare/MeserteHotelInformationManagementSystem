// backend/src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// === HELPER: GET FULL IMAGE URL ===
const getFullImageUrl = (path) => {
    if (!path) return '/default-avatar.png';
    if (path.startsWith('http')) return path;
    const API_BASE = process.env.API_URL || 'http://localhost:5000';
    return `${API_BASE}${path}`;
};

// LOGIN — BLOCK INACTIVE USERS
exports.login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Your account is deactivated. Contact admin to reactivate.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: getFullImageUrl(user.profileImage)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ME — ALSO BLOCK INACTIVE
exports.getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Account deactivated. Contact admin.'
            });
        }

        res.json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: getFullImageUrl(user.profileImage)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

// REGISTER - WITH IMAGE
exports.register = async(req, res) => {
    const { firstName, lastName, email, password, phone, country, city, kebele } = req.body;
    let profileImage = '/default-avatar.png';

    if (req.file) {
        profileImage = `/uploads/avatars/${req.file.filename}`;
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashed,
            phone,
            profileImage,
            address: { country: country || 'Ethiopia', city, kebele }
        });

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Registered successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: getFullImageUrl(user.profileImage)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
/*// backend/src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// LOGIN — BLOCK INACTIVE USERS
exports.login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // BLOCK INACTIVE USERS
        if (!user.isActive) {
            return res.status(403).json({
                message: 'Your account is deactivated. Contact admin to reactivate.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ... rest of register, logout, getMe unchanged// GET ME — ALSO BLOCK INACTIVE// GET ME — ALSO BLOCK INACTIVE
exports.getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Account deactivated. Contact admin.'
            });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; // LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};
// REGISTER - WITH IMAGE
exports.register = async(req, res) => {
    const { firstName, lastName, email, password, phone, country, city, kebele } = req.body;
    let profileImage = '/default-avatar.png';

    if (req.file) {
        profileImage = `/uploads/avatars/${req.file.filename}`;
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashed,
            phone,
            profileImage,
            address: { country: country || 'Ethiopia', city, kebele }
        });

        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Registered successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/