import React from "react";
import "../../styles/SuperAdminDashboard.css";

const metrics = [
  { label: "Colleges", value: 42 },
  { label: "Total Users", value: "124.5k" },
  { label: "Admins", value: 156 },
  { label: "Organizers", value: 890 },
  { label: "Students", value: "123k" }
];

const Dashboard = () => {
  return (
    <div className="superadmin-dashboard">

      <header className="dashboard-header">
        <p className="dashboard-label">ROOT ACCESS CONSOLE</p>
        <h1>Ecosystem Metrics</h1>
      </header>

      <div className="metrics-grid">
        {/* Metrics cards will go here */}
      </div>

      <div className="dashboard-main">
        {/* Graph + system panels */}
      </div>

    </div>
  );
};

export default Dashboard;