const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Ended'],
    default: 'Pending'
  },
  chatExpiresAt: {
    type: Date
  }
}, { timestamps: true });

connectionSchema.index({ requesterId: 1, status: 1 });
connectionSchema.index({ recipientId: 1, status: 1 });

const ConnectionModel = mongoose.model('Connection', connectionSchema);
module.exports = { ConnectionModel };
