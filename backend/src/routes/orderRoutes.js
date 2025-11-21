/*// backend/src/routes/orderRoutes.js
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
router.post('/', protect, authorize('customer'), createOrder);

// Manager routes
router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.get('/:id', protect, authorize('admin', 'manager'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/stats', protect, authorize('admin', 'manager'), getOrderStats);
module.exports = router;*/
// backend/src/routes/orderRoutes.js (Backend - Fixed)
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createOrder,
    createChapaOrder,
    chapaVerify
} = require('../controllers/orderController');
const Order = require('../models/orderModel');
const { getFullImageUrl } = require('../controllers/userController');
// Customer
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), async(req, res) => {
    try {
        const orders = await Order.find({ createdBy: req.user._id })
            .populate('items.menuItem', 'name price image')
            .sort({ orderedAt: -1 });
        const formatted = orders.map(o => ({
            ...o.toObject(),
            items: o.items.map(i => ({
                ...i,
                menuItem: {...i.menuItem.toObject(), image: getFullImageUrl(i.menuItem.image) }
            }))
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
// Chapa
router.post('/chapa', protect, authorize('customer'), createChapaOrder);
router.post('/chapa/verify', chapaVerify); // FIXED: Changed to POST for Chapa callback/webhook
// Manager / Admin
router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.get('/:id', protect, authorize('admin', 'manager'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/stats', protect, authorize('admin', 'manager'), getOrderStats);
module.exports = router;