const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/AuthMiddleware');
const { getGlobalLeaderboard, getLocalLeaderboard, getMyRank, getPointHistory } = require('../Controllers/LeaderboardController');

// Global leaderboard (public, paginated)
router.get('/global', getGlobalLeaderboard);

// Local college leaderboard (auth required to determine college)
router.get('/local', verifyToken, getLocalLeaderboard);

// Current student rank
router.get('/me', verifyToken, getMyRank);

// Point transaction history
router.get('/history', verifyToken, getPointHistory);

module.exports = router;
