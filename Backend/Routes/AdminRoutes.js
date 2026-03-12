const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getCollegeEvents,
  createEvent,
  updateEvent,
  getCollegeOrganizers,
  getCollegeStudents,
  getCollegeClubs,
  getPendingCrossCollegeRegistrations,
  reviewCrossCollegeRegistration,
  getCollegeAnalytics,
  getDashboardStats,
  getPendingPromotions,
  promoteToOrganizer,
  denyPromotion,
  getPendingAccessRequests,
  grantAccessRequest,
  rejectAccessRequest,
  getCollegeDetails,
  updateUser,
  deleteUser,
  Profiledata,
} = require("../Controllers/AdminController");
const upload = require("../utils/uploadConfig");

// all routes require admin role
router.use(verifyToken, checkRole("admin"));

// dashboard
router.get("/dashboard-stats", getDashboardStats);

// event approval
router.get("/events/pending", getPendingEvents);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);

// college data (including events)
router.get("/events", getCollegeEvents);
router.post("/events", upload.single("poster"), createEvent);
router.put("/events/:id", upload.single("poster"), updateEvent);
router.get("/organizers", getCollegeOrganizers);
router.get("/students", getCollegeStudents);
router.get("/clubs", getCollegeClubs);
router.get("/analytics", getCollegeAnalytics);

// cross-college registration approval
router.get("/registrations/pending", getPendingCrossCollegeRegistrations);
router.patch("/registrations/:id/review", reviewCrossCollegeRegistration);

// student-to-organizer promotion
router.get("/promotions/pending", getPendingPromotions);
router.patch("/promotions/:id/approve", promoteToOrganizer);
router.patch("/promotions/:id/deny", denyPromotion);

// event access requests
router.get("/access-requests/pending", getPendingAccessRequests);
router.patch("/access-requests/:id/grant", grantAccessRequest);
router.patch("/access-requests/:id/reject", rejectAccessRequest);

// viewing all users of the college 
router.get("/users", getCollegeDetails)
router.put("/users/:id", updateUser)
router.patch("/users/:id/delete", deleteUser)

//profle
router.get("/profile", Profiledata)

module.exports = router;
