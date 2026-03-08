const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getCollegeEvents,
  getCollegeOrganizers,
  getCollegeStudents,
  getCollegeClubs,
  getPendingCrossCollegeRegistrations,
  reviewCrossCollegeRegistration,
  getCollegeAnalytics,
} = require("../Controllers/AdminController");

// all routes require admin role
router.use(verifyToken, checkRole("admin"));

// event approval
router.get("/events/pending", getPendingEvents);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);

// college data
router.get("/events", getCollegeEvents);
router.get("/organizers", getCollegeOrganizers);
router.get("/students", getCollegeStudents);
router.get("/clubs", getCollegeClubs);
router.get("/analytics", getCollegeAnalytics);

// cross-college registration approval
router.get("/registrations/pending", getPendingCrossCollegeRegistrations);
router.patch("/registrations/:id/review", reviewCrossCollegeRegistration);

module.exports = router;
