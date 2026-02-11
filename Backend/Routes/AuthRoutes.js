const router = require('express').Router();
const { signup } = require('../Controllers/AuthControl');
const { signupvad } = require('../Middleware/AuthMiddleware');

router.post('/signup', signupvad, signup);

module.exports = router;