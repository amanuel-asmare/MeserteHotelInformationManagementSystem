/*// backend/src/controllers/roomController.js
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

// @desc    Get all rooms (admin, manager, receptionist)
// @route   GET /api/rooms
exports.getRooms = async(req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
exports.getRoom = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create new room (admin, manager)
// @route   POST /api/rooms
exports.createRoom = async(req, res) => {
    const { roomNumber, type, price, amenities, image } = req.body;

    // Validate required fields
    if (!roomNumber || !type || !price) {
        return res.status(400).json({ message: 'Room number, type, and price are required' });
    }

    try {
        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const room = await Room.create({
            roomNumber,
            type,
            price,
            amenities: amenities || [],
            image: image || '',
            status: 'available'
        });

        res.status(201).json({
            message: 'Room created successfully',
            room
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
exports.updateRoom = async(req, res) => {
    const { roomNumber, type, price, amenities, status, image } = req.body;

    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Prevent duplicate room number
        if (roomNumber && roomNumber !== room.roomNumber) {
            const exists = await Room.findOne({ roomNumber });
            if (exists) {
                return res.status(400).json({ message: 'Room number already in use' });
            }
        }

        // Update fields
        room.roomNumber = roomNumber || room.roomNumber;
        room.type = type || room.type;
        room.price = price !== undefined ? price : room.price;
        room.amenities = amenities !== undefined ? amenities : room.amenities;
        room.status = status || room.status;
        room.image = image !== undefined ? image : room.image;

        await room.save();

        res.json({
            message: 'Room updated',
            room
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete room (admin only)
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Prevent deletion if room is currently booked
        const activeBooking = await Reservation.findOne({
            room: room._id,
            status: { $in: ['confirmed', 'checked-in'] }
        });

        if (activeBooking) {
            return res.status(400).json({ message: 'Cannot delete room with active booking' });
        }

        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Search available rooms (public + staff)
// @route   GET /api/rooms/search?checkIn=...&checkOut=...&type=...
exports.searchAvailableRooms = async(req, res) => {
    const { checkIn, checkOut, type } = req.query;

    try {
        let query = { status: 'available' };

        // Filter by room type
        if (type && ['single', 'double', 'triple', 'family'].includes(type)) {
            query.type = type;
        }

        // If dates provided, exclude rooms booked in that range
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (isNaN(checkInDate) || isNaN(checkOutDate)) {
                return res.status(400).json({ message: 'Invalid date format' });
            }

            if (checkOutDate <= checkInDate) {
                return res.status(400).json({ message: 'Check-out must be after check-in' });
            }

            // Find rooms that are booked overlapping the requested dates
            const conflictingReservations = await Reservation.find({
                $or: [
                    { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
                ],
                status: { $in: ['confirmed', 'checked-in'] }
            }).select('room');

            const bookedRoomIds = conflictingReservations.map(r => r.room);

            query._id = { $nin: bookedRoomIds };
        }

        const rooms = await Room.find(query).sort({ roomNumber: 1 });

        res.json({
            availableRooms: rooms,
            count: rooms.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/


// backend/src/controllers/roomController.js
const Room = require('../models/Room.js');
const fs = require('fs');
const path = require('path');

// // Helper to get full image URL
// const getFullImageUrl = (imagePath) => {
//     // const API_BASE = process.env.API_URL || 'https://localhost:5000';
//     const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
//     return `${API_BASE}${imagePath}`; // Fixed: Backticks + ${}
// };
// 1. Update the Helper at the top
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE = process.env.API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
    return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
// Format room response with full image URLs
const formatRoom = (room) => {
    return {
        ...room.toObject(),
        images: room.images.map(getFullImageUrl)
    };
};

// GET ALL ROOMS
exports.getAllRooms = async(req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });
        const formattedRooms = rooms.map(formatRoom);
        res.json(formattedRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET SINGLE ROOM
exports.getRoom = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(formatRoom(room));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE ROOM
exports.createRoom = async(req, res) => {
    const {
        roomNumber,
        // typeEn,
        // typeAm,
        type,
        price,
        floorNumber,
        // descEn,
        // descAm, 
        description,
        capacity,
        amenities,
        status,
        numberOfBeds,
        bathrooms
    } = req.body;
    // const images = req.files ? req.files.map(file => `/uploads/rooms/${file.filename}`) : []; // Fixed
    // FIX: Get full URLs from Cloudinary
    const images = req.files ? req.files.map(file => file.path) : [];
    try {
        const room = new Room({
            roomNumber,
            type,
            // typeEn,
            //typeAm, // Dual Language Input
            price: Number(price),
            floorNumber: Number(floorNumber),
            description,
            // descEn,
            // descAm, // Dual Language Input
            images,
            capacity: Number(capacity),
            amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
            status: status || 'clean',
            numberOfBeds: Number(numberOfBeds),
            bathrooms: Number(bathrooms)
        });

        await room.save();
        res.status(201).json(formatRoom(room));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE ROOM
exports.updateRoom = async(req, res) => {
    const { roomNumber, type, price, availability, floorNumber, description, capacity, amenities, status, numberOfBeds, bathrooms } = req.body;

    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Delete old images if new ones uploaded
        if (req.files && req.files.length > 0) {
            room.images.forEach(img => {
                const imgPath = path.join(__dirname, '..', 'public', img);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
            // room.images = req.files.map(file => `/uploads/rooms/${file.filename}`); // Fixed
            room.images = req.files.map(file => file.path);
        }

        room.roomNumber = roomNumber || room.roomNumber;
        room.type = type || room.type;
        room.price = price ? Number(price) : room.price;
        room.availability = availability !== undefined ? availability : room.availability;
        room.floorNumber = floorNumber ? Number(floorNumber) : room.floorNumber;
        room.description = description || room.description;
        room.capacity = capacity ? Number(capacity) : room.capacity;
        room.amenities = amenities ? amenities.split(',').map(a => a.trim()) : room.amenities;
        room.status = status || room.status;
        room.numberOfBeds = numberOfBeds ? Number(numberOfBeds) : room.numberOfBeds;
        room.bathrooms = bathrooms ? Number(bathrooms) : room.bathrooms;

        await room.save();
        res.json(formatRoom(room));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE ROOM
exports.deleteRoom = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Delete images
        room.images.forEach(img => {
            const imgPath = path.join(__dirname, '..', 'public', img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

        await Room.deleteOne({ _id: req.params.id });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// UPDATE ROOM STATUS (MANAGER ONLY)
exports.updateRoomStatus = async(req, res) => {
    const { status } = req.body;
    const validStatuses = ['clean', 'dirty', 'maintenance'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        room.status = status;
        await room.save();

        res.json(formatRoom(room));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};