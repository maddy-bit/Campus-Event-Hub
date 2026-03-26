const { UserModel } = require("../Models/users");

const getLeaderboard = async (req, res) => {
  try {
    const { collegeId, limit = 50 } = req.query;
    
    const query = { role: 'student', totalPoints: { $gt: 0 }, isDeleted: false };
    if (collegeId) {
      query.collegeId = collegeId;
    }

    const users = await UserModel.find(query)
      .sort({ totalPoints: -1 })
      .limit(Number(limit))
      .select("fullName profilePicture department totalPoints");

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      department: u.department,
      totalPoints: u.totalPoints
    }));

    res.status(200).json({ leaderboard: ranked });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard", error: err.message });
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

module.exports = { getLeaderboard, getMyRank };
