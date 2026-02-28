const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  registerForEvent,
  getAllRegistrations,
  getRegistrationById,
  cancelRegistration,
} = require("../Controllers/ERegistrationController");
const { getParticipantsByEventId } = require("../Controllers/EventController");

// Route to register for an event
router.post("/", verifyToken, checkRole("student"), registerForEvent);

router.get("/", verifyToken, getAllRegistrations);

router.get("/:id", verifyToken, getRegistrationById);

router.delete("/:id", verifyToken, cancelRegistration);

//get all participants of that particular event
router.get("/event/:eventId", verifyToken, getParticipantsByEventId);

module.exports = router;
