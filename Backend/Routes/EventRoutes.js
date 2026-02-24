const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../Controllers/EventController");

router.post("/create", verifyToken, checkRole("admin", "clubauthority"), createEvent);

router.get("/", verifyToken, getAllEvents);

router.get("/:id", verifyToken, getEventById);

router.put("/:id", verifyToken, checkRole("admin", "clubauthority"), updateEvent);

router.delete("/:id", verifyToken, checkRole("admin", "clubauthority"), deleteEvent);

module.exports = router;
