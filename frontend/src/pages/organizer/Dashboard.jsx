import { useEffect, useState } from "react";
import "./OrganizerDashboard.css";
import fakeEvents from "../../data/fakeEvents";

const Dashboard = () => {

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const today = new Date();

    const activeEvents = fakeEvents.filter(
      e => e.status === "Approved"
    ).length;

    const upcomingEvents = fakeEvents.filter(
      e => new Date(e.eventDate) > today && e.status === "Approved"
    );

    const totalParticipants = fakeEvents.reduce(
      (sum, e) => sum + e.registered,
      0
    );

    const pendingRegistrations = fakeEvents.reduce(
      (sum, e) => sum + e.paymentPending,
      0
    );

    const top5 = [...fakeEvents]
      .filter(e => e.status === "Approved")
      .sort((a, b) => b.registered - a.registered)
      .slice(0, 5);

    setDashboardData({
      activeEvents,
      upcomingEvents,
      totalParticipants,
      pendingRegistrations,
      top5
    });

  }, []);

  if (!dashboardData) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">ORGANIZER_DB</h1>

      {/* ===== Top Stats Cards ===== */}
      <div className="stats-row">
        <div className="card green">
          <h3>ACTIVE EVENTS</h3>
          <p>{dashboardData.activeEvents}</p>
        </div>

        <div className="card blue">
          <h3>UPCOMING</h3>
          <p>{dashboardData.upcomingEvents.length}</p>
        </div>

        <div className="card yellow">
          <h3>PARTICIPANTS</h3>
          <p>{dashboardData.totalParticipants}</p>
        </div>

        <div className="card red">
          <h3>PENDING</h3>
          <p>{dashboardData.pendingRegistrations}</p>
        </div>
      </div>

      {/* ===== Bottom Section ===== */}
      <div className="bottom-section">

        {/* Upcoming Queue */}
        <div className="panel">
          <div className="panel-header blue-header">
            UPCOMING_QUEUE
          </div>

          <div className="panel-content">
            {dashboardData.upcomingEvents.slice(0, 5).map(event => (
              <div key={event.id} className="queue-item">
                <span>{event.title}</span>
                <span>
                  {event.registered}/{event.maxSeats}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <div className="panel-header yellow-header">
            QUICK_ACTIONS
          </div>

          <div className="panel-content actions">
            <button>Create New Event</button>
            <button>Manage Participants</button>
            <button>Send Notifications</button>
            <button>View Analytics</button>
          </div>
        </div>

        {/* Insights (Top 5 Events) */}
        <div className="panel">
          <div className="panel-header blue-header">
            INSIGHTS_V4 (Top 5)
          </div>

          <div className="panel-content">
            {dashboardData.top5.map(event => (
              <div key={event.id} className="queue-item">
                <span>{event.title}</span>
                <span>{event.registered}</span>
              </div>
            ))}

            <button className="export-btn">
              EXPORT_REPORT.csv
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;