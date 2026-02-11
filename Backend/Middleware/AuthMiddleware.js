const joi = require('joi');

const signupvad = (req, res, next) => {
    const signupschema = joi.object({
        fullName: joi.string().required(),
        email: joi.string().email().required(),
        phoneNumber: joi.string().required(),
        collegeName: joi.string().required(),
        department: joi.string().required(),
        yearOfStudy: joi.string().length(4).pattern(/^[0-9]+$/).required(),
        password: joi.string().min(3).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        role: joi.string().valid('admin', 'clubauthority', 'student').optional()
    });

    const { error } = signupschema.validate(req.body);
    if (error) {
        // Use NODE_ENV to decide if detailed error should be sent (optional, but good practice)
        return res.status(400).json({
            message: 'Validation Error',
            error: process.env.NODE_ENV === 'development' ? error.details : 'Invalid input'
        });
    }
    next();
};

module.exports = {
    signupvad
};