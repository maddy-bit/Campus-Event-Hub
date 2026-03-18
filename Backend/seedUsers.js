const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { UserModel: User } = require("./Models/users");
const { CollegeModel: College } = require("./Models/college");
const { ClubModel: Club } = require("./Models/club");
const { EventModel: Event } = require("./Models/event");
const { ERegistrationModel: ERegistration } = require("./Models/ERegistration");
const { NotificationModel: Notification } = require("./Models/Notification");
const { FeedbackModel: Feedback } = require("./Models/Feedback");
const { EventCommentModel: EventComment } = require("./Models/EventComment");
const { ChatMessageModel: ChatMessage } = require("./Models/ChatMessage");
const { ConnectionModel: Connection } = require("./Models/Connection");

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        console.log("Clearing all collections...");
        await Promise.all([
            User.deleteMany({}),
            College.deleteMany({}),
            Club.deleteMany({}),
            Event.deleteMany({}),
            ERegistration.deleteMany({}),
            Notification.deleteMany({}),
            Feedback.deleteMany({}),
            EventComment.deleteMany({}),
            ChatMessage.deleteMany({}),
            Connection.deleteMany({}),
        ]);
        console.log("Database cleared.");

        const password = "sprng";
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating default college...");
        const college = await College.create({
            name: "Default University",
            location: "Main Campus",
            isVerified: true
        });

        console.log("Creating default club...");
        const club = await Club.create({
            name: "Main Event Club",
            collegeId: college._id,
            category: "Other",
            description: "Default club for organizing events"
        });

        const users = [
            {
                fullName: "Super Admin",
                email: "superadmin@g.com",
                phoneNumber: "9876543210",
                password: hashedPassword,
                role: "superadmin",
                isEmailVerified: true,
                isApproved: true
            },
            {
                fullName: "Admin User",
                email: "admin@g.com",
                phoneNumber: "9876543211",
                password: hashedPassword,
                role: "admin",
                collegeId: college._id,
                isEmailVerified: true,
                isApproved: true
            },
            {
                fullName: "Organizer User",
                email: "organizer@g.com",
                phoneNumber: "9876543212",
                password: hashedPassword,
                role: "organizer",
                collegeId: college._id,
                clubId: club._id,
                yearOfStudy: "2025",
                isEmailVerified: true,
                isApproved: true
            },
            {
                fullName: "Student User",
                email: "student@g.com",
                phoneNumber: "9876543213",
                password: hashedPassword,
                role: "student",
                collegeId: college._id,
                department: "Computer Science",
                yearOfStudy: "2025",
                isEmailVerified: true,
                isApproved: true
            }
        ];

        console.log("Creating users...");
        await User.insertMany(users);
        console.log("Users created successfully.");

        console.log("\n--- Seed Summary ---");
        console.log(`Password for all: ${password}`);
        console.log(`Super Admin: superadmin@g.com`);
        console.log(`Admin: admin@g.com`);
        console.log(`Organizer: organizer@g.com`);
        console.log(`Student: student@g.com`);
        
        console.log("\nDone!");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();
