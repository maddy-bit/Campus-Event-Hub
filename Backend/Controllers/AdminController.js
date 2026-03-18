const mongoose = require("mongoose");
const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const { ERegistrationModel } = require("../Models/ERegistration");
const { ClubModel } = require("../Models/club");
const { NotificationModel } = require("../Models/Notification");
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

// reject event with reason — sends rejection reason as notification to organizer
const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const event = await EventModel.findById(id).populate("createdBy", "fullName email");

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
      rejectionReason: reason,
    };
    await event.save();

    // Notify the organizer with rejection reason
    await NotificationModel.create({
      title: "Event Rejected",
      message: `Your event "${event.title}" was rejected. Reason: ${reason}`,
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

// create an event directly by admin (auto-approved)
const createEvent = async (req, res) => {
  try {
    const { title, category, location, description, eventDate, startTime, endTime, registrationDeadline, maxSeats, isPaidEvent, ticketPrice, isPublic } = req.body;
    
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

    const newEvent = new EventModel({
      title,
      category,
      location,
      description,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      maxSeats,
      isPaidEvent: isPaidEvent === "true" || isPaidEvent === true,
      ticketPrice: ticketPrice || 0,
      isPublic: isPublic === "false" || isPublic === false ? false : true,
      posterUrl,
      createdBy: req.user._id,
      collegeId: req.user.collegeId,
      status: "Approved", // Auto-approved
      moderation: {
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// update an existing event, including status
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const event = await EventModel.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // handle boolean parsing due to FormData
    if (updateData.isPaidEvent !== undefined) updateData.isPaidEvent = updateData.isPaidEvent === "true" || updateData.isPaidEvent === true;
    if (updateData.isPublic !== undefined) updateData.isPublic = updateData.isPublic !== "false" && updateData.isPublic !== false;

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "campuseventhub/events",
          transformation: [
            { width: 1200, height: 630, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        updateData.posterUrl = result.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
      }
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: "Failed to update event", error: err.message });
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

const getCollegeClubs = async (req, res) => {
  try {
    const clubs = await ClubModel.find({ collegeId: req.user.collegeId });
    const clubsWithOrganizers = await Promise.all(
      clubs.map(async (club) => {
        const organizer = await UserModel.findOne({ clubId: club._id, role: "organizer", isDeleted: false }).select("fullName email").lean();
        return { ...club.toObject(), organizer: organizer || null };
      })
    );
    res.status(200).json({ count: clubsWithOrganizers.length, clubs: clubsWithOrganizers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clubs", error: err.message });
  }
};

const createClub = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name) return res.status(400).json({ message: "Club name is required" });

    const existing = await ClubModel.findOne({ name, collegeId: req.user.collegeId });
    if (existing) return res.status(400).json({ message: "A club with this name already exists in your college" });

    const club = await ClubModel.create({ name, category: category || "Other", description, collegeId: req.user.collegeId });
    res.status(201).json({ message: "Club created", club });
  } catch (err) {
    res.status(500).json({ message: "Failed to create club", error: err.message });
  }
};

const getClubDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await ClubModel.findById(id).lean();
    if (!club) return res.status(404).json({ message: "Club not found" });

    const organizers = await UserModel.find({ clubId: id, role: "organizer", isDeleted: false }).select("-password").lean();
    const members = await UserModel.find({ clubId: id, isDeleted: false }).select("-password").lean();

    res.status(200).json({ club, organizers, members });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch club details", error: err.message });
  }
};

const assignOrganizerToClub = async (req, res) => {
  try {
    const { clubId, userId } = req.body;
    if (!clubId || !userId) return res.status(400).json({ message: "clubId and userId are required" });

    const club = await ClubModel.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    if (club.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Club does not belong to your college" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isDeleted) return res.status(400).json({ message: "User is deleted" });
    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "User does not belong to your college" });
    }

    user.role = "organizer";
    user.clubId = clubId;
    await user.save();

    res.status(200).json({ message: `${user.fullName} assigned as organizer of ${club.name}`, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, clubId: user.clubId } });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign organizer", error: err.message });
  }
};

const removeOrganizerFromClub = async (req, res) => {
  try {
    const { clubId, userId } = req.body;
    if (!clubId || !userId) return res.status(400).json({ message: "clubId and userId are required" });

    const club = await ClubModel.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    if (club.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Club does not belong to your college" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.clubId?.toString() !== clubId) {
      return res.status(400).json({ message: "User is not assigned to this club" });
    }

    user.role = "student"; // demote to student
    user.clubId = null; // remove club association
    await user.save();

    res.status(200).json({ message: `${user.fullName} has been removed from ${club.name} and demoted to student` });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove organizer", error: err.message });
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
    const { action, reason } = req.body; // "approve" or "reject"

    const registration = await ERegistrationModel.findById(id)
      .populate("userId", "fullName collegeId")
      .populate("eventId", "title createdBy");

    if (!registration) return res.status(404).json({ message: "Registration not found" });

    if (registration.userId.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "You can only review registrations from your college students" });
    }

    if (registration.status !== "Pending_Approval") {
      return res.status(400).json({ message: "Registration is not pending approval" });
    }

    if (action === "reject" && (!reason || !reason.trim())) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    registration.status = action === "approve" ? "Registered" : "Cancelled";
    await registration.save();

    // Notify the event organizer about the decision
    if (action === "reject" && registration.eventId?.createdBy) {
      await NotificationModel.create({
        title: "Access Request Rejected",
        message: `Access request by "${registration.userId.fullName}" for "${registration.eventId.title}" was rejected. Reason: ${reason}`,
        event: registration.eventId._id,
        type: "Submission_Update",
        sender: req.user._id,
        status: "Sent",
        reachCount: 1,
      });
    }

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

// Dashboard stats — ongoing events, registration trend chart data, pending counts
const getDashboardStats = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const now = new Date();

    // Ongoing events = Approved events where eventDate is today or in the future
    const ongoingEvents = await EventModel.find({
      collegeId,
      status: "Approved",
      eventDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
    }).populate("createdBy", "fullName").sort({ eventDate: 1 });

    // Count stats
    const [totalEvents, totalStudents, pendingReviewCount, ongoingCount] = await Promise.all([
      EventModel.countDocuments({ collegeId }),
      UserModel.countDocuments({ collegeId, role: "student", isDeleted: false }),
      EventModel.countDocuments({ collegeId, status: "Submitted" }),
      EventModel.countDocuments({
        collegeId,
        status: "Approved",
        eventDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
      }),
    ]);

    // Registration trend — last 7 months of registration counts for college events
    const collegeEventIds = await EventModel.find({ collegeId }).select("_id");
    const eventIds = collegeEventIds.map(e => e._id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const registrationTrend = await ERegistrationModel.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          registrationDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$registrationDate" },
            month: { $month: "$registrationDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Build chart data for last 7 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthNum = d.getMonth() + 1;
      const year = d.getFullYear();
      const found = registrationTrend.find(r => r._id.month === monthNum && r._id.year === year);
      chartData.push({
        month: months[d.getMonth()],
        registrations: found ? found.count : 0
      });
    }

    // Ongoing events chart data (events per category that are ongoing)
    const ongoingByCategory = await EventModel.aggregate([
      {
        $match: {
          collegeId: new mongoose.Types.ObjectId(req.user.collegeId),
          status: "Approved",
          eventDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      totalEvents,
      totalStudents,
      pendingReviewCount,
      ongoingCount,
      ongoingEvents: ongoingEvents.slice(0, 5),
      registrationChartData: chartData,
      ongoingByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: err.message });
  }
};

// Get pending student-to-organizer promotion requests
const getPendingPromotions = async (req, res) => {
  try {
    const promotions = await UserModel.find({
      collegeId: req.user.collegeId,
      role: "student",
      isDeleted: false,
      promotionRequest: { $exists: true, $ne: null },
      "promotionRequest.status": "pending"
    }).select("-password").sort({ "promotionRequest.requestedAt": -1 });

    res.status(200).json({ count: promotions.length, promotions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch promotion requests", error: err.message });
  }
};

// promote student to organizer
const promoteToOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Can only promote students from your college" });
    }

    user.role = "organizer";
    user.promotionRequest = { ...user.promotionRequest, status: "approved", reviewedAt: new Date(), reviewedBy: req.user._id };
    await user.save();

    await NotificationModel.create({
      title: "Promotion Approved",
      message: `Congratulations! You have been promoted to Organizer role.`,
      type: "Submission_Update",
      sender: req.user._id,
      status: "Sent",
      reachCount: 1,
    });

    res.status(200).json({ message: "Student promoted to organizer", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote student", error: err.message });
  }
};

// deny promotion request with reason
const denyPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Denial reason is required" });
    }

    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Can only review students from your college" });
    }

    user.promotionRequest = { ...user.promotionRequest, status: "denied", denialReason: reason, reviewedAt: new Date(), reviewedBy: req.user._id };
    await user.save();

    await NotificationModel.create({
      title: "Promotion Request Denied",
      message: `Your request to become an organizer was denied. Reason: ${reason}`,
      type: "Submission_Update",
      sender: req.user._id,
      status: "Sent",
      reachCount: 1,
    });

    res.status(200).json({ message: "Promotion request denied", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to deny promotion", error: err.message });
  }
};

// Get pending event access requests (for invite-only or restricted events)
const getPendingAccessRequests = async (req, res) => {
  try {
    const collegeEventIds = await EventModel.find({ collegeId: req.user.collegeId }).select("_id");
    const eventIds = collegeEventIds.map(e => e._id);

    const accessRequests = await ERegistrationModel.find({
      eventId: { $in: eventIds },
      status: "Pending_Approval",
      isCrossCollege: false,
    })
      .populate("userId", "fullName email department yearOfStudy")
      .populate("eventId", "title category eventDate location isPublic")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: accessRequests.length, accessRequests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch access requests", error: err.message });
  }
};

// Grant event access request
const grantAccessRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await ERegistrationModel.findById(id)
      .populate("userId", "fullName")
      .populate("eventId", "title createdBy collegeId");

    if (!registration) return res.status(404).json({ message: "Registration not found" });

    if (registration.eventId.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    registration.status = "Registered";
    await registration.save();

    res.status(200).json({ message: "Access granted", registration });
  } catch (err) {
    res.status(500).json({ message: "Failed to grant access", error: err.message });
  }
};

// Reject event access request with reason
const rejectAccessRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const registration = await ERegistrationModel.findById(id)
      .populate("userId", "fullName")
      .populate("eventId", "title createdBy collegeId");

    if (!registration) return res.status(404).json({ message: "Registration not found" });

    if (registration.eventId.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    registration.status = "Cancelled";
    await registration.save();

    // Notify organizer about the rejected access request
    if (registration.eventId.createdBy) {
      await NotificationModel.create({
        title: "Event Access Request Rejected",
        message: `Access request by "${registration.userId.fullName}" for "${registration.eventId.title}" was rejected. Reason: ${reason}`,
        event: registration.eventId._id,
        type: "Submission_Update",
        sender: req.user._id,
        status: "Sent",
        reachCount: 1,
      });
    }

    res.status(200).json({ message: "Access request rejected", registration });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject access request", error: err.message });

  }
};

const getCollegeDetails = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const users = await UserModel.find({ 
      collegeId: collegeId,
      role: { $ne: "superadmin" }
    })
    .select("fullName email role department yearOfStudy createdAt isDeleted")
    .sort({ createdAt: -1 });

    const totalUsers = users.length;
    const studentsCount = users.filter(u => u.role === "student").length;
    const organizersCount = users.filter(u => u.role === "organizer").length;

    res.status(200).json({ 
      stats: {
        totalUsers,
        studentsCount,
        organizersCount
      },
      users 
    });
    
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch college details", error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, department, yearOfStudy } = req.body;
    
    const user = await UserModel.findById(id);
    if (!user || user.collegeId.toString() !== req.user.collegeId.toString()) {
       return res.status(404).json({ message: "User not found or unauthorised" });
    }
    
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    if (department) user.department = department;
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;

    await user.save();
    
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    
    if (!user || user.collegeId.toString() !== req.user.collegeId.toString()) {
       return res.status(404).json({ message: "User not found or unauthorised" });
    }
    
    user.isDeleted = true;
    await user.save();
    
    res.status(200).json({ message: "User soft deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

const getPendingStudents = async (req, res) => {
  try {
    const students = await UserModel.find({
      collegeId: req.user.collegeId,
      role: "student",
      isApproved: false,
      isDeleted: false
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending students", error: err.message });
  }
};

const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) return res.status(404).json({ message: "Student not found" });
    if (user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    user.isApproved = true;
    await user.save();

    await NotificationModel.create({
      recipient: user._id,
      recipientType: "Student",
      title: "Account Approved",
      message: `Welcome ${user.fullName}! Your account has been approved by the college admin. You can now login and explore events.`,
      type: "Submission_Update",
      sender: req.user._id,
      status: "Sent",
      reachCount: 1,
    });

    res.status(200).json({ message: "Student approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve student", error: err.message });
  }
};

const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const user = await UserModel.findById(id);
    if (!user || user.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(404).json({ message: "Student not found or unauthorized" });
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json({ message: "Student registration rejected and account removed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject student", error: err.message });
  }
};

const Profiledata = async (req, res) => {
  try {
    const id= req.user._id    
    const data= await UserModel.findById(id).select("-password").populate("collegeId");
    
    res.status(200).json({message:"Profile data fetched successfully", data})
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile data", error: error.message });
  }
}

module.exports = {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getCollegeEvents,
  createEvent,
  updateEvent,
  getCollegeOrganizers,
  getCollegeStudents,
  getCollegeClubs,
  getPendingCrossCollegeRegistrations,
  reviewCrossCollegeRegistration,
  getCollegeAnalytics,
  getDashboardStats,
  getPendingPromotions,
  promoteToOrganizer,
  denyPromotion,
  getPendingStudents,
  approveStudent,
  rejectStudent,
  getPendingAccessRequests,
  grantAccessRequest,
  rejectAccessRequest,
  getCollegeDetails,
  updateUser,
  deleteUser,
  Profiledata,
  createClub,
  getClubDetails,
  assignOrganizerToClub,
  removeOrganizerFromClub,
};
