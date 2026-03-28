const mongoose = require('mongoose');

const EventResultSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  position: { type: Number, enum: [1, 2, 3], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// One winner per position per event
EventResultSchema.index({ eventId: 1, position: 1 }, { unique: true });
// One user cannot win multiple positions in the same event
EventResultSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventResultModel = mongoose.model('EventResult', EventResultSchema);
module.exports = { EventResultModel };
