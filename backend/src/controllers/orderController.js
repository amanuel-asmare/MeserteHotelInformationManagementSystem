// backend/src/controllers/orderController.js
const Order = require('../models/orderModel.js');
const Menu = require('../models/Menu');
const User = require('../models/User');
const axios = require('axios');
const path = require('path');
// ──────────────────────────────────────────────────────────────
// IMAGE URL HELPER - FULL ABSOLUTE URL
// ──────────────────────────────────────────────────────────────
const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = process.env.API_URL || 'https://localhost:5000';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return base + cleanPath;
};

// ──────────────────────────────────────────────────────────────
// ORDER NUMBER GENERATOR
// ──────────────────────────────────────────────────────────────
const generateOrderNumber = async() => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) || 0 : 0;
    return 'ORD-' + String(lastNumber + 1).padStart(4, '0');
};

// ──────────────────────────────────────────────────────────────
// FORMAT ORDER ITEMS WITH FULL IMAGE URL
// ──────────────────────────────────────────────────────────────
const formatOrderItems = (items, menuItemsList) => {
    return items.map(item => {
        let menuItem = null;
        if (menuItemsList && Array.isArray(menuItemsList)) {
            menuItem = menuItemsList.find(m => m && m._id && item.menuItem && m._id.toString() === item.menuItem.toString());
        }

        return {
            _id: item._id || item.menuItem,
            name: item.name || (menuItem && menuItem.name) || 'Unknown Item',
            price: item.price || (menuItem && menuItem.price) || 0,
            quantity: item.quantity || 1,
            notes: item.notes || '',
            image: item.menuItem && item.menuItem.image ?
                `/uploads/menu/${path.basename(item.menuItem.image)}` : null
        };
    });
};

// ──────────────────────────────────────────────────────────────
// GET ALL ORDERS (Manager + Kitchen)
// ──────────────────────────────────────────────────────────────
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            })
            .populate('createdBy', 'firstName lastName')
            .sort({ orderedAt: -1 });

        const formatted = orders.map(order => {
            const o = order.toObject();
            const menuItems = o.items.map(i => i.menuItem).filter(Boolean);
            return {
                ...o,
                items: formatOrderItems(o.items, menuItems)
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('getAllOrders error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// GET SINGLE ORDER (Receipt page)
// ──────────────────────────────────────────────────────────────
exports.getOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            })
            .populate('createdBy', 'firstName lastName');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const o = order.toObject();
        const menuItems = o.items.map(i => i.menuItem).filter(Boolean);

        res.json({
            ...o,
            items: formatOrderItems(o.items, menuItems)
        });
    } catch (err) {
        console.error('getOrder error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// ──────────────────────────────────────────────────────────────
exports.updateOrderStatus = async(req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'delivered') order.deliveredAt = new Date();
        await order.save();

        const populated = await Order.findById(order._id)
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            });

        const o = populated.toObject();
        const menuItems = o.items.map(i => i.menuItem).filter(Boolean);
        const formattedOrder = {
            ...o,
            items: formatOrderItems(o.items, menuItems)
        };

        if (global.io) global.io.emit('orderUpdate', formattedOrder);

        res.json(formattedOrder);
    } catch (err) {
        console.error('updateOrderStatus error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// CREATE ORDER (Direct order - no payment)
// ──────────────────────────────────────────────────────────────
exports.createOrder = async(req, res) => {
    try {
        const { items, notes, roomNumber, tableNumber } = req.body;
        const user = req.user;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }
        if (!roomNumber && !tableNumber) {
            return res.status(400).json({ message: 'Room or table number is required.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const i of items) {
            const menu = await Menu.findById(i.menuItem);
            if (!menu) return res.status(404).json({ message: 'Menu item not found: ' + i.menuItem });

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
                name: user.firstName + ' ' + user.lastName,
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

        const populated = await Order.findById(order._id)
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            });

        const o = populated.toObject();
        const menuItems = o.items.map(i => i.menuItem).filter(Boolean);
        const formattedOrder = {
            ...o,
            items: formatOrderItems(o.items, menuItems)
        };

        if (global.io) global.io.emit('orderUpdate', formattedOrder);

        res.status(201).json(formattedOrder);
    } catch (err) {
        console.error('createOrder error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// CREATE CHAPA ORDER (Payment)
// ──────────────────────────────────────────────────────────────
exports.createChapaOrder = async(req, res) => {
    try {
        const { items, notes, totalAmount, customerName, email, phone, roomNumber, tableNumber } = req.body;
        const user = req.user;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }
        if (!roomNumber && !tableNumber) {
            return res.status(400).json({ message: 'Room or table number is required.' });
        }

        let calcTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menu = await Menu.findById(item.menuItem);
            if (!menu) return res.status(404).json({ message: 'Menu item not found: ' + item.menuItem });

            const qty = item.quantity || 1;
            calcTotal += menu.price * qty;

            orderItems.push({
                menuItem: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: qty,
                notes: item.notes || ''
            });
        }

        if (Math.abs(calcTotal - totalAmount) > 0.01) {
            return res.status(400).json({ message: 'Total amount mismatch. Refresh your cart.' });
        }

        const orderNumber = await generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            customer: {
                name: customerName || (user.firstName + ' ' + user.lastName),
                roomNumber: roomNumber || undefined,
                tableNumber: tableNumber || undefined,
                phone: phone || user.phone
            },
            items: orderItems,
            totalAmount: calcTotal,
            notes: notes || '',
            status: 'pending',
            paymentStatus: 'pending',
            createdBy: user._id
        });

        // Format phone for Chapa
        let phoneStr = (phone || user.phone || '').toString().trim().replace(/\D/g, '');
        if (phoneStr.startsWith('0') && phoneStr.length === 10) phoneStr = '251' + phoneStr.slice(1);
        else if (phoneStr.startsWith('9') && phoneStr.length === 9) phoneStr = '251' + phoneStr;
        else if (!/^2519\d{8}$/.test(phoneStr)) phoneStr = '251912345678';

        const chapaPayload = {
            amount: calcTotal.toFixed(2),
            currency: 'ETB',
            email: email || user.email || 'guest@meserethotel.com',
            first_name: (user.firstName || 'Guest').trim(),
            last_name: (user.lastName || '').trim(),
            phone_number: '+' + phoneStr,
            tx_ref: order._id.toString(),
            callback_url: process.env.API_URL + '/api/orders/chapa/verify',
            return_url: process.env.CLIENT_URL + '/customer/menu?paid=1',
            customization: {
                title: 'Order ' + orderNumber,
                description: 'Meseret Hotel Food and Drinks'
            }
        };

        const chapaRes = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            chapaPayload, {
                headers: {
                    Authorization: 'Bearer ' + process.env.CHAPA_SECRET_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        if (chapaRes.data && chapaRes.data.status === 'success' && chapaRes.data.data && chapaRes.data.data.checkout_url) {
            return res.json({
                checkout_url: chapaRes.data.data.checkout_url,
                orderId: order._id
            });
        }

        console.error('Chapa rejected:', chapaRes.data);
        await Order.findByIdAndDelete(order._id);
        res.status(400).json({ message: chapaRes.data.message || 'Payment failed' });

    } catch (err) {
        console.error('createChapaOrder error:', err.response ? err.response.data : err.message);
        if (err.config && err.config.data) {
            try {
                const sent = JSON.parse(err.config.data);
                if (sent.tx_ref) await Order.findByIdAndDelete(sent.tx_ref);
            } catch (e) {}
        }
        res.status(500).json({ message: 'Payment setup failed. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// CHAPA VERIFY
// ──────────────────────────────────────────────────────────────
exports.chapaVerify = async(req, res) => {
    const tx_ref = req.body.tx_ref || req.query.tx_ref;
    if (!tx_ref) return res.status(400).json({ message: 'Missing tx_ref' });

    try {
        const order = await Order.findById(tx_ref);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const verifyRes = await fetch('https://api.chapa.co/v1/transaction/verify/' + tx_ref, {
            headers: { Authorization: 'Bearer ' + process.env.CHAPA_SECRET_KEY }
        });
        const data = await verifyRes.json();

        if (verifyRes.ok && data.status === 'success' && data.data && data.data.status === 'success') {
            order.paymentStatus = 'completed';
            await order.save();

            const populated = await Order.findById(order._id)
                .populate({ path: 'items.menuItem', select: 'name price image' });

            const o = populated.toObject();
            const menuItems = o.items.map(i => i.menuItem).filter(Boolean);
            const formatted = {
                ...o,
                items: formatOrderItems(o.items, menuItems)
            };

            if (global.io) global.io.emit('orderUpdate', formatted);
            return res.json({ message: 'Payment verified' });
        } else {
            order.paymentStatus = 'failed';
            await order.save();
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (err) {
        console.error('chapaVerify error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ──────────────────────────────────────────────────────────────
// GET ORDER STATS
// ──────────────────────────────────────────────────────────────
exports.getOrderStats = async(req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: daysAgo }, status: 'delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const topItems = await Order.aggregate([
            { $match: { createdAt: { $gte: daysAgo }, status: 'delivered' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItem',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'menus',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: '$menuItem.name',
                    image: '$menuItem.image',
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        const formattedTopItems = topItems.map(t => ({
            ...t,
            image: getFullImageUrl(t.image)
        }));

        res.json({ dailySales, topItems: formattedTopItems });
    } catch (err) {
        console.error('getOrderStats error:', err);
        res.status(500).json({ message: err.message });
    }
};
/*// backend/src/controllers/orderController.js
const Order = require('../models/orderModel.js');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { getFullImageUrl } = require('./userController');
const axios = require('axios');

// ---------- Helpers ----------
const generateOrderNumber = async() => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) || 0 : 0;
    return `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
};

// Public routes (admin/manager)
// FIXED: getAllOrders - Removed invalid "? ."
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            })
            .populate('createdBy', 'firstName lastName')
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
        console.error('getAllOrders error:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.getOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({
            ...order.toObject(),
            items: order.items.map(i => ({
                ...i,
                menuItem: {
                    ...i.menuItem,
                    image: getFullImageUrl(i.menuItem.image)
                }
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Also fix updateOrderStatus emit (replace the old one)
exports.updateOrderStatus = async(req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'delivered') order.deliveredAt = new Date();
        await order.save();

        // Properly populate before emitting
        const populated = await Order.findById(order._id)
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            });

        const cleanItems = populated.items.map(item => ({
            ...item.toObject(),
            name: item.name || (item.menuItem ? item.menuItem.name : 'Unknown'),
            price: item.price || (item.menuItem ? item.menuItem.price : 0)
        }));

        global.io.emit('orderUpdate', {
            ...populated.toObject(),
            items: cleanItems
        });

        res.json({...populated.toObject(), items: cleanItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
exports.getOrderStats = async(req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: daysAgo }, status: 'delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const topItems = await Order.aggregate([
            { $match: { createdAt: { $gte: daysAgo }, status: 'delivered' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItem',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'menus',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json({ dailySales, topItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
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
// ──────────────────────────────────────────────────────────────
// FINAL 100% SAFE createChapaOrder – NO ?. ANYWHERE (copy-paste safe)
// ──────────────────────────────────────────────────────────────
exports.createChapaOrder = async(req, res) => {
    try {
        const { items, notes, totalAmount, customerName, email, phone, roomNumber, tableNumber } = req.body;
        const user = req.user;

        // ── Basic validation ──
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain items" });
        }
        if (!roomNumber && !tableNumber) {
            return res.status(400).json({ message: "Room or table number is required." });
        }

        // ── Recalculate total (security) ──
        let calcTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menu = await Menu.findById(item.menuItem);
            if (!menu) return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });

            const qty = item.quantity || 1;
            calcTotal += menu.price * qty;
            orderItems.push({
                menuItem: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: qty,
                notes: item.notes || ""
            });
        }

        if (Math.abs(calcTotal - totalAmount) > 0.01) {
            return res.status(400).json({ message: "Total amount mismatch. Refresh your cart." });
        }

        const orderNumber = await generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            customer: {
                name: customerName || `${user.firstName} ${user.lastName}`,
                roomNumber: roomNumber || undefined,
                tableNumber: tableNumber || undefined,
                phone: phone || user.phone
            },
            items: orderItems,
            totalAmount: calcTotal,
            notes: notes || "",
            status: "pending",
            paymentStatus: "pending",
            createdBy: user._id
        });

        // ── Phone formatting for Chapa ──
        let phoneStr = (phone || user.phone || "").toString().trim().replace(/\D/g, '');
        if (phoneStr.startsWith('0') && phoneStr.length === 10) phoneStr = '251' + phoneStr.slice(1);
        else if (phoneStr.startsWith('9') && phoneStr.length === 9) phoneStr = '251' + phoneStr;
        else if (!/^2519\d{8}$/.test(phoneStr)) phoneStr = '251912345678';

        const chapaPayload = {
            amount: calcTotal.toFixed(2),
            currency: "ETB",
            email: email || user.email || "guest@hotel.com",
            first_name: (user.firstName || "Guest").trim(),
            last_name: (user.lastName || "").trim(),
            phone_number: "+" + phoneStr,
            tx_ref: order._id.toString(),
            callback_url: `${process.env.API_URL}/api/orders/chapa/verify`,
            return_url: `${process.env.CLIENT_URL}/customer/menu?paid=1`,
            customization: {
                title: `Order ${orderNumber}`,
                description: "Meseret Hotel Food and Drinks"
            }
        };

        // ── DEBUG LOG (safe – no optional chaining) ──
        const secretPreview = process.env.CHAPA_SECRET_KEY ?
            process.env.CHAPA_SECRET_KEY.substring(0, 15) + "..." :
            "MISSING";

        console.log("Sending to Chapa →", {
            amount: chapaPayload.amount,
            tx_ref: chapaPayload.tx_ref,
            email: chapaPayload.email,
            phone: chapaPayload.phone_number,
            secret_key_preview: secretPreview
        });

        const chapaRes = await axios.post(
            "https://api.chapa.co/v1/transaction/initialize?test=1",
            chapaPayload, {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        // ── SUCCESS ──
        if (chapaRes.data && chapaRes.data.status === "success" && chapaRes.data.data && chapaRes.data.data.checkout_url) {
            return res.json({
                checkout_url: chapaRes.data.data.checkout_url,
                orderId: order._id
            });
        }

        // ── CHAPA REJECTED ──
        console.error("Chapa rejected payload:", chapaRes.data);
        await Order.findByIdAndDelete(order._id);
        const errorMsg = chapaRes.data && chapaRes.data.message ? chapaRes.data.message : "Failed to initialize payment.";
        return res.status(400).json({ message: errorMsg });

    } catch (err) {
        console.error("createChapaOrder error:", err.response ? err.response.data : err.message);

        // Cleanup failed order
        if (err.config && err.config.data) {
            try {
                const sent = JSON.parse(err.config.data);
                if (sent.tx_ref) await Order.findByIdAndDelete(sent.tx_ref);
            } catch {}
        }

        return res.status(500).json({ message: "Payment setup failed. Please try again." });
    }
};
// chapaVerify - also fix emit
exports.chapaVerify = async(req, res) => {
    const tx_ref = req.body.tx_ref;
    if (!tx_ref) {
        return res.status(400).json({ message: 'Transaction reference is missing.' });
    }

    try {
        const order = await Order.findById(tx_ref);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const verificationRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
            }
        });
        const verificationData = await verificationRes.json();

        if (verificationRes.ok && verificationData.status === 'success' && verificationData.data.status === 'success') {
            order.paymentStatus = 'completed';
            await order.save();

            const populated = await Order.findById(order._id)
                .populate({
                    path: 'items.menuItem',
                    select: 'name price image'
                });

            const cleanItems = populated.items.map(item => ({
                ...item.toObject(),
                name: item.name || (item.menuItem ? item.menuItem.name : 'Unknown'),
                price: item.price || (item.menuItem ? item.menuItem.price : 0)
            }));

            global.io.emit('orderUpdate', {
                ...populated.toObject(),
                items: cleanItems
            });

            return res.status(200).json({ message: 'Payment verified.' });
        } else {
            order.paymentStatus = 'failed';
            await order.save();
            return res.status(400).json({ message: 'Payment verification failed.' });
        }
    } catch (err) {
        console.error("Chapa verify error:", err);
        res.status(500).json({ message: "Server error" });
    }
};*/