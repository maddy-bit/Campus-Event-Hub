const { CollegeModel } = require("../Models/college");
const { UserModel } = require("../Models/users");
const { ClubModel } = require("../Models/club");
const { EventModel } = require("../Models/event");
const bcrypt = require("bcryptjs");

// create a new college
const createCollege = async (req, res) => {
  try {
    const { name, location, logo, domain } = req.body;

    if (!name) return res.status(400).json({ message: "College name is required" });

    const existing = await CollegeModel.findOne({ name });
    if (existing) return res.status(400).json({ message: "College already exists" });

    const college = await CollegeModel.create({ name, location, logo, domain, isVerified: true });

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

    res.status(201).json({
      message: "Admin created",
      admin: { _id: admin._id, fullName: admin.fullName, email: admin.email, collegeId: admin.collegeId }
    });
  } catch (err) {
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

// platform analytics
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

    res.status(200).json({
      totalColleges,
      totalUsers,
      totalEvents,
      totalStudents,
      totalOrganizers,
      totalAdmins,
      totalClubs,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
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
};
