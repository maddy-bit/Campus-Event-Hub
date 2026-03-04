import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  Ticket,
  Bell,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const menuItems = [
  { name: "Events", path: "/student/events", icon: CalendarDays },
  { name: "Tickets", path: "/student/registrations", icon: Ticket },
  { name: "Notifs", path: "/student/notification", icon: Bell },
];

const bottomItems = [
  { name: "Profile", path: "/student/profile", icon: User },
];

const StudentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await api.get("/notifications/my");
        const unread = (res.data.notifications || []).filter((n) => !n.isRead).length;
        setNotifCount(unread);
      } catch { /* silent */ }
    };
    fetchNotifCount();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out safely");
    } catch { /* silent */ }
    navigate("/login");
  };

  return (
    <>
      {/* ── Desktop Sidebar (fixed) ── */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen bg-[#faf9f4] border-r-[3px] border-black/10 shrink-0 fixed top-0 left-0 z-40">

        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-black/10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#ccff00] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:shadow-[3px_3px_0px_#000] group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] transition-all">
              <Zap size={16} fill="currentColor" />
            </div>
            <div className="leading-none">
              <span className="block text-[13px] font-black tracking-tighter uppercase">Infy</span>
              <span className="block text-[9px] font-bold tracking-widest uppercase text-gray-400">Event Hub</span>
            </div>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 pt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.name === "Notifs" && notifCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all relative
                  ${isActive
                    ? "bg-[#ccff00] border-2 border-black shadow-[3px_3px_0px_#000]"
                    : "hover:bg-black/5 border-2 border-transparent"
                  }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                <span>{item.name}</span>
                {showBadge && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[8px] font-black flex items-center justify-center border border-black">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-5 space-y-1 border-t border-black/10 pt-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all
                  ${isActive
                    ? "bg-[#ccff00] border-2 border-black shadow-[3px_3px_0px_#000]"
                    : "hover:bg-black/5 border-2 border-transparent"
                  }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider hover:bg-black/5 border-2 border-transparent transition-all w-full text-left text-gray-500"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span>Exit</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav (floating) — NO logo on mobile ── */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white border-3 border-black shadow-[5px_5px_0px_#000] z-50 flex items-center justify-around py-2 px-1">
        {[...menuItems, ...bottomItems].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const showBadge = item.name === "Notifs" && notifCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[8px] font-black uppercase transition-all relative
                ${isActive
                  ? "bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000]"
                  : "border-2 border-transparent"
                }`}
            >
              <Icon size={18} strokeWidth={2.5} />
              <span>{item.name}</span>
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[7px] font-black flex items-center justify-center border border-black rounded-full">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default StudentSidebar;
