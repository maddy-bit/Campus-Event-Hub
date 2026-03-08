const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "Club must belong to a college"],
      index: true,
    },

    category: {
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

    description: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      default: null,
    },

    socialLinks: {
      website: String,
      instagram: String,
      linkedin: String,
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

// club name must be unique within the same college
clubSchema.index({ name: 1, collegeId: 1 }, { unique: true });

// don't rturn soft-deleted clubs in normal queries
clubSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const ClubModel = mongoose.model("Club", clubSchema);
module.exports = { ClubModel };
