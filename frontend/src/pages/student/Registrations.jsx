import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Frown,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Search,
} from "lucide-react";
import api from "../../api";
 
/* ── Helpers ─────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};
 
const formatShortDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return `${day} ${month}`;
};
 
const isUpcoming = (eventDate) => new Date(eventDate) > new Date();
 
/* ── Reusable Components ─────────────────────────────── */
const StatCard = ({ value, label, bgColor = "bg-white" }) => (
  <div
    className={`${bgColor} border-[3px] border-black p-4 md:p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]`}
  >
    <p className="text-3xl md:text-4xl font-black mb-1 leading-none">
      {value}
    </p>
    <p className="text-[10px] font-black tracking-tight uppercase">{label}</p>
  </div>
);
 
const InfoBlock = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon size={14} className="text-black shrink-0 mt-0.5" />}
    <div>
      <p className="text-[7px] md:text-[8px] font-bold text-gray-400 mb-0.5 md:mb-1 uppercase">
        {label}
      </p>
      <p className="text-[10px] md:text-[11px] font-black uppercase leading-tight">
        {value}
      </p>
    </div>
  </div>
);
 
/* ── Main Component ──────────────────────────────────── */
const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
 
  /* Fetch the logged-in student's registrations */
  useEffect(() => {
    fetchRegistrations();
  }, []);
 
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/registrations/my");
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      console.error("Fetch registrations error:", err);
      toast.error("Failed to load your registrations");
    } finally {
      setLoading(false);
    }
  };
 
  /* Cancel a registration */
  const handleCancel = async (regId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?"))
      return;
    try {
      setCancellingId(regId);
      await api.delete(`/registrations/${regId}`);
      toast.success("Registration cancelled!");
      setRegistrations((prev) => prev.filter((r) => r._id !== regId));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel registration"
      );
    } finally {
      setCancellingId(null);
    }
  };
 
  /* Derived stats */
  const stats = useMemo(() => {
    const total = registrations.length;
    const upcoming = registrations.filter(
      (r) => r.eventId && isUpcoming(r.eventId.eventDate)
    ).length;
    const finished = total - upcoming;
    return { total, upcoming, finished };
  }, [registrations]);
 
  /* Filtered registrations */
  const filteredRegistrations = useMemo(() => {
    let result = [...registrations];
 
    // Filter by status
    if (activeFilter === "UPCOMING") {
      result = result.filter(
        (r) => r.eventId && isUpcoming(r.eventId.eventDate)
      );
    } else if (activeFilter === "FINISHED") {
      result = result.filter(
        (r) => r.eventId && !isUpcoming(r.eventId.eventDate)
      );
    }
 
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.eventId?.title?.toLowerCase().includes(q) ||
          r.eventId?.category?.toLowerCase().includes(q) ||
          r.eventId?.location?.toLowerCase().includes(q)
      );
    }
 
    return result;
  }, [registrations, activeFilter, searchQuery]);
 
  return (
    <div className="min-h-screen bg-[#f5f4f0] p-4 md:p-8 font-mono uppercase text-black">
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
        <div>
          <p className="text-[10px] text-gray-500 font-bold mb-1">
            REGISTRY_V2 // STUDENT_ACCESS
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            MY_PASSES
          </h1>
        </div>
        <div className="bg-black text-[#b4ff39] px-3 py-1 text-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          SESSION_LIVE // {String(stats.total).padStart(2, "0")}_CONFIRMED
        </div>
      </header>
 
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        <StatCard
          value={String(stats.total).padStart(2, "0")}
          label="Total Registrations"
        />
        <StatCard
          value={String(stats.upcoming).padStart(2, "0")}
          label="Upcoming Events"
          bgColor="bg-[#b4ff39]"
        />
        <StatCard
          value={String(stats.finished).padStart(2, "0")}
          label="Finished Events"
          bgColor="bg-[#c2d9ff]"
        />
      </div>
 
      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-grow border-[3px] border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center px-4">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search by event name, category, venue..."
            className="w-full py-3 bg-transparent outline-none font-bold text-sm uppercase placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 h-12 md:h-auto">
          {["ALL", "UPCOMING", "FINISHED"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 md:flex-none px-6 border-[3px] border-black font-bold text-xs shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all
                ${
                  activeFilter === f
                    ? "bg-black text-[#b4ff39]"
                    : "bg-white hover:bg-gray-50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
 
      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-sm font-bold uppercase text-gray-400">
            LOADING_REGISTRATIONS_PAYLOAD...
          </p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="border-8 border-dashed border-black bg-white p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <Frown className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-lg font-black uppercase text-gray-500">
            NO_REGISTRATIONS_FOUND
          </p>
          <p className="text-xs text-gray-400 mt-1 italic uppercase">
            Register for events from the Events page to see them here.
          </p>
        </div>
      ) : (
        /* ── TICKETS ── */
        <div className="space-y-10">
          {filteredRegistrations.map((reg) => {
            const event = reg.eventId;
            if (!event) return null;
 
            const upcoming = isUpcoming(event.eventDate);
            const isCancelling = cancellingId === reg._id;
 
            return (
              <div
                key={reg._id}
                className={`relative flex flex-col md:flex-row border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
                  ${!upcoming ? "opacity-60 grayscale" : ""}`}
              >
                {/* ── Status Bar ── */}
                <div
                  className={`h-10 md:h-auto md:w-12 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black flex items-center justify-center
                    ${upcoming ? "bg-[#b4ff39]" : "bg-gray-300"}`}
                >
                  <span
                    className={`md:rotate-[-90deg] whitespace-nowrap font-black text-[10px] md:text-[12px] tracking-widest
                      ${!upcoming ? "text-gray-600" : ""}`}
                  >
                    {upcoming ? "UPCOMING" : "FINISHED"}
                  </span>
                </div>
 
                <div className="flex flex-col md:flex-row flex-1">
                  {/* ── QR / Ticket ID Area ── */}
                  <div className="w-full md:w-48 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black border-dashed flex flex-row md:flex-col items-center justify-center p-6 relative bg-gray-50/30">
                    {/* Ticket punches */}
                    <div className="hidden md:block absolute -top-[18px] -right-[18px] w-8 h-8 bg-[#f5f4f0] border-[3px] border-black rounded-full z-10"></div>
                    <div className="hidden md:block absolute -bottom-[18px] -right-[18px] w-8 h-8 bg-[#f5f4f0] border-[3px] border-black rounded-full z-10"></div>
 
                    {/* QR Code Pattern */}
                    <div className="w-16 h-16 md:w-24 md:h-24 border-[2px] border-black p-1 md:p-2 mb-0 md:mb-2 flex flex-wrap bg-white">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1/4 h-1/4 ${
                            (i + reg._id.charCodeAt(i % reg._id.length)) % 3 !==
                            0
                              ? "bg-black"
                              : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="ml-4 md:ml-0 text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                      *RX-{reg._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
 
                  {/* ── Info Section ── */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="bg-black text-white text-[8px] px-2 py-0.5 w-fit mb-2 font-bold">
                        {event.category?.toUpperCase() || "EVENT"}
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black mb-6 leading-tight">
                        {event.title?.toUpperCase() || "UNTITLED EVENT"}
                      </h2>
 
                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6">
                        <InfoBlock
                          icon={Calendar}
                          label="Event Date"
                          value={formatDate(event.eventDate)}
                        />
                        <InfoBlock
                          icon={MapPin}
                          label="Location"
                          value={event.location || "TBA"}
                        />
                        <InfoBlock
                          icon={Clock}
                          label="Time"
                          value={
                            event.startTime
                              ? `${event.startTime}${
                                  event.endTime ? ` - ${event.endTime}` : ""
                                }`
                              : "TBA"
                          }
                        />
                        <InfoBlock
                          icon={Tag}
                          label="Registered On"
                          value={formatDate(reg.registrationDate)}
                        />
                      </div>
                    </div>
 
                    {/* Actions Footer */}
                    <div className="flex flex-row justify-between items-center mt-8">
                      <div
                        className={`border-[2px] border-black px-3 py-1 -rotate-2 font-black text-[10px]
                          ${
                            upcoming
                              ? "bg-[#b4ff39]"
                              : "bg-gray-300 text-gray-600"
                          }`}
                      >
                        {upcoming ? "PASS_ACTIVE" : "PASS_EXPIRED"}
                      </div>
 
                      {upcoming && (
                        <button
                          onClick={() => handleCancel(reg._id)}
                          disabled={isCancelling}
                          className="bg-red-500 text-white border-[3px] border-black px-4 py-2 font-black text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:bg-red-600 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          {isCancelling ? "CANCELLING..." : "CANCEL_REG"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
 
      {/* ── FOOTER ── */}
      <footer className="w-full bg-black py-4 border-t-4 border-black mt-20 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          SESSION_ACTIVE // RECORDS_LIVE // TOTAL: {stats.total} // UPCOMING:{" "}
          {stats.upcoming}
        </p>
      </footer>
    </div>
  );
};
 
export default StudentRegistrations;
 