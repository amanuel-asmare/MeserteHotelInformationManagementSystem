/*// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalid' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

module.exports = { protect, authorize };*/
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOrderNumber } = require('../controllers/orderController');
const Menu = require('../models/Menu');
const Order = require('../models/orderModel');

exports.protect = async(req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token failed' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
// FIXED: createOrder - emit properly populated items
exports.createOrder = async(req, res) => {
    try {
        const { items, notes, roomNumber, tableNumber } = req.body;
        const user = req.user;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }
        if (!roomNumber && !tableNumber) {
            return res.status(400).json({ message: 'Room number or table number is required.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const i of items) {
            const menu = await Menu.findById(i.menuItem);
            if (!menu) return res.status(404).json({ message: `Menu item not found: ${i.menuItem}` });

            const qty = i.quantity || 1;
            totalAmount += menu.price * qty;
            orderItems.push({
                menuItem: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: qty,
                notes: i.notes || ''
            });
        }

        const orderNumber = await generateOrderNumber();
        const order = await Order.create({
            orderNumber,
            customer: {
                name: `${user.firstName} ${user.lastName}`,
                roomNumber: roomNumber || undefined,
                tableNumber: tableNumber || undefined,
                phone: user.phone || 'N/A'
            },
            items: orderItems,
            totalAmount,
            notes: notes || '',
            status: 'pending',
            createdBy: user._id
        });

        // Properly populate and emit to Socket.IO
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            });

        const cleanItems = populatedOrder.items.map(item => ({
            ...item.toObject(),
            name: item.name || (item.menuItem ? item.menuItem.name : 'Unknown'),
            price: item.price || (item.menuItem ? item.menuItem.price : 0)
        }));

        global.io.emit('orderUpdate', {
            ...populatedOrder.toObject(),
            items: cleanItems
        });

        res.status(201).json({
            ...populatedOrder.toObject(),
            items: cleanItems
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};