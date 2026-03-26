const { EventModel } = require("../Models/event");
const { EventResultModel } = require("../Models/EventResult");
const { PointTransactionModel } = require("../Models/PointTransaction");
const { UserModel } = require("../Models/users");
const POINTS = require("../config/points");

const assignWinners = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { first, second, third } = req.body;
    const organizerId = req.user._id;

    if (!first || !second) {
      return res.status(400).json({ message: "First and second place winners are required" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: "Only event creator can assign winners" });
    }

    if (event.status === 'Completed') {
      return res.status(400).json({ message: "Winners already assigned for this event" });
    }

    const winners = [
      { userId: first, position: 1, points: POINTS.WINNER_1ST, action: 'winner_1st' },
      { userId: second, position: 2, points: POINTS.WINNER_2ND, action: 'winner_2nd' }
    ];
    if (third) {
      winners.push({ userId: third, position: 3, points: POINTS.WINNER_3RD, action: 'winner_3rd' });
    }

    // Award points
    for (const w of winners) {
      await EventResultModel.create({
        eventId,
        position: w.position,
        userId: w.userId,
        assignedBy: organizerId
      });

      await PointTransactionModel.create({
        userId: w.userId,
        eventId,
        action: w.action,
        points: w.points
      });

      await UserModel.findByIdAndUpdate(w.userId, { $inc: { totalPoints: w.points } });
    }

    // Add Completed status
    event.status = 'Completed';
    await event.save();

    res.status(200).json({ message: "Winners assigned and points awarded" });
  } catch (err) {
    console.error("Assign winners error:", err);
    res.status(500).json({ message: "Failed to assign winners", error: err.message });
  }
};

const getEventResults = async (req, res) => {
  try {
    const { eventId } = req.params;
    const results = await EventResultModel.find({ eventId })
      .populate("userId", "fullName email profilePicture department")
      .sort({ position: 1 });
    
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results", error: err.message });
  }
};

module.exports = { assignWinners, getEventResults };
