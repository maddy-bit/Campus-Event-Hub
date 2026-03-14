const express = require("express");
const router = express.Router();

const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");

const {
  registerForEvent,
  getAllRegistrations,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  postCommentsForEvent,
} = require("../Controllers/ERegistrationController");

const { getParticipantsByEventId, updatePaymentStatus } = require("../Controllers/EventController");

// register for event
router.post("/register", verifyToken, checkRole("student"), registerForEvent);

// get all registrations
router.get("/", verifyToken, getAllRegistrations);

// my registrations
router.get("/my", verifyToken, getMyRegistrations);

// participants of event
router.get("/event/:eventId", verifyToken, getParticipantsByEventId);

// single registration
router.get("/:id", verifyToken, getRegistrationById);

// cancel registration
router.delete("/:id", verifyToken, cancelRegistration);

// update payment
router.patch("/payment/:id", verifyToken, updatePaymentStatus);

// comments
router.post("/comment/:id", verifyToken, postCommentsForEvent);

module.exports = router;