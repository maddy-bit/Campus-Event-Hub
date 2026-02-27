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
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    yearOfStudy: {
      type: String,
      required: true,
      match: [/^\d{4}$/, "Year of study must be a 4-digit number"],
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
      enum: ["superadmin","admin", "organizer", "student"],
      default: "student",
    },

    // Organizer-specific fields bro
    clubName: {
      type: String,
      trim: true,
    },

    clubCategory: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Literary", "Social Service", "Other"],
    },

    clubDescription: {
      type: String,
      trim: true,
    },

    clubLogo: {
      type: String, 
    },

    socialLinks: {
      email: String,
      phone: String,
      website: String,
      clubWebsite: String,
    },
    stats: {
      eventsCreated: {
        type: Number,
        default: 0,
      },
      totalParticipants: {
        type: Number,
        default: 0,
      },
      activeEvents: {
        type: Number,
        default: 0,
      },
      completedEvents: {
        type: Number,
        default: 0,
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpiry: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };
