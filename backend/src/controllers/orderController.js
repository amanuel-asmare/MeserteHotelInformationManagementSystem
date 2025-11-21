// backend/src/controllers/orderController.js (Backend - Fixed)
const Order = require('../models/orderModel.js');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { getFullImageUrl } = require('./userController'); // Ensure this is correctly exported
const axios = require('axios');
// ---------- Helpers ----------
const generateOrderNumber = async() => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) || 0 : 0;
    return `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
};
// ---------- Public ----------
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName')
            .sort({ orderedAt: -1 });
        const formatted = orders.map(o => ({
            ...o.toObject(),
            items: o.items.map(i => ({
                ...i,
                menuItem: {
                    ...i.menuItem,
                    image: getFullImageUrl(i.menuItem.image)
                }
            }))
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
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
        global.io.emit('orderUpdate', {
            ...order.toObject(),
            items: order.items.map(i => ({
                ...i,
                menuItem: {...i.menuItem, image: getFullImageUrl(i.menuItem.image) }
            }))
        });
        res.json(order);
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
// ---------- Customer ----------
exports.createOrder = async(req, res) => {
    try {
        // This 'createOrder' typically handles direct API calls, not Chapa
        // It might not be used for frontend Chapa flow but keeping it consistent
        const { items, notes, roomNumber, tableNumber } = req.body; // Added tableNumber
        const user = req.user;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }
        if (!roomNumber && !tableNumber) { // Require either room or table number
            return res.status(400).json({ message: 'Room number or table number is required to place an order.' });
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
                roomNumber: roomNumber || undefined, // Store if provided
                tableNumber: tableNumber || undefined, // Store if provided
                phone: user.phone || 'N/A'
            },
            items: orderItems,
            totalAmount,
            notes: notes || '',
            status: 'pending',
            createdBy: user._id
        });
        const populated = await Order.findById(order._id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
// ---------- Chapa ----------
exports.createChapaOrder = async(req, res) => {
    try {
        const { items, notes, totalAmount, customerName, email, phone, roomNumber, tableNumber } = req.body; // Added tableNumber
        const user = req.user;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain items" });
        }
        // Require either roomNumber or tableNumber
        if (!roomNumber && !tableNumber) {
            return res.status(400).json({ message: "Room number or table number is required to place an order." });
        }
        // Secure: Server recalculates the real total
        let calcTotal = 0;
        const orderItems = [];
        for (const i of items) {
            const menu = await Menu.findById(i.menuItem);
            if (!menu) return res.status(404).json({ message: `Menu item not found: ${i.menuItem}` });
            const qty = i.quantity || 1;
            calcTotal += menu.price * qty;
            orderItems.push({
                menuItem: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: qty,
                notes: i.notes || "",
            });
        }
        if (Math.abs(calcTotal - totalAmount) > 0.01) { // Allow for tiny floating point differences
            return res.status(400).json({ message: "Total amount mismatch. Please refresh your cart." });
        }
        const orderNumber = await generateOrderNumber();
        const order = await Order.create({
            orderNumber,
            customer: {
                name: customerName,
                roomNumber: roomNumber || undefined, // Store room number if provided
                tableNumber: tableNumber || undefined, // Store table number if provided
                phone
            },
            items: orderItems,
            totalAmount: calcTotal, // Use calculated total for security
            notes: notes || "",
            status: "pending",
            createdBy: user._id,
        });
        // Call Chapa payment API
        const chapaBody = { // FIXED: Conditional phone_number to avoid invalid values
            amount: calcTotal, // Use calculated total
            currency: 'ETB',
            email,
            first_name: user.firstName,
            last_name: user.lastName,
            tx_ref: order._id.toString(), // Transaction reference should be unique
            callback_url: `${process.env.API_URL}/api/orders/chapa/verify`,
            return_url: `${process.env.CLIENT_URL}/customer/menu?paid=1`, // Redirect after success
            customization: { title: `Payment for Order ${orderNumber}`, description: "Hotel Food Order" },
        };
        if (phone && phone.trim()) { // Only add if valid (non-empty)
            chapaBody.phone_number = phone.trim();
        }
        const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chapaBody),
        });
        const chapaData = await chapaRes.json();
        if (!chapaRes.ok || chapaData.status !== 'success') {
            // Delete the order if Chapa payment initiation fails
            await Order.findByIdAndDelete(order._id);
            console.error("Chapa initiation error:", chapaData.message || chapaData);
            return res.status(400).json({ message: chapaData.message || "Payment initiation failed. Please try again." });
        }
        res.json({ checkout_url: chapaData.data.checkout_url });
    } catch (err) {
        console.error("Error in createChapaOrder:", err);
        res.status(500).json({ message: err.message || "Internal server error during payment initiation" });
    }
};
// FIXED: Chapa Webhook Verification (now uses req.body for POST)
exports.chapaVerify = async(req, res) => {
    const tx_ref = req.body.tx_ref; // FIXED: Use req.body.tx_ref (Chapa sends POST with body)
    if (!tx_ref) {
        return res.status(400).json({ message: 'Transaction reference is missing.' });
    }
    try {
        const order = await Order.findById(tx_ref);
        if (!order) {
            return res.status(404).json({ message: 'Order not found for this transaction reference.' });
        }
        // Verify with Chapa
        const verificationRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            },
        });
        const verificationData = await verificationRes.json();
        if (verificationRes.ok && verificationData.status === 'success' && verificationData.data.status === 'success') {
            // Payment is successful
            order.status = 'pending'; // Set to pending, then preparing, etc., by kitchen staff
            order.paymentStatus = 'completed'; // Assuming you add this field to your Order model
            await order.save();
            // Emit update to all connected clients
            global.io.emit('orderUpdate', {
                ...order.toObject(),
                items: order.items.map(i => ({
                    ...i,
                    menuItem: {...i.menuItem, image: getFullImageUrl(i.menuItem.image) }
                }))
            });
            // Redirect user (this is for the return_url, not the callback_url)
            // The callback_url is usually a backend endpoint that Chapa calls directly.
            // For the return_url, Chapa will redirect the user's browser.
            // This endpoint (chapaVerify) is generally used by the callback_url, so it doesn't
            // typically send a browser redirect. The frontend handles the redirect from Chapa's `return_url`.
            // So, for the actual verification endpoint (callback_url), we just send a success status.
            return res.status(200).json({ message: 'Payment verified and order updated successfully.' });
        } else {
            // Payment failed or not successful
            order.paymentStatus = 'failed';
            // You might want to cancel the order or mark it as 'payment_failed'
            // For now, let's keep it simple: if verification fails, the order status remains 'pending' or can be set to 'cancelled_payment'
            // To be safe, if payment initiation worked, but verification failed, we might want to still keep the order
            // and maybe an admin can manually review it. Or, simply cancel it.
            // For this example, if verification fails, we don't change the order status from pending.
            await order.save();
            console.error("Chapa verification failed:", verificationData);
            return res.status(400).json({ message: verificationData.message || 'Payment verification failed.' });
        }
    } catch (err) {
        console.error("Error verifying Chapa payment:", err);
        res.status(500).json({ message: err.message || "Internal server error during payment verification." });
    }
};
/*const Order = require('../models/orderModel.js');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { getFullImageUrl } = require('./userController'); // Ensure this is correctly exported
const axios = require('axios');

// ---------- Helpers ----------
const generateOrderNumber = async() => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) || 0 : 0;
    return `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
};

// ---------- Public ----------
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName')
            .sort({ orderedAt: -1 });

        const formatted = orders.map(o => ({
            ...o.toObject(),
            items: o.items.map(i => ({
                ...i,
                menuItem: {
                    ...i.menuItem,
                    image: getFullImageUrl(i.menuItem.image)
                }
            }))
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
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

        global.io.emit('orderUpdate', {
            ...order.toObject(),
            items: order.items.map(i => ({
                ...i,
                menuItem: {...i.menuItem, image: getFullImageUrl(i.menuItem.image) }
            }))
        });

        res.json(order);
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

// ---------- Customer ----------
exports.createOrder = async(req, res) => {
    try {
        const { items, notes } = req.body;
        const user = req.user;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
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
                roomNumber: user.roomNumber || 'N/A', // Assuming roomNumber is on user object
                phone: user.phone || 'N/A'
            },
            items: orderItems,
            totalAmount,
            notes: notes || '',
            status: 'pending',
            createdBy: user._id
        });

        const populated = await Order.findById(order._id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ---------- Chapa ----------

exports.createChapaOrder = async(req, res) => {
    try {
        const { items, notes, totalAmount, customerName, email, phone, roomNumber } = req.body;
        const user = req.user;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain items" });
        }
        if (!roomNumber) {
            return res.status(400).json({ message: "Room number is required to place an order." });
        }

        // Secure: Server recalculates the real total
        let calcTotal = 0;
        const orderItems = [];
        for (const i of items) {
            const menu = await Menu.findById(i.menuItem);
            if (!menu) return res.status(404).json({ message: `Menu item not found: ${i.menuItem}` });
            const qty = i.quantity || 1;
            calcTotal += menu.price * qty;
            orderItems.push({
                menuItem: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: qty,
                notes: i.notes || "",
            });
        }

        if (Math.abs(calcTotal - totalAmount) > 0.01) { // Allow for tiny floating point differences
            return res.status(400).json({ message: "Total amount mismatch. Please refresh your cart." });
        }

        const orderNumber = await generateOrderNumber();
        const order = await Order.create({
            orderNumber,
            customer: { name: customerName, roomNumber, phone },
            items: orderItems,
            totalAmount: calcTotal, // Use calculated total for security
            notes: notes || "",
            status: "pending",
            createdBy: user._id,
        });

        // Call Chapa payment API
        const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", { // Corrected endpoint
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: calcTotal, // Use calculated total
                currency: 'ETB',
                email,
                first_name: user.firstName,
                last_name: user.lastName,
                phone_number: phone,
                tx_ref: order._id.toString(), // Transaction reference should be unique
                callback_url: `${process.env.API_URL}/api/orders/chapa/verify`,
                return_url: `${process.env.CLIENT_URL}/customer/menu?paid=1`, // Redirect after success
                customization: { title: `Payment for Order ${orderNumber}`, description: "Hotel Food Order" },
            }),
        });

        const chapaData = await chapaRes.json();

        if (!chapaRes.ok || chapaData.status !== 'success') {
            // Delete the order if Chapa payment initiation fails
            await Order.findByIdAndDelete(order._id);
            console.error("Chapa initiation error:", chapaData.message || chapaData);
            return res.status(400).json({ message: chapaData.message || "Payment initiation failed. Please try again." });
        }

        res.json({ checkout_url: chapaData.data.checkout_url });
    } catch (err) {
        console.error("Error in createChapaOrder:", err);
        res.status(500).json({ message: err.message || "Internal server error during payment initiation" });
    }
};

// ---------- Chapa Verify (webhook) ----------
// This route is primarily for Chapa's redirect after payment.
// For true webhook verification, Chapa sends a POST request to callback_url.
// You might need a separate POST route for that if you want more robust verification.
exports.chapaVerify = async(req, res) => {
    try {
        const { status, tx_ref } = req.query; // Chapa typically sends status and tx_ref in query for GET return_url

        // You might want to also verify the transaction with Chapa's API here for robustness
        // const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
        //     headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` }
        // });
        // const verifyData = await verifyRes.json();
        // if (!verifyRes.ok || verifyData.status !== 'success') {
        //     // Handle failed verification
        //     return res.redirect(`${process.env.CLIENT_URL}/customer/menu?paid=0`);
        // }

        const order = await Order.findById(tx_ref);

        if (!order) {
            console.warn(`Chapa verification failed: Order with tx_ref ${tx_ref} not found.`);
            return res.redirect(`${process.env.CLIENT_URL}/customer/menu?paid=0`);
        }

        // Update order status only if it's pending and payment was successful
        if (order.status === 'pending' && status === 'success') {
            order.status = 'preparing'; // Or 'pending-paid' if you want a separate status
            await order.save();

            global.io.emit('orderUpdate', {
                ...order.toObject(),
                items: order.items.map(i => ({
                    ...i,
                    menuItem: {...i.menuItem, image: getFullImageUrl(i.menuItem.image) }
                }))
            });

            // Clear the cart if payment was successful and order confirmed
            // This logic might be better handled on the client-side after redirect
            // req.session.cart = []; // If you were using sessions for cart
            return res.redirect(`${process.env.CLIENT_URL}/customer/menu?paid=1`);
        } else {
            // Payment was not successful or order not in pending state
            return res.redirect(`${process.env.CLIENT_URL}/customer/menu?paid=0`);
        }

    } catch (err) {
        console.error("Error in chapaVerify:", err);
        res.redirect(`${process.env.CLIENT_URL}/customer/menu?paid=0`);
    }
};*/