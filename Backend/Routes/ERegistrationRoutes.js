const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  registerForEvent,
  getAllRegistrations,
  getRegistrationById,
  cancelRegistration,
} = require("../Controllers/ERegistrationController");

router.post("/register", verifyToken, checkRole("student"), registerForEvent);

router.get("/", verifyToken, getAllRegistrations);

router.get("/:id", verifyToken, getRegistrationById);

router.delete("/:id", verifyToken, cancelRegistration);

module.exports = router;
