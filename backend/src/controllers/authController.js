const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// HELPER: Define cookie options once for consistency
const cookieOptions = {
    httpOnly: true,
    // CRITICAL: Set secure and sameSite for production
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// // === HELPER: GET FULL IMAGE URL ===
// const getFullImageUrl = (path) => {
//     if (!path) return '/default-avatar.png';
//     if (path.startsWith('http')) return path;
//     const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
//     return `${API_BASE}${path}`;
// };
// HELPER
const getFullImageUrl = (path) => {
    if (!path) return '/default-avatar.png';
    if (path.startsWith('http')) return path;
    const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
};


// LOGIN — UPDATED
exports.login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account is deactivated. Contact admin to reactivate.' });
        }

        const token = generateToken(user._id, user.role);

        // Use the consistent cookie options
        res.cookie('token', token, cookieOptions);

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

/*// REGISTER - UPDATED
exports.register = async(req, res) => {
    const { firstName, lastName, email, password, phone, country, city, kebele } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            profileImage: req.file ? `/uploads/avatars/${req.file.filename}` : '/default-avatar.png',
            address: { country: country || 'Ethiopia', city, kebele }
        });

        const token = generateToken(user._id, user.role);

        // Use the consistent cookie options
        res.cookie('token', token, cookieOptions);

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
};*/
// REGISTER - UPDATED
exports.register = async(req, res) => {
    const { firstName, lastName, email, password, phone, country, city, kebele } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // CRITICAL FIX: Ensure the path stored in DB always starts with /uploads/avatars/
        let profileImage = '/default-avatar.png';
        if (req.file) {
            // Force the correct relative path structure
            profileImage = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            profileImage, // Save the consistent path
            address: { country: country || 'Ethiopia', city, kebele }
        });

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            message: 'Registered successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: getFullImageUrl(user.profileImage) // Return full URL
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SOCIAL LOGIN CALLBACK - UPDATED
exports.socialLoginCallback = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id, user.role);

    // Use the consistent cookie options
    res.cookie('token', token, cookieOptions);

    const clientUrl = process.env.CLIENT_URL || 'https://meseret-hotel-ims.vercel.app';
    res.redirect(`${clientUrl}/${user.role === 'customer' ? 'customer' : user.role}`);
};

// RESET PASSWORD - UPDATED
exports.resetPassword = async(req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id, user.role);

        // Use the consistent cookie options
        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            user: { id: user._id, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// --- OTHER FUNCTIONS (No changes needed) ---

// GET ME
exports.getMe = async(req, res) => {
    // ... (This function remains the same, it only reads cookies, doesn't set them)
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
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
    // ... (This function remains the same)
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

// FORGOT PASSWORD
exports.forgotPassword = async(req, res) => {
    // ... (This function remains the same, it sends an email, doesn't set cookies)
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const message = `... your email HTML ...`;
        try {
            await sendEmail({ email: user.email, subject: 'Password Reset Token', message });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
/*const User = require('../models / User ');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module
const sendEmail = require('../utils/sendEmail'); // Import the utility
// const { getFullImageUrl } = require('../controllers/userController'); // Reuse helper

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ... (Existing login, register, getMe, logout functions remain unchanged) ...

// 1. FORGOT PASSWORD
exports.forgotPassword = async(req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url (Points to Frontend)
        // Ensure CLIENT_URL is set in .env (e.g., http://localhost:3000)
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #d97706; text-align: center;">Meseret Hotel Password Reset</h2>
                <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. RESET PASSWORD
exports.resetPassword = async(req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // Check if not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Log user in immediately
        const token = generateToken(user._id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            user: {
                id: user._id,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// === HELPER: GET FULL IMAGE URL ===
const getFullImageUrl = (path) => {
    if (!path) return '/default-avatar.png';
    if (path.startsWith('http')) return path;
    const API_BASE = process.env.API_URL || 'https://meseret-hotel-ims.vercel.app';
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
// Helper function to handle social login response
exports.socialLoginCallback = (req, res) => {
    // User is already authenticated by Passport strategies
    const user = req.user;

    // Generate JWT Token
    const token = generateToken(user._id, user.role);

    // Set Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to Client Frontend (Dashboard or Home)
    // Adjust CLIENT_URL based on user role if needed, or just go to home
    const clientUrl = process.env.CLIENT_URL || 'https://meseret-hotel-ims.vercel.app';

    if (user.role === 'customer') {
        res.redirect(`${clientUrl}/customer`);
    } else {
        // Fallback for staff
        res.redirect(`${clientUrl}/${user.role}`);
    }
};*/