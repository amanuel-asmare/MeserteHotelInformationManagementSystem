// backend/src/controllers/userController.js
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
};
/*// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (admin/manager only)
// @route   GET /api/users
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

// @desc    Get single user by ID
// @route   GET /api/users/:id
exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create staff account (admin/manager only)
// @route   POST /api/users
exports.createStaff = async(req, res) => {
    let { fullName, firstName, lastName, email, password, phone, role } = req.body;

    // If fullName is provided, split it (fallback for old frontend)
    if (fullName && !firstName && !lastName) {
        const names = fullName.trim().split(/\s+/);
        firstName = names[0];
        lastName = names.slice(1).join(' ');
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    // Validate role
    const validRoles = ['receptionist', 'cashier', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role,
            createdBy: req.user.id // The logged-in admin/manager who created this staff
        });

        const userResponse = await User.findById(user._id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            message: 'Staff account created',
            user: userResponse
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user (admin/manager only)
// @route   PUT /api/users/:id
exports.updateUser = async(req, res) => {
    let { fullName, firstName, lastName, email, phone, role, isActive } = req.body;

    // If fullName is provided, split it
    if (fullName && !firstName && !lastName) {
        const names = fullName.trim().split(/\s+/);
        firstName = names[0];
        lastName = names.slice(1).join(' ');
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent changing role to customer via update
        if (role && !['receptionist', 'cashier', 'manager', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Prevent email conflict
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone !== undefined ? phone : user.phone;
        user.role = role || user.role;
        user.isActive = isActive !== undefined ? isActive : user.isActive;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select('-password')
            .populate('createdBy', 'firstName lastName');

        res.json({
            message: 'User updated',
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Optional: Prevent deleting last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin' });
            }
        }

        // Soft delete or hard delete
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/