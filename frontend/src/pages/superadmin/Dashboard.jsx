import React from "react";
import "../../styles/SuperAdminDashboard.css";

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