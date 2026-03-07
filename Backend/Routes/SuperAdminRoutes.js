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
} = require("../Controllers/SuperAdminController");

// all routes require superadmin role
router.use(verifyToken, checkRole("superadmin"));

// college management
router.post("/colleges", createCollege);
router.get("/colleges", getAllColleges);
router.put("/colleges/:id", updateCollege);
router.delete("/colleges/:id", deleteCollege);

// admin management
router.post("/admins", createAdmin);
router.get("/admins", getAllAdmins);
router.delete("/admins/:id", removeAdmin);

// platform analytics
router.get("/analytics", getPlatformAnalytics);

module.exports = router;
