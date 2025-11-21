const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    file: {
        url: { type: String },
        originalName: { type: String },
        mimeType: { type: String }
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    isEdited: { type: Boolean, default: false },
    // --- NEW/UPDATED FIELD ---
    isRead: { type: Boolean, default: false }, // Tracks if the receiver has read the message
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
/*const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    file: {
        url: { type: String },
        originalName: { type: String },
        mimeType: { type: String }
    },
    // --- NEW FIELDS ---
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }, // For message replies
    isEdited: { type: Boolean, default: false }, // To show 'edited' status
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // To handle message deletion for specific users
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);*/
/*const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    file: {
        url: { type: String },
        originalName: { type: String },
        mimeType: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);*/