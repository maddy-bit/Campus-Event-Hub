const { FeedbackModel } = require("../Models/Feedback");
const { ERegistrationModel } = require("../Models/ERegistration");
const { EventModel } = require("../Models/event");

const submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Verify event has finished
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // We only allow rating past events
    if (eventDate >= today) {
      return res.status(400).json({ message: "Can only rate finished events" });
    }

    // Verify user was registered
    const registration = await ERegistrationModel.findOne({ eventId, userId });
    if (!registration) {
      return res.status(403).json({ message: "You were not registered for this event" });
    }

    // Upsert rating (user can change their mind and re-rate)
    const feedback = await FeedbackModel.findOneAndUpdate(
      { eventId, userId },
      { rating },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ message: "Failed to submit feedback", error: err.message });
  }
};

const getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user._id;
    const feedbacks = await FeedbackModel.find({ userId }).select("eventId rating");
    
    res.status(200).json({
      feedbacks
    });
  } catch (err) {
    console.error("Get my feedbacks error:", err);
    res.status(500).json({ message: "Failed to retrieve your feedbacks", error: err.message });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedbacks
};
