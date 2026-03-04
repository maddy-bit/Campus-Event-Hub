const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../Middleware/AuthMiddleware");
const {
  sendNotification,
  getSentNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getOrganizerEvents,
} = require("../Controllers/NotificationController");
 
// Organizer routes
router.post("/send", verifyToken, checkRole("organizer", "admin"), sendNotification);
router.get("/sent", verifyToken, checkRole("organizer", "admin"), getSentNotifications);
router.get("/my-events", verifyToken, checkRole("organizer", "admin"), getOrganizerEvents);
 
// Student routes
router.get("/my", verifyToken, getMyNotifications);
router.patch("/read-all", verifyToken, markAllAsRead);
router.patch("/:id/read", verifyToken, markAsRead);
 
// Delete (organizer/admin)
router.delete("/:id", verifyToken, checkRole("organizer", "admin"), deleteNotification);
 
module.exports = router;