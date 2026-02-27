import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Menu, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Circle,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../../api';
import { Link } from 'react-router-dom';

// --- STYLED COMPONENTS ---

const BrutalistBox = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer bg-white ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ label, count, color, isActive }) => (
  <div className={`flex items-center gap-4 p-2 border-2 border-black min-w-[140px] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-transform ${isActive ? 'scale-105 border-b-4' : ''}`}>
    <div className="text-xl font-bold border-r-2 border-black pr-4">{count}</div>
    <div className="flex items-center gap-2">
      <div className={`w-3 h-5 ${color} border border-black`}></div>
      <span className="text-[10px] font-bold tracking-tighter uppercase">{label}</span>
    </div>
  </div>
);

const App = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // --- API LOGIC ---

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/events/my-events");
        setEvents(response.data.events);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-[#B6FF60] text-black';
      case 'draft': return 'bg-[#FFF6A0] text-black';
      case 'rejected': return 'bg-[#FF8A8A] text-black';
      default: return 'bg-gray-200 text-black';
    }
  };

  // --- SEARCH & FILTER LOGIC ---
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(searchStr) ||
        event.category.toLowerCase().includes(searchStr) ||
        event.location.toLowerCase().includes(searchStr);
      
      const matchesStatus = statusFilter === "ALL" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Derived Stats
  const stats = {
    total: events.length,
    draft: events.filter(e => e.status === 'Draft').length,
    approved: events.filter(e => e.status === 'Approved').length,
    rejected: events.filter(e => e.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-black font-mono p-4 md:p-8">
      {/* Top Breadcrumbs */}
      <div className="flex gap-2 text-[10px] font-bold text-gray-500 mb-2 uppercase">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-black">My Events</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2">MY_EVENTS</h1>
          <div className="bg-black text-[#B6FF60] px-3 py-1 inline-flex items-center gap-2 text-[10px] font-bold uppercase border-2 border-black">
            <span className="flex items-center gap-1">
              <Circle size={8} fill="#B6FF60" /> {stats.total} Total Events
            </span>
            <span className="text-gray-500">//</span>
            <span>Last updated: Today</span>
          </div>
        </div>
        
        <Link to="/create">
          <BrutalistBox className="bg-[#B6FF60] px-6 py-3 flex items-center gap-2 font-bold uppercase text-sm">
            <PlusCircle size={20} />
            Create New Event
          </BrutalistBox>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div onClick={() => setStatusFilter("ALL")}>
          <StatCard label="All Events" count={stats.total} color="bg-black" isActive={statusFilter === "ALL"} />
        </div>
        <div onClick={() => setStatusFilter("Draft")}>
          <StatCard label="Pending" count={stats.draft} color="bg-[#FFF6A0]" isActive={statusFilter === "Draft"} />
        </div>
        <div onClick={() => setStatusFilter("Approved")}>
          <StatCard label="Approved" count={stats.approved} color="bg-[#B6FF60]" isActive={statusFilter === "Approved"} />
        </div>
        <div onClick={() => setStatusFilter("Rejected")}>
          <StatCard label="Rejected" count={stats.rejected} color="bg-[#FF8A8A]" isActive={statusFilter === "Rejected"} />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH BY NAME, CATEGORY OR LOCATION..."
            className="w-full bg-white border-2 border-black p-3 pl-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-bold uppercase text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <BrutalistBox className="flex items-center justify-between px-4 py-3 min-w-[160px] text-xs font-bold uppercase relative group">
          Status: {statusFilter}
          <ChevronDown size={16} />
        </BrutalistBox>

        {/* pending implementation of export functionality */}
        <BrutalistBox className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase">
          <Menu size={16} />
          Export CSV
        </BrutalistBox>
      </div>

      {/* Table Container */}
      <div className="border-2 border-black bg-white overflow-hidden mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-black text-white p-3 flex justify-between items-center px-4">
          <h2 className="text-sm font-bold tracking-widest uppercase">Event_List</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {isLoading ? 'Fetching data...' : `Showing ${filteredEvents.length} of ${events.length} events`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[10px] text-gray-500 font-bold uppercase text-left border-b-2 border-black">
                <th className="p-4 border-r border-gray-100">Poster</th>
                <th className="p-4 border-r border-gray-100">Event Name</th>
                <th className="p-4 border-r border-gray-100">Date</th>
                <th className="p-4 border-r border-gray-100">Seats Filled</th>
                <th className="p-4 border-r border-gray-100">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-bold animate-pulse uppercase">Syncing_with_database...</td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const percentage = Math.round((event.seatsFilled / event.maxSeats) * 100) || 0;
                  return (
                    <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 bg-[#E0F2FE] text-blue-600 border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {event.title.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tight">{event.title}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{event.category}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase">{formatDate(event.eventDate)}</span>
                          <span className="text-[9px] text-gray-400 font-bold">{event.startTime}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{event.seatsFilled} / {event.maxSeats}</span>
                            <span className="text-gray-400">({percentage}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 border border-black overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getStatusStyles(event.status)}`}>
                          <Circle size={6} fill="black" />
                          {event.status}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button  className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]">
                            <Edit3 size={14} />
                          </button>
                          <button className="p-1.5 border-2 border-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-bold uppercase">No_Matching_Events_Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase">Page 1 of 1</div>
        <div className="flex items-center gap-1">
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ChevronLeft size={20} />
          </button>
          <button className="w-8 h-8 border-2 border-black bg-[#B6FF60] font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</button>
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;