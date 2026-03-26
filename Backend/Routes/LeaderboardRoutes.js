const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/AuthMiddleware');
const { getLeaderboard, getMyRank } = require('../Controllers/LeaderboardController');

// get generic leaderboard 
router.get('/', getLeaderboard);

// Get current student's rank
router.get('/me', verifyToken, getMyRank);

module.exports = router;
