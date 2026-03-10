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
  promoteUserToOrganizer,
  sendCollegeNotification,
  deleteUser,
  updateUser,
  getRegistrationTrend,
  getOrganizersByClub,
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

// user management
router.patch("/users/:id/promote", promoteUserToOrganizer);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);

// notifications
router.post("/notifications/send", sendCollegeNotification);

// analytics
router.get("/analytics/trend", getRegistrationTrend);
router.get("/organizers/status", getOrganizersByClub);

module.exports = router;
