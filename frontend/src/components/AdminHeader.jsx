import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import api from "../api";

const AdminHeader = ({ title, onMenuClick }) => {
  const [user, setUser] = useState(null);
  
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-transparent px-4 py-4 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      <div className="flex items-center justify-between md:hidden w-full">
        <Link to="/" className="flex items-center gap-1.5 no-underline text-black">
          <span style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "-1px", textTransform: "uppercase" }}>INFY</span>
          <span style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.5 }}>EVENT HUB</span>
        </Link>
        <button
          onClick={onMenuClick}
          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="hidden md:flex flex-col">
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-4 w-full md:w-auto">
        <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors relative bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md">
          <Bell size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full py-1.5 pl-1.5 pr-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600 tracking-tighter">
            {user ? getInitials(user.fullName) : "AP"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-black leading-tight truncate max-w-[120px]">
              {user ? user.fullName : "Admin Principal"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
