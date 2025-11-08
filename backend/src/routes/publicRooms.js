/*//You need a separate public endpointfor customers to view available rooms, without requiring admin / manager roles.
// backend/src/routes/publicRooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.get('/', async(req, res) => {
    try {
        const rooms = await Room.find({
                availability: true, // <-- ONLY AVAILABLE
                status: 'clean' // <-- ONLY CLEAN
            })
            .select('roomNumber type price images description capacity amenities numberOfBeds bathrooms floorNumber')
            .sort({ roomNumber: 1 });

        const API_BASE = process.env.API_URL || 'http://localhost:5000';
        const formatted = rooms.map(room => ({
            ...room.toObject(),
            images: room.images.map(img => `${API_BASE}${img}`)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;*/
// backend/src/routes/publicRooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET /api/public/rooms  →  only AVAILABLE + CLEAN rooms
router.get('/', async(req, res) => {
    try {
        const rooms = await Room.find({
            availability: true,
            status: 'clean',
        }).sort({ roomNumber: 1 });

        // reuse the same helper that the admin UI uses
        const getFullImageUrl = (path) => {
            const API_BASE = process.env.API_URL || 'http://localhost:5000';
            return path.startsWith('http') ? path : `${API_BASE}${path}`;
        };

        const formatted = rooms.map(r => ({
            ...r.toObject(),
            images: r.images.map(getFullImageUrl),
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;