const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { UserModel } = require("./Models/users");
const { CollegeModel } = require("./Models/college");
const { ClubModel } = require("./Models/club");
const { EventModel } = require("./Models/event");
const { ERegistrationModel } = require("./Models/ERegistration");
const { EventResultModel } = require("./Models/EventResult");
const { PointTransactionModel } = require("./Models/PointTransaction");
const { FeedbackModel } = require("./Models/Feedback");
const { NotificationModel } = require("./Models/Notification");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("=========================================");
    console.log("Connected to MongoDB. Wiping database...");
    
    // Clear all
    await UserModel.deleteMany({});
    await CollegeModel.deleteMany({});
    await ClubModel.deleteMany({});
    await EventModel.deleteMany({});
    await ERegistrationModel.deleteMany({});
    await EventResultModel.deleteMany({});
    await PointTransactionModel.deleteMany({});
    await FeedbackModel.deleteMany({});
    await NotificationModel.deleteMany({});

    console.log("Database wiped clean.");
    console.log("=========================================");

    const pass = bcrypt.hashSync("spring", 10);
    // Setting isEmailVerified because of user request
    const passOpts = { password: pass, isApproved: true, isEmailVerified: true };

    // 1. Superadmin
    await UserModel.create({
      fullName: "Super Admin",
      email: "superadmin@g.com",
      phoneNumber: "9999999999",
      role: "superadmin",
      ...passOpts
    });
    console.log("Created Superadmin: superadmin@g.com");

    // 2. Colleges
    const collegesData = [
      { name: "Springboard Institute of Tech", location: "Bangalore" },
      { name: "Global Tech University", location: "Mumbai" },
      { name: "Central State College", location: "Delhi" },
      { name: "Pinnacle Engineering Academy", location: "Pune" },
      { name: "Nexus Design College", location: "Chennai" }
    ];
    const colleges = await CollegeModel.insertMany(collegesData);
    console.log(`Created ${colleges.length} Colleges.`);

    // 3. Create Admin & Organizers per college
    let orgs = [];
    for (let i = 0; i < colleges.length; i++) {
        const c = colleges[i];
        
        // Admin
        await UserModel.create({
            fullName: `${c.name} Admin`,
            email: `admin${i+1}@g.com`,
            phoneNumber: `888888880${i}`,
            role: "admin",
            collegeId: c._id,
            ...passOpts
        });

        // Clubs
        const club1 = await ClubModel.create({
            name: `Coding & Hack Club ${i+1}`,
            category: "Technical",
            description: "Advanced logical building paradigms.",
            collegeId: c._id
        });
        const club2 = await ClubModel.create({
            name: `Arts & Culture ${i+1}`,
            category: "Cultural",
            description: "Music, storytelling and fine theater.",
            collegeId: c._id
        });

        // Organizers
        const org1 = await UserModel.create({
            fullName: `Tech Head org${i+1}a`,
            email: `org${i+1}a@g.com`,
            phoneNumber: `777777770${i}`,
            role: "organizer",
            collegeId: c._id,
            clubId: club1._id,
            yearOfStudy: "2024",
            ...passOpts
        });
        const org2 = await UserModel.create({
            fullName: `Culture Head org${i+1}b`,
            email: `org${i+1}b@g.com`,
            phoneNumber: `777777771${i}`,
            role: "organizer",
            collegeId: c._id,
            clubId: club2._id,
            yearOfStudy: "2023",
            ...passOpts
        });

        orgs.push(org1, org2);
    }
    console.log("Created Admins, Clubs, and Organizers.");

    // 4. Create Students
    const mainCollege = colleges[0];
    
    // Special Student: student@g.com
    const mainStudent = await UserModel.create({
        fullName: "Primary Pitch Student",
        email: "student@g.com",
        phoneNumber: "6666666600",
        role: "student",
        collegeId: mainCollege._id,
        department: "Computer Science",
        yearOfStudy: "2025",
        totalPoints: 1250, 
        ...passOpts
    });

    // 15 generic students distributed properly!
    let students = [mainStudent];
    for (let i = 1; i <= 15; i++) {
        const c = colleges[i % colleges.length];
        const s = await UserModel.create({
            fullName: `Generic Student ${i}`,
            email: `student${i}@g.com`,
            phoneNumber: `66666666${i.toString().padStart(2, '0')}`,
            role: "student",
            collegeId: c._id,
            department: "Engineering",
            yearOfStudy: "2026",
            totalPoints: Math.floor(Math.random() * 50) * 20 + 100, // random points
            ...passOpts
        });
        students.push(s);
    }
    console.log(`Created ${students.length} Students including student@g.com`);

    // 5. Events - Generate exactly 12 good name events spanning different colleges
    const now = new Date();
    const futureDate = new Date(now); futureDate.setDate(now.getDate() + 10);
    const runningDate = new Date(now);
    const pastDate = new Date(now); pastDate.setDate(now.getDate() - 5);

    const eventData = [
      { t: "TechNexus Innovate 2026", d: futureDate, s: "Approved", orgI: 0 }, // College 1
      { t: "ByteDance Coding Marathon", d: runningDate, s: "Approved", orgI: 2 }, // College 2
      { t: "NexGen Artificial Intelligence Summit", d: pastDate, s: "Approved", orgI: 4 }, // College 3, ready to assign winners/rate
      { t: "Cyber Security Defend-a-thon", d: pastDate, s: "Completed", orgI: 0 }, // College 1, completed
      { t: "Cultural Fest: Rhythm & Beats", d: futureDate, s: "Approved", orgI: 3 }, // College 2 (cultural)
      { t: "Global Entrepreneurship Conclave", d: futureDate, s: "Approved", orgI: 6 }, // College 4
      { t: "RoboWars Arena Clash", d: runningDate, s: "Approved", orgI: 0 }, // College 1
      { t: "FinTech Disruption Panel", d: pastDate, s: "Approved", orgI: 2 }, // College 2, rateable
      { t: "Creative Arts & Design Expo", d: pastDate, s: "Completed", orgI: 5 }, // College 3 (cultural)
      { t: "Open Source Contributor Days", d: futureDate, s: "Approved", orgI: 8 }, // College 5
      { t: "Cloud Computing Masterclass", d: pastDate, s: "Completed", orgI: 8 }, // College 5
      { t: "E-Sports Championship Series", d: runningDate, s: "Approved", orgI: 0 } // College 1
    ];

    let createdEvents = [];
    for (const evt of eventData) {
        const org = orgs[evt.orgI];
        const newEvt = await EventModel.create({
            title: evt.t,
            category: "Workshop",
            location: "Main Campus Auditorium",
            description: `Super immersive event regarding ${evt.t}. Designed to boost student practical engagement extensively across multiple real-world disciplines!`,
            eventDate: evt.d,
            startTime: "10:00 AM",
            endTime: "04:00 PM",
            registrationDeadline: evt.d,
            maxSeats: 150,
            seatsFilled: Math.floor(Math.random() * 40),
            createdBy: org._id,
            collegeId: org.collegeId,
            status: evt.s,
            isPublic: true
        });
        createdEvents.push(newEvt);
    }
    console.log(`Created 12 premium events across all colleges`);

    // 6. Registrations for primary student
    // Let's grab some events to join student@g.com into
    const studentEvents = [
      createdEvents[0]._id, // Future (College 1)
      createdEvents[3]._id, // Completed (College 1)
      createdEvents[6]._id, // Running (College 1)
      createdEvents[11]._id // Running (College 1)
    ];
    
    for (const evId of studentEvents) {
        await ERegistrationModel.create({ eventId: evId, userId: mainStudent._id, status: 'Registered' });
        await EventModel.findByIdAndUpdate(evId, { $inc: { seatsFilled: 1 } });
    }

    // Register generic students to "NexGen Artificial Intelligence Summit" so they can be assigned winners
    await ERegistrationModel.create([
        { eventId: createdEvents[2]._id, userId: students[1]._id, status: 'Registered' },
        { eventId: createdEvents[2]._id, userId: students[2]._id, status: 'Registered' },
        { eventId: createdEvents[2]._id, userId: students[3]._id, status: 'Registered' }
    ]);

    console.log("Registered student@g.com to multiple events contextually.");

    // 7. Results for completed event (Cyber Security Defend-a-thon)
    // Make mainStudent win 1st place!
    const completedEvt = createdEvents[3]; 
    if(completedEvt.status === "Completed") {
        await EventResultModel.create([
            { eventId: completedEvt._id, position: 1, userId: mainStudent._id, assignedBy: orgs[0]._id }
        ]);
        await PointTransactionModel.create([
            { userId: mainStudent._id, points: 50, action: 'winner_1st', eventId: completedEvt._id }
        ]);
    }

    console.log("=========================================");
    console.log("SUCCESS! PERFECT PITCH DATA IMPORTED!");
    console.log("ALL passwords are 'spring'. ALL emails are verified. Leaderboard data works.");
    console.log("Login examples:");
    console.log("Student: student@g.com \nOrganizer: org1a@g.com \nAdmin: admin1@g.com \nSuper: superadmin@g.com");
    console.log("=========================================");

    process.exit(0);
  } catch (err) {
    console.error("Failed to seed pitch data!!", err);
    process.exit(1);
  }
}

seed();
