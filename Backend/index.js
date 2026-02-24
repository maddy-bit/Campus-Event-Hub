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
const dashboardRoutes= require('./Routes/DashboardRoutes')

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/auth', authroutes);
app.use('/events', eventRoutes);
app.use('/registrations', eRegistrationRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/check', (req, res) => {
    res.send(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});