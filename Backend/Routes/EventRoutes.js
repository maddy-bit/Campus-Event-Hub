const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getparticipantsByEventId,
} = require("../Controllers/EventController");
const { get } = require("mongoose");

router.post("/create", verifyToken, checkRole("admin", "organizer"), createEvent);

//to get only the count of the evnts  
router.get("/", verifyToken, getAllEvents);

//for getting the details of the event for that particular user
router.get("/my-events", verifyToken, getMyEvents);

//get all participants of that particular event
router.get("/event/:eventId", verifyToken, getparticipantsByEventId);

router.get("/:id", verifyToken, getEventById);

router.put("/:id", verifyToken, checkRole("admin", "organizer"), updateEvent);

router.delete("/:id", verifyToken, checkRole("admin", "organizer"), deleteEvent);

module.exports = router;
