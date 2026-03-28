const mongoose = require('mongoose');

const PointTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  action: { 
    type: String, 
    enum: ['registration', 'winner_1st', 'winner_2nd', 'winner_3rd', 'rating_given'],
    required: true 
  },
  points: { type: Number, required: true },
}, { timestamps: true });

// Prevent duplicate points for same user + event + action
PointTransactionSchema.index({ userId: 1, eventId: 1, action: 1 }, { unique: true });

const PointTransactionModel = mongoose.model('PointTransaction', PointTransactionSchema);
module.exports = { PointTransactionModel };
