/*// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllOrders, getOrder, updateOrderStatus, getOrderStats } = require('../controllers/orderController');

router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.get('/stats', protect, getOrderStats);

module.exports = router;*/
// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createOrder
} = require('../controllers/orderController');

// Customer can create order
router.post('/', protect, createOrder);

// Manager routes
router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.get('/:id', protect, authorize('admin', 'manager'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/stats', protect, authorize('admin', 'manager'), getOrderStats);

module.exports = router;