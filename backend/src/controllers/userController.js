// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Helper – full image URL
const getFullImageUrl = (imagePath) => {
    const API_BASE = process.env.API_URL || 'http://localhost:5000';
    return `${API_BASE}${imagePath}`;
};

// GET ALL USERS (admin/manager)
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('createdBy', 'firstName lastName');
        const formatted = users.map(u => ({
            ...u.toObject(),
            profileImage: getFullImageUrl(u.profileImage)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET SINGLE USER
exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            ...user.toObject(),
            profileImage: getFullImageUrl(user.profileImage)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE STAFF
exports.createStaff = async(req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        city,
        kebele,
        salary,
        gender,
        educationLevel,
        educationField,
        educationInstitution,
        shiftStart,
        shiftEnd,
        role
    } = req.body;

    let profileImage = '/default-avatar.png';
    if (req.file) profileImage = `/uploads/avatars/${req.file.filename}`;

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'First name, last name, email, password, and role are required' });
    }

    const validRoles = ['receptionist', 'cashier', 'manager'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            profileImage,
            address: { country: country || 'Ethiopia', city, kebele },
            role,
            salary: salary ? Number(salary) : 0,
            gender,
            education: educationLevel ? { level: educationLevel, field: educationField, institution: educationInstitution } : undefined,
            shift: (role === 'receptionist' || role === 'cashier') ? { start: shiftStart, end: shiftEnd } : undefined,
            isActive: true,
            createdBy: req.user.id
        });

        const populated = await User.findById(user._id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            ...populated.toObject(),
            profileImage: getFullImageUrl(populated.profileImage)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// UPDATE USER (STAFF)
exports.updateUser = async(req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        country,
        city,
        kebele,
        salary,
        gender,
        educationLevel,
        educationField,
        educationInstitution,
        shiftStart,
        shiftEnd,
        role,
        isActive
    } = req.body;

    try {
        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (country || city || kebele) {
            updates.address = { country: country || 'Ethiopia', city: city || '', kebele: kebele || '' };
        }
        if (salary !== undefined) updates.salary = Number(salary);
        if (gender) updates.gender = gender;
        if (educationLevel) {
            updates.education = { level: educationLevel, field: educationField || '', institution: educationInstitution || '' };
        }
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;

        if ((role === 'receptionist' || role === 'cashier') && shiftStart && shiftEnd) {
            updates.shift = { start: shiftStart, end: shiftEnd };
        }

        if (req.file) {
            updates.profileImage = `/uploads/avatars/${req.file.filename}`;
        }

        await User.findByIdAndUpdate(req.params.id, updates, { runValidators: true });

        const updatedUser = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({
            ...updatedUser.toObject(),
            profileImage: getFullImageUrl(updatedUser.profileImage)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// NEW: UPDATE MY PROFILE – WITH OLD + NEW + CONFIRM PASSWORD
exports.updateMyProfile = async(req, res) => {
    const { firstName, lastName, email, oldPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = {};

        // Basic fields
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;

        // Profile image
        if (req.file) {
            updates.profileImage = `/uploads/avatars/${req.file.filename}`;
        }

        // Password change logic
        if (oldPassword || newPassword || confirmPassword) {
            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'All password fields are required' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New passwords do not match' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }

            updates.password = await bcrypt.hash(newPassword, 10);
        }

        // Apply updates
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updates, { new: true, runValidators: true }
        ).select('-password');

        res.json({
            ...updatedUser.toObject(),
            profileImage: getFullImageUrl(updatedUser.profileImage)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
// DELETE USER
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
/*// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET ALL USERS (admin/manager)
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('createdBy', 'firstName lastName');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET SINGLE USER
exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// backend/src/controllers/userController.js

// CREATE STAFF — FIXED
exports.createStaff = async(req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        city,
        kebele,
        salary,
        gender,
        educationLevel,
        educationField,
        educationInstitution,
        shiftStart,
        shiftEnd,
        role
    } = req.body;

    let profileImage = '/default-avatar.png';
    if (req.file) {
        profileImage = `/uploads/avatars/${req.file.filename}`;
    }

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'First name, last name, email, password, and role are required' });
    }

    const validRoles = ['receptionist', 'cashier', 'manager'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            profileImage,
            address: { country: country || 'Ethiopia', city, kebele },
            role,
            salary: salary ? Number(salary) : 0,
            gender,
            education: educationLevel ? {
                level: educationLevel,
                field: educationField,
                institution: educationInstitution
            } : undefined,
            shift: (role === 'receptionist' || role === 'cashier') ? {
                start: shiftStart,
                end: shiftEnd
            } : undefined,
            isActive: true,
            createdBy: req.user.id
        });

        // CRITICAL FIX: Re-fetch the user to get correct image path
        const populated = await User.findById(user._id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// UPDATE USER — FIXED
exports.updateUser = async(req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        country,
        city,
        kebele,
        salary,
        gender,
        educationLevel,
        educationField,
        educationInstitution,
        shiftStart,
        shiftEnd,
        role,
        isActive
    } = req.body;

    try {
        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (country || city || kebele) {
            updates.address = {
                country: country || 'Ethiopia',
                city: city || '',
                kebele: kebele || ''
            };
        }
        if (salary !== undefined) updates.salary = Number(salary);
        if (gender) updates.gender = gender;
        if (educationLevel) {
            updates.education = {
                level: educationLevel,
                field: educationField || '',
                institution: educationInstitution || ''
            };
        }
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;

        if ((role === 'receptionist' || role === 'cashier') && shiftStart && shiftEnd) {
            updates.shift = { start: shiftStart, end: shiftEnd };
        }

        // Handle new image upload
        if (req.file) {
            updates.profileImage = `/uploads/avatars/${req.file.filename}`;
        }

        // Update & re-fetch to get fresh data
        await User.findByIdAndUpdate(req.params.id, updates, { runValidators: true });

        const updatedUser = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json(updatedUser); // This now has correct image!
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
// DELETE USER (unchanged)
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};*/