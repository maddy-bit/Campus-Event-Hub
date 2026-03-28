const express = require("express");
const router = express.Router();
const {
  getTrendingEvents,
  getTopStudents,
  getColleges,
  submitContact,
} = require("../Controllers/PublicController");

// Public routes — no auth required
router.get("/events/trending", getTrendingEvents);
router.get("/students/top", getTopStudents);
router.get("/colleges", getColleges);
router.post("/contact", submitContact);

module.exports = router;
