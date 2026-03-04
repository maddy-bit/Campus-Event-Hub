const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    maxlength: 80,
    trim: true
  },
  category: {
    type: String,
    enum: ['Competition', 'Conference', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1800
  },

  eventDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true 
  },
  endTime: {
    type: String 
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  maxSeats: {
    type: Number,
    default: 100
  },

  posterUrl: {
    type: String 
  },

  isPaidEvent: {
    type: Boolean,
    default: false
  },
  ticketPrice: {
    type: Number,
    default: 0 
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EventModel = mongoose.model('Event', eventSchema);
module.exports = { EventModel };
