require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const http = require('http'); // ← REQUIRED
const connectionDB = require("./config/db");

const app = express();
connectionDB();

// Ensure upload directory
const uploadDir = path.join(__dirname, 'public', 'uploads', 'menu');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/public/rooms', require('./routes/publicRooms'));
// In your main routes file or server.js
app.use('/api/dashboard', require('./routes/dashboard'));
// ADD THIS NEW LINE
app.use('/api/attendance', require('./routes/attendanceRoutes')); //
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes.js'));
//app.use('/api/report', require('./routes/reportCashierRoutes.js'));
const server = http.createServer(app);

// === SOCKET.IO ===
const io = require('./socket')(server);
global.io = io;

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});

// === CLEANUP ===
const { cleanupFinishedBookings } = require('./utils/cleanup');
setInterval(cleanupFinishedBookings, 60 * 60 * 1000);
cleanupFinishedBookings();
/*// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const connectionDB = require("./config/db");



const app = express();
connectionDB();
// backend/src/server.js
const http = require('http');
const server = http.createServer(app);
const io = require('./socket')(server);
// Emit order update
global.io = io;
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
cleanupFinishedBookings(); */