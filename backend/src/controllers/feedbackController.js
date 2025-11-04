const Feedback = require('../models/Feedback');

exports.submitFeedback = async(req, res) => {
    const feedback = await Feedback.create({
        customer: req.user.id,
        ...req.body
    });
    res.status(201).json(feedback);
};

exports.getFeedbacks = async(req, res) => {
    const feedbacks = await Feedback.find().populate('customer', 'fullName');
    res.json(feedbacks);
};

exports.respondToFeedback = async(req, res) => {
    // Add response field if needed
    res.json({ message: 'Response recorded' });
};