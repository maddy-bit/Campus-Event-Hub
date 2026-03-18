const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { UserModel: User } = require("./Models/users");
const { CollegeModel: College } = require("./Models/college");
const { EventModel: Event } = require("./Models/event");
const { ERegistrationModel: ERegistration } = require("./Models/ERegistration");

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected. Commencing dedicated Networking Data Seed...");

    // Get an admin and college
    const college = await College.findOne();
    const admin = await User.findOne({ role: "admin" });

    if (!college || !admin) {
        console.error("No college or admin found. Please run your full original seed first.");
        process.exit(1);
    }

    // 1. Create one new user for networking test
    let testUser = await User.findOne({ email: "testnetwork@g.com" });
    if (!testUser) {
        const hash = await bcrypt.hash("spring", 10);
        testUser = new User({
            fullName: "Network Drone",
            email: "testnetwork@g.com",
            phoneNumber: "9876543009",
            password: hash,
            role: "student",
            collegeId: college._id,
            department: "Computer Science",
            yearOfStudy: "2026",
            isEmailVerified: true,
            interests: ["VUE", "BLOCKCHAIN", "NEXTJS"]
        });
        await testUser.save();
        console.log(`User created: ${testUser.email}`);
    } else {
        console.log(`User ${testUser.email} already exists.`);
    }

    // 2. Create one new event occurring strictly TODAY
    const newEvent = new Event({
      title: "event" + Date.now(),
      category: "Workshop",
      location: "Virtual Room A",
      description: "A fresh event generated specifically for the today-only networking condition.",
      eventDate: new Date(),
      startTime: "10:00 AM",
      registrationDeadline: new Date(Date.now() + 86400000), // tomorrow
      maxSeats: 100,
      seatsFilled: 1,
      createdBy: admin._id,
      collegeId: college._id,
      status: "Approved"
    });

    const savedEvent = await newEvent.save();
    console.log(`Created new event: ${savedEvent.title}`);

   

    console.log("Successfully registered the test user to the new event!");

    process.exit(0);

  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seed();
