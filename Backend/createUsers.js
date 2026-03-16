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

    // await User.insertMany(users);
    // console.log("Users created");

    // Seed a PAST EVENT and REGISTRATION for testing Feedback
    console.log("Seeding a past event to test feedback...");
    
    // Find the student user and a college
    const studentUser = await User.findOne({ email: "student@g.com" });
    const someCollege = await College.findOne();
    const adminUser = await User.findOne({ role: "admin" });

    if (studentUser && someCollege && adminUser) {
      // 1. Create a Past Event
      const pastEventDate = new Date();
      pastEventDate.setDate(pastEventDate.getDate() - 5); // 5 days ago

      const pastEvent = new Event({
        title: "Legacy Systems Workshop",
        category: "Workshop",
        location: "Virtual",
        description: "A workshop that already happened. Used to test the 5-star feedback rating system.",
        eventDate: pastEventDate,
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        registrationDeadline: new Date(pastEventDate.getTime() - 86400000), // 6 days ago
        maxSeats: 100,
        seatsFilled: 1,
        posterUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952", // random tech image
        isPaidEvent: false,
        createdBy: adminUser._id,
        collegeId: someCollege._id,
        status: "Approved"
      });

      const savedEvent = await pastEvent.save();

      // 2. Create a Registration for the student
      const pastRegistration = new ERegistration({
        userId: studentUser._id,
        eventId: savedEvent._id,
        status: "Registered",
        isCrossCollege: false,
        ticketType: "Free",
        registrationDate: new Date(pastEventDate.getTime() - 86400000 * 2) // registered 7 days ago
      });

      await pastRegistration.save();
      console.log("Successfully seeded 1 Past Event and 1 Registration for student@g.com");
    } else {
      console.log("Could not seed past event: Missing student@g.com, a college, or an admin user in the DB.");
    }

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
