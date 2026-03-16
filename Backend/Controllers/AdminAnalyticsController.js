const { EventModel } = require("../Models/event");
const { ERegistrationModel } = require("../Models/ERegistration");
const { FeedbackModel } = require("../Models/Feedback");

const getEventPerformance = async (req, res) => {
  try {
    const adminCollegeId = req.user.collegeId;

    if (!adminCollegeId) {
      return res.status(403).json({ message: "Admin must belong to a college." });
    }

    // Find all events created under this admin's college
    const events = await EventModel.find({ collegeId: adminCollegeId })
      .select("_id title status maxSeats")
      .lean();

    if (!events.length) {
      return res.status(200).json({ performanceData: [] });
    }

    const eventIds = events.map(e => e._id);

    // Aggregate Registrations map
    const registrations = await ERegistrationModel.aggregate([
      { $match: { eventId: { $in: eventIds }, status: "Registered" } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } }
    ]);
    const registrationMap = registrations.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    // Aggregate Feedback map
    const feedbacks = await FeedbackModel.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", averageRating: { $avg: "$rating" }, totalFeedbacks: { $sum: 1 } } }
    ]);
    const feedbackMap = feedbacks.reduce((acc, curr) => {
      acc[curr._id.toString()] = {
        avg: parseFloat(curr.averageRating.toFixed(1)),
        count: curr.totalFeedbacks
      };
      return acc;
    }, {});

    // Combine data for the chart
    const performanceData = events.map(event => {
      const idStr = event._id.toString();
      return {
        eventId: idStr,
        eventName: event.title.length > 20 ? event.title.substring(0, 20) + "..." : event.title,
        registrations: registrationMap[idStr] || 0,
        averageRating: feedbackMap[idStr]?.avg || 0,
        totalFeedbacks: feedbackMap[idStr]?.count || 0,
        status: event.status
      };
    });

    res.status(200).json({ performanceData });
  } catch (err) {
    console.error("Event Performance error:", err);
    res.status(500).json({ message: "Failed to retrieve analytics", error: err.message });
  }
};

module.exports = {
  getEventPerformance
};
