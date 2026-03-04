const ERegistrationModel  = require("../Models/ERegistration");
const  EventModel  = require("../Models/event");

const registerForEvent = async (req, res) => {
  try {
    const { eventId, additionalInfo, paymentAmount } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    if (event.registeredParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    const existingRegistration = await ERegistrationModel.findOne({ userId, eventId });
    if (existingRegistration) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    const registration = new ERegistrationModel({
      userId,
      eventId,
      additionalInfo,
      paymentAmount: paymentAmount || 0,
    });

    await registration.save();

    event.registeredParticipants += 1;
    await event.save();

    res.status(201).json({
      message: "Registration successful",
      registration,
    });
  } catch (err) {
    console.error("Register for event error:", err);
    res.status(500).json({ message: "Failed to register for event", error: err.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await ERegistrationModel.find()
      .populate("userId", "fullName email phoneNumber")
      .populate("eventId", "title eventDate location category startTime endTime registrationDeadline maxSeats posterUrl status")
      .sort({ registrationDate: -1 });

    res.status(200).json({
      message: "Registrations retrieved successfully",
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    console.error("Get all registrations error:", err);
    res.status(500).json({ message: "Failed to retrieve registrations", error: err.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;

    const registrations = await ERegistrationModel.find({ userId })
      .populate("eventId", "title eventDate location category startTime endTime registrationDeadline maxSeats posterUrl status createdBy")
      .sort({ registrationDate: -1 });

    res.status(200).json({
      message: "Your registrations retrieved successfully",
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    console.error("Get my registrations error:", err);
    res.status(500).json({ message: "Failed to retrieve your registrations", error: err.message });
  }
};

const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await ERegistrationModel.findById(id)
      .populate("userId", "fullName email phoneNumber collegeName department")
      .populate("eventId", "eventName eventDate eventTime venue organizer");

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({
      message: "Registration retrieved successfully",
      registration,
    });
  } catch (err) {
    console.error("Get registration by ID error:", err);
    res.status(500).json({ message: "Failed to retrieve registration", error: err.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await ERegistrationModel.findById(id);

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.userId.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to cancel this registration" });
    }

    const event = await EventModel.findById(registration.eventId);
    if (event) {
      event.registeredParticipants = Math.max(0, event.registeredParticipants - 1);
      await event.save();
    }

    await ERegistrationModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Registration cancelled successfully",
    });
  } catch (err) {
    console.error("Cancel registration error:", err);
    res.status(500).json({ message: "Failed to cancel registration", error: err.message });
  }
};


module.exports = {
  registerForEvent,
  getAllRegistrations,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
};
