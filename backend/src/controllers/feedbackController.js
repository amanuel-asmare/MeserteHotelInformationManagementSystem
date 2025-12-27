/*// backend/src/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private (Customer)
exports.createFeedback = async(req, res) => {
    try {
        const { category, rating, message, target, isAnonymous } = req.body;

        const feedback = await Feedback.create({
            user: req.user.id, // User ID from 'protect' middleware
            category,
            rating,
            message,
            target,
            isAnonymous
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all feedback based on user role
// @route   GET /api/feedback
// @access  Private (Staff: Admin, Manager, Receptionist, Cashier)
exports.getFeedback = async(req, res) => {
    try {
        let query;
        const userRole = req.user.role;

        // Admin sees all feedback
        if (userRole === 'admin') {
            query = Feedback.find();
        } else {
            // Other staff see feedback targeted to 'all' or their specific role
            query = Feedback.find({
                $or: [
                    { target: 'all' },
                    { target: userRole }
                ]
            });
        }

        const feedback = await query.populate({
            path: 'user',
            select: 'firstName lastName profileImage' // Populate user info
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};*/ 
// backend/src/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private (Customer)
exports.createFeedback = async(req, res) => {
    try {
        const { category, rating, message, target, isAnonymous } = req.body;

        const feedback = await Feedback.create({
            user: req.user.id, // User ID from 'protect' middleware
            category,
            rating,
            message,
            target,
            isAnonymous
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all feedback based on user role
// @route   GET /api/feedback
// @access  Private (Staff: Admin, Manager, Receptionist, Cashier)
exports.getFeedback = async(req, res) => {
    try {
        let query;
        const userRole = req.user.role;

        // Admin sees all feedback
        if (userRole === 'admin') {
            query = Feedback.find();
        } else {
            // Other staff see feedback targeted to 'all' or their specific role
            query = Feedback.find({
                $or: [
                    { target: 'all' },
                    { target: userRole }
                ]
            });
        }

        const feedback = await query.populate({
            path: 'user',
            select: 'firstName lastName profileImage' // Populate user info
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ --- NEW FUNCTION ADDED --- ✅
// @desc    Get feedback submitted by the current logged-in customer
// @route   GET /api/feedback/my
// @access  Private (Customer)
exports.getMyFeedback = async(req, res) => {
    try {
        // Find all feedback documents where the user field matches the logged-in user's ID
        const feedback = await Feedback.find({ user: req.user.id })
            .sort({ createdAt: -1 }); // Sort by most recent first

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};