/*const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createChapaOrder,
    chapaVerify
} = require('../controllers/orderController');

// Customer routes
router.post('/', protect, authorize('customer'), require('../controllers/orderController').createOrder);

// GET MY ORDERS — FIXED: No more "? .name" syntax error
router.get('/my', protect, authorize('customer'), async(req, res) => {
    try {
        const orders = await require('../models/orderModel')
            .find({ createdBy: req.user._id })
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            })
            .sort({ orderedAt: -1 });

        const formatted = orders.map(order => {
            const o = order.toObject();
            return {
                ...o,
                items: o.items.map(item => ({
                    _id: item._id,
                    name: item.name || (item.menuItem ? item.menuItem.name : 'Unknown Item'),
                    price: item.price || (item.menuItem ? item.menuItem.price : 0),
                    quantity: item.quantity || 1,
                    notes: item.notes || ''
                }))
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('get my orders error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Chapa payment routes
router.post('/chapa', protect, authorize('customer'), createChapaOrder);
router.post('/chapa/verify', chapaVerify); // Webhook → POST

// Admin / Manager routes
router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.get('/:id', protect, authorize('admin', 'manager'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/stats', protect, authorize('admin', 'manager'), getOrderStats);

module.exports = router;*/
// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const Order = require('../models/orderModel');

const {
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createChapaOrder,
    chapaVerify
} = require('../controllers/orderController');
// ... existing code ...

// === GET MY ORDERS (Customer) - FIXED IMAGE LOGIC ===
router.get('/my', protect, authorize('customer'), async(req, res) => {
    try {
        const orders = await Order.find({ createdBy: req.user._id })
            .populate('items.menuItem', 'name price image')
            .sort({ orderedAt: -1 });

        const formatted = orders.map(order => {
            const o = order.toObject();
            return {
                ...o,
                items: o.items.map(item => {
                    // FIX: Handle Cloudinary URLs vs Local Paths
                    let finalImage = null;
                    const rawImage = item.menuItem && item.menuItem.image ? item.menuItem.image : null;

                    if (rawImage) {
                        if (rawImage.startsWith('http')) {
                            finalImage = rawImage;
                        } else {
                            finalImage = `/uploads/menu/${path.basename(rawImage)}`;
                        }
                    }

                    return {
                        _id: item._id,
                        name: item.name || (item.menuItem && item.menuItem.name) || 'Unknown Item',
                        price: item.price || (item.menuItem && item.menuItem.price) || 0,
                        quantity: item.quantity || 1,
                        notes: item.notes || '',
                        image: finalImage // Use fixed path
                    };
                })
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('Error fetching my orders:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ... rest of the file stays exactly the same ...

// // === GET MY ORDERS (Customer) ===
// router.get('/my', protect, authorize('customer'), async(req, res) => {
//     try {
//         const orders = await Order.find({ createdBy: req.user._id })
//             .populate('items.menuItem', 'name price image')
//             .sort({ orderedAt: -1 });

//         const formatted = orders.map(order => {
//             const o = order.toObject();
//             return {
//                 ...o,
//                 items: o.items.map(item => ({
//                     _id: item._id,
//                     name: item.name || (item.menuItem && item.menuItem.name) || 'Unknown Item',
//                     price: item.price || (item.menuItem && item.menuItem.price) || 0,
//                     quantity: item.quantity || 1,
//                     notes: item.notes || '',
//                     image: item.menuItem && item.menuItem.image ?
//                         `/uploads/menu/${path.basename(item.menuItem.image)}` :
//                         null
//                 }))
//             };
//         });

//         res.json(formatted);
//     } catch (err) {
//         console.error('Error fetching my orders:', err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// === GET SINGLE ORDER (Customer sees own, Staff sees all) ===
router.get('/:id', protect, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security check
        const isOwner = order.createdBy && order.createdBy._id.toString() === req.user._id.toString();
        const isStaff = req.user.role === 'admin' || req.user.role === 'manager';

        if (!isOwner && !isStaff) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const o = order.toObject();
        const formatted = {
            ...o,
            items: o.items.map(item => ({
                _id: item._id,
                name: item.name || (item.menuItem && item.menuItem.name) || 'Unknown Item',
                price: item.price || (item.menuItem && item.menuItem.price) || 0,
                quantity: item.quantity || 1,
                notes: item.notes || '',
                image: item.menuItem && item.menuItem.image ?
                    `/uploads/menu/${path.basename(item.menuItem.image)}` : null
            }))
        };

        res.json(formatted);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// === PAYMENT & ADMIN ROUTES ===
router.post('/chapa', protect, authorize('customer'), createChapaOrder);
router.post('/chapa/verify', chapaVerify);

router.get('/', protect, authorize('admin', 'manager'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.get('/stats', protect, authorize('admin', 'manager'), getOrderStats);

module.exports = router;