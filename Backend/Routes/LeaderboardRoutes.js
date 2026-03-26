const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/AuthMiddleware');
const { getLeaderboard, getMyRank, getPointHistory } = require('../Controllers/LeaderboardController');

// get generic leaderboard 
router.get('/', getLeaderboard);

// get current student's rank
router.get('/me', verifyToken, getMyRank);

// get point history
router.get('/history', verifyToken, getPointHistory);

module.exports = router;
