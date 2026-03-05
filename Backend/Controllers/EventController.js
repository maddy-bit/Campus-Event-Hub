const { EventModel } = require("../Models/event");
const { ERegistrationModel } = require("../Models/ERegistration");
const cloudinary = require("../Config/cloudinary");
const fs = require("fs");


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
      isPaidEvent,
      ticketPrice,
    } = req.body;

    if (!title || !description || !eventDate || !startTime || !location || !category || !registrationDeadline) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    let posterUrl = "";

    // upload poster to Cloudinary if file is provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "campuseventhub/events",
          transformation: [
            { width: 1200, height: 630, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        posterUrl = result.secure_url;

        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Temp file cleanup error:", err);
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ message: "Image upload failed", error: uploadErr.message });
      }
    }

    const newEvent = new EventModel({
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      category,
      maxSeats: maxSeats || 100,
      registrationDeadline,
      isPaidEvent: isPaidEvent === "true" || isPaidEvent === true,
      ticketPrice: ticketPrice || 0,
      posterUrl,
      createdBy: req.user._id,
      status: "Submitted",
    });


    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully and submitted for approval",
      event: newEvent,
    });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find().populate("createdBy", "fullName email collegeName").sort({ eventDate: 1 });

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

const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();

    const events = await EventModel.find({
      // status: { $in: ["Approved", "Draft", "Submitted"] }, bro we will add if approval requires
      registrationDeadline: { $gte: currentDate }
    })
      .populate("createdBy", "fullName email collegeName")
      .sort({ eventDate: 1 });

    res.status(200).json({
      message: "Upcoming events with open registration retrieved successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Get upcoming events error:", err);
    res.status(500).json({ message: "Failed to retrieve upcoming events", error: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id).populate("createdBy", "fullName email collegeName");

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

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to update this event" });
    }

    // handling poster update 
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "campuseventhub/events",
          transformation: [
            { width: 1200, height: 630, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        updates.posterUrl = result.secure_url;

        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Temp file cleanup error:", err);
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
      }
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
    const events = await EventModel.find({
      createdBy: req.user._id
    })
      .populate("createdBy", "fullName email")
      .sort({ eventDate: 1 });

    const eventsWithSeatData = await Promise.all(
      events.map(async (event) => {
        const seatsFilled = await ERegistrationModel.countDocuments({
          eventId: event._id,
          status: "Registered"
        });

        return {
          ...event.toObject(), // keep all event details
          seatsFilled,         // add registered seats
          seatsAvailable: event.maxSeats - seatsFilled
        };
      })
    );

    res.status(200).json({
      message: "My events retrieved successfully",
      count: eventsWithSeatData.length,
      events: eventsWithSeatData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//to get participants by event id 
const getParticipantsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        message: "You are not authorized to view participants of this event"
      });
    }

    const registrations = await ERegistrationModel.find({ eventId })
      .populate("userId", "fullName email department yearOfStudy collegeName phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: registrations.length,
      participants: registrations
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//updating the payment status of the participant
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const registration = await ERegistrationModel.findById(id).populate("eventId");

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (
      registration.eventId.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        message: "You don't have permission to update payment status"
      });
    }

    registration.payment.status = paymentStatus;

    await registration.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      registration
    });

  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({
      message: "Failed to update payment status",
      error: err.message
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getParticipantsByEventId,
  updatePaymentStatus
};
