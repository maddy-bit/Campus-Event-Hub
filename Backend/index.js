require('dotenv').config();

const express = require('express');
const cors = require('cors');
require('./config/db');
const cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

//  SECURITY MIDDLEWARE 

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/uploads', express.static('uploads'));

//  ROUTES 

const authroutes = require('./Routes/AuthRoutes');
const eventRoutes = require('./Routes/EventRoutes');
const eRegistrationRoutes = require('./Routes/ERegistrationRoutes');
const dashboardRoutes = require('./Routes/DashboardRoutes');
const profileRoutes = require('./Routes/ProfileRoutes');
const notificationRoutes = require('./Routes/NotificationRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const superAdminRoutes = require('./Routes/SuperAdminRoutes');
const collegeRoutes = require('./Routes/CollegeRoutes');

app.use('/auth', authroutes);
app.use('/events', eventRoutes);
app.use('/registrations', eRegistrationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/superadmin', superAdminRoutes);
app.use('/colleges', collegeRoutes);

// TEST ROUTE 

app.get('/check', (req, res) => {
  res.send(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});

//  ERROR HANDLER LAST

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// SERVER  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});