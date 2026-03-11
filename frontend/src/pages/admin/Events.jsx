import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  MoreVertical,
  Box,
  Music,
  Tent,
  X,
  Check,
  Edit2,
  Upload,
  Search,
  Filter,
  DollarSign
} from "lucide-react";
import api from "../../api";
import { toast } from "sonner";

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
    <div ref={menuRef} className="absolute right-0 bottom-full mb-2 bg-white rounded-xl p-2 shadow-xl border border-gray-200 w-44 z-50">
      <button
        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-semibold text-blue-600 flex items-center gap-2 transition-colors"
        onClick={() => {
          onEditEvent();
          onClose();
        }}
      >
        <Edit2 size={16} />
        Edit Event
      </button>
      
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Change Status:</span>
        {["Approved", "Submitted", "Draft", "Rejected"].map(status => (
          <button
            key={status}
            className={`w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentStatus === status ? "text-gray-900 bg-slate-50" : "text-gray-600"}`}
            onClick={() => {
              if (currentStatus !== status) onEditStatus(status);
              onClose();
            }}
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
  const Icon = CATEGORY_ICONS[event.category] || Box;

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return "Invalid Date";
    }
  };

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Draft: "bg-slate-100 text-slate-700 border-slate-200",
    Submitted: "bg-amber-100 text-amber-700 border-amber-200"
  };

  const authorName = typeof event.createdBy === 'object' && event.createdBy?.fullName 
    ? event.createdBy.fullName.split(" ")[0] 
    : "Admin";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col overflow-hidden group">
      <div 
        className="h-48 bg-slate-50 relative flex items-center justify-center text-slate-300 bg-cover bg-center"
        style={event.posterUrl ? { backgroundImage: `url(${event.posterUrl})` } : {}}
      >
        {!event.posterUrl && <Icon size={48} className="opacity-50" />}
        <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${statusStyle[event.status] || statusStyle.Submitted}`}>
          {event.status}
        </span>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                {event.category || "General"}
            </span>
            {event.isPaidEvent && (
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <DollarSign size={12} /> {event.ticketPrice}
                </span>
            )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-black transition-colors line-clamp-2">
            {event.title || "Untitled Event"}
        </h3>

        <div className="space-y-2 mb-6 flex-1">
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Calendar size={16} />
            </div>
            <span>{formatDate(event.eventDate)} {event.startTime && `• ${event.startTime}`}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <MapPin size={16} />
            </div>
            <span className="line-clamp-1">{event.location || "TBA"}</span>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-900">By {authorName}</span>
          </div>
          
          <div className="relative">
            <button 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors" 
                onClick={() => setShowMenu(true)}
            >
              <MoreVertical size={16} />
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
            title: "", category: "Competition", location: "", description: "",
            eventDate: "", startTime: "", endTime: "", registrationDeadline: "",
            maxSeats: 100, isPaidEvent: false, ticketPrice: 0, isPublic: true
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
        await api.put(`/admin/events/${initialData._id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Event updated successfully");
      } else {
        await api.post("/admin/events", payload, { headers: { "Content-Type": "multipart/form-data" } });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {initialData ? "Edit Event Configuration" : "Create New Event"}
          </h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" onClick={onClose}>
              <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Poster</label>
            {posterPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 group">
                <img src={posterPreview} alt="Preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                <button type="button" onClick={removePoster} className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-lg">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="h-48 rounded-2xl border-2 border-dashed border-slate-300 hover:border-black hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Upload size={20} />
                </div>
                <div className="text-sm font-medium text-slate-500">Click to upload high-res poster (Max 5MB)</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Enter an engaging title..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                  {["Competition", "Conference", "Workshop", "Seminar", "Sports", "Cultural", "Other"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Campus Auditorium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none" placeholder="What is this event about?" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Deadline</label>
                <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Seats</label>
                <input type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} required min="1" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input type="checkbox" name="isPaidEvent" checked={formData.isPaidEvent} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-black">Paid Event Interface</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-black">Open to External Colleges</span>
              </label>
            </div>

            {formData.isPaidEvent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ticket Price (₹)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="0" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="500" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                Cancel
            </button>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center min-w-[140px]">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  initialData ? "Save Changes" : "Create Event"
              )}
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

  const filteredEvents = events.filter(e => {
    const matchesSearch = (e.title || "").toLowerCase().includes(search.toLowerCase()) || (e.location || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (category !== "All" && e.category !== category) return false;
    if (activeTab === "Upcoming") return new Date(e.eventDate) >= new Date();
    if (activeTab === "Drafts") return e.status === "Draft";
    if (activeTab === "Completed") return new Date(e.eventDate) < new Date();
    return true; 
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:px-12 font-sans pb-24">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-1 block">Event Management</span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Events</h1>
        </div>
        
        <button 
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl font-bold transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 active:translate-y-0"
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      {/* Filters & Tabs Section */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-10">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto hide-scrollbar">
          {["All Events", "Upcoming", "Drafts", "Completed"].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                ? "bg-slate-100 text-black shadow-sm" 
                : "text-slate-500 hover:text-black hover:bg-slate-50"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
               <Search size={18} />
             </div>
             <input 
                type="text" 
                placeholder="Search events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm"
             />
          </div>
          
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center px-4 py-1.5">
             <Filter size={18} className="text-slate-400 mr-2" />
             <select
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                 className="bg-transparent text-sm font-bold text-gray-900 border-none focus:ring-0 outline-none w-full sm:w-36 py-1.5 cursor-pointer appearance-none"
             >
                 {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Events Grid Area */}
      <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
                <span className="font-bold">Loading brilliant events...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Calendar size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                <p className="text-slate-500 max-w-sm mb-8">It seems we couldn't find any events matching your current filters. Wanna create one?</p>
                <button 
                  onClick={() => { setEditingEvent(null); setShowModal(true); }}
                  className="text-black font-bold flex items-center gap-2 hover:bg-slate-100 px-6 py-3 rounded-xl transition-colors"
                >
                  <Plus size={20} /> Create Event
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>

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
