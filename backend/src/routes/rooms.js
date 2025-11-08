/*// backend/src/routes/rooms.js
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

module.exports = router;*/
// backend/src/routes/rooms.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus
} = require('../controllers/roomController');
const { uploadRoom } = require('../middleware/upload');
router
    .route('/').get(protect, authorize('admin', 'manager'), getAllRooms)
    .post(protect, authorize('admin', 'manager'), uploadRoom.array('images', 3), createRoom);
router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getRoom)
    .put(protect, authorize('admin', 'manager'), uploadRoom.array('images', 3), updateRoom)
    .delete(protect, authorize('admin', 'manager'), deleteRoom);
// Add this line with other routes
router.put('/:id/status', protect, authorize('admin', 'manager'), updateRoomStatus);
module.exports = router;