const { CollegeModel } = require("../Models/college");
const { UserModel } = require("../Models/users");
const { ClubModel } = require("../Models/club");
const { EventModel } = require("../Models/event");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const sendAdminCreationEmail = require("../helpers/emailTemplates/collegeadmin");
const sendEmail = require("../utils/sendEmail");

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
const createCollege = async (req, res) => {
  try {
    const { name, location, domain } = req.body;

    if (!name) return res.status(400).json({ message: "College name is required" });

    const existing = await CollegeModel.findOne({ name });
    if (existing) return res.status(400).json({ message: "College already exists" });

    const college = await CollegeModel.create({ name, location, domain, isVerified: true });

    res.status(201).json({ message: "College created", college });
  } catch (err) {
    res.status(500).json({ message: "Failed to create college", error: err.message });
  }
};

// get all colleges
const getAllColleges = async (req, res) => {
  try {
    const colleges = await CollegeModel.find();
    res.status(200).json({ count: colleges.length, colleges });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch colleges", error: err.message });
  }
};

// update college
const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const college = await CollegeModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!college) return res.status(404).json({ message: "College not found" });

    res.status(200).json({ message: "College updated", college });
  } catch (err) {
    res.status(500).json({ message: "Failed to update college", error: err.message });
  }
};

// soft delete college
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const activeEvents = await EventModel.countDocuments({ collegeId: id, status: "Approved" });
    if (activeEvents > 0) {
      return res.status(400).json({ message: `Cannot delete college with ${activeEvents} active events. Reject them first.` });
    }

    const college = await CollegeModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!college) return res.status(404).json({ message: "College not found" });

    res.status(200).json({ message: "College soft-deleted", college });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete college", error: err.message });
  }
};

// create admin for a college
const createAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, collegeId } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !collegeId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const college = await CollegeModel.findById(collegeId);
    if (!college) return res.status(404).json({ message: "College not found" });

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await UserModel.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "admin",
      collegeId,
      isEmailVerified: true,
    });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Infy Event Hub – Your Admin Account Details",
        text: `Greetings from Infy Event Hub!`,
        html: sendAdminCreationEmail(fullName, college.name, email, password, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`),
      });
    } catch (emailError) {
      console.error("Failed to send admin creation email. Admin was created but email was not sent:", emailError);
    }

    res.status(201).json({
      message: "Admin created",
      admin: { _id: admin._id, fullName: admin.fullName, email: admin.email, collegeId: admin.collegeId }
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Failed to create admin", error: err.message });
  }
};

// get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await UserModel.find({ role: "admin", isDeleted: false })
      .select("-password")
      .populate("collegeId", "name");

    res.status(200).json({ count: admins.length, admins });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admins", error: err.message });
  }
};

// remove admin (soft delete)
const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await UserModel.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role !== "admin") return res.status(400).json({ message: "User is not an admin" });

    admin.isDeleted = true;
    await admin.save();

    res.status(200).json({ message: "Admin removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove admin", error: err.message });
  }
};

const getPlatformAnalytics = async (req, res) => {
  try {
    const [totalColleges, totalUsers, totalEvents, totalStudents, totalOrganizers, totalAdmins, totalClubs] =
      await Promise.all([
        CollegeModel.countDocuments(),
        UserModel.countDocuments({ isDeleted: false }),
        EventModel.countDocuments(),
        UserModel.countDocuments({ role: "student", isDeleted: false }),
        UserModel.countDocuments({ role: "organizer", isDeleted: false }),
        UserModel.countDocuments({ role: "admin", isDeleted: false }),
        ClubModel.countDocuments(),
      ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

    const eventCreationTrend = await EventModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const userRegistrationTrend = await UserModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, isDeleted: false } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const evtFound = eventCreationTrend.find(r => r._id.month === m && r._id.year === y);
      const usrFound = userRegistrationTrend.find(r => r._id.month === m && r._id.year === y);
      chartData.push({
        month: months[d.getMonth()],
        events: evtFound ? evtFound.count : 0,
        users: usrFound ? usrFound.count : 0,
      });
    }

    const [approvedEvents, submittedEvents, rejectedEvents, draftEvents] = await Promise.all([
      EventModel.countDocuments({ status: "Approved" }),
      EventModel.countDocuments({ status: "Submitted" }),
      EventModel.countDocuments({ status: "Rejected" }),
      EventModel.countDocuments({ status: "Draft" }),
    ]);

    const eventsByCategory = await EventModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentEvents = await EventModel.find()
      .populate("collegeId", "name")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUsers = await UserModel.find({ isDeleted: false })
      .populate("collegeId", "name")
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      totalColleges,
      totalUsers,
      totalEvents,
      totalStudents,
      totalOrganizers,
      totalAdmins,
      totalClubs,
      chartData,
      eventsByStatus: { approved: approvedEvents, submitted: submittedEvents, rejected: rejectedEvents, draft: draftEvents },
      eventsByCategory,
      recentEvents,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};

const getCollegeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await CollegeModel.findById(id);
    if (!college) return res.status(404).json({ message: "College not found" });

    const [admins, organizers, students, events, clubs] = await Promise.all([
      UserModel.find({ collegeId: id, role: "admin", isDeleted: false })
        .select("-password")
        .lean(),
      UserModel.find({ collegeId: id, role: "organizer", isDeleted: false })
        .select("-password")
        .populate("clubId", "name category")
        .lean(),
      UserModel.find({ collegeId: id, role: "student", isDeleted: false })
        .select("-password")
        .lean(),
      EventModel.find({ collegeId: id })
        .populate("createdBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean(),
      ClubModel.find({ collegeId: id }).lean(),
    ]);

    const eventsCreatedMap = {};
    events.forEach((event) => {
      const creatorId = event.createdBy?._id?.toString() || event.createdBy?.toString();
      if (creatorId) {
        eventsCreatedMap[creatorId] = (eventsCreatedMap[creatorId] || 0) + 1;
      }
    });

    const enrichUser = (user) => ({
      ...user,
      stats: {
        ...user.stats,
        eventsCreated: eventsCreatedMap[user._id.toString()] || 0,
      },
    });

    res.status(200).json({
      college,
      stats: {
        totalAdmins: admins.length,
        totalOrganizers: organizers.length,
        totalStudents: students.length,
        totalEvents: events.length,
        totalClubs: clubs.length,
      },
      admins: admins.map(enrichUser),
      organizers: organizers.map(enrichUser),
      students: students.map(enrichUser),
      events,
      clubs,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch college details", error: err.message });
  }
};

// superadmin can update any user's details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, role, department, yearOfStudy, isDeleted } = req.body;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Cannot modify a superadmin user" });
    }

    // check for email uniqueness if email is being changed
    if (email && email !== user.email) {
      const existing = await UserModel.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use" });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (yearOfStudy !== undefined) user.yearOfStudy = yearOfStudy;
    if (isDeleted !== undefined) user.isDeleted = isDeleted;

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    res.status(200).json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// get all events across all colleges
const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find()
      .populate("createdBy", "fullName email")
      .populate("collegeId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: events.length, events });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

// update an existing event, including status (superadmin)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const event = await EventModel.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

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


module.exports = {
  createCollege,
  getAllColleges,
  updateCollege,
  deleteCollege,
  createAdmin,
  getAllAdmins,
  removeAdmin,
  getPlatformAnalytics,
  getCollegeDetails,
  updateUser,
  getAllEvents,
  updateEvent,
};

