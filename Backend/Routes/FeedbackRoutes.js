const express = require("express");
const router = express.Router();

const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const { submitFeedback, getMyFeedbacks } = require("../Controllers/FeedbackController");

// Post rating
router.post("/:eventId", verifyToken, checkRole("student"), submitFeedback);

// Get my ratings
router.get("/my/ratings", verifyToken, checkRole("student"), getMyFeedbacks);

module.exports = router;
