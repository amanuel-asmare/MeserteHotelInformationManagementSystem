/*// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createStaff,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

router
    .route('/')
    .get(protect, authorize('admin', 'manager'), getAllUsers)
    .post(
        protect,
        authorize('admin', 'manager'),
        uploadAvatar.single('profileImage'),
        createStaff
    );

router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getUser)
    .put(
        protect,
        authorize('admin', 'manager'),
        uploadAvatar.single('profileImage'),
        updateUser
    )
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;*/
/*// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createStaff,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

// GET & CREATE (admin + manager)
router
    .route('/')
    .get(protect, authorize('admin', 'manager'), getAllUsers)
    .post(
        protect,
        authorize('admin', 'manager'),
        uploadAvatar.single('profileImage'),
        createStaff
    );

// GET, UPDATE, DELETE (admin + manager for all)
router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getUser)
    .put(
        protect,
        authorize('admin', 'manager'),
        uploadAvatar.single('profileImage'),
        updateUser
    )
    .delete(protect, authorize('admin', 'manager'), deleteUser); // FIXED

module.exports = router;*/
/*// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createStaff,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMyProfile
} = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

// ──────────────────────────────────────────────────────────────
// 1. SPECIFIC ROUTES FIRST
// ──────────────────────────────────────────────────────────────
router
    .route('/me')
    .put(protect, uploadAvatar.single('profileImage'), updateMyProfile);

// ──────────────────────────────────────────────────────────────
// 2. DYNAMIC ROUTES AFTER (/:id)
// ──────────────────────────────────────────────────────────────

// Allow receptionist to view customers
router
    .route('/')
    .get(protect, authorize('admin', 'manager', 'receptionist'), getAllUsers)
    .post(protect, authorize('admin', 'manager'), uploadAvatar.single('profileImage'), createStaff);

router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getUser)
    .put(protect, authorize('admin', 'manager'), uploadAvatar.single('profileImage'), updateUser)
    .delete(protect, authorize('admin', 'manager'), deleteUser);

module.exports = router;*/ // backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createStaff,
    getAllUsers,
    getChatUsers, // Import the new controller function
    getUser,
    updateUser,
    deleteUser,
    updateMyProfile
} = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

// ──────────────────────────────────────────────────────────────
// 1. SPECIFIC ROUTES FIRST
// ──────────────────────────────────────────────────────────────
router
    .route('/me')
    .put(protect, uploadAvatar.single('profileImage'), updateMyProfile);

// New route specifically for fetching users for chat for ALL roles
router.route('/chat').get(protect, getChatUsers);

// ──────────────────────────────────────────────────────────────
// 2. DYNAMIC ROUTES AFTER (/:id)
// ──────────────────────────────────────────────────────────────

// This route remains for admin/manager/receptionist to manage all users
router
    .route('/')
    .get(protect, authorize('admin', 'manager', 'receptionist'), getAllUsers)
    .post(protect, authorize('admin', 'manager'), uploadAvatar.single('profileImage'), createStaff);

router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getUser)
    .put(protect, authorize('admin', 'manager'), uploadAvatar.single('profileImage'), updateUser)
    .delete(protect, authorize('admin', 'manager'), deleteUser);

module.exports = router;