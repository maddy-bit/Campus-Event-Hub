
const router = require('express').Router();
// const { getDashboard } = require('../Controllers/DashboardController');
const { protect } = require('../Middleware/AuthGuard');

router.get('/', protect);

module.exports = router;