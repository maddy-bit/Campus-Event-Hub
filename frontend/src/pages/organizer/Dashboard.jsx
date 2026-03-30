import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Clock,
  Users,
  AlertCircle,
  PlusCircle,
  UserSearch,
  Bell,
  BarChart3,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Activity,
  Sparkles,
  ChevronRight,
  Download,
} from "lucide-react";
import api from "../../api";
import "./OrganizerDashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events/my-events");
        const events = res.data.events || [];
        const today = new Date();

        const activeEvents = events.filter(
          (e) => e.status === "Approved"
        ).length;

        const upcomingEvents = events.filter(
          (e) => new Date(e.eventDate) > today && e.status === "Approved"
        );

        const totalParticipants = events.reduce(
          (sum, e) => sum + (e.seatsFilled || 0),
          0
        );

        const pendingEvents = events.filter(
          (e) => e.status === "Draft" || e.status === "Submitted"
        ).length;

        const top5 = [...events]
          .filter((e) => e.status === "Approved")
          .sort((a, b) => (b.seatsFilled || 0) - (a.seatsFilled || 0))
          .slice(0, 5);

        const recentEvents = [...events]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        setDashboardData({
          activeEvents,
          upcomingEvents,
          totalParticipants,
          pendingEvents,
          top5,
          recentEvents,
          totalEvents: events.length,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Fallback to empty state
        setDashboardData({
          activeEvents: 0,
          upcomingEvents: [],
          totalParticipants: 0,
          pendingEvents: 0,
          top5: [],
          recentEvents: [],
          totalEvents: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container px-3 sm:px-5 md:px-8">
        <div className="db-loading-state">
          <div className="db-loading-spinner"></div>
          <p>SYNCING_DASHBOARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container px-3 sm:px-5 md:px-8">
      {/* ── HEADER ── */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-header-tag">
            <Zap size={10} fill="currentColor" />
            CONTROL_CENTER
          </div>
          <h1 className="db-title">
            ORGANIZER
            <span className="db-title-accent">_DB</span>
          </h1>
          <p className="db-subtitle">
            {dashboardData.totalEvents} events tracked · Real-time sync
          </p>
        </div>
        <div className="db-header-right">
          <div className="db-live-indicator">
            <span className="db-live-dot"></span>
            LIVE
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stats-row">
        <div className="card green">
          <div className="card-pattern"></div>
          <div className="card-icon-wrapper card-icon-green">
            <CalendarCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="card-content">
            <h3>ACTIVE EVENTS</h3>
            <p>{dashboardData.activeEvents}</p>
            <span className="card-meta">
              <ArrowUpRight size={12} /> Approved &amp; live
            </span>
          </div>
          <div className="card-accent-bar card-accent-green"></div>
        </div>

        <div className="card blue">
          <div className="card-pattern"></div>
          <div className="card-icon-wrapper card-icon-blue">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <div className="card-content">
            <h3>UPCOMING</h3>
            <p>{dashboardData.upcomingEvents.length}</p>
            <span className="card-meta">
              <Activity size={12} /> Scheduled ahead
            </span>
          </div>
          <div className="card-accent-bar card-accent-blue"></div>
        </div>

        <div className="card yellow">
          <div className="card-pattern"></div>
          <div className="card-icon-wrapper card-icon-yellow">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <div className="card-content">
            <h3>PARTICIPANTS</h3>
            <p>{dashboardData.totalParticipants}</p>
            <span className="card-meta">
              <TrendingUp size={12} /> Total registrations
            </span>
          </div>
          <div className="card-accent-bar card-accent-yellow"></div>
        </div>

        <div className="card red">
          <div className="card-pattern"></div>
          <div className="card-icon-wrapper card-icon-red">
            <AlertCircle size={20} strokeWidth={2.5} />
          </div>
          <div className="card-content">
            <h3>PENDING</h3>
            <p>{dashboardData.pendingEvents}</p>
            <span className="card-meta">
              <Sparkles size={12} /> Awaiting approval
            </span>
          </div>
          <div className="card-accent-bar card-accent-red"></div>
        </div>
      </div>

      {/* ── BOTTOM PANELS ── */}
      <div className="bottom-section">
        {/* Upcoming Queue */}
        <div className="panel">
          <div className="panel-header blue-header">
            <div className="panel-header-left">
              <Clock size={14} strokeWidth={3} />
              <span>UPCOMING_QUEUE</span>
            </div>
            <span className="panel-badge">{dashboardData.upcomingEvents.length}</span>
          </div>

          <div className="panel-content">
            {dashboardData.upcomingEvents.length === 0 ? (
              <div className="db-empty-state">
                <p>NO_UPCOMING_EVENTS</p>
                <span>Create a new event to get started</span>
              </div>
            ) : (
              dashboardData.upcomingEvents.slice(0, 5).map((event, i) => (
                <div key={event._id || i} className="queue-item">
                  <div className="queue-item-left">
                    <div className="queue-index">{String(i + 1).padStart(2, "0")}</div>
                    <div className="queue-info">
                      <span className="queue-title">{event.title}</span>
                      <span className="queue-date">{formatDate(event.eventDate)}</span>
                    </div>
                  </div>
                  <div className="queue-seats">
                    <div className="queue-seats-bar">
                      <div
                        className="queue-seats-fill"
                        style={{
                          width: `${Math.min(100, ((event.seatsFilled || 0) / (event.maxSeats || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="queue-seats-text">
                      {event.seatsFilled || 0}/{event.maxSeats}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <div className="panel-header yellow-header">
            <div className="panel-header-left">
              <Zap size={14} strokeWidth={3} />
              <span>QUICK_ACTIONS</span>
            </div>
          </div>

          <div className="panel-content actions">
            <Link to="/organizer/create-event" className="action-btn">
              <div className="action-btn-icon action-icon-green">
                <PlusCircle size={18} />
              </div>
              <span>Create New Event</span>
              <ChevronRight size={14} className="action-arrow" />
            </Link>
            <Link to="/organizer/view-participants" className="action-btn">
              <div className="action-btn-icon action-icon-blue">
                <UserSearch size={18} />
              </div>
              <span>Manage Participants</span>
              <ChevronRight size={14} className="action-arrow" />
            </Link>
            <Link to="/organizer/notifications" className="action-btn">
              <div className="action-btn-icon action-icon-yellow">
                <Bell size={18} />
              </div>
              <span>Send Notifications</span>
              <ChevronRight size={14} className="action-arrow" />
            </Link>
            <Link to="/organizer/myevents" className="action-btn">
              <div className="action-btn-icon action-icon-purple">
                <BarChart3 size={18} />
              </div>
              <span>View All Events</span>
              <ChevronRight size={14} className="action-arrow" />
            </Link>
          </div>
        </div>

        {/* Top Events Insights */}
        <div className="panel">
          <div className="panel-header blue-header">
            <div className="panel-header-left">
              <TrendingUp size={14} strokeWidth={3} />
              <span>TOP_EVENTS</span>
            </div>
            <span className="panel-badge panel-badge-dark">TOP 5</span>
          </div>

          <div className="panel-content">
            {dashboardData.top5.length === 0 ? (
              <div className="db-empty-state">
                <p>NO_DATA_YET</p>
                <span>Insights will appear after events are created</span>
              </div>
            ) : (
              <>
                {dashboardData.top5.map((event, i) => (
                  <div key={event._id || i} className="insight-item">
                    <div className="insight-rank">
                      {i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </div>
                    <div className="insight-info">
                      <span className="insight-title">{event.title}</span>
                      <span className="insight-cat">{event.category}</span>
                    </div>
                    <div className="insight-count">{event.seatsFilled || 0}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      {dashboardData.recentEvents.length > 0 && (
        <div className="db-recent-section">
          <div className="db-recent-header">
            <Activity size={14} strokeWidth={3} />
            <span>RECENT_EVENTS</span>
          </div>
          <div className="db-recent-grid">
            {dashboardData.recentEvents.map((event, i) => (
              <div key={event._id || i} className="db-recent-card">
                <div className="db-recent-card-stripe" data-status={event.status?.toLowerCase()}></div>
                <div className="db-recent-card-body">
                  <div className="db-recent-card-top">
                    <span className={`db-status-pill db-status-${event.status?.toLowerCase()}`}>
                      {event.status}
                    </span>
                    <span className="db-recent-date">{formatDate(event.eventDate)}</span>
                  </div>
                  <h4 className="db-recent-title">{event.title}</h4>
                  <div className="db-recent-meta">
                    <span>{event.category}</span>
                    <span>·</span>
                    <span>{event.seatsFilled || 0} registered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;