/*// backend/src/controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User'); // To get staff list for manager
const moment = require('moment-timezone'); // For date handling

// Helper to get start of day in a consistent timezone (e.g., Africa/Addis_Ababa)
const getStartOfDay = (dateString) => {
    // Assuming 'Africa/Addis_Ababa' as the default timezone for consistency
    return moment.tz(dateString, 'YYYY-MM-DD', 'Africa/Addis_Ababa').startOf('day').toDate();
};

// =========================================================
// STAFF ACTIONS (Receptionist, Cashier)
// =========================================================

// @desc    Mark Check-in for current user
// @route   POST /api/attendance/check-in
// @access  Private (Staff)
exports.checkIn = async(req, res) => {
    try {
        const userId = req.user.id;
        const today = getStartOfDay(moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD'));

        let attendance = await Attendance.findOne({ user: userId, date: today });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in for today.' });
        }

        if (attendance && attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out for today. Cannot check in again.' });
        }

        if (!attendance) {
            attendance = await Attendance.create({
                user: userId,
                date: today,
                checkIn: new Date(),
                status: 'present', // Default to present upon first check-in
                markedBy: userId, // Self-marked
            });
        } else {
            attendance.checkIn = new Date();
            attendance.status = 'present';
            attendance.markedBy = userId;
            await attendance.save();
        }

        res.status(200).json({ message: 'Checked in successfully', attendance });

    } catch (err) {
        console.error('Error in checkIn:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark Check-out for current user
// @route   POST /api/attendance/check-out
// @access  Private (Staff)
exports.checkOut = async(req, res) => {
    try {
        const userId = req.user.id;
        const today = getStartOfDay(moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD'));

        const attendance = await Attendance.findOne({ user: userId, date: today });

        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today.' });
        }
        if (!attendance.checkIn) {
            return res.status(400).json({ message: 'You have not checked in yet today.' });
        }
        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out for today.' });
        }

        attendance.checkOut = new Date();
        // You might want to update status based on checkIn/checkOut duration here
        // For simplicity, we keep it as 'present' unless explicitly changed by manager
        await attendance.save();

        res.status(200).json({ message: 'Checked out successfully', attendance });

    } catch (err) {
        console.error('Error in checkOut:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get current user's attendance for a specific date (or today)
// @route   GET /api/attendance/my/:date
// @access  Private (Staff)
exports.getMyAttendance = async(req, res) => {
    try {
        const userId = req.user.id;
        const dateParam = req.params.date; // YYYY-MM-DD
        const queryDate = getStartOfDay(dateParam || moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD'));

        const attendance = await Attendance.findOne({ user: userId, date: queryDate });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found for this date.' });
        }

        res.status(200).json(attendance);

    } catch (err) {
        console.error('Error in getMyAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};


// =========================================================
// MANAGER ACTIONS
// =========================================================

// @desc    Get attendance for all staff on a specific date
// @route   GET /api/attendance/manager/date/:date
// @access  Private (Manager, Admin)
exports.getStaffAttendanceByDate = async(req, res) => {
    try {
        const dateParam = req.params.date; // YYYY-MM-DD
        const queryDate = getStartOfDay(dateParam);

        // Get all staff users (receptionist, cashier)
        const staffUsers = await User.find({ role: { $in: ['receptionist', 'cashier'] } }).select('_id firstName lastName email role');

        // Fetch attendance records for these staff on the given date
        const attendanceRecords = await Attendance.find({
                user: { $in: staffUsers.map(u => u._id) },
                date: queryDate,
            })
            .populate('user', 'firstName lastName email role')
            .populate('markedBy', 'firstName lastName')
            .lean(); // Use .lean() for faster query if not modifying Mongoose documents

        // Combine staff list with their attendance records
        const result = staffUsers.map(staff => {
            const record = attendanceRecords.find(att => att.user._id.equals(staff._id));
            return {
                staff: staff,
                attendance: record || null, // null if no record for that staff on that day
            };
        });

        res.status(200).json(result);

    } catch (err) {
        console.error('Error in getStaffAttendanceByDate:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update a specific attendance record (by manager)
// @route   PUT /api/attendance/manager/:attendanceId
// @access  Private (Manager, Admin)
exports.updateAttendance = async(req, res) => {
    try {
        const { attendanceId } = req.params;
        const { checkIn, checkOut, status, notes } = req.body;

        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        // Only allow managers/admins to update
        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Only managers/admins can update attendance.' });
        }

        if (checkIn !== undefined) attendance.checkIn = checkIn ? new Date(checkIn) : null;
        if (checkOut !== undefined) attendance.checkOut = checkOut ? new Date(checkOut) : null;
        if (status) attendance.status = status;
        if (notes !== undefined) attendance.notes = notes;
        attendance.markedBy = req.user.id; // Manager/Admin updated it

        await attendance.save();

        res.status(200).json({ message: 'Attendance updated successfully', attendance });

    } catch (err) {
        console.error('Error in updateAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create an attendance record (e.g., mark absent or leave by manager)
// @route   POST /api/attendance/manager
// @access  Private (Manager, Admin)
exports.createStaffAttendance = async(req, res) => {
    try {
        const { userId, date, checkIn, checkOut, status, notes } = req.body;

        if (!userId || !date || !status) {
            return res.status(400).json({ message: 'User ID, date, and status are required.' });
        }

        const queryDate = getStartOfDay(date);
        const staff = await User.findById(userId);

        if (!staff || !['receptionist', 'cashier'].includes(staff.role)) {
            return res.status(400).json({ message: 'Invalid staff user ID.' });
        }
        if (moment(queryDate).isAfter(moment().startOf('day'))) {
            return res.status(400).json({ message: 'Cannot mark attendance for a future date.' });
        }


        let attendance = await Attendance.findOne({ user: userId, date: queryDate });

        if (attendance) {
            return res.status(400).json({ message: 'Attendance record already exists for this user on this date. Please update it instead.' });
        }

        attendance = await Attendance.create({
            user: userId,
            date: queryDate,
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: checkOut ? new Date(checkOut) : null,
            status,
            notes,
            markedBy: req.user.id,
        });

        res.status(201).json({ message: 'Attendance created successfully', attendance });

    } catch (err) {
        console.error('Error in createStaffAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get attendance history for a specific staff member
// @route   GET /api/attendance/manager/history/:userId
// @access  Private (Manager, Admin)
exports.getStaffAttendanceHistory = async(req, res) => {
    try {
        const { userId } = req.params;
        const staff = await User.findById(userId);

        if (!staff || !['receptionist', 'cashier'].includes(staff.role)) {
            return res.status(400).json({ message: 'Invalid staff user ID.' });
        }

        const history = await Attendance.find({ user: userId })
            .sort({ date: -1 }) // Newest first
            .populate('markedBy', 'firstName lastName')
            .lean();

        res.status(200).json(history);

    } catch (err) {
        console.error('Error in getStaffAttendanceHistory:', err);
        res.status(500).json({ message: err.message });
    }
};*/


const Attendance = require('../models/Attendance');
const User = require('../models/User');
const moment = require('moment-timezone');

// SAFE: Never let moment.tz receive undefined timezone
const getStartOfDay = (dateString) => {
    // If no date provided, use today
    const input = dateString && typeof dateString === 'string' ?
        dateString.trim() :
        moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD');

    // Validate format first
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return null;
    }

    // Now safely parse
    const parsed = moment.tz(input, 'YYYY-MM-DD', 'Africa/Addis_Ababa');
    return parsed.isValid() ? parsed.startOf('day').toDate() : null;
};

// =========================================================
// STAFF ACTIONS
// =========================================================
exports.checkIn = async(req, res) => {
    try {
        const userId = req.user.id;
        const today = getStartOfDay(); // today in Addis Ababa

        let attendance = await Attendance.findOne({ user: userId, date: today });

        // Fixed: no optional chaining
        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today.' });
        }

        if (!attendance) {
            attendance = new Attendance({
                user: userId,
                date: today,
                checkIn: new Date(),
                status: 'present',
                markedBy: userId
            });
            await attendance.save();
        } else {
            attendance.checkIn = new Date();
            attendance.status = 'present';
            attendance.markedBy = userId;
            await attendance.save();
        }

        res.json({ message: 'Checked in successfully', attendance });
    } catch (err) {
        console.error('Error in checkIn:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkOut = async(req, res) => {
    try {
        const userId = req.user.id;
        const today = getStartOfDay();

        const attendance = await Attendance.findOne({ user: userId, date: today });

        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found today.' });
        }
        if (!attendance.checkIn) {
            return res.status(400).json({ message: 'You have not checked in yet.' });
        }
        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today.' });
        }

        attendance.checkOut = new Date();
        await attendance.save();

        res.json({ message: 'Checked out successfully', attendance });
    } catch (err) {
        console.error('Error in checkOut:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyAttendance = async(req, res) => {
    try {
        const userId = req.user.id;
        const dateParam = req.params.date;

        const queryDate = getStartOfDay(dateParam);

        if (!queryDate) {
            return res.status(400).json({
                message: 'Invalid or missing date. Use YYYY-MM-DD format.'
            });
        }

        const attendance = await Attendance.findOne({
            user: userId,
            date: queryDate
        });

        if (!attendance) {
            return res.status(404).json({
                message: 'No attendance record found for this date.'
            });
        }

        res.status(200).json(attendance);
    } catch (err) {
        console.error('getMyAttendance Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// =========================================================
// MANAGER ACTIONS (unchanged except safe getStartOfDay)
// =========================================================
exports.getStaffAttendanceByDate = async(req, res) => {
    try {
        const dateParam = req.params.date;
        const queryDate = getStartOfDay(dateParam);

        const staffUsers = await User.find({ role: { $in: ['receptionist', 'cashier'] } })
            .select('_id firstName lastName email role');

        const attendanceRecords = await Attendance.find({
                user: { $in: staffUsers.map(u => u._id) },
                date: queryDate,
            })
            .populate('user', 'firstName lastName email role')
            .populate('markedBy', 'firstName lastName')
            .lean();

        const result = staffUsers.map(staff => {
            const record = attendanceRecords.find(att => att.user._id.equals(staff._id));
            return { staff, attendance: record || null };
        });

        res.status(200).json(result);
    } catch (err) {
        console.error('Error in getStaffAttendanceByDate:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateAttendance = async(req, res) => {
    try {
        const { attendanceId } = req.params;
        const { checkIn, checkOut, status, notes } = req.body;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found.' });

        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Only managers/admins can update attendance.' });
        }

        if (checkIn !== undefined) attendance.checkIn = checkIn ? new Date(checkIn) : null;
        if (checkOut !== undefined) attendance.checkOut = checkOut ? new Date(checkOut) : null;
        if (status) attendance.status = status;
        if (notes !== undefined) attendance.notes = notes;

        attendance.markedBy = req.user.id;
        await attendance.save();

        res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } catch (err) {
        console.error('Error in updateAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.createStaffAttendance = async(req, res) => {
    try {
        const { userId, date, checkIn, checkOut, status, notes } = req.body;
        if (!userId || !date || !status) {
            return res.status(400).json({ message: 'User ID, date, and status are required.' });
        }

        const queryDate = getStartOfDay(date);
        if (!queryDate) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        const staff = await User.findById(userId);
        if (!staff || !['receptionist', 'cashier'].includes(staff.role)) {
            return res.status(400).json({ message: 'Invalid staff user ID.' });
        }

        const existing = await Attendance.findOne({ user: userId, date: queryDate });
        if (existing) {
            return res.status(400).json({ message: 'Attendance already exists. Use update instead.' });
        }

        const attendance = await Attendance.create({
            user: userId,
            date: queryDate,
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: checkOut ? new Date(checkOut) : null,
            status,
            notes,
            markedBy: req.user.id,
        });

        res.status(201).json({ message: 'Attendance created successfully', attendance });
    } catch (err) {
        console.error('Error in createStaffAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getStaffAttendanceHistory = async(req, res) => {
    try {
        const { userId } = req.params;
        const staff = await User.findById(userId);
        if (!staff || !['receptionist', 'cashier'].includes(staff.role)) {
            return res.status(400).json({ message: 'Invalid staff user ID.' });
        }

        const history = await Attendance.find({ user: userId })
            .sort({ date: -1 })
            .populate('markedBy', 'firstName lastName')
            .lean();

        res.status(200).json(history);
    } catch (err) {
        console.error('Error in getStaffAttendanceHistory:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    checkIn: exports.checkIn,
    checkOut: exports.checkOut,
    getMyAttendance: exports.getMyAttendance,
    getStaffAttendanceByDate: exports.getStaffAttendanceByDate,
    updateAttendance: exports.updateAttendance,
    createStaffAttendance: exports.createStaffAttendance,
    getStaffAttendanceHistory: exports.getStaffAttendanceHistory
};