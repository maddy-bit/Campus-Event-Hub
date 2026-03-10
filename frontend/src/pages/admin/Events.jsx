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
  Check,
  Edit2,
  Upload,
  Image as ImageIcon
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

const ActionMenu = ({ show, onClose, onEditStatus, onEditEvent, currentStatus }) => {
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
      <button
        className="dropdown-item"
        style={{ color: "#3b82f6", marginBottom: "0.5rem" }}
        onClick={() => {
          onEditEvent();
          onClose();
        }}
      >
        <Edit2 size={14} />
        <span style={{ marginLeft: "8px" }}>Edit Event</span>
      </button>
      
      <div className="dropdown-label" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.5rem" }}>Change Status:</div>
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

const EventCard = ({ event, onStatusChange, onEdit }) => {
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
      <div className="card-image-area" style={{ backgroundImage: event.posterUrl ? `url(${event.posterUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {!event.posterUrl && <Icon size={48} />}
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
              onEditEvent={() => onEdit(event)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ show, onClose, onSuccess, initialData }) => {
  const fileInputRef = useRef(null);
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
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          category: initialData.category || "Competition",
          location: initialData.location || "",
          description: initialData.description || "",
          eventDate: initialData.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : "",
          startTime: initialData.startTime || "",
          endTime: initialData.endTime || "",
          registrationDeadline: initialData.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().split('T')[0] : "",
          maxSeats: initialData.maxSeats || 100,
          isPaidEvent: initialData.isPaidEvent || false,
          ticketPrice: initialData.ticketPrice || 0,
          isPublic: initialData.isPublic !== false
        });
        setPosterPreview(initialData.posterUrl || null);
      } else {
        setFormData({
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
        setPosterPreview(null);
      }
      setPosterFile(null);
    }
  }, [show, initialData]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const removePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });
      if (posterFile) {
        payload.append("poster", posterFile);
      }

      if (initialData) {
        await api.put(`/admin/events/${initialData._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Event updated successfully");
      } else {
        await api.post("/admin/events", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Event created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ overflowY: "auto", padding: "2rem 0" }}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ margin: "auto" }}>
        <div className="admin-modal-header">
          <h3>{initialData ? "Edit Event" : "Create New Event"}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal-form">
          
          <div className="input-group" style={{ marginBottom: "1.5rem" }}>
            <label style={{display: "block", marginBottom: "0.5rem", fontWeight: "600"}}>Event Poster</label>
            {posterPreview ? (
              <div style={{ position: "relative", display: "inline-block", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <img src={posterPreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", display: "block", objectFit: "cover" }} />
                <button type="button" onClick={removePoster} className="close-btn" style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,0.8)", borderRadius: "4px", padding: "4px" }}>
                  <X size={16} color="#000" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}>
                <Upload size={24} color="#64748b" style={{ margin: "0 auto 0.5rem" }} />
                <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Click to upload poster (Max 5MB)</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

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

          <div className="form-row" style={{ marginTop: "1rem", gap: "2rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600" }}>
              <input type="checkbox" name="isPaidEvent" checked={formData.isPaidEvent} onChange={handleChange} />
              Paid Event
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600" }}>
              <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} />
              Open to Other Colleges
            </label>
          </div>

          {formData.isPaidEvent && (
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Ticket Price (₹)</label>
              <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="0" required />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : initialData ? "Update Event" : "Create & Approve"}
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
  const [editingEvent, setEditingEvent] = useState(null);

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

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
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
        <button className="create-event-btn" onClick={() => { setEditingEvent(null); setShowModal(true); }}>
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
            <EventCard 
              key={event._id} 
              event={event} 
              onStatusChange={handleStatusChange} 
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <EventModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingEvent(null); }}
        onSuccess={fetchEvents}
        initialData={editingEvent}
      />
    </div>
  );
};

export default Events;
