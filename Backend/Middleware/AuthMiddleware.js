const joi = require('joi');

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
};
const verifyEmailVad = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        otp: joi.string().required()
    });

    const { value, error } = schema.validate(req.body, { stripUnknown: true });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    req.body = value;
    next();
};

module.exports = {
    signupvad, loginvad
};