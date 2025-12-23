/*const MenuItem = require('../models / MenuItem ');

exports.getMenu = async(req, res) => {
    const items = await MenuItem.find({ available: true });
    res.json(items);
};

exports.createMenuItem = async(req, res) => {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
};

exports.updateMenuItem = async(req, res) => {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
};

exports.deleteMenuItem = async(req, res) => {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
};*/
const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

// ✅ Get all menu items
exports.getAll = async(req, res) => {
    try {
        const menus = await Menu.find().sort({ createdAt: -1 });
        res.json(menus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Add menu item
exports.add = async(req, res) => {
    try {
        const { name, description, price, category, tags } = req.body;
        // const image = req.file ? `/uploads/menu/${req.file.filename}` : '/uploads/menu/default-menu.png';
        // FIX: Store the Cloudinary URL
        const image = req.file ? req.file.path : '/uploads/menu/default-menu.png';
        const menu = await Menu.create({
            name,
            description,
            price,
            category,
            image,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
        });

        res.status(201).json(menu);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.update = async(req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });

        if (req.file) {
            // SAFE DELETE: Only unlink if it is NOT a cloudinary link (doesn't start with http)
            if (menu.image && !menu.image.startsWith('http') && menu.image !== '/uploads/menu/default-menu.png') {
                const oldPath = path.join(__dirname, '..', 'public', menu.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            menu.image = req.file.path; // Update with new Cloudinary URL
        }

        Object.assign(menu, req.body);
        await menu.save();
        res.json(menu);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// // ✅ Update menu item
// exports.update = async(req, res) => {
//     try {
//         const menu = await Menu.findById(req.params.id);
//         if (!menu) return res.status(404).json({ message: 'Menu not found' });

//         // ✅ delete old image if replaced
//         if (req.file) {
//             if (menu.image && menu.image !== '/uploads/menu/default-menu.png') {
//                 const oldPath = path.join(__dirname, '..', 'public', menu.image.replace(/^\/uploads\//, 'uploads/'));
//                 if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//             }
//             // menu.image = `/uploads/menu/${req.file.filename}`;
//             // FIX: Store the Cloudinary URL if a new file is uploaded

//             menu.image = req.file.path;

//         }

//         Object.assign(menu, req.body);
//         await menu.save();
//         res.json(menu);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// ✅ Delete menu item
exports.remove = async(req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });

        if (menu.image && menu.image !== '/uploads/menu/default-menu.png') {
            const filePath = path.join(__dirname, '..', 'public', menu.image.replace(/^\/uploads\//, 'uploads/'));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await menu.deleteOne();
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};