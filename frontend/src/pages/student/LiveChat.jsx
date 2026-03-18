import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Send, ArrowLeft, Loader2, Clock, AlertTriangle } from "lucide-react";
import api from "../../api";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const LiveChat = () => {
  const { connectionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [peerId, setPeerId] = useState(null);

  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/profile");
        setCurrentUser(profileRes.data.data);
      } catch (err) {
        toast.error("Failed to authenticate session.");
        navigate("/student/network");
      }
    };
    initialize();
  }, [navigate]);

  // Socket
  useEffect(() => {
    if (!currentUser || !connectionId) return;

    const newSocket = io(API_BASE, {
      withCredentials: true,
      transports: ["websocket"]
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinChatSession", {
        connectionId,
        userId: currentUser._id
      }, (res) => {
        if (!res.success) {
          toast.error(res.message);
          setIsExpired(true);
          setLoading(false);
          return;
        }

        const expiresAt = new Date(res.chatExpiresAt).getTime();
        const now = Date.now();
        const diffSeconds = Math.floor((expiresAt - now) / 1000);

        if (diffSeconds <= 0) {
          setIsExpired(true);
        } else {
          setTimeLeft(diffSeconds);
          setPeerId(res.peerId);
        }
        
        setLoading(false);
      });
    });

    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Handle peer leaving
    newSocket.on("peerLeftChat", (data) => {
      if (data.connectionId === connectionId) {
        toast.info("Peer has left the session.");
        setIsExpired(true);
      }
    });

    newSocket.on("peerDisconnected", (data) => {
      if (data.userId === peerId) {
        toast.info("Peer disconnected.");
        setIsExpired(true);
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit("leaveChat", { connectionId, userId: currentUser._id });
        newSocket.disconnect();
      }
    };
  }, [currentUser, connectionId, peerId]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          toast.error("Networking session has expired.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isExpired]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket || isExpired) return;

    const text = inputValue.trim();
    setInputValue("");

    socket.emit("sendMessage", {
      connectionId,
      senderId: currentUser._id,
      text
    }, (res) => {
      if (!res.success) {
        toast.error(res.message);
        if (res.message.includes("expired")) {
           setIsExpired(true);
        }
      } else {
        setMessages(prev => [...prev, res.message]);
      }
    });
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4EB] flex flex-col items-center justify-center font-mono">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-black">ESTABLISHING_SECURE_LINK...</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F4F4EB] flex flex-col items-center justify-center font-mono p-8 text-center text-black">
        <div className="bg-white border-[4px] border-black p-12 shadow-[12px_12px_0px_#000] max-w-lg w-full">
          <AlertTriangle size={64} className="mb-6 opacity-30 mx-auto" strokeWidth={1.5} />
          <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">CONNECTION_TERMINATED</h1>
          <p className="font-bold text-gray-500 uppercase tracking-widest mb-8 leading-relaxed">
            The networking window is closed. 
            Your session data is being cleared for privacy.
          </p>
          <button 
            onClick={() => navigate("/student/network")}
            className="w-full bg-[#c6ff00] border-[4px] border-black py-5 font-black text-sm uppercase tracking-widest hover:bg-black hover:text-[#c6ff00] transition-colors shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_#111]"
          >
            RETURN_TO_LOBBY
          </button>
        </div>
      </div>
    );
  }

  const isLowTime = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="h-screen bg-[#F4F4EB] font-mono flex flex-col p-2 md:p-8 selection:bg-black selection:text-[#c6ff00]">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        
        {/* Header */}
        <div className="border-b-[4px] border-black p-4 md:p-6 flex justify-between items-center bg-white z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (socket) socket.emit("leaveChat", { connectionId, userId: currentUser._id });
                navigate("/student/network");
              }}
              className="w-12 h-12 border-[3.5px] border-black flex items-center justify-center bg-white hover:bg-black hover:text-[#c6ff00] transition-all shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            >
              <ArrowLeft size={22} strokeWidth={3} />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-black uppercase text-xs tracking-[0.2em] text-gray-400">SESSION_ID</h2>
              <p className="font-black text-sm text-black truncate max-w-[150px]">{connectionId.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-4 border-[4px] border-black px-6 py-3 font-black text-2xl tracking-widest shadow-[4px_4px_0px_#000] transition-colors ${isLowTime ? "bg-red-500 text-white animate-pulse" : "bg-black text-[#c6ff00]"}`}>
            <Clock size={24} strokeWidth={3} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-black text-[#c6ff00] py-2 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#c6ff00] animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">SECURE_UPLINK_ACTIVE</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em]">10min_TTL</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-gray-50/50 flex flex-col custom-scrollbar">
          <div className="flex flex-col items-center mb-4">
             <div className="w-full h-[2px] bg-black/10 relative">
               <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F4F4EB] px-4 text-[10px] font-black text-gray-400 tracking-widest uppercase">
                 ESTABLISHED_AT_{new Date().toLocaleTimeString().slice(0,5)}
               </span>
             </div>
          </div>

          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser?._id;
            
            return (
              <div key={msg._id || i} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] md:max-w-[70%] border-[3.5px] border-black p-5 relative shadow-[6px_6px_0px_#000] ${isMe ? "bg-[#c6ff00] text-black" : "bg-white text-black"}`}>
                  {/* Bubble Tail */}
                  <div className={`absolute top-0 w-4 h-4 border-black ${isMe ? "-right-2 border-r-[3.5px] border-t-[3.5px] bg-[#c6ff00] rotate-[45deg]" : "-left-2 border-l-[3.5px] border-t-[3.5px] bg-white rotate-[-45deg]"}`}></div>

                  <p className="font-bold text-sm md:text-base break-words leading-relaxed uppercase relative z-10">
                    {msg.content}
                  </p>
                  <div className={`flex items-center gap-2 mt-3 pt-2 border-t-[1.5px] border-black/10 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-[9px] font-black text-black">
                      {isMe ? "TX" : "RX"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-[4px] border-black p-4 md:p-8 bg-white shrink-0 z-20">
          <form onSubmit={handleSend} className="flex gap-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="TYPE_TRANSMISSION..."
                className="w-full border-[3.5px] border-black px-6 py-5 font-black uppercase tracking-widest text-sm outline-none bg-white focus:bg-[#fcfcfc] transition-all placeholder:text-gray-300"
                disabled={isExpired}
              />
              <div className="absolute top-0 right-4 h-full flex items-center">
                 <span className="text-[10px] font-black text-black/20 group-focus-within:text-[#c6ff00] transition-colors uppercase italic">STABLE</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isExpired}
              className="bg-black text-[#c6ff00] border-[4px] border-black px-10 py-5 font-black uppercase flex items-center justify-center gap-3 hover:bg-[#1a1a1a] disabled:opacity-30 transition-all shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0px_#000]"
            >
              <Send size={24} strokeWidth={3} />
              <span className="hidden md:inline tracking-[0.2em]">SEND</span>
            </button>
          </form>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F4F4EB;
          border-left: 2px solid black;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: black;
          border: 1px solid #c6ff00;
        }
      `}</style>
    </div>
  );
};

export default LiveChat;
