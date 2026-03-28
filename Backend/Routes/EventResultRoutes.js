const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../Middleware/AuthMiddleware');
const { assignWinners, getEventResults } = require('../Controllers/EventResultController');

// Assign winners for an event (Organizer only)
router.post('/:eventId/results', verifyToken, checkRole('organizer', 'admin'), assignWinners);

// Get results for an event
router.get('/:eventId/results', getEventResults);

module.exports = router;
