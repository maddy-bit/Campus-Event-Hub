const fakeEvents = [
  {
    id: 1,
    title: "AI Workshop",
    category: "Workshop",
    eventDate: "2026-03-10",
    maxSeats: 100,
    registered: 90,
    status: "Approved",
    paymentPending: 5
  },
  {
    id: 2,
    title: "Hackathon 2026",
    category: "Competition",
    eventDate: "2026-04-05",
    maxSeats: 300,
    registered: 300,
    status: "Approved",
    paymentPending: 20
  },
  {
    id: 3,
    title: "Drone Race",
    category: "Sports",
    eventDate: "2025-12-01",
    maxSeats: 150,
    registered: 70,
    status: "Approved",
    paymentPending: 2
  },
  {
    id: 4,
    title: "Cultural Fest",
    category: "Cultural",
    eventDate: "2025-11-20",
    maxSeats: 500,
    registered: 480,
    status: "Approved",
    paymentPending: 15
  },
  {
    id: 5,
    title: "Tech Conference",
    category: "Conference",
    eventDate: "2026-06-15",
    maxSeats: 400,
    registered: 210,
    status: "Approved",
    paymentPending: 12
  },
  {
    id: 6,
    title: "Startup Meetup",
    category: "Seminar",
    eventDate: "2026-02-01",
    maxSeats: 120,
    registered: 120,
    status: "Approved",
    paymentPending: 0
  },
  {
    id: 7,
    title: "Robotics Bootcamp",
    category: "Workshop",
    eventDate: "2026-01-10",
    maxSeats: 80,
    registered: 60,
    status: "Approved",
    paymentPending: 3
  },
  {
    id: 8,
    title: "Cyber Security Talk",
    category: "Seminar",
    eventDate: "2025-10-01",
    maxSeats: 200,
    registered: 150,
    status: "Approved",
    paymentPending: 6
  },
  {
    id: 9,
    title: "Gaming Tournament",
    category: "Competition",
    eventDate: "2026-07-01",
    maxSeats: 250,
    registered: 200,
    status: "Approved",
    paymentPending: 18
  },
  {
    id: 10,
    title: "Photography Contest",
    category: "Competition",
    eventDate: "2026-05-12",
    maxSeats: 100,
    registered: 40,
    status: "Draft",
    paymentPending: 0
  },
  {
    id: 11,
    title: "Music Night",
    category: "Cultural",
    eventDate: "2026-08-20",
    maxSeats: 600,
    registered: 580,
    status: "Approved",
    paymentPending: 30
  },
  {
    id: 12,
    title: "Blockchain Summit",
    category: "Conference",
    eventDate: "2026-09-01",
    maxSeats: 350,
    registered: 300,
    status: "Approved",
    paymentPending: 25
  },
  {
    id: 13,
    title: "ML Bootcamp",
    category: "Workshop",
    eventDate: "2026-03-22",
    maxSeats: 120,
    registered: 115,
    status: "Approved",
    paymentPending: 10
  },
  {
    id: 14,
    title: "Art Expo",
    category: "Cultural",
    eventDate: "2025-09-15",
    maxSeats: 200,
    registered: 150,
    status: "Rejected",
    paymentPending: 0
  },
  {
    id: 15,
    title: "Cloud Computing",
    category: "Seminar",
    eventDate: "2026-04-30",
    maxSeats: 180,
    registered: 175,
    status: "Approved",
    paymentPending: 8
  },
  {
    id: 16,
    title: "IoT Expo",
    category: "Conference",
    eventDate: "2026-10-01",
    maxSeats: 250,
    registered: 240,
    status: "Approved",
    paymentPending: 5
  },
  {
    id: 17,
    title: "Chess Tournament",
    category: "Sports",
    eventDate: "2026-02-18",
    maxSeats: 100,
    registered: 95,
    status: "Approved",
    paymentPending: 4
  },
  {
    id: 18,
    title: "Dance Battle",
    category: "Cultural",
    eventDate: "2026-01-25",
    maxSeats: 300,
    registered: 290,
    status: "Approved",
    paymentPending: 7
  },
  {
    id: 19,
    title: "Startup Pitch",
    category: "Competition",
    eventDate: "2026-03-05",
    maxSeats: 150,
    registered: 145,
    status: "Approved",
    paymentPending: 9
  },
  {
    id: 20,
    title: "DevOps Workshop",
    category: "Workshop",
    eventDate: "2026-06-01",
    maxSeats: 100,
    registered: 80,
    status: "Approved",
    paymentPending: 6
  }
];

export default fakeEvents;