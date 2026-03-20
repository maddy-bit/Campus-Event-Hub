import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  UserPlus,
  KeyRound,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Filter,
} from "lucide-react";
import api from "../../api";
import "../../styles/AdminApprovals.css";

const TABS = [
  { key: "events", label: "Event Approvals", icon: CalendarDays },
  { key: "promotions", label: "Student to Organizer", icon: UserPlus },
  { key: "access", label: "Event Access Requests", icon: KeyRound },
  { key: "students", label: "Student Registrations", icon: UserPlus },
];

const ITEMS_PER_PAGE = 6;

const ActionMenu = ({ show, onClose, onApprove, onReject, type }) => {
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

  const approveLabel = type === "promotions" ? "Promote to Organizer" : type === "access" ? "Grant Access" : "Approve Event";
  const rejectLabel = type === "promotions" ? "Deny" : type === "access" ? "Reject Request" : "Reject";

  return (
    <div ref={menuRef} className="approval-action-dropdown">
      <button className="approval-dropdown-item approve" onClick={onApprove}>
        <Check size={14} />
        {approveLabel}
      </button>
      <button className="approval-dropdown-item reject" onClick={onReject}>
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
    <div className="approval-modal-overlay" onClick={onClose}>
      <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title || "Rejection Reason"}</h3>
        <p className="approval-modal-desc">
          Please provide a reason. This will be sent as a notification to the User.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter the reason for rejection..."
          rows={4}
          className="approval-modal-textarea"
        />
        <div className="approval-modal-actions">
          <button className="approval-modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="approval-modal-submit"
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

const Approvals = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, tab: null });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
    setActiveMenu(null);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, promotionsRes, accessRes, studentsRes] = await Promise.all([
        api.get("/admin/events/pending"),
        api.get("/admin/promotions/pending"),
        api.get("/admin/access-requests/pending"),
        api.get("/admin/students/pending"),
      ]);
      setEvents(eventsRes.data.events || []);
      setPromotions(promotionsRes.data.promotions || []);
      setAccessRequests(accessRes.data.accessRequests || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error("Approvals fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Event actions
  const handleApproveEvent = async (id) => {
    try {
      await api.patch(`/admin/events/${id}/approve`);
      setActiveMenu(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleRejectEvent = async (reason) => {
    try {
      await api.patch(`/admin/events/${rejectModal.id}/reject`, { reason });
      closeRejectModal();
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Promotion actions
  const handleApprovePromotion = async (id) => {
    try {
      await api.patch(`/admin/promotions/${id}/approve`);
      setActiveMenu(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDenyPromotion = async (reason) => {
    try {
      await api.patch(`/admin/promotions/${rejectModal.id}/deny`, { reason });
      closeRejectModal();
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Access request actions
  const handleGrantAccess = async (id) => {
    try {
      await api.patch(`/admin/access-requests/${id}/grant`);
      setActiveMenu(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleRejectAccess = async (reason) => {
    try {
      await api.patch(`/admin/access-requests/${rejectModal.id}/reject`, { reason });
      closeRejectModal();
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Student actions
  const handleApproveStudent = async (id) => {
    try {
      await api.patch(`/admin/students/${id}/approve`);
      setActiveMenu(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleRejectStudent = async (reason) => {
    try {
      await api.patch(`/admin/students/${rejectModal.id}/reject`, { reason });
      closeRejectModal();
      fetchData();
    } catch (err) { console.error(err); }
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, id: null, tab: null });
    setActiveMenu(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Get current data based on tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "events": return events;
      case "promotions": return promotions;
      case "access": return accessRequests;
      case "students": return students;
      default: return [];
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
  const paginatedData = currentData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getTabCount = (key) => {
    switch (key) {
      case "events": return events.length;
      case "promotions": return promotions.length;
      case "access": return accessRequests.length;
      case "students": return students.length;
      default: return 0;
    }
  };

  const getRejectModalTitle = () => {
    switch (rejectModal.tab) {
      case "events": return "Reject Event";
      case "promotions": return "Deny Promotion Request";
      case "access": return "Reject Access Request";
      case "students": return "Reject Registration";
      default: return "Rejection Reason";
    }
  };

  const handleRejectSubmit = (reason) => {
    switch (rejectModal.tab) {
      case "events": return handleRejectEvent(reason);
      case "promotions": return handleDenyPromotion(reason);
      case "access": return handleRejectAccess(reason);
      case "students": return handleRejectStudent(reason);
    }
  };

  const handleApprove = (id) => {
    switch (activeTab) {
      case "events": return handleApproveEvent(id);
      case "promotions": return handleApprovePromotion(id);
      case "access": return handleGrantAccess(id);
      case "students": return handleApproveStudent(id);
    }
  };

  const renderEventRow = (event) => (
    <tr key={event._id} className="approval-row">
      <td>
        <div className="requester-info">
          <div className="requester-avatar" style={{ background: "#6366f115", color: "#6366f1" }}>
            {getInitials(event.title)}
          </div>
          <div className="requester-details">
            <span className="requester-name">{event.title}</span>
            <span className="requester-sub">By: {event.createdBy?.fullName || "Unknown"}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="detail-block">
          <span className="detail-primary">{event.category} • {event.maxSeats ? `${event.maxSeats} Seats` : "Open"}</span>
          <span className="detail-secondary">
            <MapPin size={12} />
            Venue: {event.location}
          </span>
        </div>
      </td>
      <td>
        <div className="date-block">
          <span className="date-primary">{formatDate(event.createdAt)}</span>
          <span className="date-secondary">{formatTime(event.createdAt)}</span>
        </div>
      </td>
      <td className="actions-cell">
        <button
          className="approval-more-btn reject-text"
          onClick={() => {
            setRejectModal({ show: true, id: event._id, tab: "events" });
            setActiveMenu(null);
          }}
        >
          Reject
        </button>
        <button
          className="approval-action-primary"
          onClick={() => handleApproveEvent(event._id)}
        >
          Approve Event
        </button>
      </td>
    </tr>
  );

  const renderPromotionRow = (user) => (
    <tr key={user._id} className="approval-row">
      <td>
        <div className="requester-info">
          <div className="requester-avatar" style={{ background: "#f59e0b15", color: "#f59e0b" }}>
            {getInitials(user.fullName)}
          </div>
          <div className="requester-details">
            <span className="requester-name">{user.fullName}</span>
            <span className="requester-sub">Student ID: #{user._id?.slice(-5).toUpperCase()}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="detail-block quote">
          <span className="detail-quote">
            "{user.promotionRequest?.reason || "Seeking organizer role to manage events."}"
          </span>
        </div>
      </td>
      <td>
        <div className="date-block">
          <span className="date-primary">{formatDate(user.promotionRequest?.requestedAt || user.createdAt)}</span>
          <span className="date-secondary">{formatTime(user.promotionRequest?.requestedAt || user.createdAt)}</span>
        </div>
      </td>
      <td className="actions-cell">
        <button
          className="approval-more-btn reject-text"
          onClick={() => {
            setRejectModal({ show: true, id: user._id, tab: "promotions" });
            setActiveMenu(null);
          }}
        >
          Deny
        </button>
        <button
          className="approval-action-primary promote"
          onClick={() => handleApprovePromotion(user._id)}
        >
          Promote to Organizer
        </button>
      </td>
    </tr>
  );

  const renderAccessRow = (req) => (
    <tr key={req._id} className="approval-row">
      <td>
        <div className="requester-info">
          <div className="requester-avatar" style={{ background: "#10b98115", color: "#10b981" }}>
            {getInitials(req.userId?.fullName)}
          </div>
          <div className="requester-details">
            <span className="requester-name">{req.userId?.fullName || "Unknown"}</span>
            <span className="requester-sub">Requesting access to: {req.eventId?.title || "Unknown Event"}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="detail-block quote">
          <span className="detail-quote">
            "{req.userId?.department ? `${req.userId.department} student. ` : ""}Requesting event access."
          </span>
        </div>
      </td>
      <td>
        <div className="date-block">
          <span className="date-primary">{formatDate(req.createdAt)}</span>
          <span className="date-secondary">{formatTime(req.createdAt)}</span>
        </div>
      </td>
      <td className="actions-cell">
        <button
          className="approval-more-btn reject-text"
          onClick={() => {
            setRejectModal({ show: true, id: req._id, tab: "access" });
            setActiveMenu(null);
          }}
        >
          Reject Request
        </button>
        <button
          className="approval-action-primary grant"
          onClick={() => handleGrantAccess(req._id)}
        >
          Grant Access
        </button>
      </td>
    </tr>
  );

  const renderStudentRow = (student) => (
    <tr key={student._id} className="approval-row">
      <td>
        <div className="requester-info">
          <div className="requester-avatar" style={{ background: "#8b5cf615", color: "#8b5cf6" }}>
            {getInitials(student.fullName)}
          </div>
          <div className="requester-details">
            <span className="requester-name">{student.fullName}</span>
            <span className="requester-sub">{student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="detail-block">
          <span className="detail-primary">{student.department}</span>
          <span className="detail-secondary">Year: {student.yearOfStudy}</span>
        </div>
      </td>
      <td>
        <div className="date-block">
          <span className="date-primary">{formatDate(student.createdAt)}</span>
          <span className="date-secondary">{formatTime(student.createdAt)}</span>
        </div>
      </td>
      <td className="actions-cell">
        <button
          className="approval-more-btn reject-text"
          onClick={() => {
            setRejectModal({ show: true, id: student._id, tab: "students" });
            setActiveMenu(null);
          }}
        >
          Reject
        </button>
        <button
          className="approval-action-primary"
          onClick={() => handleApproveStudent(student._id)}
        >
          Approve Student
        </button>
      </td>
    </tr>
  );

  const renderRow = (item) => {
    switch (activeTab) {
      case "events": return renderEventRow(item);
      case "promotions": return renderPromotionRow(item);
      case "access": return renderAccessRow(item);
      case "students": return renderStudentRow(item);
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="approvals-page">
        <div className="approvals-loading">
          <div className="approvals-spinner" />
          <span>Loading approvals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-page">
      <div className="approvals-header">
        <div className="approvals-header-left">
          <span className="approvals-breadcrumb">Review Queue</span>
          <h1>Pending Approvals</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="approvals-tabs">
        {TABS.map((tab) => {
          const count = getTabCount(tab.key);
          return (
            <button
              key={tab.key}
              className={`approval-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="approvals-table-container">
        <table className="approvals-table">
          <thead>
            <tr>
              <th>REQUESTER / TARGET</th>
              <th>DETAILS</th>
              <th>SUBMISSION DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map(renderRow)
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="approvals-empty">
                    <Check size={36} strokeWidth={1.5} />
                    <p>No pending {activeTab === "events" ? "event approvals" : activeTab === "promotions" ? "promotion requests" : activeTab === "access" ? "access requests" : "student registrations"}.</p>
                    <span>You're all caught up!</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {currentData.length > 0 && (
        <div className="approvals-pagination">
          <span className="pagination-info">
            {currentData.length} total items awaiting your review.
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <RejectModal
        show={rejectModal.show}
        onClose={closeRejectModal}
        onSubmit={handleRejectSubmit}
        title={getRejectModalTitle()}
      />
    </div>
  );
};

export default Approvals;
