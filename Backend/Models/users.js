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

    collegeName: {
      type: String,
      required: function () {
        return this.role !== "superadmin";
      },
      trim: true,
    },

    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    yearOfStudy: {
      type: String,
      required: true,
      match: [/^\d{4}$/, "Year of study must be a 4-digit number"],
    },

    clubName: {
      type: String,
      trim: true,
    },

    clubCategory: {
      type: String,
      enum: [
        "Technical",
        "Cultural",
        "Sports",
        "Literary",
        "Social Service",
        "Other",
      ],
    },

    clubDescription: {
      type: String,
      trim: true,
    },

    clubLogo: {
      type: String,
    },

    socialLinks: {
      website: String,
      instagram: String,
      linkedin: String,
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