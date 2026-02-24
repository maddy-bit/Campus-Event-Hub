const joi = require('joi');
const jwt = require('jsonwebtoken');

const signupvad = (req, res, next) => {
    const signupschema = joi.object({
        fullName: joi.string().required().messages({ 'any.required': 'Full name is required' }),
        email: joi.string().email().required().messages({ 'string.email': 'Please provide a valid email address' }),
        phoneNumber: joi.string().required(),
        collegeName: joi.string().required(),
        department: joi.string().required(),
        yearOfStudy: joi.string().length(4).pattern(/^[0-9]+$/).required()
            .messages({ 'string.length': 'Year of study must be a 4-digit year' }),
        password: joi.string().min(6).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required()
            .messages({ 'any.only': 'Passwords do not match' }),
        role: joi.string().valid('admin', 'clubauthority', 'student').optional()
    });

    const { value, error } = signupschema.validate(req.body, { 
        abortEarly: true, 
        stripUnknown: true 
    });

    if (error) {
        const errorMessage = error.details[0].message.replace(/[平"]/g, '');
        
        return res.status(400).json({
            message: errorMessage
        });
    }

    req.body = value;
    next();
};

const loginvad = (req, res, next) => {
    const loginschema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()

    });
    const { value, error } = loginschema.validate(req.body, { stripUnknown: true });
    if (error) {
        return res.status(400).json({
            message: 'Validation Error',
            error: process.env.NODE_ENV === 'development' ? error.details : 'Invalid input'
        });
    }
    req.body = value;
    next();
}

// Verify JWT token
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = {
    signupvad, 
    loginvad,
    verifyToken,
    checkRole
};