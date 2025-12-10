// --- [STEP 1] IMPORT MODULES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https'); // Use HTTPS instead of HTTP

const financeRoutes = require('./routes/financeRoutes');


const connectionDB = require("./config/db");

// --- [STEP 2] INITIALIZE APP & DATABASE ---
const app = express();
connectionDB();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads', 'menu');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- [STEP 3] SETUP MIDDLEWARE ---
// IMPORTANT: Update CORS origin for your new HTTPS frontend URL
app.use(cors({
    origin: ['https://localhost:3000',
        process.env.CLIENT_URL
        // Changed to HTTPS
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// --- [STEP 4] DEFINE ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/public/rooms', require('./routes/publicRooms'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes.js'));
//app.use('/api/report', require('./routes/reportCashierRoutes.js'));
// In server.js, add this line:
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/news', require('./routes/newsRoutes.js'));
app.use('/api/settings', require('./routes/settingRoutes'));



// ... existing routes
app.use('/api/finance', financeRoutes); // <--- ADD THIS LINE



// // --- [STEP 5] CONFIGURE HTTPS & CREATE SERVER ---
// // Define the paths to your locally generated SSL certificate files
// const options = {
//     key: fs.readFileSync(path.join(__dirname, '..', '..', '.cert', 'localhost-key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '..', '..', '.cert', 'localhost.pem')),
// };

// // Create the HTTPS server with the options and your express app
// const server = https.createServer(options, app);

// --- [STEP 5] CONFIGURE SERVER (ADAPTED FOR DEPLOYMENT) ---
let server;

// Check if we are in production or development
if (process.env.NODE_ENV === 'production') {
    // In production (Render), use standard HTTP. Render handles SSL externally.
    const http = require('http');
    server = http.createServer(app);
} else {
    // In local development, use your local certificates
    const https = require('https');
    const options = {
        key: fs.readFileSync(path.join(__dirname, '..', '..', '.cert', 'localhost-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '..', '..', '.cert', 'localhost.pem')),
    };
    server = https.createServer(options, app);
}


// --- [STEP 6] ATTACH SOCKET.IO ---
// Attach socket.io to the new HTTPS server
const io = require('./socket')(server);
global.io = io;


// --- [STEP 7] START THE SECURE SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    // Updated log message to show HTTPS
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});


// --- [STEP 8] RUN BACKGROUND CLEANUP JOBS ---
const { cleanupFinishedBookings } = require('./utils/cleanup');
setInterval(cleanupFinishedBookings, 60 * 60 * 1000);
cleanupFinishedBookings();
/*require('dotenv').config();
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
cleanupFinishedBookings();*/