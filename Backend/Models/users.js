const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "organizer", "student"],
      default: "student",
      index: true,
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: function () {
        return this.role !== "superadmin";
      },
      index: true,
    },

    // Only for organizers — links to the Club they manage
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: function () {
        return this.role === "organizer";
      },
    },

    interests: {
      type: [String],
      default: function () {
        return this.role === "student" ? [] : undefined;
      },
    },

    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    yearOfStudy: {
      type: String,
      required: function () {
        return this.role === "student" || this.role === "organizer";
      },
      match: [/^\d{4}$/, "Year of study must be a 4-digit number"],
    },

    stats: {
      eventsCreated: { type: Number, default: 0 },
      totalParticipants: { type: Number, default: 0 },
      activeEvents: { type: Number, default: 0 },
      completedEvents: { type: Number, default: 0 },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };