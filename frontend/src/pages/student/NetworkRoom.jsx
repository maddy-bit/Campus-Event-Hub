import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, UserPlus, ArrowLeft, Loader2, CalendarX2, Zap } from "lucide-react";
import api from "../../api";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const NetworkRoom = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  // Socket and Networking State
  const [socket, setSocket] = useState(null);
  const [activePeers, setActivePeers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [sendingRequestTo, setSendingRequestTo] = useState(null);

  // 1. Fetch Profile & Registrations on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileRes = await api.get("/profile");
        const profile = profileRes.data.data;
        setCurrentUser(profile);

        // Check interests
        if (!profile.interests || profile.interests.length === 0) {
          toast.error("Please add networking interests to your profile first.");
          navigate("/student/profile");
          return; // Stop here if no interests
        }

        // Fetch registrations to check for today's events
        const regRes = await api.get("/registrations/my");
        const regs = regRes.data.registrations || [];
        
        const todayStr = new Date().toDateString();
        const activeToday = regs
          .map(r => r.eventId)
          .filter(event => {
            if (!event || !event.eventDate) return false;
            return new Date(event.eventDate).toDateString() === todayStr;
          });

        setTodayEvents(activeToday);

        // If exactly one event today, automatically select it
        if (activeToday.length === 1) {
          setSelectedEventId(activeToday[0]._id);
        }

      } catch (err) {
        console.error("Init NetworkRoom Error:", err);
        toast.error("Failed to load networking data");
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [navigate]);

  // 2. Initialize Socket Connection when an event is selected
  useEffect(() => {
    if (!selectedEventId || !currentUser) return;

    // Connect to backend socket
    const newSocket = io(API_BASE, {
      withCredentials: true,
      transports: ["websocket"]
    });

    setSocket(newSocket);

    // Socket Event: Connect
    newSocket.on("connect", () => {
      console.log("Connected to networking server:", newSocket.id);
      
      // Join Room Payload
      const payload = {
        userId: currentUser._id,
        eventId: selectedEventId,
        userProfile: {
          fullName: currentUser.fullName,
          role: currentUser.role,
          college: currentUser.collegeId?.name || "Local College",
          interests: currentUser.interests || []
        }
      };

      newSocket.emit("joinEventRoom", payload, (res) => {
        if (!res.success) {
          toast.error(res.message);
        }
      });
    });

    // Socket Event: Active Peers Update
    newSocket.on("activeUsersUpdate", (peers) => {
      // Filter out self
      const others = peers.filter(p => p.userId !== currentUser._id);
      setActivePeers(others);
    });

    // Socket Event: Incoming Connection Request
    newSocket.on("incomingConnectRequest", (data) => {
      setIncomingRequest(data);
    });

    // Socket Event: Request Accepted
    newSocket.on("connectRequestAccepted", (data) => {
      toast.success("Request accepted! Entering chat...");
      navigate(`/student/chat/${data.connectionId}`);
    });

    // Socket Event: Request Rejected
    newSocket.on("connectRequestRejected", () => {
      toast.error("Your connection request was declined.");
      setSendingRequestTo(null);
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [selectedEventId, currentUser, navigate]);

  // Actions
  const handleSendRequest = (peerId) => {
    if (!socket) return;
    setSendingRequestTo(peerId);
    
    socket.emit("sendConnectRequest", {
      requesterId: currentUser._id,
      recipientId: peerId,
      eventId: selectedEventId
    }, (res) => {
      if (!res.success) {
        toast.error(res.message || "Failed to send request");
        setSendingRequestTo(null);
      } else {
        toast.success("Signal sent! Waiting for response...");
      }
    });
  };

  const handleRespondRequest = (action) => {
    if (!socket || !incomingRequest) return;

    socket.emit("respondConnectRequest", {
      connectionId: incomingRequest.connectionId,
      action: action,
      responderId: currentUser._id
    }, (res) => {
      if (action === "Accept" && res.success) {
        toast.success("Connection established!");
        navigate(`/student/chat/${incomingRequest.connectionId}`);
      } else if (action === "Reject") {
        setIncomingRequest(null);
      }
    });
  };

  // ----------------------------------------------------------------
  // RENDER BLOCKS
  // ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4EB] flex flex-col items-center justify-center p-8 font-mono">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm">INITIALIZING_UPLINK...</p>
      </div>
    );
  }

  // BLOCKED: No event today
  if (todayEvents.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F4EB] font-mono p-8 md:p-16 flex flex-col items-center justify-center">
        <div className="bg-white border-[4px] border-black p-10 max-w-lg w-full shadow-[8px_8px_0px_#000] text-center flex flex-col items-center">
          <CalendarX2 size={64} className="mb-6 opacity-30" />
          <h1 className="text-2xl font-black uppercase mb-4 leading-tight">OFFLINE_MODE</h1>
          <p className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-8 leading-relaxed">
            You have to be physically attending an event today to access the proximity networking feature. 
            No active passes found for {new Date().toLocaleDateString()}.
          </p>
          <button 
            onClick={() => navigate("/student/events")}
            className="w-full bg-[#c6ff00] border-[3px] border-black py-4 font-black uppercase tracking-widest hover:bg-black hover:text-[#c6ff00] transition-colors shadow-[4px_4px_0px_#000]"
          >
            BROWSE_EVENTS
          </button>
        </div>
      </div>
    );
  }

  // REQUIRED: Multiple events selection
  if (todayEvents.length > 1 && !selectedEventId) {
    return (
      <div className="min-h-screen bg-[#F4F4EB] font-mono p-8 flex flex-col items-center justify-center selection:bg-black selection:text-[#c6ff00]">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-black uppercase mb-2">SELECT_NETWORK_ZONE</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">You are attending multiple events today.</p>
          
          <div className="grid grid-cols-1 gap-6">
            {todayEvents.map(ev => (
              <div key={ev._id} className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="bg-black text-white text-[10px] px-2 py-1 font-black tracking-widest uppercase mb-3 inline-block">
                    {ev.category || "EVENT"}
                  </span>
                  <h2 className="text-xl font-black uppercase">{ev.title}</h2>
                  <p className="text-xs font-bold text-gray-500 mt-2 uppercase flex items-center gap-2">
                    <Zap size={12} /> {ev.location}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedEventId(ev._id)}
                  className="bg-[#c6ff00] border-3 border-black px-6 py-3 font-black text-sm uppercase shadow-[3px_3px_0px_#000] hover:bg-[#aee600] transition-colors w-full md:w-auto text-center"
                >
                  ENTER_ZONE
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ROOM UI
  
  // Filter peers by search query
  const filteredPeers = activePeers.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.profile.fullName.toLowerCase().includes(q);
    const tagMatch = p.profile.interests.some(t => t.toLowerCase().includes(q));
    return nameMatch || tagMatch;
  });

  return (
    <div className="min-h-screen bg-[#F4F4EB] font-mono p-4 md:p-8 selection:bg-[#c6ff00] selection:text-black relative">
      <div className="max-w-6xl mx-auto flex flex-col items-center pb-24">
        
        {/* Header & Back Action */}
        <div className="w-full flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate("/student/registrations")}
            className="bg-white border-[3px] border-black p-2 md:px-6 md:py-3 font-black text-sm uppercase tracking-widest hover:bg-black hover:text-[#c6ff00] transition-colors shadow-[4px_4px_0px_#000] flex items-center gap-2"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            <span className="hidden md:inline">LEAVE_ZONE</span>
          </button>
          
          <div className="text-right flex flex-col items-end">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              LIVE_NETWORK
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-black"></span>
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activePeers.length} PEERS ONLINE</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full flex border-[4px] border-black bg-white mb-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
          <input
            type="text"
            placeholder="SEARCH BY NAME OR INTEREST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-4 md:px-6 md:py-5 outline-none text-black font-bold uppercase tracking-widest text-xs md:text-sm placeholder:text-gray-400"
          />
          <div className="bg-black text-[#c6ff00] px-6 py-4 md:px-8 md:py-5 font-black uppercase tracking-widest flex items-center justify-center">
            <Search size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* Users Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPeers.length === 0 ? (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-black bg-white">
              <p className="font-black text-gray-400 uppercase tracking-widest">
                {searchQuery ? "NO_MATCHING_PEERS_FOUND" : "WAITING_FOR_PEERS_TO_JOIN..."}
              </p>
            </div>
          ) : (
            filteredPeers.map((peer) => {
              const initials = peer.profile.fullName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
              const isSending = sendingRequestTo === peer.userId;
              
              return (
                <div
                  key={peer.userId}
                  className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-center p-4 md:p-5 gap-4 border-b-[4px] border-black bg-gray-50/50">
                    <div className="w-12 h-12 border-[3px] border-black flex items-center justify-center font-black text-xl italic shadow-[2px_2px_0px_#000] bg-white">
                      {initials}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-black italic text-lg md:text-xl tracking-wider text-black truncate">
                        {peer.profile.fullName}
                      </span>
                      <span className="text-[10px] font-bold tracking-widest text-gray-500 mt-0.5 truncate uppercase">
                        {peer.profile.college}
                      </span>
                    </div>
                  </div>

                  {/* Body/Tags */}
                  <div className="p-4 md:p-5 flex-1 border-b-[4px] border-black flex flex-col bg-white">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                      <Zap size={10} /> CORE_INTERESTS
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {peer.profile.interests.map((tag, idx) => {
                        const isMatch = currentUser.interests.map(i=>i.toLowerCase()).includes(tag.toLowerCase());
                        return (
                          <span
                            key={idx}
                            className={`border-[2px] border-black text-black text-[9px] font-black px-2 py-1 shadow-[2px_2px_0px_#000] uppercase tracking-wider ${
                              isMatch ? "bg-[#c6ff00]" : "bg-white text-gray-600"
                            }`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Connect Action */}
                  <div className="p-4 md:p-5 bg-gray-50/50">
                    <button 
                      onClick={() => handleSendRequest(peer.userId)}
                      disabled={isSending}
                      className="w-full bg-black text-[#c6ff00] border-[3px] border-black py-3 px-4 font-black text-xs uppercase hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
                    >
                      {isSending ? (
                        <Loader2 size={16} className="animate-spin text-[#c6ff00]" />
                      ) : (
                        <UserPlus size={16} strokeWidth={3} className="text-[#c6ff00]" />
                      )}
                      <span className="tracking-widest">{isSending ? "TRANSMITTING..." : "SEND_CONNECT_SIGNAL"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── INCOMING REQUEST MODAL ── */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#B6FF60] border-[4px] border-black shadow-[12px_12px_0px_#000] p-6 max-w-sm w-full animate-in zoom-in duration-200">
            <h3 className="text-[10px] font-black uppercase text-black/60 tracking-widest mb-1">INCOMING_TRANSMISSION</h3>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-none">
              {incomingRequest.requester.fullName} 
              <br/><span className="text-lg"> wants to connect!</span>
            </h2>
            
            <div className="flex flex-wrap gap-1.5 mb-8">
              {incomingRequest.requester.interests.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[8px] bg-black text-[#c6ff00] px-2 py-1 font-black uppercase tracking-widest border border-black">{tag}</span>
              ))}
              {incomingRequest.requester.interests.length > 3 && <span className="text-[8px] font-black uppercase tracking-widest mt-1">+{incomingRequest.requester.interests.length - 3} MORE</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleRespondRequest("Reject")}
                className="bg-white border-3 border-black p-3 font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-colors shadow-[3px_3px_0px_#000]"
              >
                SKIP
              </button>
              <button 
                onClick={() => handleRespondRequest("Accept")}
                className="bg-black text-[#c6ff00] border-3 border-black p-3 font-black text-xs uppercase hover:bg-gray-800 transition-colors shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2"
              >
                ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkRoom;
