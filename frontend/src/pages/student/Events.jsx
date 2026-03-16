import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const USE_DUMMY = true;
import {
  Search,
  MapPin,
  Users,
  Share2,
  ChevronDown,
  Calendar,
  Clock,
  Loader2,
  Frown,
  Ticket,
  School,
  Globe,
  X,
  CheckCircle2,
  Info,
  IndianRupee,
  Tag,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import api from "../../api";

/* ── Config ─────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  Competition: {
    color: "bg-blue-100 text-blue-800",
    accent: "#3b82f6",
    abbr: "CMP",
  },
  Conference: {
    color: "bg-purple-100 text-purple-800",
    accent: "#8b5cf6",
    abbr: "CNF",
  },
  Workshop: {
    color: "bg-amber-100 text-amber-800",
    accent: "#f59e0b",
    abbr: "WRK",
  },
  Seminar: {
    color: "bg-teal-100 text-teal-800",
    accent: "#14b8a6",
    abbr: "SEM",
  },
  Sports: {
    color: "bg-green-100 text-green-800",
    accent: "#22c55e",
    abbr: "SPT",
  },
  Cultural: {
    color: "bg-pink-100 text-pink-800",
    accent: "#ec4899",
    abbr: "CLT",
  },
  Other: { color: "bg-gray-100 text-gray-800", accent: "#6b7280", abbr: "OTH" },
};

const CATEGORIES = [
  "All",
  "Competition",
  "Conference",
  "Workshop",
  "Seminar",
  "Sports",
  "Cultural",
  "Other",
];

const SORT_OPTIONS = [
  { label: "Date (Soonest)", value: "date_asc" },
  { label: "Date (Latest)", value: "date_desc" },
  { label: "Title (A–Z)", value: "title_asc" },
  { label: "Title (Z–A)", value: "title_desc" },
];

/* ── Helpers ────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return "TBA";
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, "0")} ${dt.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${dt.getFullYear()}`;
};

const fmtShort = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, "0")} ${dt.toLocaleString("en-US", { month: "short" }).toUpperCase()}`;
};

const isDeadlinePassed = (dl) => new Date() > new Date(dl);

/* ── Brutalist Dropdown ─────────────────────────────── */
const BrutalDropdown = ({ options, value, onChange, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border-2 border-black px-4 py-2 text-[11px] font-black uppercase bg-white hover:bg-gray-50 min-w-[180px] justify-between shadow-[3px_3px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={12} />}
          <span>{selected?.label || "Select"}</span>
        </div>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white border-2 border-black z-50 shadow-[4px_4px_0px_#000]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 text-[11px] font-black uppercase transition-all hover:bg-black hover:text-[#B6FF60] border-b border-black/10 last:border-0 ${
                value === opt.value ? "bg-black text-[#B6FF60]" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Event Detail Dialog ────────────────────────────── */
const EventDialog = ({
  event,
  isOpen,
  onClose,
  onRegister,
  isRegistered,
  isRegistering,
}) => {
  if (!isOpen || !event) return null;
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.Other;
  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#000] transition-all"
        >
          <X size={16} />
        </button>

        {/* Poster */}
        <div className="h-52 border-b-4 border-black relative bg-gray-100 overflow-hidden">
          {event.posterUrl ? (
            <img
              src={
                event.posterUrl.startsWith("http")
                  ? event.posterUrl
                  : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${event.posterUrl}`
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="flex items-center justify-center h-full text-9xl font-black uppercase select-none"
              style={{ color: `${cat.accent}18` }}
            >
              {cat.abbr}
            </div>
          )}
          <div
            className={`absolute top-4 left-4 px-3 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] ${cat.color}`}
          >
            {event.category}
          </div>
          {isRegistered && (
            <div className="absolute top-4 right-14 bg-[#B6FF60] border-2 border-black px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1">
              <CheckCircle2 size={11} /> REGISTERED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-6 border-b-4 border-black pb-4">
            {event.title}
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              {
                icon: Calendar,
                label: "Event Date",
                value: fmtDate(event.eventDate),
              },
              {
                icon: Clock,
                label: "Time",
                value: `${event.startTime || "TBA"}${event.endTime ? ` — ${event.endTime}` : ""}`,
              },
              {
                icon: MapPin,
                label: "Location",
                value: event.location || "TBA",
              },
              {
                icon: Users,
                label: "Capacity",
                value: `${event.maxSeats || 100} seats`,
              },
              {
                icon: Tag,
                label: "Reg. Deadline",
                value: fmtDate(event.registrationDeadline),
                red: deadlinePassed,
              },
            ].map(({ icon: Icon, label, value, red }) => (
              <div key={label} className="border-2 border-black p-3 bg-gray-50">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase mb-1">
                  <Icon size={11} /> {label}
                </div>
                <div
                  className={`text-sm font-black uppercase ${red ? "text-red-500" : ""}`}
                >
                  {value}
                </div>
              </div>
            ))}
            {event.isPaidEvent && (
              <div className="border-2 border-black p-3 bg-[#B6FF60]">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase mb-1">
                  <IndianRupee size={11} /> Ticket Price
                </div>
                <div className="text-sm font-black uppercase">
                  ₹{event.ticketPrice || 0}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-2">
              <Info size={11} /> About This Event
            </div>
            <div className="border-2 border-black p-4 bg-gray-50 text-sm leading-relaxed whitespace-pre-wrap normal-case">
              {event.description || "No description provided."}
            </div>
          </div>

          {event.createdBy && (
            <div className="mb-6 flex items-center gap-3 border-2 border-black p-3 bg-gray-50">
              <div className="w-9 h-9 bg-black text-white font-black text-xs flex items-center justify-center border-2 border-black shrink-0">
                {event.createdBy.fullName?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-400 uppercase">
                  Organized By
                </div>
                <div className="text-xs font-black uppercase">
                  {event.createdBy.fullName}
                </div>
                {event.collegeId?.name && (
                  <div className="text-[10px] text-gray-500 font-bold">
                    {event.collegeId.name}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isRegistered ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black font-black text-xs uppercase bg-[#B6FF60] shadow-[4px_4px_0px_#000]">
                <CheckCircle2 size={15} /> Already Registered
              </div>
            ) : deadlinePassed ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black font-black text-xs uppercase bg-gray-200 text-gray-500">
                <X size={15} /> Deadline Passed
              </div>
            ) : (
              <button
                onClick={() => onRegister(event._id)}
                disabled={isRegistering}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black font-black text-xs uppercase bg-[#B6FF60] hover:bg-black hover:text-[#B6FF60] shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
              >
                {isRegistering ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Ticket size={15} />
                )}
                {isRegistering ? "Registering..." : "Confirm Registration"}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-3 border-4 border-black font-black text-xs uppercase bg-white hover:bg-gray-100 shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────── */
const StudentEvents = () => {
  const navigate = useNavigate();
  const [myCollegeEvents, setMyCollegeEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date_asc");
  const [registeringId, setRegisteringId] = useState(null);
  const [userCollegeId, setUserCollegeId] = useState("");
  const [userCollegeName, setUserCollegeName] = useState("");
  const [collegeContext, setCollegeContext] = useState("My College");
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());


  useEffect(() => {
    if (USE_DUMMY) {

    const dummyEvents = [
      ,
      {
        _id: "456",
        title: "Robotics Workshop",
        category: "Workshop",
        eventDate: "2026-05-02",
        startTime: "02:00 PM",
        location: "Engineering Lab",
        maxSeats: 60,
        posterUrl: "https://images.unsplash.com/photo-1581091870622-1e7b3c6b8c5b",
        registrationDeadline: "2026-04-30",
        createdAt: "2026-03-10",
      },
      
    ];

    setMyCollegeEvents(dummyEvents);
    setExternalEvents([]);
    setLoading(false);
    return;
  }

    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await api.get("/auth/me");
        setUserCollegeId(
          userRes.data?.college?._id || "",
        );
        setUserCollegeName(
          userRes.data?.college?.name || "",
        );

        // Fetch both sets of events in parallel
        const [myCollegeRes, externalRes] = await Promise.all([
          api.get("/events/my-college"),
          api.get("/events/external"),
        ]);

        setMyCollegeEvents(myCollegeRes.data.events || []);
        setExternalEvents(externalRes.data.events || []);

        try {
          const regRes = await api.get("/registrations/my");
          const regIds = new Set(
            (regRes.data.registrations || [])
              .filter((r) => r.eventId)
              .map((r) =>
                typeof r.eventId === "string" ? r.eventId : r.eventId._id,
              ),
          );
          setRegisteredEventIds(regIds);
        } catch {
          // continue without registration data
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = useMemo(() => {
    // Pick the right source based on the active tab
    let result = collegeContext === "My College"
      ? [...myCollegeEvents]
      : [...externalEvents];

    if (activeCategory !== "All") {
      result = result.filter((e) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      if (sortBy === "date_asc")
        return new Date(a.eventDate) - new Date(b.eventDate);
      if (sortBy === "date_desc")
        return new Date(b.eventDate) - new Date(a.eventDate);
      if (sortBy === "title_asc")
        return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "title_desc")
        return (b.title || "").localeCompare(a.title || "");
      return 0;
    });
    return result;
  }, [
    myCollegeEvents,
    externalEvents,
    activeCategory,
    searchQuery,
    sortBy,
    collegeContext,
  ]);

  const handleRegister = async (eventId) => {
    try {
      setRegisteringId(eventId);
      await api.post("/registrations/register", { eventId });
      toast.success("🎉 Successfully registered!");
      setRegisteredEventIds((prev) => new Set([...prev, eventId]));
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleShare = (event) => {
    const text = `Check out "${event.title}" on ${fmtDate(event.eventDate)} at ${event.location}!`;
    if (navigator.share) navigator.share({ title: event.title, text });
    else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };



  const categoryOptions = CATEGORIES.map((c) => ({
    label: c === "All" ? "All Categories" : c,
    value: c,
  }));

  return (
    <div className="w-full font-mono min-h-screen">
      


      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          EVENT_FEED
        </h1>
        <div className="inline-flex items-center gap-2 bg-black text-[#B6FF60] px-3 py-1 text-[10px] font-bold uppercase mt-2 border-2 border-black shadow-[2px_2px_0px_#000]">
          <span className="w-2 h-2 bg-[#B6FF60] rounded-full animate-pulse" />
          LIVE // {filteredEvents.length} EVENTS FOUND
        </div>
      </div>

      {/* ── Search ── */}
      <div className="bg-white border-4 border-black p-1 shadow-[6px_6px_0px_#000] mb-6 flex">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={17}
          />
          <input
            type="text"
            className="w-full border-0 py-3 pl-12 pr-4 font-bold uppercase text-sm focus:outline-none placeholder:text-gray-400 bg-white"
            placeholder="Search events, venues, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="px-4 border-l-2 border-black hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center flex-wrap">
        {/* College Context Tabs */}
        <div className="border-4 border-black inline-flex bg-white shadow-[4px_4px_0px_#000] shrink-0">
          <button
            onClick={() => setCollegeContext("My College")}
            className={`px-5 py-2.5 flex items-center gap-2 border-r-4 border-black text-[11px] font-black uppercase transition-all ${
              collegeContext === "My College"
                ? "bg-[#B6FF60]"
                : "hover:bg-gray-100"
            }`}
          >
            <School size={13} /> My College
          </button>
          <button
            onClick={() => setCollegeContext("External")}
            className={`px-5 py-2.5 flex items-center gap-2 text-[11px] font-black uppercase transition-all ${
              collegeContext === "External"
                ? "bg-black text-[#B6FF60]"
                : "hover:bg-gray-100"
            }`}
          >
            <Globe size={13} /> External
          </button>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-black/20" />

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1 whitespace-nowrap">
            <SlidersHorizontal size={10} /> Category
          </span>
          <BrutalDropdown
            options={categoryOptions}
            value={activeCategory}
            onChange={setActiveCategory}
            icon={Tag}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1 whitespace-nowrap">
            <ArrowUpDown size={10} /> Sort
          </span>
          <BrutalDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            icon={ArrowUpDown}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-sm font-bold uppercase text-gray-400">
            LOADING_EVENTS...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border-4 border-dashed border-black bg-white p-16 text-center shadow-[6px_6px_0px_rgba(0,0,0,0.06)]">
          <Frown className="mx-auto mb-4 text-gray-300" size={56} />
          <p className="text-base font-black uppercase text-gray-500">
            NO EVENTS FOUND
          </p>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold">
            Try adjusting your filters or switching tabs.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredEvents.map((event) => {
            const catConfig =
              CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.Other;
            const deadlinePassed = isDeadlinePassed(event.registrationDeadline);
            const isRegistered = registeredEventIds.has(event._id);

            return (
              <article
                key={event._id}
                className="relative group cursor-pointer"
                onClick={() => navigate(`/student/events/${event._id}`)}
              >
                {/* Shadow layer */}
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-all duration-200" />

                {/* Card */}
                <div className="relative bg-white border-4 border-black flex flex-col h-full overflow-hidden group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                  {/* Poster */}
                  <div className="h-44 border-b-4 border-black relative bg-gray-100 overflow-hidden">
                    {event.posterUrl ? (
                      <img
                        src={
                          event.posterUrl.startsWith("http")
                            ? event.posterUrl
                            : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${event.posterUrl}`
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center h-full text-7xl font-black uppercase select-none"
                        style={{ color: `${catConfig.accent}15` }}
                      >
                        {catConfig.abbr}
                      </div>
                    )}

                    {/* Date badge */}
                    <div className="absolute top-3 left-3 bg-white border-2 border-black px-2 py-1 font-black text-sm shadow-[2px_2px_0px_#000]">
                      {fmtShort(event.eventDate)}
                    </div>

                    {/* Category badge */}
                    <div
                      className={`absolute bottom-3 left-3 px-2 py-0.5 border-2 border-black text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] ${catConfig.color}`}
                    >
                      {event.category}
                    </div>

                    {/* External */}
                    {event.collegeId?._id !== userCollegeId && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white border-2 border-black p-1 shadow-[2px_2px_0px_#000]">
                        <Globe size={11} />
                      </div>
                    )}

                    {/* Registered */}
                    {isRegistered && (
                      <div className="absolute bottom-3 right-3 bg-[#B6FF60] border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1">
                        <CheckCircle2 size={9} /> REGISTERED
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-black uppercase leading-tight mb-3 tracking-tighter line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4 text-[11px] font-bold text-gray-500 uppercase">
                      <div className="flex items-center gap-2">
                        <MapPin size={11} className="text-black shrink-0" />
                        <span className="truncate">
                          {event.location || "TBA"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={11} className="text-black shrink-0" />
                        <span>{event.startTime || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={11} className="text-black shrink-0" />
                        <span>{event.maxSeats || 100} seats</span>
                      </div>
                    </div>

                    {/* Deadline bar */}
                    <div className="w-full h-2 border-2 border-black mb-1">
                      <div
                        className={`h-full ${deadlinePassed ? "bg-red-400" : "bg-[#B6FF60]"}`}
                        style={{
                          width: `${Math.min(Math.max(((new Date() - new Date(event.createdAt)) / (new Date(event.registrationDeadline) - new Date(event.createdAt))) * 100, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-[9px] font-bold uppercase text-gray-400 mb-4">
                      {deadlinePassed
                        ? "DEADLINE PASSED"
                        : `DEADLINE: ${fmtDate(event.registrationDeadline)}`}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      {isRegistered ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-black font-black text-[10px] uppercase bg-[#B6FF60] shadow-[3px_3px_0px_#000]">
                          <CheckCircle2 size={13} /> REGISTERED
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
  e.stopPropagation();
  navigate(`/student/events/${event._id}`);
}}
                          disabled={deadlinePassed}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-black font-black text-[10px] uppercase shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all ${
                            deadlinePassed
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                              : "bg-[#B6FF60] hover:bg-black hover:text-[#B6FF60]"
                          }`}
                        >
                          <Ticket size={13} />
                          {deadlinePassed ? "CLOSED" : "VIEW & REGISTER"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(event);
                        }}
                        className="p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_#000] active:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default StudentEvents;
