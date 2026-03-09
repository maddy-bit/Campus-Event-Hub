import React from "react";
import {
  CalendarDays,
  Users,
  UserCircle,
  Clock,
  MoreHorizontal,
  Plus
} from "lucide-react";
import "../../styles/AdminDashboard.css";

const StatCard = ({ title, value, trend, icon: Icon, dark = false }) => (
  <div className={`stat-card ${dark ? "dark" : ""}`}>
    <div className="stat-icon">
      <Icon size={20} />
    </div>
    <div className="stat-info">
      <div className="label">{title}</div>
      <div className="value">{value}</div>
      <div className={`trend ${dark ? "action" : "positive"}`}>{trend}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const stats = [
    { title: "Total Events", value: "842", trend: "↑ +18% active", icon: CalendarDays },
    { title: "Total Students", value: "4,285", trend: "↑ +12.5%", icon: Users },
    { title: "Organizers", value: "156", trend: "↑ +4 new", icon: UserCircle },
    { title: "Pending Review", value: "24", trend: "ACTION REQ", icon: Clock, dark: true },
  ];

  const organizers = [
    { name: "Coding Club", events: 12, status: "green", initials: "CC" },
    { name: "Sports Dept", events: 8, status: "orange", initials: "SD" },
    { name: "Music Council", events: 5, status: "green", initials: "MC" },
  ];

  const submissions = [
    { id: 1, name: "Tech Fiesta 2024", organizer: "Coding Club", date: "Oct 15, 2024", status: "APPROVED" },
    { id: 2, name: "Annual Sports Meet", organizer: "Sports Dept", date: "Oct 20, 2024", status: "PENDING" },
    { id: 3, name: "AI Seminar", organizer: "IEEE Branch", date: "Oct 12, 2024", status: "APPROVED" },
    { id: 4, name: "Gala Nights", organizer: "Music Council", date: "Oct 22, 2024", status: "REJECTED" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="terminal-label">Event Hub Terminal</div>
          <h1>Dashboard Overview</h1>
        </div>
        <button className="add-event-btn flex items-center gap-2">
          <Plus size={18} />
          Add New Event
        </button>
      </div>

      <div className="stat-cards-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="middle-row">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Registration Trend</h3>
            <span>Oct 2024</span>
          </div>
          <svg viewBox="0 0 800 240" className="sparkline-svg">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M 20,180 C 100,180 120,100 180,100 C 240,100 280,150 340,150 C 400,150 420,40 500,40 C 580,40 600,180 680,180 C 720,180 740,70 800,70"
              fill="none"
              stroke="#000"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 20,180 C 100,180 120,100 180,100 C 240,100 280,150 340,150 C 400,150 420,40 500,40 C 580,40 600,180 680,180 C 720,180 740,70 800,70 L 800,240 L 20,240 Z"
              fill="url(#chartGradient)"
            />
          </svg>
          <div className="days-labels">
            <span className="day-label">MON</span>
            <span className="day-label">TUE</span>
            <span className="day-label">WED</span>
            <span className="day-label">THU</span>
            <span className="day-label">FRI</span>
            <span className="day-label">SAT</span>
            <span className="day-label">SUN</span>
          </div>
        </div>

        <div className="organizer-status-card">
          <h3>Organizer Status</h3>
          <div className="organizer-list">
            {organizers.map((org, index) => (
              <div key={index} className="organizer-item">
                <div className="org-avatar">{org.initials}</div>
                <div className="org-details">
                  <span className="org-name">{org.name}</span>
                  <span className="org-events">{org.events} Events</span>
                </div>
                <div className={`status-dot ${org.status}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="submissions-section">
        <div className="section-header">
          <h3>Recent Submissions</h3>
          <span className="review-all">Review All Requests</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="event-name">{sub.name}</td>
                  <td className="organizer-cell">{sub.organizer}</td>
                  <td className="date-cell">{sub.date}</td>
                  <td>
                    <span className={`status-badge ${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <button className="actions-btn">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
