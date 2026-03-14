const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL index: documents expire 10 minutes 
  }
});

const ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = { ChatMessageModel };
