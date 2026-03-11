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
        {metrics.map((m, i) => (
          <div key={i} className="metric-card">
            <p className="metric-label">{m.label}</p>
            <h3>{m.value}</h3>
          </div>
        ))}
      </div>

      <div className="dashboard-main">

        {/* Chart Section */}

        <div className="chart-panel">
          <h3>Event Creation Over Time</h3>

          <div className="chart-placeholder">
            Chart will appear here after backend integration
          </div>

        </div>

        {/* System Panel */}

        {/* System Panel */}

<div className="system-panel">

  <h3>System Core Status</h3>

  <div className="system-status-list">

    <div className="status-row">
      <span>Database Cluster</span>
      <span className="status-active">ACTIVE</span>
    </div>

    <div className="status-row">
      <span>Auth Services</span>
      <span className="status-active">ACTIVE</span>
    </div>

    <div className="status-row">
      <span>File Storage</span>
      <span className="status-active">ACTIVE</span>
    </div>

    <div className="status-row">
      <span>API Gateway</span>
      <span className="status-active">ACTIVE</span>
    </div>

  </div>

</div>

      </div>

    </div>
  );
};

export default Dashboard;