require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Initialize Database
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- SECURITY MIDDLEWARE ---------------- */

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting to prevent brute-force/DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

/* ---------------- STANDARD MIDDLEWARE ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- STATIC FILES ---------------- */

app.use('/uploads', express.static('uploads'));

/* ---------------- ROUTES ---------------- */

const authroutes = require('./Routes/AuthRoutes');
const eventRoutes = require('./Routes/EventRoutes');
const eRegistrationRoutes = require('./Routes/ERegistrationRoutes');
const dashboardRoutes = require('./Routes/DashboardRoutes');
const profileRoutes = require('./Routes/ProfileRoutes');
const notificationRoutes = require('./Routes/NotificationRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const adminAnalyticsRoutes = require('./Routes/AdminAnalyticsRoutes');
const superAdminRoutes = require('./Routes/SuperAdminRoutes');
const collegeRoutes = require('./Routes/CollegeRoutes');
const feedbackRoutes = require('./Routes/FeedbackRoutes');
const leaderboardRoutes = require('./Routes/LeaderboardRoutes');
const eventResultRoutes = require('./Routes/EventResultRoutes');
const publicRoutes = require('./Routes/PublicRoutes');

app.use('/auth', authroutes);
app.use('/events', eventRoutes);
app.use('/registrations', eRegistrationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/analytics', adminAnalyticsRoutes);
app.use('/superadmin', superAdminRoutes);
app.use('/colleges', collegeRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/event-results', eventResultRoutes);
app.use('/public', publicRoutes);

/* ---------------- TEST ROUTE ---------------- */

app.get('/check', (req, res) => {
  res.send(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ---------------- SERVER & SOCKETS ---------------- */

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Initialize Networking Socket
const networkingSocket = require('./Sockets/NetworkingSocket');
networkingSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});