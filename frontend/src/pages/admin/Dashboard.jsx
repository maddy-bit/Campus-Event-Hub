import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Clock,
  Activity,
  MoreHorizontal,
  Check,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  Line,
  Legend,
  Tooltip,
} from "recharts";
import api from "../../api";
import "../../styles/AdminDashboard.css";

const CATEGORY_COLORS = {
  Competition: "#111827",
  Conference: "#374151",
  Workshop: "#4b5563",
  Seminar: "#6b7280",
  Sports: "#9ca3af",
  Cultural: "#d1d5db",
  Other: "#e5e7eb",
};

const StatCard = ({ title, value, trend, icon: Icon, dark = false }) => (
  <div className={`stat-card ${dark ? "dark" : ""}`}>
    <div className="stat-icon">
      <Icon size={18} strokeWidth={2} />
    </div>
    <div className="stat-info">
      <div className="label">{title}</div>
      <div className="value">{value}</div>
      <div className={`trend ${dark ? "action" : "positive"}`}>{trend}</div>
    </div>
  </div>
);

const ActionMenu = ({ show, onClose, onApprove, onReject, type = "event" }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  const approveLabel = type === "promotion" ? "Promote to Organizer" : type === "access" ? "Grant Access" : "Approve Event";
  const rejectLabel = type === "promotion" ? "Deny Request" : type === "access" ? "Reject Request" : "Reject Event";

  return (
    <div ref={menuRef} className="action-dropdown">
      <button className="dropdown-item approve" onClick={onApprove}>
        <Check size={14} />
        {approveLabel}
      </button>
      <button className="dropdown-item reject" onClick={onReject}>
        <X size={14} />
        {rejectLabel}
      </button>
    </div>
  );
};

const RejectModal = ({ show, onClose, onSubmit, title }) => {
  const [reason, setReason] = useState("");

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title || "Rejection Reason"}</h3>
        <p className="modal-description">Please provide a reason. This will be sent to the organizer.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter the reason for rejection..."
          rows={4}
          className="modal-textarea"
        />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="modal-btn-submit"
            onClick={() => { onSubmit(reason); setReason(""); }}
            disabled={!reason.trim()}
          >
            Send & Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value} registrations</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, type: null });
  const [activeChartTab, setActiveChartTab] = useState("TREND"); // "TREND" or "PERFORMANCE"

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, perfRes] = await Promise.all([
        api.get("/admin/dashboard-stats"),
        api.get("/admin/events/pending"),
        api.get("/admin/analytics/event-performance")
      ]);
      setDashData(statsRes.data);
      setPendingEvents(pendingRes.data.events || []);
      setPerformanceData(perfRes.data.performanceData || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (id) => {
    try {
      await api.patch(`/admin/events/${id}/approve`);
      setActiveMenu(null);
      fetchDashboard();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleRejectEvent = async (reason) => {
    try {
      await api.patch(`/admin/events/${rejectModal.id}/reject`, { reason });
      setRejectModal({ show: false, id: null, type: null });
      setActiveMenu(null);
      fetchDashboard();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Total Events", value: dashData?.totalEvents || 0, trend: "All time", icon: CalendarDays },
    { title: "Total Students", value: dashData?.totalStudents?.toLocaleString() || "0", trend: "Enrolled", icon: Users },
    { title: "Ongoing Events", value: dashData?.ongoingCount || 0, trend: "Currently active", icon: Activity },
    { title: "Pending Review", value: dashData?.pendingReviewCount || 0, trend: "ACTION REQ", icon: Clock, dark: true },
  ];

  const chartData = dashData?.registrationChartData || [];
  const ongoingByCategory = dashData?.ongoingByCategory || [];
  const top5Submissions = pendingEvents.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="terminal-label">Event Hub Terminal</div>
          <h1>Dashboard Overview</h1>
        </div>
      </div>

      <div className="stat-cards-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="middle-row">
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3>{activeChartTab === "TREND" ? "Registration Trend" : "Event Performance"}</h3>
              <span className="chart-subtitle">
                {activeChartTab === "TREND" ? "Last 7 months" : "Registrations vs Average Rating"}
              </span>
            </div>
            
            <div className="chart-tabs">
              <button 
                className={`chart-tab ${activeChartTab === "TREND" ? "active" : ""}`}
                onClick={() => setActiveChartTab("TREND")}
              >
                Trend
              </button>
              <button 
                className={`chart-tab ${activeChartTab === "PERFORMANCE" ? "active" : ""}`}
                onClick={() => setActiveChartTab("PERFORMANCE")}
              >
                Performance
              </button>
            </div>
          </div>
          
          {activeChartTab === "TREND" ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#adb5bd", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#adb5bd" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip   content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#000000"
                  strokeWidth={4}
                  fill="url(#registrationGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#000000", stroke: "#fff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={performanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="eventName" tick={{ fontSize: 10, fill: "#adb5bd", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#adb5bd" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#adb5bd" }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#adb5bd", fontWeight: "bold", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="registrations" name="Total Registrations" barSize={30} fill="#111827" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="averageRating" name="Avg Rating (Out of 5)" stroke="#b4ff39" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
 
        <div className="ongoing-events-card">
          <div className="card-header-row">
            <h3>Ongoing Events</h3>
            <span className="ongoing-count">{dashData?.ongoingCount || 0}</span>
          </div>
          {ongoingByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ongoingByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#adb5bd", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#adb5bd" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip  
                  contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#adb5bd" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                  {ongoingByCategory.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry._id] || "#111827"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-message">
              <Activity size={32} strokeWidth={1.5} />
              <p>No ongoing events</p>
            </div>
          )}
          {dashData?.ongoingEvents?.length > 0 && (
            <div className="ongoing-list">
              {dashData.ongoingEvents.slice(0, 3).map((ev, i) => (
                <div key={i} className="ongoing-item">
                  <div className="ongoing-dot" style={{ background: CATEGORY_COLORS[ev.category] || "#111827" }} />
                  <div className="ongoing-info">
                    <span className="ongoing-name">{ev.title}</span>
                    <span className="ongoing-date">{formatDate(ev.eventDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="submissions-section">
        <div className="section-header">
          <h3>Recent Submissions</h3>
          <span className="review-all" onClick={() => navigate("/admin/approvals")}>
            Review All Requests
            <ChevronRight size={16} />
          </span>
        </div>
        <div className="table-container">
          {top5Submissions.length > 0 ? (
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
                {top5Submissions.map((sub) => (
                  <tr key={sub._id}>
                    <td className="tableData tableData event-name">{sub.title}</td>
                    <td className="tableData organizer-cell">
                      <div className="organizer-badge">
                        <span className="org-initials">{getInitials(sub.createdBy?.fullName)}</span>
                        {sub.createdBy?.fullName || "Unknown"}
                      </div>
                    </td>
                    <td className="tableData date-cell">{formatDate(sub.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="tableData actions-cell">
                      <button
                        className="actions-btn"
                        onClick={() => setActiveMenu(activeMenu === sub._id ? null : sub._id)}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <ActionMenu
                        show={activeMenu === sub._id}
                        onClose={() => setActiveMenu(null)}
                        onApprove={() => handleApproveEvent(sub._id)}
                        onReject={() => {
                          setRejectModal({ show: true, id: sub._id, type: "event" });
                          setActiveMenu(null);
                        }}
                        type="event"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-table-message">
              <Check size={32} />
              <p>No pending submissions. You're all caught up!</p>
            </div>
          )}
        </div>
        {pendingEvents.length > 0 && (
          <div className="table-footer">
            <span className="footer-count">{pendingEvents.length} total items awaiting your review.</span>
          </div>
        )}
      </div>

      <RejectModal
        show={rejectModal.show}
        onClose={() => setRejectModal({ show: false, id: null, type: null })}
        onSubmit={handleRejectEvent}
        title="Reject Event"
      />
    </div>
  );
};

export default Dashboard;
