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
  <div className={`flex items-center gap-4 p-2 border-2 border-black min-w-[140px] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isActive ? 'ring-2 ring-black ring-offset-2' : ''}`}>
    <div className="text-xl font-bold border-r-2 border-black pr-4">{count}</div>
    <div className="flex items-center gap-2">
      <div className={`w-3 h-5 ${color} border-l border-black`}></div>
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
    switch (status) {
      case 'Approved': return 'bg-[#B6FF60] text-black';
      case 'Draft': return 'bg-[#FFF6A0] text-black';
      case 'Rejected': return 'bg-[#FF8A8A] text-black';
      default: return 'bg-gray-200 text-black';
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
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
        
        <BrutalistBox className="bg-[#B6FF60] px-6 py-3 flex items-center gap-2 font-bold uppercase text-sm">
          <PlusCircle size={20} />
          Create New Event
        </BrutalistBox>
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div onClick={() => setStatusFilter("ALL")}>
          <StatCard label="All Events" count={stats.total} color="bg-black" isActive={statusFilter === "ALL"} />
        </div>
        <div onClick={() => setStatusFilter("Draft")}>
          <StatCard label="Draft" count={stats.draft} color="bg-yellow-300" isActive={statusFilter === "Draft"} />
        </div>
        <div onClick={() => setStatusFilter("Approved")}>
          <StatCard label="Approved" count={stats.approved} color="bg-green-400" isActive={statusFilter === "Approved"} />
        </div>
        <div onClick={() => setStatusFilter("Rejected")}>
          <StatCard label="Rejected" count={stats.rejected} color="bg-red-400" isActive={statusFilter === "Rejected"} />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH EVENTS..."
            className="w-full bg-white border-2 border-black p-3 pl-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-bold uppercase text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <BrutalistBox className="flex items-center justify-between px-4 py-3 min-w-[160px] text-xs font-bold uppercase">
          Status: {statusFilter}
          <ChevronDown size={16} />
        </BrutalistBox>

        <BrutalistBox className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase">
          <Menu size={16} />
          Export CSV
        </BrutalistBox>
      </div>

      {/* Table Container */}
      <div className="border-2 border-black bg-white overflow-hidden mb-6">
        <div className="bg-black text-white p-3 flex justify-between items-center px-4">
          <h2 className="text-sm font-bold tracking-widest uppercase">Event_List</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {isLoading ? 'Fetching data...' : `Showing ${filteredEvents.length} events`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[10px] text-gray-400 font-bold uppercase text-left">
                <th className="p-4">Event Identity</th>
                <th className="p-4">Category</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#EEEEEE]">
              {isLoading ? (
                 <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-bold animate-pulse">LOADING_DATA_FROM_SERVER...</td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-[#B6FF60] border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {event.title.charAt(0)}
                        </div>
                        <div className="text-xs font-black uppercase tracking-tight">{event.title}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[9px] font-bold text-gray-500 uppercase px-2 py-1 border border-black inline-block bg-gray-50">
                        {event.category}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase">
                          <Calendar size={12} /> {formatDate(event.eventDate)}
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 ml-4">{event.startTime}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                        <MapPin size={12} className="text-red-500" />
                        {event.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getStatusStyles(event.status)}`}>
                        <Circle size={6} fill="black" />
                        {event.status}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button title="View" className="p-1 border border-black hover:bg-black hover:text-[#B6FF60] transition-colors">
                          <Eye size={14} />
                        </button>
                        <button title="Edit" className="p-1 border border-black hover:bg-black hover:text-[#B6FF60] transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button title="Delete" className="p-1 border border-black hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-bold">NO_RESULTS_FOUND</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase">Registry Page 1 of 1</div>
        <div className="flex items-center gap-1">
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <button className="w-8 h-8 border-2 border-black bg-[#B6FF60] font-bold text-sm">1</button>
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;