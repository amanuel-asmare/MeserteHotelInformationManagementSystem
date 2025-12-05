// backend/src/routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET active staff for payroll preview (safe fields only)
router.get('/payroll-preview', protect, async(req, res) => {
    try {
        const allowedRoles = ['manager', 'admin', 'cashier'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const staff = await User.find({
            role: { $in: ['manager', 'admin', 'cashier', 'receptionist'] },
            isActive: true,
            salary: { $gt: 0 }
        }).select('firstName lastName role salary profileImage _id').lean();

        const baseUrl = process.env.API_URL || 'https://localhost:5000';
        const formatted = staff.map(user => ({
            ...user,
            profileImage: user.profileImage ?
                user.profileImage.startsWith('http') ?
                user.profileImage :
                `${baseUrl}${user.profileImage.startsWith('/') ? '' : '/uploads/avatars/'}${user.profileImage}` :
                '/default-avatar.png'
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;