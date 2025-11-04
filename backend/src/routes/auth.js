/*// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;*/ // backend/src/routes/auth.js
// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload'); // ← CORRECT

// ROUTES
router.post('/register', uploadAvatar.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// EXPORT
module.exports = router; // ← MUST BE router, not { router }