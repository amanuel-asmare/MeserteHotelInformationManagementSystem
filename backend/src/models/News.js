const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['announcement', 'event', 'promotion', 'urgent'],
        default: 'announcement'
    },
    // Supports multiple attachments
    attachments: [{
        type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
        path: { type: String, required: true },
        originalName: { type: String }
    }],
    targetAudience: {
        type: String,
        enum: ['all', 'staff', 'customer'],
        default: 'all'
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);