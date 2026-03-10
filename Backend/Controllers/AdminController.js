const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const { ERegistrationModel } = require("../Models/ERegistration");
const { ClubModel } = require("../Models/club");
const { NotificationModel } = require("../Models/Notification");

// get events pending approval for admin's college
const getPendingEvents = async (req, res) => {
  try {
    const events = await EventModel.find({
      collegeId: req.user.collegeId,
      status: "Submitted"
    })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: events.length, events });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending events", error: err.message });
  }
};

// approve event (same college only)
const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await EventModel.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only approve events from your college" });
    }

    if (event.status !== "Submitted") {
      return res.status(400).json({ message: "Event is not in submitted state" });
    }

    event.status = "Approved";
    event.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };
    await event.save();

    // notify organizer
    await NotificationModel.create({
      title: "Event Approved",
      message: `Your event "${event.title}" has been approved.`,
      event: event._id,
      type: "Submission_Update",
      sender: req.user._id,
      status: "Sent",
      reachCount: 1,
    });

    res.status(200).json({ message: "Event approved", event });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve event", error: err.message });
  }
};

// reject event with reason
const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const event = await EventModel.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only reject events from your college" });
    }

    if (event.status !== "Submitted") {
      return res.status(400).json({ message: "Event is not in submitted state" });
    }

    event.status = "Rejected";
    event.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      rejectionReason: reason || "No reason provided",
    };
    await event.save();

    // notify organizer
    await NotificationModel.create({
      title: "Event Rejected",
      message: `Your event "${event.title}" was rejected. Reason: ${reason || "No reason provided"}`,
      event: event._id,
      type: "Submission_Update",
      sender: req.user._id,
      status: "Sent",
      reachCount: 1,
    });

    res.status(200).json({ message: "Event rejected", event });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject event", error: err.message });
  }
};

// get all events for admin's college
const getCollegeEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ collegeId: req.user.collegeId })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: events.length, events });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch college events", error: err.message });
  }
};

// get all organizers in admin's college
const getCollegeOrganizers = async (req, res) => {
  try {
    const organizers = await UserModel.find({
      collegeId: req.user.collegeId,
      role: "organizer",
      isDeleted: false,
    })
      .select("-password")
      .populate("clubId", "name category");

    res.status(200).json({ count: organizers.length, organizers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch organizers", error: err.message });
  }
};

// get all students in admin's college
const getCollegeStudents = async (req, res) => {
  try {
    const students = await UserModel.find({
      collegeId: req.user.collegeId,
      role: "student",
      isDeleted: false,
    }).select("-password");

    res.status(200).json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
};

// get clubs in admin's college
const getCollegeClubs = async (req, res) => {
  try {
    const clubs = await ClubModel.find({ collegeId: req.user.collegeId });
    res.status(200).json({ count: clubs.length, clubs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clubs", error: err.message });
  }
};

// get cross-college registration requests (student's college admin approves)
const getPendingCrossCollegeRegistrations = async (req, res) => {
  try {
    const registrations = await ERegistrationModel.find({
      isCrossCollege: true,
      status: "Pending_Approval",
    })
      .populate({
        path: "userId",
        select: "fullName email collegeId",
        populate: { path: "collegeId", select: "name" }
      })
      .populate("eventId", "title eventDate collegeId")
      .sort({ createdAt: -1 });

    // only show registrations where the student belongs to admin's college
    const filtered = registrations.filter(
      (r) => r.userId?.collegeId?._id?.toString() === req.user.collegeId.toString()
    );

    res.status(200).json({ count: filtered.length, registrations: filtered });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending registrations", error: err.message });
  }
};

// approve/reject cross-college registration
const reviewCrossCollegeRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    const registration = await ERegistrationModel.findById(id).populate("userId", "collegeId");

    if (!registration) return res.status(404).json({ message: "Registration not found" });

    if (registration.userId.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only review registrations from your college students" });
    }

    if (registration.status !== "Pending_Approval") {
      return res.status(400).json({ message: "Registration is not pending approval" });
    }

    registration.status = action === "approve" ? "Registered" : "Cancelled";
    await registration.save();

    res.status(200).json({
      message: `Registration ${action === "approve" ? "approved" : "rejected"}`,
      registration
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to review registration", error: err.message });
  }
};

// college analytics
const getCollegeAnalytics = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const [totalEvents, approvedEvents, totalStudents, totalOrganizers, totalClubs, totalRegistrations] =
      await Promise.all([
        EventModel.countDocuments({ collegeId }),
        EventModel.countDocuments({ collegeId, status: "Approved" }),
        UserModel.countDocuments({ collegeId, role: "student", isDeleted: false }),
        UserModel.countDocuments({ collegeId, role: "organizer", isDeleted: false }),
        ClubModel.countDocuments({ collegeId }),
        ERegistrationModel.countDocuments({
          eventId: { $in: await EventModel.find({ collegeId }).select("_id") }
        }),
      ]);

    res.status(200).json({
      totalEvents,
      approvedEvents,
      pendingEvents: totalEvents - approvedEvents,
      totalStudents,
      totalOrganizers,
      totalClubs,
      totalRegistrations,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};

// promote student to organizer
const promoteUserToOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const { clubId } = req.body;

    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only promote users from your college" });
    }

    if (user.role !== "student") {
      return res.status(400).json({ message: "Only students can be promoted to organizer" });
    }

    user.role = "organizer";
    if (clubId) user.clubId = clubId;
    await user.save();

    res.status(200).json({ message: "User promoted to organizer", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote user", error: err.message });
  }
};

// send notification to entire college
const sendCollegeNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const students = await UserModel.find({
      collegeId: req.user.collegeId,
      role: { $in: ["student", "organizer"] },
      isDeleted: false,
    });

    const notification = await NotificationModel.create({
      title,
      message,
      type: type || "General",
      sender: req.user._id,
      status: "Sent",
      reachCount: students.length,
    });

    res.status(201).json({ message: "Notification sent", notification, reachCount: students.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};

// soft delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only delete users from your college" });
    }

    if (user.role === "admin" || user.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete admin or superadmin users" });
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

// edit user details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only edit users from your college" });
    }

    // prevent role and sensitive field changes
    delete updates.password;
    delete updates.role;
    delete updates.collegeId;
    delete updates.isDeleted;

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// weekly registration trend
const getRegistrationTrend = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const events = await EventModel.find({ collegeId }).select("_id");
    const eventIds = events.map(e => e._id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrations = await ERegistrationModel.find({
      eventId: { $in: eventIds },
      createdAt: { $gte: sevenDaysAgo }
    }).select("createdAt");

    // group by day
    const trend = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      trend[key] = 0;
    }

    registrations.forEach(reg => {
      const key = reg.createdAt.toISOString().split('T')[0];
      if (trend[key] !== undefined) trend[key]++;
    });

    const trendData = Object.keys(trend).sort().map(date => ({
      date,
      count: trend[date]
    }));

    res.status(200).json({ trend: trendData });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch registration trend", error: err.message });
  }
};

// organizers grouped by club with event counts
const getOrganizersByClub = async (req, res) => {
  try {
    const organizers = await UserModel.find({
      collegeId: req.user.collegeId,
      role: "organizer",
      isDeleted: false,
    })
      .select("-password")
      .populate("clubId", "name category");

    // get event counts for each organizer
    const organizersWithCounts = await Promise.all(
      organizers.map(async (org) => {
        const eventCount = await EventModel.countDocuments({ createdBy: org._id });
        return {
          ...org.toObject(),
          eventCount
        };
      })
    );

    // group by club
    const grouped = organizersWithCounts.reduce((acc, org) => {
      const clubName = org.clubId?.name || "No Club";
      if (!acc[clubName]) {
        acc[clubName] = {
          club: org.clubId,
          organizers: []
        };
      }
      acc[clubName].organizers.push(org);
      return acc;
    }, {});

    res.status(200).json({ data: Object.values(grouped) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch organizers by club", error: err.message });
  }
};

module.exports = {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getCollegeEvents,
  getCollegeOrganizers,
  getCollegeStudents,
  getCollegeClubs,
  getPendingCrossCollegeRegistrations,
  reviewCrossCollegeRegistration,
  getCollegeAnalytics,
  promoteUserToOrganizer,
  sendCollegeNotification,
  deleteUser,
  updateUser,
  getRegistrationTrend,
  getOrganizersByClub,
};
