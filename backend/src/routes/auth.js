const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, logout, getMe, forgotPassword, resetPassword, socialLoginCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Normal Routes
router.post('/register', uploadAvatar.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// --- SOCIAL LOGIN ROUTES ---

// 1. Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    socialLoginCallback
);

// 2. Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    socialLoginCallback
);

// 3. GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    socialLoginCallback
);

module.exports = router;