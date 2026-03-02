const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: {
      type: String,
      enum: ["Announcement", "Reminder", "Alert", "Update"],
      default: "Announcement",
      required: true,
    },
    channel: {
      type: String,
      enum: ["In-App", "Email"],
      default: "In-App",
      required: true,
    },
    recipientType: {
      type: String,
      enum: [
        "All Participants",
        "Paid Only",
        "Pending Payment",
        "Volunteers",
        "Waitlisted",
      ],
      default: "All Participants",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      required: function () {
        return this.isScheduled;
      },
    },
    status: {
      type: String,
      enum: [ "Sent", "Failed"],
      default: "Sent",
    },
    reachCount: {
      type: Number,
      default: 0,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ event: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 });

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };