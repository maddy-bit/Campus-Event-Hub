import React, { useState, useMemo } from 'react';
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
  Circle
} from 'lucide-react';

// Mock Data from the image
const INITIAL_EVENTS = [
  { id: 1, name: "ROBO-SPRINT 2024", category: "ROBOTICS", date: "Oct 24, 2024", time: "09:00 AM", seats: 120, totalSeats: 150, status: "APPROVED", initial: "R", color: "bg-blue-200" },
  { id: 2, name: "AI WORKSHOP", category: "AI & ML", date: "Nov 2, 2024", time: "10:00 AM", seats: 50, totalSeats: 50, status: "APPROVED", initial: "A", color: "bg-lime-200" },
  { id: 3, name: "MICRO-MOUSE COMP", category: "ROBOTICS", date: "Nov 15, 2024", time: "06:00 AM", seats: 12, totalSeats: 100, status: "PENDING", initial: "M", color: "bg-yellow-200" },
  { id: 4, name: "IOT SUMMIT 2024", category: "IOT", date: "Dec 1, 2024", time: "11:00 AM", seats: 140, totalSeats: 200, status: "APPROVED", initial: "I", color: "bg-red-200" },
  { id: 5, name: "DRONE RACE FINALS", category: "ROBOTICS", date: "Dec 10, 2024", time: "02:00 PM", seats: 60, totalSeats: 100, status: "APPROVED", initial: "D", color: "bg-blue-100" },
  { id: 6, name: "CODE SPRINT FALL", category: "HACKATHON", date: "Nov 20, 2024", time: "09:00 AM", seats: 85, totalSeats: 120, status: "PENDING", initial: "C", color: "bg-green-200" },
  { id: 7, name: "CIRCUIT DESIGN BOOT", category: "WORKSHOP", date: "Oct 30, 2024", time: "10:00 AM", seats: 30, totalSeats: 40, status: "REJECTED", initial: "C", color: "bg-red-300" },
  { id: 8, name: "ML BOOTCAMP", category: "AI & ML", date: "Jan 15, 2025", time: "09:30 AM", seats: 20, totalSeats: 60, status: "PENDING", initial: "M", color: "bg-yellow-100" },
  { id: 9, name: "EMBEDDED SYS CONF", category: "CONFERENCE", date: "Feb 5, 2025", time: "10:00 AM", seats: 75, totalSeats: 80, status: "APPROVED", initial: "E", color: "bg-blue-50" },
  { id: 10, name: "PCB DESIGN SPRINT", category: "WORKSHOP", date: "Sep 18, 2024", time: "08:00 AM", seats: 25, totalSeats: 30, status: "REJECTED", initial: "P", color: "bg-red-400" },
  { id: 11, name: "AUTONOMOUS CAR RACE", category: "ROBOTICS", date: "Mar 10, 2025", time: "10:00 AM", seats: 0, totalSeats: 80, status: "PENDING", initial: "A", color: "bg-orange-100" },
  { id: 12, name: "WEB DEV HACKATHON", category: "HACKATHON", date: "Jan 20, 2025", time: "09:00 AM", seats: 44, totalSeats: 100, status: "APPROVED", initial: "W", color: "bg-green-100" },
];

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

const MyEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredEvents = useMemo(() => {
    return INITIAL_EVENTS.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-[#B6FF60] text-black';
      case 'PENDING': return 'bg-[#FFF6A0] text-black';
      case 'REJECTED': return 'bg-[#FF8A8A] text-black';
      default: return 'bg-gray-200 text-black';
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-green-400';
    if (percent >= 40) return 'bg-gray-600';
    return 'bg-yellow-400';
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
              <Circle size={8} fill="#B6FF60" /> 12 Total Events
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
        <StatCard label="All Events" count={12} color="bg-black" isActive={statusFilter === "ALL"} />
        <StatCard label="Pending" count={3} color="bg-yellow-300" isActive={statusFilter === "PENDING"} />
        <StatCard label="Approved" count={7} color="bg-green-400" isActive={statusFilter === "APPROVED"} />
        <StatCard label="Rejected" count={2} color="bg-red-400" isActive={statusFilter === "REJECTED"} />
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
          All Status
          <ChevronDown size={16} />
        </BrutalistBox>

        <BrutalistBox className="flex items-center justify-between px-4 py-3 min-w-[160px] text-xs font-bold uppercase">
          Newest First
          <ChevronDown size={16} />
        </BrutalistBox>

        <BrutalistBox className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase">
          <Menu size={16} />
          Export CSV
        </BrutalistBox>
      </div>

      {/* Table Container */}
      <div className="border-2 border-black bg-white overflow-hidden mb-6">
        {/* Table Header */}
        <div className="bg-black text-white p-3 flex justify-between items-center px-4">
          <h2 className="text-sm font-bold tracking-widest uppercase">Event_List</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Showing {filteredEvents.length} of 12 events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[10px] text-gray-400 font-bold uppercase text-left">
                <th className="p-4 w-16">Poster</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Seats Filled</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#EEEEEE]">
              {filteredEvents.map((event) => {
                const percent = Math.round((event.seats / event.totalSeats) * 100);
                return (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className={`w-8 h-8 ${event.color} border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                        {event.initial}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-black uppercase tracking-tight">{event.name}</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase">{event.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] font-black">{event.date}</div>
                      <div className="text-[9px] font-bold text-gray-400">{event.time}</div>
                    </td>
                    <td className="p-4 min-w-[150px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black">{event.seats} / {event.totalSeats}</span>
                        <span className="text-[9px] font-bold text-gray-300">({percent}%)</span>
                      </div>
                      <div className="h-1 w-full bg-gray-100 border border-gray-200">
                        <div 
                          className={`h-full ${getProgressColor(percent)}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getStatusStyles(event.status)}`}>
                        <Circle size={6} fill="currentColor" />
                        {event.status}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <button className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
                          <Eye size={14} />
                        </button>
                        <button className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase">Page 1 of 2</div>
        <div className="flex items-center gap-1">
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <button className="w-8 h-8 border-2 border-black bg-[#B6FF60] font-bold text-sm">1</button>
          <button className="w-8 h-8 border-2 border-black bg-white font-bold text-sm hover:bg-gray-100">2</button>
          <button className="p-1 border-2 border-black bg-white hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyEvents;