// backend/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, editMessage, deleteMessage, getUnreadCounts } = require('../controllers/chatController');
const { protect } = require('../middleware/auth'); // CORRECTED: Imported 'protect' instead of 'auth'
const { uploadChatFile } = require('../middleware/upload'); // CORRECTED: Imported 'uploadChatFile' specifically

// --- ROUTE DEFINITIONS ---

// GET /api/chat/unread-counts
router.get('/unread-counts', protect, getUnreadCounts); // CORRECTED: Used 'protect'

// GET /api/chat/:userId
router.get('/:userId', protect, getConversation); // CORRECTED: Used 'protect'

// POST /api/chat
router.post('/', protect, uploadChatFile.single('file'), sendMessage); // CORRECTED: Used 'protect' and 'uploadChatFile'

// PUT /api/chat/:messageId
router.put('/:messageId', protect, editMessage); // CORRECTED: Used 'protect'

// DELETE /api/chat/:messageId
router.delete('/:messageId', protect, deleteMessage); // CORRECTED: Used 'protect'

module.exports = router;
/*const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, sendMessage } = require('../controllers/chatController');
const { uploadChatFile } = require('../middleware/upload');

router.route('/:userId').get(protect, getConversation);
router.route('/').post(protect, uploadChatFile.single('file'), sendMessage);

module.exports = router;*/
/*
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, sendMessage, editMessage, deleteMessage } = require('../controllers/chatController');
const { uploadChatFile } = require('../middleware/upload');

// Get conversation
router.route('/:userId').get(protect, getConversation);

// Send message
router.route('/').post(protect, uploadChatFile.single('file'), sendMessage);

// Edit and Delete messages
router.route('/:messageId')
    .put(protect, editMessage)
    .delete(protect, deleteMessage);

module.exports = router;*/