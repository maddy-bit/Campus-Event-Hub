require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
require('./Config/db');
const cookieParser = require('cookie-parser');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
const authroutes = require('./Routes/AuthRoutes');
const eventRoutes = require('./Routes/EventRoutes');
const eRegistrationRoutes = require('./Routes/ERegistrationRoutes');
const dashboardRoutes= require('./Routes/DashboardRoutes');
const profileRoutes = require('./Routes/ProfileRoutes');
const notificationRoutes = require('./Routes/NotificationRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const superAdminRoutes = require('./Routes/SuperAdminRoutes');
const collegeRoutes = require('./Routes/CollegeRoutes');
 
// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
// Serve static files for uploads
app.use('/uploads', express.static('uploads'));
 
// Routes
app.use('/auth', authroutes);
app.use('/events', eventRoutes);
app.use('/registrations', eRegistrationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/superadmin', superAdminRoutes);
app.use('/colleges', collegeRoutes);
 
 
app.get('/check', (req, res) => {
    res.send(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});
 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});