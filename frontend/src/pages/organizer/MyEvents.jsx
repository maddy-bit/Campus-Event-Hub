import React, { useState, useMemo, useEffect } from "react";
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
  Calendar,
  X,
} from "lucide-react";
import api from "../../api";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const BrutalistBox = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer bg-white ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ label, count, color, isActive }) => (
  <div
    className={`flex items-center gap-4 p-2 border-2 border-black min-w-[140px] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-transform ${isActive ? "scale-105 border-b-4" : ""}`}
  >
    <div className="text-xl font-bold border-r-2 border-black pr-4">
      {count}
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-3 h-5 ${color} border border-black`}></div>
      <span className="text-[10px] font-bold tracking-tighter uppercase">
        {label}
      </span>
    </div>
  </div>
);

const App = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // how many events per page

  useEffect(() => {
    setCurrentPage(1);
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
  }, [searchTerm, statusFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-[#B6FF60] text-black";
      case "draft":
        return "bg-[#FFF6A0] text-black";
      case "rejected":
        return "bg-[#FF8A8A] text-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(searchStr) ||
        event.category.toLowerCase().includes(searchStr) ||
        event.location.toLowerCase().includes(searchStr);

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Derived Stats
  const stats = {
    total: events.length,
    draft: events.filter((e) => e.status === "Draft").length,
    approved: events.filter((e) => e.status === "Approved").length,
    rejected: events.filter((e) => e.status === "Rejected").length,
  };

  //to edit the evnts
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      category: event.category,
      location: event.location,
      description: event.description,
      eventDate: event.eventDate.split("T")[0], // Format for date input
      startTime: event.startTime,
      registrationDeadline: event.registrationDeadline?.split("T")[0],
      maxSeats: event.maxSeats,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    try {
await api.put(`/events/${selectedEvent._id}`, {
  ...formData,
  maxSeats: Number(formData.maxSeats)
});  
toast.success("Event updated successfully", {
  className: "rounded-none border-2 border-black bg-[#B6FF60] text-black font-black uppercase tracking-tight shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
});
    // Refresh list
      const response = await api.get("/events/my-events");
      setEvents(response.data.events);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

const handleDelete = async (eventId) => {
  try {
    await api.delete(`/events/${eventId}`);
    setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));   
    setDeleteTarget(null);
    toast.success("Deleted succefully")
  } catch (error) {
    console.error("Deletion failed:", error);
    alert("FATAL_ERROR: UNABLE TO DELETE EVENT");
  }
};
const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // These are the items actually displayed on the current page
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

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
          <h1 className="text-6xl font-black tracking-tighter mb-2">
            MY_EVENTS
          </h1>
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
          <StatCard
            label="All Events"
            count={stats.total}
            color="bg-black"
            isActive={statusFilter === "ALL"}
          />
        </div>
        <div onClick={() => setStatusFilter("Draft")}>
          <StatCard
            label="Pending"
            count={stats.draft}
            color="bg-[#FFF6A0]"
            isActive={statusFilter === "Draft"}
          />
        </div>
        <div onClick={() => setStatusFilter("Approved")}>
          <StatCard
            label="Approved"
            count={stats.approved}
            color="bg-[#B6FF60]"
            isActive={statusFilter === "Approved"}
          />
        </div>
        <div onClick={() => setStatusFilter("Rejected")}>
          <StatCard
            label="Rejected"
            count={stats.rejected}
            color="bg-[#FF8A8A]"
            isActive={statusFilter === "Rejected"}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
            size={18}
          />
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
          <h2 className="text-sm font-bold tracking-widest uppercase">
            Event_List
          </h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {isLoading
              ? "Fetching data..."
              : `Showing ${filteredEvents.length} of ${events.length} events`}
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
                  <td
                    colSpan="6"
                    className="p-12 text-center text-gray-400 font-bold animate-pulse uppercase"
                  >
                    Syncing_with_database...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((event) => {
                  const percentage =
                    Math.round((event.seatsFilled / event.maxSeats) * 100) || 0;
                  return (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-10 h-10 bg-[#E0F2FE] text-blue-600 border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {event.title.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tight">
                            {event.title}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {event.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase">
                            {formatDate(event.eventDate)}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold">
                            {event.startTime}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>
                              {event.seatsFilled} / {event.maxSeats}
                            </span>
                            <span className="text-gray-400">
                              ({percentage}%)
                            </span>
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
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getStatusStyles(event.status)}`}
                        >
                          <Circle size={6} fill="black" />
                          {event.status}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]">
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditClick(event)}
                            className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* edit is done here  */}
                          {isEditModalOpen && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-[#F5F5F0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-10">
                                  <h2 className="font-black uppercase tracking-tighter">
                                    Edit_Event: {selectedEvent?.title}
                                  </h2>
                                  <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="hover:text-red-400"
                                  >
                                    <X size={24} />
                                  </button>
                                </div>

                                <form
                                  onSubmit={handleUpdate}
                                  className="p-6 space-y-8"
                                >
                                  <section>
                                    <div className="flex items-center gap-2 mb-4">
                                      <span className="bg-black text-white px-2 py-0.5 text-xs font-bold">
                                        01
                                      </span>
                                      <h3 className="font-black uppercase text-sm">
                                        Basic Information
                                      </h3>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-[10px] font-black uppercase mb-1">
                                          Event Title{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white"
                                          value={formData.title}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              title: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-black uppercase mb-1">
                                            Category{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </label>
                                          <select
                                            className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white"
                                            value={formData.category}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                category: e.target.value,
                                              })
                                            }
                                          >
                                            <option>Workshop</option>
                                            <option>Competition</option>
                                            <option>Hackathon</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-black uppercase mb-1">
                                            Location{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </label>
                                          <input
                                            className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white"
                                            value={formData.location}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                location: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black uppercase mb-1">
                                          Description{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <textarea
                                          rows="3"
                                          className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-white resize-none"
                                          value={formData.description}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              description: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  </section>

                                  <section>
                                    <div className="flex items-center gap-2 mb-4">
                                      <span className="bg-black text-white px-2 py-0.5 text-xs font-bold">
                                        02
                                      </span>
                                      <h3 className="font-black uppercase text-sm">
                                        Schedule & Capacity
                                      </h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-black uppercase mb-1">
                                          Event Date
                                        </label>
                                        <input
                                          type="date"
                                          className="w-full border-2 border-black p-2 text-sm"
                                          value={formData.eventDate}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              eventDate: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black uppercase mb-1">
                                          Start Time
                                        </label>
                                        <input
                                          type="text"
                                          className="w-full border-2 border-black p-2 text-sm"
                                          value={formData.startTime}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              startTime: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black uppercase mb-1">
                                          Max Seats
                                        </label>
                                        <input
                                          type="number"
                                          className="w-full border-2 border-black p-2 text-sm"
                                          value={formData.maxSeats}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              maxSeats: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  </section>

                                  <div className="flex gap-4 pt-4">
                                    <button
                                      type="submit"
                                      className="flex-1 bg-[#B6FF60] border-2 border-black p-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIsEditModalOpen(false)}
                                      className="flex-1 bg-white  border-2 border-black p-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                          <button onClick={() => setDeleteTarget(event)} className="p-1.5 border-2 border-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px]">
                            <Trash2 size={14} />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-12 text-center text-gray-400 font-bold uppercase"
                  >
                    No_Matching_Events_Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {/* Pagination Container */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase">
          Page {currentPage} of {totalPages || 1}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page Number Buttons */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] transition-all ${
                currentPage === i + 1 ? "bg-[#B6FF60]" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Button */}
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-500 text-white p-1 border-2 border-black">
                <Trash2 size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Warning!</h2>
            </div>
            
            <p className="text-[11px] font-bold mb-6 uppercase leading-relaxed">
              You are performing a <span className="text-red-500">permanent_deletion</span> of:
              <br />
              <span className="text-sm underline decoration-2">{deleteTarget.title}</span>
              <br /><br />
              this action cannot be undone. proceed?
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => handleDelete(deleteTarget._id)}
                className="flex-1 bg-red-500 text-white border-2 border-black p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Confirm_Delete
              </button>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-white border-2 border-black p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
