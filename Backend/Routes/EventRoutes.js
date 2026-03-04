const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const upload = require("../utils/uploadConfig");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../Controllers/EventController");

router.post("/create", verifyToken, checkRole("admin", "organizer"), upload.single("poster"), createEvent);

router.get("/", verifyToken, getAllEvents);

router.get("/:id", verifyToken, getEventById);

router.put("/:id", verifyToken, checkRole("admin", "organizer"), upload.single("poster"), updateEvent);

router.delete("/:id", verifyToken, checkRole("admin", "organizer"), deleteEvent);

module.exports = router;
