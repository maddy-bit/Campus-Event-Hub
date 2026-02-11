const mongoose = require('mongoose')
const userschema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  yearOfStudy: {
    type: String,
    required: true,
    match: [/^\d{4}$/, 'Year of study must be a 4-digit number']
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'clubauthority', 'student'],
    default: 'student'
  }
})

const UserModel = mongoose.model('user', userschema)
module.exports = { UserModel };