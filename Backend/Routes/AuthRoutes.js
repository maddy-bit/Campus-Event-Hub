const router = require('express').Router();
const { signup,login } = require('../Controllers/AuthControl');
const { signupvad } = require('../Middleware/AuthMiddleware');


router.post('/signup', signupvad, signup);
router.post('/login', loginvad,login);

module.exports = router;