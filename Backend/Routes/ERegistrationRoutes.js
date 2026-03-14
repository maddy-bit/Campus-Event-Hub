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
const { getParticipantsByEventId } = require("../Controllers/EventController");

// Route to register for an event
router.post("/register", verifyToken, checkRole("student"), registerForEvent);

router.get("/", verifyToken, getAllRegistrations);

router.get("/my", verifyToken, getMyRegistrations);

router.get("/:id", verifyToken, getRegistrationById);

router.delete("/:id", verifyToken, cancelRegistration);

//get all participants of that particular event
router.get("/event/:eventId", verifyToken, getParticipantsByEventId);

//posting comments 
router.post("/comment/:id",verifyToken, postCommentsForEvent)

module.exports = router;
