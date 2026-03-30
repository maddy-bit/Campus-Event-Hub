import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Mail, Eye, X, CalendarOff, Users, Frown, Loader2 } from "lucide-react";
import api from "../../api";
import { toast } from "sonner";

// --- Sub-Components ---

const Stat = ({ label, value, sub, color }) => (
  <div className={`${color} p-3 sm:p-4 md:p-6 border-r-[3px] border-black last:border-r-0`}>
    <p className="text-[10px] font-black mb-1 opacity-80">{label}</p>
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">{value}</h2>
    <p className="text-[9px] font-bold mt-1 opacity-50">{sub}</p>
  </div>
);

const DetailRow = ({ label, value, isStatus }) => (
  <div className="border-b-2 border-black/10 pb-2">
    <p className="text-[9px] font-black text-gray-400">{label}</p>
    <p className={`font-black text-sm ${isStatus && (value === 'Completed' ? 'text-green-600' : 'text-orange-500')}`}>
      {value || "NOT PROVIDED"}
    </p>
  </div>
);

// --- Main Component ---

const ViewParticipants = () => {
  // 1. Data State
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  // 2. UI & Filter State
  const [eventSearch, setEventSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // 3. Modal State
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [modalType, setModalType] = useState(null); // 'email' | 'details' | null
  const [emailContent, setEmailContent] = useState({ subject: "", body: "" });

  // --- Data Fetching ---

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await api.get("/events/my-events");
        setEvents(res.data.events);
        if (res.data.events.length > 0) setSelectedEvent(res.data.events[0]);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;

    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/registrations/event/${selectedEvent._id}`);
        setParticipants(res.data.participants);
      } catch (err) {
        console.error("Error fetching participants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [selectedEvent]);

  // --- Memoized Logic ---

  const displayedEvents = useMemo(() => {
    const filtered = events.filter((e) => 
      e.title.toLowerCase().includes(eventSearch.toLowerCase())
    );
    return eventSearch.trim() === "" ? filtered.slice(0, 3) : filtered;
  }, [events, eventSearch]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const user = p.userId;
      const search = participantSearch.toLowerCase();
      return (
        user?.fullName?.toLowerCase().includes(search) || 
        user?.email?.toLowerCase().includes(search) || 
        user?.collegeId?.name?.toLowerCase().includes(search)
      );
    });
  }, [participants, participantSearch]);

  const stats = useMemo(() => {
    const total = participants.length;
    const pending = participants.filter(p => p.payment?.status === "Pending").length;
    const uniqueColleges = [...new Set(participants.map(p => p.userId?.collegeId?.name))].filter(Boolean).length;
    const remaining = Math.max(0, (selectedEvent?.maxSeats || 0) - total);
    
    return { total, pending, uniqueColleges, remaining };
  }, [participants, selectedEvent]);

  // --- Handlers ---

  const handleStatusChange = async (participantId, newStatus) => {
    try {
      setParticipants((prev) => 
        prev.map((p) => p._id === participantId 
          ? { ...p, payment: { ...p.payment, status: newStatus } } 
          : p
        )
      );
      await api.patch(`/events/${participantId}/payment`, { paymentStatus: newStatus });
      toast.success("Payment status updated successfully");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const closeModals = useCallback(() => {
    setModalType(null);
    setActiveParticipant(null);
    setEmailContent({ subject: "", body: "" });
  }, []);

  const handleSendEmail = () => {
    if (!emailContent.subject || !emailContent.body) {
      return toast.error("Please fill all fields");
    }
    toast.success(`Email sent to ${activeParticipant.userId.email}`);
    closeModals();
  };

  // --- Render Helpers ---

  const renderModal = () => {
    if (!modalType) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <span className="font-black">{modalType === 'email' ? 'SEND EMAIL' : 'PARTICIPANT DETAILS'}</span>
            <button onClick={closeModals} className="hover:text-red-400"><X size={20} /></button>
          </div>
          <div className="p-6">
            {modalType === 'email' ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-black mb-1">RECIPIENT:</label>
                  <input disabled value={activeParticipant?.userId?.email} className="w-full border-2 border-black p-2 bg-gray-100" />
                </div>
                <div>
                  <label className="block font-black mb-1">SUBJECT:</label>
                  <input 
                    value={emailContent.subject} 
                    onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})} 
                    className="w-full border-2 border-black p-2 focus:bg-[#B4F481] outline-none" 
                    placeholder="ENTER SUBJECT..." 
                  />
                </div>
                <div>
                  <label className="block font-black mb-1">MESSAGE BODY:</label>
                  <textarea 
                    rows={5} 
                    value={emailContent.body} 
                    onChange={(e) => setEmailContent({...emailContent, body: e.target.value})} 
                    className="w-full border-2 border-black p-2 focus:bg-[#B4F481] outline-none resize-none" 
                    placeholder="TYPE YOUR MESSAGE HERE..." 
                  />
                </div>
                <button onClick={handleSendEmail} className="w-full bg-black text-white p-3 font-black hover:bg-[#B4F481] hover:text-black transition-colors">
                  DISPATCH EMAIL
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <DetailRow label="FULL NAME" value={activeParticipant?.userId?.fullName} />
                <DetailRow label="EMAIL ADDRESS" value={activeParticipant?.userId?.email} />
                <DetailRow label="COLLEGE" value={activeParticipant?.userId?.collegeId?.name} />
                <DetailRow label="REGISTRATION ID" value={activeParticipant?._id} />
                {selectedEvent?.isPaidEvent && (
                  <DetailRow label="PAYMENT STATUS" value={activeParticipant?.payment?.status} isStatus />
                )}
                <button onClick={closeModals} className="w-full border-4 border-black p-2 mt-4 font-black hover:bg-black hover:text-white transition-all">
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F3F3F3] min-h-screen p-3 sm:p-4 md:p-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider relative">
      
      {/* LOADING STATE */}
      {eventsLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-sm font-bold uppercase text-gray-400">
            LOADING EVENTS...
          </p>
        </div>
      ) : events.length === 0 ? (
        /* NO EVENTS CREATED - EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="border-[4px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-12 max-w-lg w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 border-[3px] border-black bg-[#FFEB69] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CalendarOff size={36} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-3">NO EVENTS CREATED YET</h2>
            <p className="text-[12px] text-gray-500 font-bold leading-relaxed mb-6 normal-case">
              You haven't created any events yet. Once you create an event and it gets approved, you'll be able to view and manage participants here.
            </p>
            <a
              href="/organizer/create-event"
              className="inline-block border-[3px] border-black bg-[#B4F481] px-8 py-3 font-black text-[12px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              + CREATE YOUR FIRST EVENT
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* EVENT SELECTOR */}
          <div className="mb-8">
            <div className="relative w-full max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="SEARCH EVENTS..." 
                value={eventSearch} 
                onChange={(e) => setEventSearch(e.target.value)} 
                className="pl-10 pr-4 py-3 border-[3px] border-black w-full focus:outline-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              {displayedEvents.map((event) => (
                <button 
                  key={event._id} 
                  onClick={() => setSelectedEvent(event)} 
                  className={`border-[3px] border-black px-6 py-2 font-black transition-all ${
                    selectedEvent?._id === event._id 
                      ? "bg-[#B4F481] -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>

          {/* DASHBOARD CONTENT */}
          {selectedEvent && (
            <div className="border-[3px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-4 sm:p-6 md:p-8 border-b-[3px] border-black bg-black text-white flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-end">
                <div>
                  <p className="text-[#B4F481] text-[10px] mb-1 font-bold">ADMIN PANEL</p>
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter break-words">{selectedEvent.title}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 border-b-[3px] border-black">
                <Stat label="REGISTRATIONS" value={stats.total} sub={`of ${selectedEvent.maxSeats}`} color="bg-[#B4F481]" />
                <Stat label="SEATS LEFT" value={stats.remaining} sub="capacity" color="bg-white" />
                {selectedEvent?.isPaidEvent ? (
                  <Stat label="PENDING" value={stats.pending} sub="actions" color="bg-[#FFEB69]" />
                ) : (
                  <Stat label="STATUS" value="ACTIVE" sub="accepting users" color="bg-[#FFEB69]" />
                )}
                <Stat label="COLLEGES" value={stats.uniqueColleges} sub="campuses" color="bg-[#A2D2FF]" />
              </div>

              {/* PARTICIPANT SEARCH */}
              {participants.length > 0 && (
                <div className="p-4 border-b-[3px] border-black">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="SEARCH PARTICIPANTS..." 
                      value={participantSearch} 
                      onChange={(e) => setParticipantSearch(e.target.value)} 
                      className="pl-10 pr-4 py-2 border-[2px] border-black w-full focus:outline-none bg-white" 
                    />
                  </div>
                </div>
              )}

              {loading ? (
                /* Loading participants */
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-black" size={28} />
                  <p className="text-[11px] font-bold text-gray-400">LOADING PARTICIPANTS...</p>
                </div>
              ) : participants.length === 0 ? (
                /* NO PARTICIPANTS YET */
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 mx-auto mb-5 border-[3px] border-black bg-[#A2D2FF] flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Users size={28} />
                  </div>
                  <h3 className="text-lg font-black tracking-tighter mb-2">NO PARTICIPANTS YET</h3>
                  <p className="text-[11px] text-gray-500 font-bold text-center max-w-sm normal-case leading-relaxed">
                    No one has registered for this event yet. Share it with students and wait for registrations to come in!
                  </p>
                </div>
              ) : filteredParticipants.length === 0 ? (
                /* SEARCH RETURNED NO RESULTS */
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <Frown className="mb-4 text-gray-300" size={40} />
                  <h3 className="text-lg font-black tracking-tighter mb-2">NO MATCHING PARTICIPANTS</h3>
                  <p className="text-[11px] text-gray-500 font-bold text-center max-w-sm normal-case">
                    No participants match your search "{participantSearch}". Try a different search term.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-white border-b-[3px] border-black">
                        <th className="p-4 border-r-[2px] border-black w-12">#</th>
                        <th className="p-4 border-r-[2px] border-black">PARTICIPANT</th>
                        <th className="p-4 border-r-[2px] border-black">COLLEGE</th>
                        {selectedEvent?.isPaidEvent ? (
                          <th className="p-4 border-r-[2px] border-black">PAYMENT STATUS</th>
                        ) : (
                          <th className="p-4 border-r-[2px] border-black">PHONE NUMBER</th>
                        )}
                        <th className="p-4">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.map((p, index) => (
                        <tr key={p._id} className="border-b-[2px] border-black hover:bg-[#F3F3F3]">
                          <td className="p-4  border-r-[2px] border-black">{index + 1}</td>
                          <td className="p-4 border-r-[2px] border-black font-black">{p.userId?.fullName}</td>
                          <td className="p-4 border-r-[2px] border-black">{p.userId?.collegeId?.name}</td>
                          {selectedEvent?.isPaidEvent ? (
                            <td className="p-4 border-r-[2px] border-black">
                              <select 
                                value={p.payment?.status || "Pending"} 
                                onChange={(e) => handleStatusChange(p._id, e.target.value)} 
                                className={`border-2 border-black font-black px-2 py-1 text-[10px] ${
                                  p.payment?.status === "Completed" ? "bg-[#B4F481]" : "bg-[#FFEB69]"
                                }`}
                              >
                                <option value="Pending">PENDING</option>
                                <option value="Completed">COMPLETED</option>
                                <option value="Failed">FAILED</option>
                              </select>
                            </td>
                          ) : (
                            <td className="p-4 border-r-[2px] border-black">{p.userId?.phoneNumber || "NOT PROVIDED"}</td>
                          )}
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setActiveParticipant(p); setModalType('email'); }} 
                                className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                              >
                                <Mail size={14}/>
                              </button>
                              <button 
                                onClick={() => { setActiveParticipant(p); setModalType('details'); }} 
                                className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                              >
                                <Eye size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL PORTAL */}
      {renderModal()}
    </div>
  );
};

export default ViewParticipants;