const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const { getEventPerformance } = require("../Controllers/AdminAnalyticsController");

// The base path in index.js for this route will be `/admin/analytics`
router.get("/event-performance", verifyToken, checkRole("admin"), getEventPerformance);

module.exports = router;
