// backend/src/controllers/orderController.js
const Order = require('../models/orderModel');
const Menu = require('../models/Menu');
const User = require('../models/User');
const { getFullImageUrl } = require('./userController');

// Generate unique order number
const generateOrderNumber = async() => {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) || 0 : 0;
    return `ORD-${String(lastNumber + 1).padStart(4, '0')}`;
};

// Get all orders
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName')
            .sort({ orderedAt: -1 });

        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item,
                menuItem: {
                    ...item.menuItem,
                    image: getFullImageUrl(item.menuItem.image)
                }
            }))
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Get single order
exports.getOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item,
                menuItem: {
                    ...item.menuItem,
                    image: getFullImageUrl(item.menuItem.image)
                }
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Update order status
exports.updateOrderStatus = async(req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'delivered') order.deliveredAt = new Date();

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Get order statistics
exports.getOrderStats = async(req, res) => {
    try {
        // FIXED: Pure JavaScript – NO TypeScript
        const days = parseInt(req.query.days) || 30;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        // Daily sales
        const dailySales = await Order.aggregate([{
                $match: {
                    createdAt: { $gte: daysAgo },
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top items
        const topItems = await Order.aggregate([{
                $match: {
                    createdAt: { $gte: daysAgo },
                    status: 'delivered'
                }
            },
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
// CREATE ORDER (Customer)
exports.createOrder = async(req, res) => {
    try {
        const { items, notes } = req.body;
        const user = req.user; // from auth middleware

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await Menu.findById(item.menuItem);
            if (!menuItem) return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });

            const price = menuItem.price;
            const quantity = item.quantity || 1;
            totalAmount += price * quantity;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price,
                quantity,
                notes: item.notes || ''
            });
        }

        const orderNumber = await generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            customer: {
                name: `${user.firstName} ${user.lastName}`,
                roomNumber: user.roomNumber || 'N/A',
                phone: user.phone || 'N/A'
            },
            items: orderItems,
            totalAmount,
            notes: notes || '',
            status: 'pending',
            createdBy: user._id
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem', 'name price image')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};