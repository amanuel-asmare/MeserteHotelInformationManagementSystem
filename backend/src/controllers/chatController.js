// backend/src/controllers/chatController.js
const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// GET Conversation with a specific user
exports.getConversation = async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await ChatMessage.find({
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId }
                ],
                deletedFor: { $ne: currentUserId }
            })
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'firstName lastName' }
            })
            .sort({ createdAt: 'asc' });

        res.json(messages);
    } catch (err) {
        console.error("Error getting conversation:", err);
        res.status(500).json({ message: err.message });
    }
};

// SEND a new message
exports.sendMessage = async(req, res) => {
    try {
        const { receiver, message, replyTo } = req.body;
        let fileData = null;

        // if (req.file) {
        //     fileData = {
        //         url: `/uploads/chat/${req.file.filename}`,
        //         originalName: req.file.originalname,
        //         mimeType: req.file.mimetype
        //     };
        // }
        // TO THIS:
        if (req.file) {
            fileData = {
                url: req.file.path, // FIXED: Saves the Cloudinary URL
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        }
        if (!message && !fileData) {
            return res.status(400).json({ message: 'Message or file is required' });
        }

        const newMessage = await ChatMessage.create({
            sender: req.user.id,
            receiver,
            message,
            file: fileData,
            replyTo: replyTo || null,
        });

        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'firstName lastName' }
            });

        global.io.to(receiver).emit('newMessage', populatedMessage);
        global.io.to(req.user.id).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: err.message });
    }
};

// --- NEW FUNCTION TO FIX 500 ERROR ---
// GET Unread Message Counts grouped by sender
exports.getUnreadCounts = async(req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);

        const unreadCounts = await ChatMessage.aggregate([
            // Stage 1: Match unread messages sent TO the current user
            {
                $match: {
                    receiver: currentUserId,
                    isRead: false
                }
            },
            // Stage 2: Group by the sender and count the messages
            {
                $group: {
                    _id: "$sender",
                    count: { $sum: 1 }
                }
            },
            // Stage 3: Reshape the output for easier use on the frontend
            {
                $project: {
                    _id: 0,
                    sender: "$_id",
                    count: "$count"
                }
            }
        ]);

        res.status(200).json(unreadCounts);
    } catch (err) {
        console.error("Error fetching unread counts:", err);
        res.status(500).json({ message: "Server error while fetching unread counts." });
    }
};


// EDIT an existing message
exports.editMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        const msg = await ChatMessage.findById(messageId);

        if (!msg) return res.status(404).json({ message: "Message not found" });
        if (msg.sender.toString() !== userId) return res.status(403).json({ message: "You can only edit your own messages" });

        msg.message = message;
        msg.isEdited = true;
        await msg.save();

        const populatedMessage = await ChatMessage.findById(msg._id).populate('sender receiver replyTo');

        global.io.to(msg.receiver.toString()).emit('messageEdited', populatedMessage);
        global.io.to(msg.sender.toString()).emit('messageEdited', populatedMessage);

        res.status(200).json(populatedMessage);
    } catch (err) {
        console.error("Error editing message:", err);
        res.status(500).json({ message: err.message });
    }
};

// DELETE a message
exports.deleteMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const msg = await ChatMessage.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        msg.deletedFor.push(userId);
        await msg.save();

        global.io.to(userId).emit('messageDeleted', { messageId });

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: err.message });
    }
};
/*const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// GET Conversation with a specific user
exports.getConversation = async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await ChatMessage.find({
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId }
                ],
                // Hide messages that the current user has deleted for themselves
                deletedFor: { $ne: currentUserId }
            })
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'sender',
                    select: 'firstName lastName'
                }
            })
            .sort({ createdAt: 'asc' });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SEND a new message
exports.sendMessage = async(req, res) => {
    try {
        const { receiver, message, replyTo } = req.body;
        let fileData = null;

        if (req.file) {
            fileData = {
                url: `/uploads/chat/${req.file.filename}`,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        }

        if (!message && !fileData) {
            return res.status(400).json({ message: 'Message or file is required' });
        }

        const newMessage = await ChatMessage.create({
            sender: req.user.id,
            receiver,
            message,
            file: fileData,
            replyTo: replyTo || null,
        });

        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'firstName lastName' }
            });

        // Emit message via Socket.IO to both sender and receiver
        global.io.to(receiver).emit('newMessage', populatedMessage);
        global.io.to(req.user.id).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// EDIT an existing message
exports.editMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        const msg = await ChatMessage.findById(messageId);

        if (!msg) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (msg.sender.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }

        msg.message = message;
        msg.isEdited = true;
        await msg.save();

        const populatedMessage = await ChatMessage.findById(msg._id)
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'firstName lastName' }
            });

        // Emit update to both users
        global.io.to(msg.receiver.toString()).emit('messageEdited', populatedMessage);
        global.io.to(msg.sender.toString()).emit('messageEdited', populatedMessage);

        res.status(200).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE a message
exports.deleteMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const msg = await ChatMessage.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        // Add user to the 'deletedFor' array
        msg.deletedFor.push(userId);
        await msg.save();

        // Emit deletion event only to the user who deleted it
        global.io.to(userId).emit('messageDeleted', { messageId });

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
*/





/*const ChatMessage = require('../models / ChatMessage ');
const User = require('../models/User');

exports.getConversation = async(req, res) => {
    try {
        const { userId } = req.params;
        const messages = await ChatMessage.find({
                $or: [
                    { sender: req.user.id, receiver: userId },
                    { sender: userId, receiver: req.user.id }
                ]
            }).populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage')
            .sort({ createdAt: 'asc' });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.sendMessage = async(req, res) => {
    try {
        const { receiver, message } = req.body;
        let fileData = null;

        if (req.file) {
            fileData = {
                url: `/uploads/chat/${req.file.filename}`,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        }

        if (!message && !fileData) {
            return res.status(400).json({ message: 'Message or file is required' });
        }

        const newMessage = await ChatMessage.create({
            sender: req.user.id,
            receiver,
            message,
            file: fileData
        });

        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate('sender', 'firstName lastName profileImage')
            .populate('receiver', 'firstName lastName profileImage');

        // Emit message via Socket.IO
        global.io.to(receiver).emit('newMessage', populatedMessage);
        global.io.to(req.user.id).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/