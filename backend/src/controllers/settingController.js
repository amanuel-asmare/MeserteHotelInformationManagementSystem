const Setting = require('../models/Setting');
const fs = require('fs');
const path = require('path');

// Helper to get full URL
const getFullUrl = (filePath) => {
    if (!filePath) return '/default-logo.png';
    if (filePath.startsWith('http')) return filePath;
    const API_BASE = process.env.API_URL || 'https://localhost:5000';
    // Ensure path starts with /
    const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
    return API_BASE + cleanPath;
};

exports.getSettings = async(req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'hotel_config' });
        if (!settings) {
            settings = await Setting.create({ key: 'hotel_config' });
        }
        const responseData = settings.toObject();
        responseData.logoUrl = getFullUrl(responseData.logoUrl);
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load settings' });
    }
};

exports.updateSettings = async(req, res) => {
    try {
        const { hotelName } = req.body;
        let updateData = {};

        if (hotelName) updateData.hotelName = hotelName;

        if (req.file) {
            // Correct path based on upload middleware
            updateData.logoUrl = `/uploads/logo/${req.file.filename}`;
        }

        const settings = await Setting.findOneAndUpdate({ key: 'hotel_config' },
            updateData, { new: true, upsert: true }
        );

        const responseData = settings.toObject();
        responseData.logoUrl = getFullUrl(responseData.logoUrl);

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};