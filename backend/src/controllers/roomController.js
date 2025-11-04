// backend/src/controllers/roomController.js
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
};