const  EventModel  = require("../Models/event");

const createEvent = async (req, res) => {
  try {
    const {
  title,
  description,
  eventDate,
  startTime,
  endTime,
  location,
  category,
  maxSeats,
  registrationDeadline,
  posterUrl,
  isPaidEvent,
  ticketPrice
} = req.body;

    if (
  !title ||
  !description ||
  !eventDate ||
  !startTime ||
  !location ||
  !category ||
  !registrationDeadline
) {
  return res.status(400).json({
    message: "All required fields must be provided",
  });
}

const newEvent = new EventModel({
  title,
  description,
  eventDate,
  startTime,
  endTime,
  location,
  category,
  maxSeats,
  registrationDeadline,
  posterUrl,
  isPaidEvent,
  ticketPrice,
  createdBy: req.user._id
});

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find().populate("createdBy", "fullName email").sort({ eventDate: 1 });

    res.status(200).json({
      message: "Events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Get all events error:", err);
    res.status(500).json({ message: "Failed to retrieve events", error: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id).populate("createdBy", "fullName email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event retrieved successfully",
      event,
    });
  } catch (err) {
    console.error("Get event by ID error:", err);
    res.status(500).json({ message: "Failed to retrieve event", error: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to update this event" });
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ message: "Failed to update event", error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to delete this event" });
    }

    await EventModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
};


//to get all events of that particular user who created the event
const getMyEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ createdBy: req.user._id }).populate("createdBy", "fullName email").sort({ eventDate: 1 });

    res.status(200).json({
      message: "My events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
};
