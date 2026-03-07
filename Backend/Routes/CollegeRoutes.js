const express = require("express");
const router = express.Router();
const { CollegeModel } = require("../Models/college");

// public - get all verified colleges (for signup dropdown)
router.get("/", async (req, res) => {
  try {
    const colleges = await CollegeModel.find({ isVerified: true }).select("name location");
    res.status(200).json({ colleges });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch colleges", error: err.message });
  }
});

module.exports = router;
