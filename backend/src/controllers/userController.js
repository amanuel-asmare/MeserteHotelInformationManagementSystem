// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// === HELPER: GET FULL IMAGE URL ===
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'; // Fallback for profile images
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE = process.env.API_URL || 'https://localhost:5000';
    // Handle menu images which might use /uploads/menu/ or /uploads/avatars/ for avatars
    if (imagePath.startsWith('/uploads/menu/') || imagePath.startsWith('/uploads/avatars/')) {
        return `${API_BASE}${imagePath}`;
    }
    // Generic fallback if path structure is unknown
    return `${API_BASE}/uploads/menu/${imagePath}`; // Default to menu upload path if unsure
};

// GET USERS FOR CHAT (Handles logic for different roles)
exports.getChatUsers = async(req, res) => {
    try {
        let users;

        if (req.user.role === 'customer') {
            // ✅ FIX: Added 'cashier' to the array of roles a customer can see.
            // Customers should only see staff members they can contact.
            users = await User.find({ role: { $in: ['receptionist', 'manager', 'admin', 'cashier'] }, isActive: true });
        } else {
            // Staff members can see all other users (customers and staff), except for themselves
            users = await User.find({ _id: { $ne: req.user.id } });
        }

        const formatted = users.map(u => ({
            ...u.toObject(),
            profileImage: getFullImageUrl(u.profileImage),
            password: undefined // Ensure password is not sent
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching chat users:", err);
        res.status(500).json({ message: err.message });
    }
};

// --- NO OTHER FUNCTIONS IN THIS FILE ARE CHANGED ---

// GET ALL USERS (For Admin Panel)
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

// UPDATE MY PROFILE – WITH OLD + NEW + CONFIRM PASSWORD
exports.updateMyProfile = async(req, res) => {
    const { firstName, lastName, email, oldPassword, newPassword, confirmPassword, roomNumber, phone } = req.body; // Added roomNumber, phone

    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = {};

        // Basic fields
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (phone) updates.phone = phone; // Allow updating phone
        if (roomNumber) updates.roomNumber = roomNumber; // Allow updating roomNumber

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
// Add this line at the end to export the helper
exports.getFullImageUrl = getFullImageUrl;




/*// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// === HELPER: GET FULL IMAGE URL ===
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png'; // Fallback for profile images
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE = process.env.API_URL || 'http://localhost:5000';
    // Handle menu images which might use /uploads/menu/ or /uploads/avatars/ for avatars
    if (imagePath.startsWith('/uploads/menu/') || imagePath.startsWith('/uploads/avatars/')) {
        return `${API_BASE}${imagePath}`;
    }
    // Generic fallback if path structure is unknown
    return `${API_BASE}/uploads/menu/${imagePath}`; // Default to menu upload path if unsure
};

// GET USERS FOR CHAT (Handles logic for different roles)
exports.getChatUsers = async(req, res) => {
    try {
        let users;

        if (req.user.role === 'customer') {
            // Customers should only see staff members they can contact
            users = await User.find({ role: { $in: ['receptionist', 'manager', 'admin'] }, isActive: true });
        } else {
            // Staff members can see all other users (customers and staff), except for themselves
            users = await User.find({ _id: { $ne: req.user.id } });
        }

        const formatted = users.map(u => ({
            ...u.toObject(),
            profileImage: getFullImageUrl(u.profileImage),
            password: undefined // Ensure password is not sent
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error fetching chat users:", err);
        res.status(500).json({ message: err.message });
    }
};

// GET ALL USERS (For Admin Panel)
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

// UPDATE MY PROFILE – WITH OLD + NEW + CONFIRM PASSWORD
exports.updateMyProfile = async(req, res) => {
    const { firstName, lastName, email, oldPassword, newPassword, confirmPassword, roomNumber, phone } = req.body; // Added roomNumber, phone

    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = {};

        // Basic fields
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (phone) updates.phone = phone; // Allow updating phone
        if (roomNumber) updates.roomNumber = roomNumber; // Allow updating roomNumber

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
// Add this line at the end to export the helper
exports.getFullImageUrl = getFullImageUrl;*/