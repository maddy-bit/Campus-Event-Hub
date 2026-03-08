const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      unique: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      default: null,
    },

    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// don't return soft-deleted colleges in normal queries
collegeSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const CollegeModel = mongoose.model("College", collegeSchema);
module.exports = { CollegeModel };
