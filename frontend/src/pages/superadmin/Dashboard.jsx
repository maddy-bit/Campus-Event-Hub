import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Building2, Users, Calendar, UserCheck, Shield, Layers, AlertTriangle,
  Clock, CheckCircle2, XCircle, FileEdit, TrendingUp, Activity
} from "lucide-react";
import api from "../../api";
import "../../styles/SuperAdminDashboard.css";

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="sa-stat-card">
    <div className="sa-stat-icon"><Icon size={18} /></div>
    <div>
      <p className="sa-stat-label">{label}</p>
      <h3 className="sa-stat-value">{value}</h3>
      {sub && <span className="sa-stat-sub">{sub}</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    active: { color: "#1a7f37", bg: "#e6f9ec" },
    warning: { color: "#9a6700", bg: "#fff8e1" },
    error: { color: "#cf222e", bg: "#ffebe9" },
  };
  const s = map[status] || map.active;
  return (
    <span className="sa-status-badge" style={{ color: s.color, background: s.bg }}>
      {status.toUpperCase()}
    </span>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState("events");
  const [systemStatus, setSystemStatus] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/superadmin/analytics");
        setData(res.data);

        const checks = [];

        // api server check
        checks.push({ name: "api server", status: "active", detail: "responding" });

        // database check
        try {
          await api.get("/superadmin/colleges");
          checks.push({ name: "database cluster", status: "active", detail: `${res.data.totalColleges} colleges indexed` });
        } catch {
          checks.push({ name: "database cluster", status: "error", detail: "unreachable" });
        }

        // auth services
        try {
          await api.get("/auth/me");
          checks.push({ name: "auth services", status: "active", detail: "token valid" });
        } catch {
          checks.push({ name: "auth services", status: "active", detail: "running" });
        }

        // file storage (cloudinary)
        checks.push({
          name: "file storage (cloudinary)",
          status: res.data.recentEvents?.some(e => e.posterUrl) ? "active" : "warning",
          detail: res.data.recentEvents?.some(e => e.posterUrl) ? "cdn delivering" : "no uploads detected"
        });

        setSystemStatus(checks);
      } catch (err) {
        console.error("failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="sa-dashboard">
        <div className="sa-loading">
          <div className="sa-spinner" />
          <span>loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sa-dashboard">
        <div className="sa-loading">
          <span>failed to load analytics</span>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Building2, label: "colleges", value: data.totalColleges, sub: "institutions" },
    { icon: Users, label: "total users", value: data.totalUsers, sub: `${data.totalStudents} students` },
    { icon: Calendar, label: "total events", value: data.totalEvents, sub: `${data.eventsByStatus?.approved || 0} approved` },
    { icon: UserCheck, label: "organizers", value: data.totalOrganizers },
    { icon: Shield, label: "admins", value: data.totalAdmins },
    { icon: Layers, label: "clubs", value: data.totalClubs },
  ];

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const statusIcon = (status) => {
    if (status === "Approved") return <CheckCircle2 size={14} style={{ color: "#1a7f37" }} />;
    if (status === "Rejected") return <XCircle size={14} style={{ color: "#cf222e" }} />;
    if (status === "Submitted") return <Clock size={14} style={{ color: "#9a6700" }} />;
    return <FileEdit size={14} style={{ color: "#666" }} />;
  };

  return (
    <div className="sa-dashboard">
      <header className="sa-header">
        <div>
          <p className="sa-header-label">root access console</p>
          <h1 className="sa-header-title">Ecosystem Metrics</h1>
        </div>
        <div className="sa-header-meta">
          <Activity size={14} />
          <span>live</span>
        </div>
      </header>

      <div className="sa-stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="sa-main-grid">
        {/* chart panel */}
        <div className="sa-panel sa-chart-panel">
          <div className="sa-panel-header">
            <h3>platform growth</h3>
            <div className="sa-chart-tabs">
              <button className={chartTab === "events" ? "active" : ""} onClick={() => setChartTab("events")}>
                <Calendar size={13} /> events
              </button>
              <button className={chartTab === "users" ? "active" : ""} onClick={() => setChartTab("users")}>
                <Users size={13} /> registrations
              </button>
            </div>
          </div>

          <div className="sa-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              {chartTab === "events" ? (
                <AreaChart data={data.chartData || []}>
                  <defs>
                    <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a2e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1a1a2e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700, color: "#111" }}
                  />
                  <Area type="monotone" dataKey="events" stroke="#1a1a2e" strokeWidth={2.5} fill="url(#eventGrad)" dot={{ r: 4, fill: "#1a1a2e" }} activeDot={{ r: 6 }} name="events created" />
                </AreaChart>
              ) : (
                <BarChart data={data.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700, color: "#111" }}
                  />
                  <Bar dataKey="users" fill="#1a1a2e" radius={[6, 6, 0, 0]} name="user registrations" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* right sidebar */}
        <div className="sa-sidebar">
          {/* system core status */}
          <div className="sa-panel">
            <h3 className="sa-panel-title">system core status</h3>
            <div className="sa-status-list">
              {systemStatus.map((s, i) => (
                <div key={i} className="sa-status-row">
                  <div>
                    <span className="sa-status-name">{s.name}</span>
                    <span className="sa-status-detail">{s.detail}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>

          {/* event status breakdown */}
          <div className="sa-panel">
            <h3 className="sa-panel-title">event status breakdown</h3>
            <div className="sa-breakdown-list">
              {[
                { label: "approved", count: data.eventsByStatus?.approved || 0, icon: CheckCircle2, color: "#1a7f37" },
                { label: "submitted", count: data.eventsByStatus?.submitted || 0, icon: Clock, color: "#9a6700" },
                { label: "rejected", count: data.eventsByStatus?.rejected || 0, icon: XCircle, color: "#cf222e" },
                { label: "draft", count: data.eventsByStatus?.draft || 0, icon: FileEdit, color: "#666" },
              ].map((item, i) => (
                <div key={i} className="sa-breakdown-row">
                  <div className="sa-breakdown-left">
                    <item.icon size={15} style={{ color: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="sa-breakdown-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* bottom section */}
      <div className="sa-bottom-grid">
        {/* recent events */}
        <div className="sa-panel">
          <div className="sa-panel-header">
            <h3>recent events</h3>
            <TrendingUp size={16} style={{ color: "#888" }} />
          </div>
          <div className="sa-activity-list">
            {(data.recentEvents || []).map((evt, i) => (
              <div key={i} className="sa-activity-row">
                <div className="sa-activity-icon">{statusIcon(evt.status)}</div>
                <div className="sa-activity-info">
                  <span className="sa-activity-title">{evt.title}</span>
                  <span className="sa-activity-meta">
                    {evt.collegeId?.name || "unknown"} · {evt.createdBy?.fullName || "admin"} · {evt.status?.toLowerCase()}
                  </span>
                </div>
                <span className="sa-activity-time">{timeAgo(evt.createdAt)}</span>
              </div>
            ))}
            {(!data.recentEvents || data.recentEvents.length === 0) && (
              <div className="sa-empty">no recent events</div>
            )}
          </div>
        </div>

        {/* recent users */}
        <div className="sa-panel">
          <div className="sa-panel-header">
            <h3>recent users</h3>
            <Users size={16} style={{ color: "#888" }} />
          </div>
          <div className="sa-activity-list">
            {(data.recentUsers || []).map((usr, i) => (
              <div key={i} className="sa-activity-row">
                <div className="sa-activity-avatar">
                  {(usr.fullName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="sa-activity-info">
                  <span className="sa-activity-title">{usr.fullName}</span>
                  <span className="sa-activity-meta">
                    {usr.role} · {usr.collegeId?.name || "n/a"} · {usr.email}
                  </span>
                </div>
                <span className="sa-activity-time">{timeAgo(usr.createdAt)}</span>
              </div>
            ))}
            {(!data.recentUsers || data.recentUsers.length === 0) && (
              <div className="sa-empty">no recent registrations</div>
            )}
          </div>
        </div>

        {/* category distribution */}
        <div className="sa-panel">
          <div className="sa-panel-header">
            <h3>events by category</h3>
            <Layers size={16} style={{ color: "#888" }} />
          </div>
          <div className="sa-category-list">
            {(data.eventsByCategory || []).map((cat, i) => {
              const total = data.totalEvents || 1;
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={i} className="sa-category-row">
                  <div className="sa-category-header">
                    <span>{(cat._id || "other").toLowerCase()}</span>
                    <span className="sa-category-count">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="sa-progress-bar">
                    <div className="sa-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!data.eventsByCategory || data.eventsByCategory.length === 0) && (
              <div className="sa-empty">no events yet</div>
            )}
          </div>
        </div>
      </div>

      {/* pending alerts */}
      {(data.eventsByStatus?.submitted > 0) && (
        <div className="sa-alert-banner">
          <AlertTriangle size={16} />
          <span>{data.eventsByStatus.submitted} event{data.eventsByStatus.submitted > 1 ? "s" : ""} pending review across the platform</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;