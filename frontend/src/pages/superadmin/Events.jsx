import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Calendar, MapPin, MoreVertical, Box, Music, Tent,
  X, Check, Edit2, Upload, Search, Filter, DollarSign
} from "lucide-react";
import api from "../../api";
import { toast } from "sonner";

const CATEGORY_ICONS = {
  Competition: Box, Conference: Tent, Workshop: Box,
  Seminar: Tent, Sports: Tent, Cultural: Music, Other: Box,
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
    <div ref={menuRef} className="absolute right-0 bottom-full mb-2 bg-white rounded-xl p-2 shadow-xl border border-gray-200 w-44 z-50">
      <button
        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-semibold text-blue-600 flex items-center gap-2"
        onClick={() => { onEditEvent(); onClose(); }}
      >
        <Edit2 size={16} /> Edit Event
      </button>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status:</span>
        {["Approved", "Submitted", "Draft", "Rejected"].map(status => (
          <button key={status}
            className={`w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2 ${currentStatus === status ? "text-gray-900 bg-slate-50" : "text-gray-600"}`}
            onClick={() => { if (currentStatus !== status) onEditStatus(status); onClose(); }}
          >
            <div className="w-4 flex justify-center">
              {currentStatus === status && <Check size={14} className="text-black" />}
            </div>
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

const EventCard = ({ event, onStatusChange, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = CATEGORY_ICONS[event?.category] || Box;

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try { return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return "N/A"; }
  };

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Draft: "bg-slate-100 text-slate-700 border-slate-200",
    Submitted: "bg-amber-100 text-amber-700 border-amber-200"
  };

  const authorName = typeof event?.createdBy === "object" && event.createdBy?.fullName
    ? event.createdBy.fullName.split(" ")[0] : "Admin";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col overflow-hidden group">
      <div
        className="h-48 bg-slate-50 relative flex items-center justify-center text-slate-300 bg-cover bg-center"
        style={event?.posterUrl ? { backgroundImage: `url(${event.posterUrl})` } : {}}
      >
        {!event?.posterUrl && <Icon size={48} className="opacity-50" />}
        <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${statusStyle[event?.status] || statusStyle.Submitted}`}>
          {event?.status || "Unknown"}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
            {event?.category || "General"}
          </span>
          {event?.isPaidEvent && (
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <DollarSign size={12} /> {event.ticketPrice}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4 group-hover:text-black transition-colors line-clamp-2">
          {event?.title || "Untitled Event"}
        </h3>

        <div className="space-y-2 mb-5 flex-1">
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <Calendar size={14} />
            </div>
            <span className="truncate">{formatDate(event?.eventDate)} {event?.startTime && `• ${event.startTime}`}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <MapPin size={14} />
            </div>
            <span className="truncate">{event?.location || "TBA"} ({event?.collegeId?.name || "Unknown College"})</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-900">By {authorName}</span>
          </div>
          <div className="relative">
            <button className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors" onClick={() => setShowMenu(true)}>
              <MoreVertical size={16} />
            </button>
            <ActionMenu show={showMenu} onClose={() => setShowMenu(false)} currentStatus={event?.status}
              onEditStatus={(s) => onStatusChange(event._id, s)} onEditEvent={() => onEdit(event)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ show, onClose, onSuccess, initialData }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "", category: "Competition", location: "", description: "",
    eventDate: "", startTime: "", endTime: "", registrationDeadline: "",
    maxSeats: 100, isPaidEvent: false, ticketPrice: 0, isPublic: true
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData({
          title: initialData.title || "", category: initialData.category || "Competition",
          location: initialData.location || "", description: initialData.description || "",
          eventDate: initialData.eventDate ? new Date(initialData.eventDate).toISOString().split("T")[0] : "",
          startTime: initialData.startTime || "", endTime: initialData.endTime || "",
          registrationDeadline: initialData.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().split("T")[0] : "",
          maxSeats: initialData.maxSeats || 100, isPaidEvent: initialData.isPaidEvent || false,
          ticketPrice: initialData.ticketPrice || 0, isPublic: initialData.isPublic !== false
        });
        setPosterPreview(initialData.posterUrl || null);
      } else {
        setFormData({ title: "", category: "Competition", location: "", description: "", eventDate: "", startTime: "", endTime: "", registrationDeadline: "", maxSeats: 100, isPaidEvent: false, ticketPrice: 0, isPublic: true });
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
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be under 5 MB"); return; }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };
  const removePoster = () => {
    setPosterFile(null); setPosterPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      if (posterFile) payload.append("poster", posterFile);
      if (initialData) {
        await api.put(`/superadmin/events/${initialData._id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Event updated successfully");
      }
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save event");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            Edit Event
          </h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Poster</label>
            {posterPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100">
                <img src={posterPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={removePoster} className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-lg">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="h-48 rounded-2xl border-2 border-dashed border-slate-300 hover:border-black hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Upload size={20} /></div>
                <div className="text-sm font-medium text-slate-500">Click to upload poster (Max 5MB)</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" placeholder="Enter title..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white">
                  {["Competition", "Conference", "Workshop", "Seminar", "Sports", "Cultural", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Deadline</label>
                <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Seats</label>
                <input type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} required min="1" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isPaidEvent" checked={formData.isPaidEvent} onChange={handleChange} className="w-5 h-5 rounded" />
                <span className="text-sm font-bold text-gray-700">Paid Event</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-5 h-5 rounded" />
                <span className="text-sm font-bold text-gray-700">Open to Other Colleges</span>
              </label>
            </div>
            {formData.isPaidEvent && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ticket Price (₹)</label>
                <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="0" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10 transition-all disabled:opacity-70 flex items-center justify-center min-w-[140px]">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Changes"}
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
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/events");
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Fetch events error:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/superadmin/events/${id}`, { status: newStatus });
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

  const filteredEvents = (events || []).filter(e => {
    if (!e) return false;
    const matchesSearch = (e.title || "").toLowerCase().includes(search.toLowerCase()) || (e.location || "").toLowerCase().includes(search.toLowerCase()) || (e.collegeId?.name || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (category !== "All" && e.category !== category) return false;
    try {
      if (activeTab === "Upcoming") return e.eventDate && new Date(e.eventDate) >= new Date();
      if (activeTab === "Drafts") return e.status === "Draft";
      if (activeTab === "Completed") return e.eventDate && new Date(e.eventDate) < new Date();
    } catch { return false; }
    return true;
  });

  return (
    <div className="pb-24 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-1 block">Platform Management</span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">All College Events</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {["All Events", "Upcoming", "Drafts", "Completed"].map(tab => (
            <button key={tab}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? "bg-slate-100 text-black shadow-sm" : "text-slate-500 hover:text-black hover:bg-slate-50"}`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search events or college..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center px-3 py-1.5">
            <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none w-full py-1 cursor-pointer appearance-none">
              {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
          <span className="font-semibold">Loading events...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-5">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">No events match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} onStatusChange={handleStatusChange} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {editingEvent && <EventModal show={showModal} onClose={() => { setShowModal(false); setEditingEvent(null); }}
        onSuccess={fetchEvents} initialData={editingEvent} />}
    </div>
  );
};

export default Events;
