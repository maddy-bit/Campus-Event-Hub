const mongoose = require('mongoose');
const ERegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isCrossCollege: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Registered', 'Waitlisted', 'Cancelled', 'Pending_Approval'],
    default: 'Pending_Approval'
  },
  ticketType: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free'
  },
  payment: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    transactionId: { type: String },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
  },
  seatNumber: {
    type: Number,
    min:1
  }
},{ timestamps: true });
// Only unique per user+event (one registration per person)
ERegistrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true }
);

// Optional: Keep seat index but don't force unique if it's not and make it partial if it is
ERegistrationSchema.index(
  { eventId: 1, seatNumber: 1 },
  { sparse: true }
);
const ERegistrationModel = mongoose.model('ERegistration', ERegistrationSchema);
module.exports = { ERegistrationModel };
