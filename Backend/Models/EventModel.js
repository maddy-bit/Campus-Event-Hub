
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    date: { type: Date, required: true },

    seats: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "live", "completed"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const EventModel = mongoose.model("Event", eventSchema);
module.exports = { EventModel };