import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import api from "../api";

const FloatingChatButton = () => {
  const [activeConnection, setActiveConnection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Hide tracking if we are currently in the chat
    if (location.pathname.includes("/chat/")) {
      setActiveConnection(null);
      return;
    }

    const fetchActiveConnection = async () => {
      try {
        const res = await api.get("/profile/active-connection");
        if (res.data.success && res.data.active) {
          setActiveConnection(res.data.data);
        } else {
          setActiveConnection(null);
        }
      } catch (error) {
        console.error("Error fetching active connection:", error);
      }
    };

    fetchActiveConnection();
    
    // Poll every 30 seconds
    const intervalId = setInterval(fetchActiveConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  if (!activeConnection || location.pathname.includes("/chat/")) return null;

  const handleResumeChat = () => {
    navigate(`/student/chat/${activeConnection.connectionId}`);
  };

  return (
    <button
      onClick={handleResumeChat}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#c6ff00] border-[4px] border-black p-3 md:px-5 md:py-3 shadow-[6px_6px_0px_#000] hover:bg-black hover:text-[#c6ff00] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0px_#000] group"
    >
      <div className="relative">
        <MessageCircle size={24} strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
        </span>
      </div>
      
      <div className="hidden sm:flex flex-col items-start font-mono text-left">
        <span className="text-[10px] font-black uppercase tracking-widest text-black group-hover:text-[#c6ff00] opacity-70">
          ACTIVE_SESSION
        </span>
        <span className="text-sm font-black uppercase truncate max-w-[120px]">
          {activeConnection.peer?.fullName || "PEER"}
        </span>
      </div>
    </button>
  );
};

export default FloatingChatButton;
