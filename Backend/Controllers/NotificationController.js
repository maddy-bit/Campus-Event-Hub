const { NotificationModel } = require("../Models/Notification");
const { ERegistrationModel } = require("../Models/ERegistration");
const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const sendEmail = require("../utils/sendEmail");

//sending notification to students
const sendNotification = async (req, res) => {
  try {
    const {
      eventId,
      title,
      message,
      type,
      channel,
      recipientType,
      isScheduled,
      scheduledAt,
    } = req.body;

    if (!eventId || !title || !message) {
      return res.status(400).json({ message: "Event, title, and message are required" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let regFilter = { eventId };
    if (recipientType === "Paid Only") {
      regFilter["payment.status"] = "Completed";
    } else if (recipientType === "Pending Payment") {
      regFilter["payment.status"] = "Pending";
    } else if (recipientType === "Waitlisted") {
      regFilter.status = "Waitlisted";
    }

    const registrations = await ERegistrationModel.find(regFilter).populate("userId", "fullName email");
    const recipients = registrations.filter((r) => r.userId).map((r) => r.userId);

    const notification = new NotificationModel({
      title,
      message,
      event: eventId,
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

    // if Email, send emails to all recipients
    if (channel === "Email" && recipients.length > 0) {
      const emailPromises = recipients.map((user) =>
        sendEmail({
          to: user.email,
          subject: `[${event.title}] ${title}`,
          text: message,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #000; color: #b4ff39; padding: 16px 24px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                Campus Event Hub — Notification
              </div>
              <div style="border: 2px solid #000; padding: 24px;">
                <div style="background: #b4ff39; display: inline-block; padding: 4px 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 16px; border: 2px solid #000;">
                  ${type || "Announcement"}
                </div>
                <h2 style="font-size: 22px; font-weight: 900; margin: 0 0 8px 0; text-transform: uppercase;">${title}</h2>
                <p style="font-size: 11px; color: #666; margin: 0 0 16px 0;">Event: ${event.title}</p>
                <p style="font-size: 14px; line-height: 1.6; color: #333;">${message}</p>
                <hr style="border: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 11px; color: #999;">This email was sent to you because you are registered for "${event.title}" on Campus Event Hub.</p>
              </div>
            </div>
          `,
        }).catch((err) => {
          console.error(`Failed to send email to ${user.email}:`, err.message);
        })
      );

      await Promise.allSettled(emailPromises);
    }

    res.status(201).json({
      message: `Notification sent successfully to ${recipients.length} recipients`,
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

// gett notifications for the current student 
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const registrations = await ERegistrationModel.find({ userId }).select("eventId");
    const eventIds = registrations.map((r) => r.eventId);

    const notifications = await NotificationModel.find({
      event: { $in: eventIds },
      channel: "In-App",
    })
      .populate("event", "title eventDate category")
      .populate("sender", "fullName")
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = [];

    for (const n of notifications) {
      const readEntry = n.readBy.find((r) => r.user.toString() === userId.toString());
      const isRead = !!readEntry;
      const readAt = readEntry?.readAt || null;

      // soft-delete: if read more than 1 day ago, skip
      if (isRead && readAt && now - new Date(readAt) > ONE_DAY_MS) {
        continue;
      }

      result.push({
        _id: n._id,
        title: n.title,
        message: n.message,
        event: n.event,
        type: n.type,
        sender: n.sender,
        createdAt: n.createdAt,
        isRead,
        readAt,
      });
    }

    res.status(200).json({
      message: "Notifications retrieved",
      count: result.length,
      notifications: result,
    });
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
