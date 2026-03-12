const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  createCollege,
  getAllColleges,
  updateCollege,
  deleteCollege,
  createAdmin,
  getAllAdmins,
  removeAdmin,
  getPlatformAnalytics,
  getCollegeDetails,
  updateUser,
  getAllEvents,
  updateEvent,
} = require("../Controllers/SuperAdminController");
const upload = require("../utils/uploadConfig");

// all routes require superadmin role
router.use(verifyToken, checkRole("superadmin"));

// college management
router.post("/colleges", createCollege);
router.get("/colleges", getAllColleges);
router.get("/colleges/:id/details", getCollegeDetails);

router.put("/colleges/:id", updateCollege);
router.delete("/colleges/:id", deleteCollege);

// admin management
router.post("/admins", createAdmin);
router.get("/admins", getAllAdmins);
router.delete("/admins/:id", removeAdmin);

// user management
router.put("/users/:id", updateUser);

// platform analytics
router.get("/analytics", getPlatformAnalytics);

// event management (sadmin)
router.get("/events", getAllEvents);
router.put("/events/:id", upload.single("poster"), updateEvent);


module.exports = router;
