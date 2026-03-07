const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const { ERegistrationModel } = require("../Models/ERegistration");
const cloudinary = require("../Config/cloudinary");

// Helper: upload buffer to Cloudinary using upload_stream
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

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
      isPublic,
    } = req.body;

    if (!title || !description || !eventDate || !startTime || !location || !category || !registrationDeadline) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // get creator's collegeId
    const creator = await UserModel.findById(req.user._id);
    if (!creator || !creator.collegeId) {
      return res.status(400).json({ message: "User must belong to a college to create events" });
    }

    let posterUrl = "";

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "campuseventhub/events",
          transformation: [
            { width: 1200, height: 630, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        posterUrl = result.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ message: "Image upload failed", error: uploadErr.message });
      }
    }

    // admin events are auto-approved
    const status = req.user.role === "admin" ? "Approved" : "Submitted";

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
      isPublic: isPublic === "false" || isPublic === false ? false : true,
      posterUrl,
      createdBy: req.user._id,
      collegeId: creator.collegeId,
      status,
    });

    await newEvent.save();

    res.status(201).json({
      message: status === "Approved"
        ? "Event created and auto-approved"
        : "Event created and submitted for approval",
      event: newEvent,
    });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// get all approved events (respects visibility)
const getAllEvents = async (req, res) => {
  try {
    const userCollegeId = req.user.collegeId;

    // show approved events: public ones + private ones from user's college
    const filter = {
      status: "Approved",
      $or: [
        { isPublic: true },
        { collegeId: userCollegeId },
      ],
    };

    const events = await EventModel.find(filter)
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name")
      .sort({ eventDate: 1 });

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

// upcoming events with open registration
const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const userCollegeId = req.user.collegeId;

    const filter = {
      status: "Approved",
      registrationDeadline: { $gte: currentDate },
      $or: [
        { isPublic: true },
        { collegeId: userCollegeId },
      ],
    };

    const events = await EventModel.find(filter)
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name")
      .sort({ eventDate: 1 });

    res.status(200).json({
      message: "Upcoming events retrieved successfully",
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

    const event = await EventModel.findById(id)
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name");

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

    // check ownership or same-college admin
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isSameCollegeAdmin = req.user.role === "admin" &&
      event.collegeId.toString() === req.user.collegeId?.toString();

    if (!isOwner && !isSameCollegeAdmin) {
      return res.status(403).json({ message: "You don't have permission to update this event" });
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "campuseventhub/events",
          transformation: [
            { width: 1200, height: 630, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        updates.posterUrl = result.secure_url;
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

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isSameCollegeAdmin = req.user.role === "admin" &&
      event.collegeId.toString() === req.user.collegeId?.toString();

    if (!isOwner && !isSameCollegeAdmin) {
      return res.status(403).json({ message: "You don't have permission to delete this event" });
    }

    await EventModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
};

// get events created by current user
const getMyEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ createdBy: req.user._id })
      .populate("createdBy", "fullName email")
      .sort({ eventDate: 1 });

    const eventsWithSeatData = await Promise.all(
      events.map(async (event) => {
        const seatsFilled = await ERegistrationModel.countDocuments({
          eventId: event._id,
          status: "Registered"
        });

        return {
          ...event.toObject(),
          seatsFilled,
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

// get participants by event id
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
      return res.status(403).json({ message: "You are not authorized to view participants of this event" });
    }

    const registrations = await ERegistrationModel.find({ eventId })
      .populate({
        path: "userId",
        select: "fullName email department yearOfStudy phoneNumber",
        populate: { path: "collegeId", select: "name" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: registrations.length,
      participants: registrations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update payment status
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
      return res.status(403).json({ message: "You don't have permission to update payment status" });
    }

    registration.payment.status = paymentStatus;
    await registration.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      registration
    });
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ message: "Failed to update payment status", error: err.message });
  }
};

// get approved events from user's own college only (both public and private)
const getMyCollegeEvents = async (req, res) => {
  try {
    const userCollegeId = req.user.collegeId;
    const currentDate = new Date();

    if (!userCollegeId) {
      return res.status(400).json({ message: "User does not belong to a college" });
    }

    const filter = {
      status: "Approved",
      collegeId: userCollegeId,
      registrationDeadline: { $gte: currentDate },
    };  
    const events = await EventModel.find(filter)
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name")
      .sort({ eventDate: 1 });

    res.status(200).json({
      message: "College events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Get my college events error:", err);
    res.status(500).json({ message: "Failed to retrieve college events", error: err.message });
  }
};

// get public approved events from OTHER colleges only
const getExternalEvents = async (req, res) => {
  try {
    const userCollegeId = req.user.collegeId;
    const currentDate = new Date();

    const filter = {
      status: "Approved",
      isPublic: true,
      registrationDeadline: { $gte: currentDate },
    };

    // If user belongs to a college, exclude their own college's events
    if (userCollegeId) {
      filter.collegeId = { $ne: userCollegeId };
    }

    console.log("Fetching external events. Excluding college:", userCollegeId);

    const events = await EventModel.find(filter)
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name")
      .sort({ eventDate: 1 });

    console.log(`Found ${events.length} external public events`);

    res.status(200).json({
      message: "External events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Get external events error:", err);
    res.status(500).json({ message: "Failed to retrieve external events", error: err.message });
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
  updatePaymentStatus,
  getMyCollegeEvents,
  getExternalEvents,
};
