const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const upload = require("../utils/uploadConfig");
const {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  updatePaymentStatus,
} = require("../Controllers/EventController");

router.post("/create", verifyToken, checkRole("admin", "organizer"), upload.single("poster"), createEvent);

//to get only the count of the evnts  
router.get("/", verifyToken, getAllEvents);

//to get upcoming events with open registration
router.get("/upcoming", verifyToken, getUpcomingEvents);

//for getting the details of the event for that particular user
router.get("/my-events", verifyToken, checkRole("admin", "organizer"), getMyEvents);

router.get("/:id", verifyToken, getEventById);

router.put("/:id", verifyToken, checkRole("admin", "organizer"), upload.single("poster"), updateEvent);

router.delete("/:id", verifyToken, checkRole("admin", "organizer"), deleteEvent);

//updatig the payment status of the participant
router.patch("/:id/payment", verifyToken, updatePaymentStatus);

module.exports = router;
