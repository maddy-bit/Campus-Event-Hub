const { NotificationModel } = require("../Models/Notification");
const { ERegistrationModel } = require("../Models/ERegistration");
const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const sendEmail = require("../utils/sendEmail");

const sendNotification = async (req, res) => {
  try {
    const { eventId, clubId, title, message, type, channel, recipientType, isScheduled, scheduledAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    if (!eventId && !clubId) {
      return res.status(400).json({ message: "Either eventId or clubId is required" });
    }

    let recipients = [];
    let eventRef = null;
    let contextTitle = "";

    if (eventId) {
      const event = await EventModel.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
      eventRef = eventId;
      contextTitle = event.title;

      let regFilter = { eventId };
      if (recipientType === "Paid Only") regFilter["payment.status"] = "Completed";
      else if (recipientType === "Pending Payment") regFilter["payment.status"] = "Pending";
      else if (recipientType === "Waitlisted") regFilter.status = "Waitlisted";

      const registrations = await ERegistrationModel.find(regFilter).populate("userId", "fullName email");
      recipients = registrations.filter(r => r.userId).map(r => r.userId);
    } else if (clubId) {
      const { ClubModel } = require("../Models/club");
      const club = await ClubModel.findById(clubId);
      if (!club) return res.status(404).json({ message: "Club not found" });
      contextTitle = club.name;

      const organizers = await UserModel.find({ clubId, role: "organizer", isDeleted: { $ne: true } }).select("fullName email");
      recipients = organizers;
    }

    const notification = new NotificationModel({
      title,
      message,
      event: eventRef,
      club: clubId || undefined,
      type: type || "Announcement",
      channel: channel || "In-App",
      recipientType: recipientType || "All Participants",
      sender: req.user._id,
      isScheduled: isScheduled || false,
      scheduledAt: isScheduled ? scheduledAt : undefined,
      status: "Sent",
      reachCount: recipients.length,
    });

    await notification.save();

    if (channel === "Email" && recipients.length > 0) {
      const emailPromises = recipients.map(user =>
        sendEmail({
          to: user.email,
          subject: `[${contextTitle}] ${title}`,
          text: message,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #000; color: #fff; padding: 16px 24px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                Campus Event Hub — Notification
              </div>
              <div style="border: 1px solid #e2e8f0; padding: 24px;">
                <div style="background: #f1f5f9; display: inline-block; padding: 4px 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 16px; border-radius: 6px;">
                  ${type || "Announcement"}
                </div>
                <h2 style="font-size: 20px; font-weight: 900; margin: 0 0 8px 0;">${title}</h2>
                <p style="font-size: 12px; color: #666; margin: 0 0 16px 0;">${contextTitle}</p>
                <p style="font-size: 14px; line-height: 1.6; color: #333;">${message}</p>
              </div>
            </div>
          `,
        }).catch(err => console.error(`Email failed for ${user.email}:`, err.message))
      );
      await Promise.allSettled(emailPromises);
    }

    res.status(201).json({
      message: `Notification sent to ${recipients.length} recipients`,
      notification,
      recipientCount: recipients.length,
    });
  } catch (err) {
    console.error("Send notification error:", err);
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};

// to get the notification they have sent in the organizer side
const getSentNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ sender: req.user._id })
      .populate("event", "title eventDate")
      .populate("club", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sent notifications retrieved",
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get sent notifications error:", err);
    res.status(500).json({ message: "Failed to retrieve notifications", error: err.message });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Find event-based notifications
    const registrations = await ERegistrationModel.find({ userId }).select("eventId");
    const eventIds = registrations.map(r => r.eventId);

    let query = { channel: "In-App", $or: [] };

    // Standard student notifications (All Participants)
    if (eventIds.length > 0) {
      query.$or.push({ 
        event: { $in: eventIds },
        recipientType: "All Participants" 
      });
    }

    // Targeted notifications specifically for this user
    query.$or.push({ recipient: userId });

    // For organizers, also find notifications sent to their club OR specifically marked for Organizers of their events
    if (userRole === "organizer") {
      if (req.user.clubId) {
        query.$or.push({ club: req.user.clubId });
      }
      // Also get notifications for events they created that are marked for "Organizer"
      const myCreatedEvents = await EventModel.find({ createdBy: userId }).select("_id");
      const myEventIds = myCreatedEvents.map(e => e._id);
      if (myEventIds.length > 0) {
        query.$or.push({ 
          event: { $in: myEventIds },
          recipientType: "Organizer"
        });
      }
    }

    if (query.$or.length === 0) {
      return res.status(200).json({ message: "No notifications", count: 0, notifications: [] });
    }

    const notifications = await NotificationModel.find(query)
      .populate("event", "title eventDate category")
      .populate("club", "name")
      .populate("sender", "fullName")
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = [];

    for (const n of notifications) {
      const readEntry = n.readBy.find(r => r.user.toString() === userId.toString());
      const isRead = !!readEntry;
      const readAt = readEntry?.readAt || null;

      if (isRead && readAt && now - new Date(readAt) > ONE_DAY_MS) continue;

      result.push({
        _id: n._id,
        title: n.title,
        message: n.message,
        event: n.event,
        club: n.club,
        type: n.type,
        sender: n.sender,
        createdAt: n.createdAt,
        isRead,
        readAt,
      });
    }

    res.status(200).json({ message: "Notifications retrieved", count: result.length, notifications: result });
  } catch (err) {
    console.error("Get my notifications error:", err);
    res.status(500).json({ message: "Failed to retrieve notifications", error: err.message });
  }
};

//marking as readd
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const alreadyRead = notification.readBy.some((r) => r.user.toString() === userId.toString());
    if (!alreadyRead) {
      notification.readBy.push({ user: userId, readAt: new Date() });
      await notification.save();
    }

    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark as read", error: err.message });
  }
};

//marking all as raed
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const registrations = await ERegistrationModel.find({ userId }).select("eventId");
    const eventIds = registrations.map((r) => r.eventId);

    const notifications = await NotificationModel.find({
      event: { $in: eventIds },
      channel: "In-App",
      "readBy.user": { $ne: userId },
    });

    const updatePromises = notifications.map((n) => {
      n.readBy.push({ user: userId, readAt: new Date() });
      return n.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: `Marked ${notifications.length} notifications as read` });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all as read", error: err.message });
  }
};

//org- deleteing the notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only the sender (organizer) or an admin can delete
    if (notification.sender.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to delete this notification" });
    }

    await NotificationModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification", error: err.message });
  }
};

//util for drop down
const getOrganizerEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ createdBy: req.user._id })
      .select("title eventDate category status")
      .sort({ eventDate: -1 });

    res.status(200).json({ events });
  } catch (err) {
    console.error("Get organizer events error:", err);
    res.status(500).json({ message: "Failed to retrieve events", error: err.message });
  }
};

module.exports = {
  sendNotification,
  getSentNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getOrganizerEvents,
};
