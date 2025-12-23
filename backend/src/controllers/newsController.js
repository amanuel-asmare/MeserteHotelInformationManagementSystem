const News = require('../models/News');
const fs = require('fs');
const path = require('path');

// // Helper to get full URL without ?.
// const getFullUrl = (filePath) => {
//     // const API_BASE = process.env.API_URL || 'https://localhost:5000';
//     const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
//     const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
//     return API_BASE + cleanPath;
// };
// 1. Update Helper
const getFullUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath; // Cloudinary Link
    const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
    const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
    return API_BASE + cleanPath;
};

// POST News
exports.createNews = async(req, res) => {
    try {
        const { title, content, category, targetAudience } = req.body;

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => {
                let type = 'document';
                if (file.mimetype.startsWith('image/')) type = 'image';
                else if (file.mimetype.startsWith('video/')) type = 'video';
                else if (file.mimetype.startsWith('audio/')) type = 'audio';

                return {
                    type: type,
                    // path: '/uploads/news/' + file.filename,
                    path: file.path, // FIX: Save the permanent Cloudinary URL
                    originalName: file.originalname
                };
            });
        }

        const news = await News.create({
            title,
            content,
            category,
            targetAudience,
            attachments,
            createdBy: req.user.id
        });

        res.status(201).json(news);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create news' });
    }
};

// GET News
exports.getNews = async(req, res) => {
    try {
        const userRole = req.user ? req.user.role : 'guest';
        let filter = { isActive: true };

        if (userRole === 'customer' || userRole === 'guest') {
            filter.targetAudience = { $in: ['all', 'customer'] };
        } else if (['admin', 'manager', 'receptionist', 'cashier'].includes(userRole)) {
            filter.targetAudience = { $in: ['all', 'staff'] };
        }
        // Admins see everything (implied by not restricting further if needed, or relying on above logic)
        // If logged in as admin, they fall into the staff bucket above, seeing 'all' and 'staff'.
        // To let admin see 'customer' only posts too, we can relax logic for admin:
        if (userRole === 'admin') {
            filter = { isActive: true }; // Admin sees all
        }

        const newsList = await News.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'firstName lastName role');

        const formatted = newsList.map(n => {
            const doc = n.toObject();
            if (doc.attachments) {
                doc.attachments = doc.attachments.map(a => ({
                    ...a,
                    url: getFullUrl(a.path)
                }));
            }
            return doc;
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE News
exports.deleteNews = async(req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'Not found' });

        // Delete files
        if (news.attachments) {
            news.attachments.forEach(att => {
                const p = path.join(__dirname, '..', 'public', att.path);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
        }

        await news.deleteOne();
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};