// backend/src/routes/users.js
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

module.exports = router;
/*// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUser,
    createStaff,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Only admin & manager can manage users
router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
    .get(getAllUsers)
    .post(createStaff); // Admin creates staff

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;*/