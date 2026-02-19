const router = require('express').Router();
const { signup,login, forgotPassword, resetPassword, verifyResetOtp, verifyEmail, logout, resendEmailVerificationOtp } = require('../Controllers/AuthControl');
const { signupvad, loginvad } = require('../Middleware/AuthMiddleware');


router.post('/signup', signupvad, signup);
router.post('/verify-email', verifyEmail)
router.post('/resend-verification-otp', resendEmailVerificationOtp)
router.post('/login', loginvad, login);
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;