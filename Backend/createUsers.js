const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./Models/users"); 

const MONGO_URI = process.env.MONGO_URI; 

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    const hashedPassword = await bcrypt.hash("spring", 10);

    const users = [
      {
        fullName: "Super Admin",
        email: "superadmin@g.com",
        phoneNumber: "9876543210",
        password: hashedPassword,
        role: "superadmin",
        yearOfStudy: "2026",
        isEmailVerified: true
      },
      {
        fullName: "Admin User",
        email: "admin@g.com",
        phoneNumber: "9876543211",
        collegeName: "Global Engineering College",
        password: hashedPassword,
        role: "admin",
        yearOfStudy: "2026",
        isEmailVerified: true
      },
      {
        fullName: "Organizer User",
        email: "organizer@g.com",
        phoneNumber: "9876543212",
        collegeName: "Global Engineering College",
        password: hashedPassword,
        role: "organizer",
        yearOfStudy: "2026",
        clubName: "Coding Club",
        clubCategory: "Technical",
        isEmailVerified: true
      },
      {
        fullName: "Student User",
        email: "student@g.com",
        phoneNumber: "9876543213",
        collegeName: "Global Engineering College",
        department: "Computer Science",
        password: hashedPassword,
        role: "student",
        yearOfStudy: "2026",
        isEmailVerified: true
      }
    ];

    await User.insertMany(users);

    console.log("Users inserted successfully ");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedUsers();