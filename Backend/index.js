require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
require('./Config/db');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const authroutes = require('./Routes/AuthRoutes');

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/auth', authroutes);

app.get('/check', (req, res) => {
    res.send(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});