import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  Users,
  Bell,
  Send,
  Inbox,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Zap,
  Trophy,
} from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const menuItems = [
  { name: "Dashboard", path: "/organizer/dashboard", icon: LayoutDashboard },
  { name: "Create", path: "/organizer/create-event", icon: CalendarPlus },
  { name: "Events", path: "/organizer/myevents", icon: ListChecks },
  { name: "Participants", path: "/organizer/view-participants", icon: Users },
  { name: "Rankings", path: "/organizer/leaderboard", icon: Trophy },
  { name: "Inbox", path: "/organizer/inbox", icon: Inbox },
  { name: "Send Notifs", path: "/organizer/notifications", icon: Send },
];

const bottomItems = [
  { name: "Profile", path: "/organizer/profile", icon: UserCircle2 },
];

/* ── Logo Block (reused in desktop + mobile drawer) ── */
const LogoBlock = () => (
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
);

const OrganizerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const NavContent = ({ onNavClick }) => (
    <>
      {/* Main Nav */}
      <nav className="flex-1 pt-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const showBadge = item.name === "Inbox" && notifCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all
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
              onClick={onNavClick}
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
          onClick={() => { onNavClick?.(); handleLogout(); }}
          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider hover:bg-black/5 border-2 border-transparent transition-all w-full text-left text-gray-500"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span>Exit</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar (fixed) ── */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen bg-[#faf9f4] border-r-[3px] border-black/10 shrink-0 fixed top-0 left-0 z-40">
        <LogoBlock />
        <NavContent />
      </aside>

      {/* ── Mobile: Hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#ccff00] border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: Drawer (includes logo) ── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[998]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 w-60 h-full bg-[#faf9f4] border-r-3 border-black z-[999] flex flex-col shadow-[6px_0_0_#000]">
            {/* Top: Logo + Close */}
            <div className="flex items-center justify-between pr-3">
              <LogoBlock />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]"
              >
                <X size={14} />
              </button>
            </div>
            <NavContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
};

export default OrganizerSidebar;
