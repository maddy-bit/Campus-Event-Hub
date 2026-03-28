const { EventModel } = require("../Models/event");
const { UserModel } = require("../Models/users");
const { CollegeModel } = require("../Models/college");
const { ERegistrationModel } = require("../Models/ERegistration");
const sendEmail = require("../utils/sendEmail");

/**
 * GET /public/events/trending
 * Returns top trending events (approved, upcoming, most registrations)
 */
const getTrendingEvents = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);

    const events = await EventModel.find({
      status: "Approved",
      eventDate: { $gte: new Date() },
    })
      .sort({ seatsFilled: -1, eventDate: 1 })
      .limit(limit)
      .select("title category eventDate location seatsFilled maxSeats posterUrl description")
      .populate("collegeId", "name")
      .lean();

    // Attach participant count from ERegistration for accuracy
    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const participantCount = await ERegistrationModel.countDocuments({
          eventId: event._id,
          status: { $in: ["Registered", "Pending_Approval"] },
        });
        return {
          _id: event._id,
          title: event.title,
          category: event.category,
          eventDate: event.eventDate,
          location: event.location,
          description: event.description,
          posterUrl: event.posterUrl,
          participants: participantCount || event.seatsFilled || 0,
          maxSeats: event.maxSeats,
          collegeName: event.collegeId ? event.collegeId.name : "N/A",
        };
      })
    );

    res.status(200).json({ success: true, events: eventsWithCount });
  } catch (err) {
    console.error("Trending events error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trending events", error: err.message });
  }
};

/**
 * GET /public/students/top
 * Returns top 3 students by points (for leaderboard showcase)
 */
const getTopStudents = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 3, 10);

    const students = await UserModel.find({
      role: "student",
      totalPoints: { $gt: 0 },
      isDeleted: false,
    })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select("fullName profilePicture department totalPoints collegeId")
      .populate("collegeId", "name")
      .lean();

    const ranked = students.map((s, i) => ({
      rank: i + 1,
      _id: s._id,
      fullName: s.fullName,
      profilePicture: s.profilePicture,
      department: s.department,
      totalPoints: s.totalPoints,
      collegeName: s.collegeId ? s.collegeId.name : "N/A",
    }));

    res.status(200).json({ success: true, students: ranked });
  } catch (err) {
    console.error("Top students error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch top students", error: err.message });
  }
};

/**
 * GET /public/colleges
 * Returns all verified colleges (for marquee)
 */
const getColleges = async (req, res) => {
  try {
    const colleges = await CollegeModel.find({ isVerified: true })
      .select("name location logo")
      .lean();

    res.status(200).json({ success: true, colleges });
  } catch (err) {
    console.error("Colleges fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch colleges", error: err.message });
  }
};

/**
 * POST /public/contact
 * Sends a contact message from a visitor to the super admin
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    // Send email to the super admin
    await sendEmail({
      to: "prajwalvr1357@gmail.com",
      subject: `[CampusEventHub] New Contact Message from ${name}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Message</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;"><strong>From:</strong> ${name}</p>
            <p style="margin: 0 0 16px;"><strong>Email:</strong> ${email}</p>
            <div style="background: #f9fafb; border-left: 4px solid #6366f1; padding: 16px; border-radius: 4px; margin-top: 16px;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #374151;">Message:</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">${message}</p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            Sent via CampusEventHub Contact Form
          </div>
        </div>
      `,
      text: `New contact message from ${name} (${email}):\n\n${message}`,
    });

    res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
};

module.exports = { getTrendingEvents, getTopStudents, getColleges, submitContact };
