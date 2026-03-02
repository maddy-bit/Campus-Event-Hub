import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Users,
  Share2,
  ChevronDown,
  Calendar,
  Clock,
  Tag,
  Loader2,
  Frown,
  Ticket,
  IndianRupee,
  School,
  Globe,
  Plus
} from "lucide-react";
import api from "../../api";

const CATEGORY_CONFIG = {
  Competition: { color: "bg-blue-100 text-blue-700", border: 'border-blue-700', abbr: "CMP" },
  Conference: { color: "bg-purple-100 text-purple-700", border: 'border-purple-700', abbr: "CNF" },
  Workshop: { color: "bg-amber-100 text-amber-700", border: 'border-amber-700', abbr: "WRK" },
  Seminar: { color: "bg-teal-100 text-teal-700", border: 'border-teal-700', abbr: "SEM" },
  Sports: { color: "bg-green-100 text-green-700", border: 'border-green-700', abbr: "SPT" },
  Cultural: { color: "bg-pink-100 text-pink-700", border: 'border-pink-700', abbr: "CLT" },
  Other: { color: "bg-gray-100 text-gray-700", border: 'border-gray-700', abbr: "OTH" },
};

const CATEGORIES = ["All", "Competition", "Conference", "Workshop", "Seminar", "Sports", "Cultural", "Other"];

const SORT_OPTIONS = [
  { label: "Date (Soonest)", value: "date_asc" },
  { label: "Date (Latest)", value: "date_desc" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  const dateFormatted = `${day} ${month}`;
  return { dateFormatted, year };
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  return timeStr;
};

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date_asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);
  const [userCollege, setUserCollege] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  
  // New State for Tab-based switching (Your College vs Other Colleges)
  const [collegeContext, setCollegeContext] = useState("My College"); 
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setUserLoading(true);

        // Fetch user info for college name
        const userRes = await api.get("/auth/me");
        setUserCollege(userRes.data?.user?.collegeName || "");
        setUserLoading(false);

        // Fetch events
        const eventRes = await api.get("/events");
        const approved = (eventRes.data.events || []).filter(
          (e) => e.status === "Approved" || e.status === "Draft"
        );
        setEvents(approved);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
        setUserLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter + sort with tab support
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // --- Tab Filtering Logic ---
    if (collegeContext === "My College") {
        // Show events where organizer's college matches user's college
        result = result.filter(e => e.createdBy?.collegeName === userCollege); 
    } else {
        // Show events from other colleges
        result = result.filter(e => e.createdBy?.collegeName !== userCollege); 
    }

    if (activeCategory !== "All") {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title?.toLowerCase().includes(q) || 
        e.category?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date_asc") return new Date(a.eventDate) - new Date(b.eventDate);
      if (sortBy === "date_desc") return new Date(b.eventDate) - new Date(a.eventDate);
      if (sortBy === "title_asc") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "title_desc") return (b.title || "").localeCompare(a.title || "");
      return 0;
    });

    return result;
  }, [events, activeCategory, searchQuery, sortBy, collegeContext, userCollege]);

  const handleRegister = async (eventId) => {
    try {
      setRegisteringId(eventId);
      await api.post("/registrations/register", { eventId });
      toast.success("Successfully registered!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleShare = (event) => {
    const text = `Check out "${event.title}" on ${new Date(event.eventDate).toLocaleDateString()} at ${event.location}!`;
    if (navigator.share) navigator.share({ title: event.title, text });
    else { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); }
  };

  const isDeadlinePassed = (deadline) => new Date() > new Date(deadline);

  return (
    <div className="w-full bg-[#FCFDF8] font-mono min-h-screen">
      {/* --- Page Title Area --- */}
      <div className="mb-8 border-b-4 border-black pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Space Mono', monospace" }}>
              DISCOVERY_PORTAL
            </h1>
            <div className="inline-flex items-center gap-2 bg-black text-[#B6FF60] px-3 py-1 text-[10px] font-bold uppercase mt-2 border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="w-2 h-2 bg-[#B6FF60] rounded-full animate-pulse" />
                STATUS: FEED_LIVE // STUDENT_VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* --- Hero Banner (Redesigned with Pattern) --- */}
      <section className="bg-[#B6FF60] border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-[0.05]" 
          style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8]" style={{ fontFamily: "'Space Mono', monospace" }}>
              EXPLORE
              <br />
              CAMPUS_EVENTS.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 min-w-full md:min-w-[400px] bg-white border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
                    <input
                        type="text"
                        className="w-full border-0 py-3 pl-12 pr-4 font-bold uppercase text-sm focus:ring-0 placeholder:text-gray-400"
                        placeholder="Search for event, venue, category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="bg-black text-white border-0 px-8 py-3 font-bold uppercase text-xs cursor-pointer shadow-none hover:bg-black/80 transition-all">
                    RUN_QUERY
                </button>
            </div>
        </div>
      </section>

      {/* --- Tab Selector (My College vs External) --- */}
      <div className="border-4 border-black inline-flex mb-8 bg-white shadow-[4px_4px_0px_0px_#000]">
          <button 
              onClick={() => setCollegeContext("My College")}
              className={`px-8 py-3 flex items-center gap-2 border-r-4 border-black text-sm font-bold uppercase ${collegeContext === 'My College' ? 'bg-[#B6FF60]' : 'hover:bg-gray-100'}`}
          >
              <School size={16}/> My_College
          </button>
          <button 
              onClick={() => setCollegeContext("External")}
              className={`px-8 py-3 flex items-center gap-2 text-sm font-bold uppercase ${collegeContext === 'External' ? 'bg-black text-[#B6FF60]' : 'hover:bg-gray-100'}`}
          >
              <Globe size={16}/> Other_Colleges
          </button>
      </div>

      {/* --- Filter & Sort Controls --- */}
      <section className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-4 flex flex-wrap justify-between items-center gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`border-2 border-black px-4 py-1.5 text-[11px] font-bold uppercase ${activeCategory === cat ? 'bg-black text-[#B6FF60]' : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#000]'}`}
            >
              {cat === 'All' ? 'All_Categories' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-4 border-2 border-black px-4 py-2 text-[11px] font-bold uppercase bg-white hover:bg-gray-100 min-w-[170px] justify-between shadow-[2px_2px_0px_#000]"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            SORT: {sortBy} <ChevronDown size={14} />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border-4 border-black z-30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-48">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }} className="block w-full text-left p-3 text-[11px] font-bold uppercase hover:bg-black hover:text-[#B6FF60]">
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Main Grid --- */}
      {loading || userLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-sm font-bold uppercase text-gray-400">LOADING_EVENTS_PAYLOAD...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border-8 border-dashed border-black bg-white p-20 text-center mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <Frown className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-lg font-black uppercase text-gray-500">NO_EVENTS_DETECTED_IN_THIS_VIEW</p>
          <p className="text-xs text-gray-400 mt-1 italic uppercase">Check filters or try the other tab context.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {filteredEvents.map(event => {
            const { dateFormatted } = formatDate(event.eventDate);
            const catConfig = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.Other;
            const deadlinePassed = isDeadlinePassed(event.registrationDeadline);

            return (
              <article key={event._id} className="relative group">
                <div className="absolute inset-0 bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all"></div>
                <div className="relative bg-white border-4 border-black flex flex-col h-full overflow-hidden transition-all group-hover:-translate-x-1 group-hover:-translate-y-1">
                  
                  {/* Poster Area */}
                  <div className="h-56 border-b-4 border-black relative bg-gray-100 overflow-hidden">
                    {event.posterUrl ? (
                      <img src={event.posterUrl.startsWith("http") ? event.posterUrl : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${event.posterUrl}`} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-8xl font-black text-black/5 uppercase select-none">{catConfig.abbr}</div>
                    )}
                    <div className={`absolute top-0 right-0 p-4 font-black text-xl border-l-4 border-b-4 border-black bg-white shadow-none`}>
                        {dateFormatted}
                        {event.createdBy?.collegeName !== userCollege && <Globe size={18} className="text-blue-500 absolute -top-1 -left-1 bg-white border-2 border-black shadow-[1px_1px_0px_#000]" />}
                    </div>
                    <div className={`absolute bottom-4 right-4 bg-white border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] ${catConfig.color}`}>
                        {event.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black uppercase leading-tight mb-4 tracking-tighter min-h-[3rem]">
                        {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase text-gray-600">
                            <MapPin size={14} className="text-black shrink-0" /> <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold uppercase text-gray-600">
                            <Users size={14} className="text-black shrink-0" /> {event.maxSeats} Capacity
                        </div>
                    </div>

                    {/* Deadline Progress */}
                    <div className="w-full h-3 border-2 border-black mb-8 relative">
                        <div className={`h-full ${deadlinePassed ? 'bg-red-500' : 'bg-[#B6FF60]'}`} 
                            style={{ width: `${Math.min(((new Date() - new Date(event.createdAt)) / (new Date(event.registrationDeadline) - new Date(event.createdAt))) * 100, 100)}%` }}>
                        </div>
                        <div className="absolute top-full mt-1.5 left-0 right-0 flex justify-between text-[10px] font-bold text-gray-500">
                            <span>REG_OPEN</span> <span>REG_CLOSED</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-3 pt-4 border-t-2 border-dashed border-gray-100">
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={deadlinePassed || registeringId === event._id}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 border-4 border-black font-black text-xs uppercase shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all
                        ${deadlinePassed ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0' : 'bg-[#B6FF60] hover:bg-black hover:text-[#B6FF60]'}`}
                      >
                        {registeringId === event._id ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                        {deadlinePassed ? "DEADLINE_PASSED" : "REGISTER_NOW"}
                      </button>
                      <button onClick={() => handleShare(event)} className="p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_#000] active:shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* --- Footer Accent --- */}
      <footer className="w-full bg-black py-4 border-t-4 border-black mt-20 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SESSION_ACTIVE // RECORDS_LIVE // END_POINT: {filteredEvents.length}</p>
      </footer>
    </div>
  );
};

export default StudentEvents;