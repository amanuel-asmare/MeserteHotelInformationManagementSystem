// backend/src/routes/rooms.js
const express = require('express');
const router = express.Router();
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    searchAvailableRooms
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.get('/search', searchAvailableRooms); // Public

router.use(protect);
router.use(authorize('admin', 'manager', 'receptionist'));

router.route('/')
    .get(getRooms)
    .post(createRoom);

router.route('/:id')
    .get(getRoom)
    .put(updateRoom)
    .delete(deleteRoom);

module.exports = router;