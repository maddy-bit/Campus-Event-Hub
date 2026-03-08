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
    default: 'Registered'
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
    type: Number
  }
},{ timestamps: true });

const ERegistrationModel = mongoose.model('ERegistration', ERegistrationSchema);
module.exports = { ERegistrationModel };
