// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const connectionDB = require("./config/db");

const app = express();
connectionDB();

// Ensure upload directory
const uploadDir = path.join(__dirname, 'public', 'uploads', 'menu');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve uploaded images correctly
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ✅ Main static folder (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));

app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/reports', require('./routes/reports'));
// Add this line with other routes
app.use('/api/orders', require('./routes/orderRoutes'));
// Add with other routes
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/public/rooms', require('./routes/publicRooms'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at: http://localhost:${PORT}`));
const { cleanupFinishedBookings } = require('./utils/cleanup');

// Run every hour
setInterval(cleanupFinishedBookings, 60 * 60 * 1000);
// Run once on start
cleanupFinishedBookings();
/*// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectionDB = require("./config/db");

const app = express();

// Connect DB
connectionDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static('public/uploads'));
app.use(express.static('public')); // for default-avatar.png

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/reports', require('./routes/reports'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});*/