const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { UserModel: User } = require("./Models/users");
const { CollegeModel: College } = require("./Models/college");
const { ClubModel: Club } = require("./Models/club");
const { EventModel: Event } = require("./Models/event");
const { ERegistrationModel: ERegistration } = require("./Models/ERegistration");
const { NotificationModel: Notification } = require("./Models/Notification");

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // drop all collections
    // await Promise.all([
    //   User.deleteMany({}),
    //   College.deleteMany({}),
    //   Club.deleteMany({}),
    //   Event.deleteMany({}),
    //   ERegistration.deleteMany({}),
    //   Notification.deleteMany({}),
    // ]);
    // console.log("All collections cleared");

    // const hashedPassword = await bcrypt.hash("spring", 10);

    // const college1 = await College.findOne();
    // const club1 = await Club.findOne();

    // const user = {
    //   fullName: "Organizer User 2",
    //   email: "organizer2@g.com",
    //   phoneNumber: "9876543212",
    //   password: hashedPassword,
    //   role: "organizer",
    //   collegeId: college1._id,
    //   clubId: club1._id,
    //   yearOfStudy: "2026",
    //   isEmailVerified: true,
    // };

    // await User.create(user);
    // console.log("User created");

    // create colleges
    // const [college1, college2] = await College.insertMany([
    //   { name: "Global Engineering College", location: "Pune", isVerified: true },
    //   { name: "National Institute of Technology", location: "Mumbai", isVerified: true },
    // ]);
    // console.log("Colleges created");

    // create clubs
    // const [club1, club2] = await Club.insertMany([
    //   { name: "Coding Club", collegeId: college1._id, category: "Technical", description: "A club for coders" },
    //   { name: "Dance Club", collegeId: college2._id, category: "Cultural", description: "A club for dancers" },
    // ]);
    // console.log("Clubs created");

    // create users
    // const users = [
    // {
    //   fullName: "Super Admin",
    //   email: "superadmin@g.com",
    //   phoneNumber: "9876543210",
    //   password: hashedPassword,
    //   role: "superadmin",
    //   isEmailVerified: true,
    // },
    // {
    //   fullName: "Admin User",
    //   email: "admin@g.com",
    //   phoneNumber: "9876543211",
    //   password: hashedPassword,
    //   role: "admin",
    //   collegeId: college1._id,
    //   isEmailVerified: true,
    // },
    // {
    //   fullName: "Admin Two",
    //   email: "admin2@g.com",
    //   phoneNumber: "9876543214",
    //   password: hashedPassword,
    //   role: "admin",
    //   collegeId: college2._id,
    //   isEmailVerified: true,
    // },
    // {
    //   fullName: "Organizer User",
    //   email: "organizer@g.com",
    //   phoneNumber: "9876543212",
    //   password: hashedPassword,
    //   role: "organizer",
    //   collegeId: college1._id,
    //   clubId: club1._id,
    //   yearOfStudy: "2026",
    //   isEmailVerified: true,
    // },
    // {
    //   fullName: "Student User",
    //   email: "student@g.com",
    //   phoneNumber: "9876543213",
    //   password: hashedPassword,
    //   role: "student",
    //   collegeId: college1._id,
    //   department: "Computer Science",
    //   yearOfStudy: "2026",
    //   isEmailVerified: true,
    // },
    // {
    //   fullName: "Student Two",
    //   email: "student2@g.com",
    //   phoneNumber: "9876543215",
    //   password: hashedPassword,
    //   role: "student",
    //   collegeId: college2._id,
    //   department: "Electronics",
    //   yearOfStudy: "2025",
    //   isEmailVerified: true,
    // },
    // ];

    await User.insertMany(users);
    console.log("Users created");

    console.log("\n--- Seed Summary ---");
    console.log(`Colleges: ${await College.countDocuments()}`);
    console.log(`Clubs: ${await Club.countDocuments()}`);
    console.log(`Users: ${await User.countDocuments()}`);
    console.log("Done!");

    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
