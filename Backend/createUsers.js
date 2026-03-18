const mongoose = require("mongoose");
require("dotenv").config();

const { EventModel: Event } = require("./Models/event");
const { UserModel: User } = require("./Models/users");
const { CollegeModel: College } = require("./Models/college");
const { ERegistrationModel: ERegistration } = require("./Models/ERegistration");

const MONGO_URI = process.env.MONGO_URI;

const seedEventWithUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected...");

    // Get college + admin
    const college = await College.findOne();
    const admin = await User.findOne({ role: "admin" });

    if (!college || !admin) {
      console.log("❌ कॉलेज or admin missing");
      process.exit(1);
    }

    // Get 2 students
    const students = await User.find({ role: "student" }).limit(2);

    if (students.length < 2) {
      console.log("❌ Need at least 2 students");
      process.exit(1);
    }

    // Create today's date (cleaned to avoid timezone issues)
    const today = new Date();
    today.setHours(10, 0, 0, 0); // 10 AM today

    const deadline = new Date();
    deadline.setHours(23, 59, 59, 999); // end of today

    // Create Event
    const event = new Event({
      title: "Today's Networking Event",
      category: "Workshop",
      location: "Virtual Room A",
      description: "Event happening today for testing student registrations.",
      eventDate: today,
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      registrationDeadline: deadline,
      maxSeats: 100,
      seatsFilled: 2,
      createdBy: admin._id,
      collegeId: college._id,
      status: "Approved"
    });

    const savedEvent = await event.save();
    console.log("✅ Event created:", savedEvent.title);

    // Register both students
    for (const student of students) {
      const existing = await ERegistration.findOne({
        userId: student._id,
        eventId: savedEvent._id
      });

      if (!existing) {
        await new ERegistration({
          userId: student._id,
          eventId: savedEvent._id,
          status: "Registered"
        }).save();

        console.log(`✅ Registered: ${student.email}`);
      }
    }

    console.log("🎉 Event + registrations completed!");
    process.exit(0);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

seedEventWithUsers();