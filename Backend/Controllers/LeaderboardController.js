const { UserModel } = require("../Models/users");
const { PointTransactionModel } = require("../Models/PointTransaction");

// Global leaderboard with pagination
const getGlobalLeaderboard = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const query = { role: 'student', totalPoints: { $gt: 0 }, isDeleted: false };
    const total = await UserModel.countDocuments(query);

    const users = await UserModel.find(query)
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(limit)
      .select("fullName profilePicture department totalPoints collegeId")
      .populate("collegeId", "name");

    const ranked = users.map((u, i) => ({
      rank: skip + i + 1,
      _id: u._id,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      department: u.department,
      totalPoints: u.totalPoints,
      collegeName: u.collegeId ? u.collegeId.name : "N/A"
    }));

    res.status(200).json({ leaderboard: ranked, total, page, hasMore: skip + limit < total });
  } catch (err) {
    console.error("Global leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch global leaderboard", error: err.message });
  }
};

// Local (college-specific) leaderboard with pagination
const getLocalLeaderboard = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const user = await UserModel.findById(req.user._id);
    if (!user || !user.collegeId) {
      return res.status(400).json({ message: "No college associated with your account" });
    }

    const query = { role: 'student', totalPoints: { $gt: 0 }, isDeleted: false, collegeId: user.collegeId };
    const total = await UserModel.countDocuments(query);

    const users = await UserModel.find(query)
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(limit)
      .select("fullName profilePicture department totalPoints");

    const ranked = users.map((u, i) => ({
      rank: skip + i + 1,
      _id: u._id,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      department: u.department,
      totalPoints: u.totalPoints
    }));

    res.status(200).json({ leaderboard: ranked, total, page, hasMore: skip + limit < total });
  } catch (err) {
    console.error("Local leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch local leaderboard", error: err.message });
  }
};

const getMyRank = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    const higherRankCount = await UserModel.countDocuments({
      role: 'student',
      totalPoints: { $gt: user.totalPoints },
      isDeleted: false
    });

    res.status(200).json({
      rank: higherRankCount + 1,
      totalPoints: user.totalPoints
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your rank", error: err.message });
  }
};

const getPointHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await PointTransactionModel.find({ userId })
      .populate("eventId", "title")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch points history", error: err.message });
  }
};

module.exports = { getGlobalLeaderboard, getLocalLeaderboard, getMyRank, getPointHistory };
