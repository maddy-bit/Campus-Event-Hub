import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Box,
  Music,
  Tent,
  X,
  Check
} from "lucide-react";
import api from "../../api";
import { toast } from "sonner";
import "../../styles/AdminEvents.css";

const CATEGORY_ICONS = {
  Competition: Box,
  Conference: Tent,
  Workshop: Box,
  Seminar: Tent,
  Sports: Tent,
  Cultural: Music,
  Other: Box,
};

const ActionMenu = ({ show, onClose, onEditStatus, currentStatus }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div ref={menuRef} className="events-dropdown-menu">
      <div className="dropdown-label">Change Status:</div>
      {["Approved", "Submitted", "Draft", "Rejected"].map(status => (
        <button
          key={status}
          className={`dropdown-item ${currentStatus === status ? "active" : ""}`}
          onClick={() => {
            if (currentStatus !== status) onEditStatus(status);
            onClose();
          }}
        >
          {currentStatus === status && <Check size={14} />}
          <span style={{ marginLeft: currentStatus !== status ? "22px" : "8px" }}>
            {status}
          </span>
        </button>
      ))}
    </div>
  );
};

const EventCard = ({ event, onStatusChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = CATEGORY_ICONS[event.category] || Box;

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === "approved") return "active";
    if (s === "rejected") return "rejected";
    if (s === "draft") return "draft";
    return "pending";
  };

  return (
    <div className="event-card">
      <div className="card-image-area">
        <Icon size={48} />
        <span className={`status-badge ${getStatusClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      <div className="card-content">
        <div className="event-category-tags">{event.category}</div>
        <h3 className="event-title">{event.title}</h3>

        <div className="info-item">
          <Calendar size={16} />
          <span>{formatDate(event.eventDate)} {event.startTime && `• ${event.startTime}`}</span>
        </div>
        <div className="info-item">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>

        <div className="card-footer">
          <div className="participant-avatars">
            {/* If we had participants array we'd map it here. For now just show who created it */}
            <div className="avatar-circle" style={{ width: "auto", padding: "0 8px", borderRadius: "8px" }}>
              By {event.createdBy?.fullName?.split(" ")[0] || "Admin"}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button className="more-btn" onClick={() => setShowMenu(true)}>
              <MoreHorizontal size={18} />
            </button>
            <ActionMenu
              show={showMenu}
              onClose={() => setShowMenu(false)}
              currentStatus={event.status}
              onEditStatus={(status) => onStatusChange(event._id, status)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Competition",
    location: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    registrationDeadline: "",
    maxSeats: 100,
    isPaidEvent: false,
    ticketPrice: 0,
    isPublic: true
  });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/admin/events", formData);
      toast.success("Event created successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Create New Event</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {["Competition", "Conference", "Workshop", "Seminar", "Sports", "Cultural", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Event Date</label>
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Max Seats</label>
              <input type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create & Approve Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [activeTab, setActiveTab] = useState("All Events");
  const [category, setCategory] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/events");
      setEvents(res.data.events || []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/events/${id}`, { status: newStatus });
      toast.success(`Event marked as ${newStatus}`);
      fetchEvents();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const categories = ["All", "Competition", "Conference", "Workshop", "Seminar", "Sports", "Cultural", "Other"];

  // Filtering
  const filteredEvents = events.filter(e => {
    if (category !== "All" && e.category !== category) return false;
    if (activeTab === "Upcoming") return new Date(e.eventDate) >= new Date();
    if (activeTab === "Drafts") return e.status === "Draft";
    if (activeTab === "Completed") return new Date(e.eventDate) < new Date();
    return true; // "All Events"
  });

  return (
    <div className="admin-events-page">
      <header className="events-header">
        <div className="header-left">
          <div className="management-label">Event Management</div>
          <h1>Explore Events</h1>
        </div>
        <button className="create-event-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Create Event
        </button>
      </header>

      <div className="filters-row">
        <div className="tabs-container">
          {["All Events", "Upcoming", "Drafts", "Completed"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="dropdowns-container">
          <div className="filter-dropdown-wrapper">
            <label className="dropdown-label">Category:</label>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">No events found matching your criteria.</div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <EventModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchEvents}
      />
    </div>
  );
};

export default Events;
