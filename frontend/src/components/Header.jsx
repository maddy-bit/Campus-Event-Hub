import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { Bell, Menu, LogOut, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import "../styles/Header.css";
 
const Header = ({ onMenuClick, hideMenu, title, variant }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
 
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
 
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
 
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out safely");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login");
    }
  };
 
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
 
  // For student/organizer variants, sidebar handles nav + logout + logo
  const isNewLayout = variant === "student" || variant === "organizer";
  const notifPath = variant === "student"
    ? "/student/notification"
    : variant === "organizer"
    ? "/organizer/notifications"
    : "/student/notification";
 
  const profilePicUrl = user?.profilePicture
    ? `${API_BASE}/${user.profilePicture}`
    : null;
 
  return (
    <div
      className="neo-header"
      style={isNewLayout ? { background: "#faf9f4", borderBottom: "3px solid rgba(0,0,0,0.1)" } : undefined}
    >
 
      {/* LEFT */}
      <div className={`neo-header-left ${isNewLayout && user?.role === "organizer" ? "ml-14 md:ml-0" : ""}`}>
        {/* Menu button: only for admin/superadmin (old sidebar) */}
        {!hideMenu && !isNewLayout && (
          <button className="neo-menu-btn" onClick={onMenuClick}>
            <Menu size={20} />
          </button>
        )}
 
        {/* Logo: plain text for student/organizer mobile, boxed for admin/superadmin */}
        {isNewLayout ? (
          <Link to="/" className="md:hidden flex items-center gap-1.5 no-underline text-black">
            <span style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "-1px", textTransform: "uppercase" }}>
              INFY
            </span>
            <span style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.5 }}>
              EVENT HUB
            </span>
          </Link>
        ) : (
          <Link to="/" className="neo-logo">
            <div className="logo-icon">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="logo-text">
              <span className="hub">INFY</span>
              <span className="ceh">EVENT HUB</span>
            </div>
          </Link>
        )}
      </div>
 
      {/* CENTER: Title — only for admin/superadmin */}
      {title && !isNewLayout && (
        <div className="neo-header-title md:block hidden">
          {title.toUpperCase()}
        </div>
      )}
 
      {/* RIGHT: USER & ACTIONS */}
      <div className="neo-header-right">
 
        {/* Notification bell — only for layouts without it in sidebar */}
        {!isNewLayout && (
          <Link to={notifPath} className="neo-action-box" title="Notifications">
            <Bell size={20} />
            <div className="notif-dot"></div>
          </Link>
        )}
 
        {/* User badge */}
        <div className="neo-profile-badge">
          <div className="avatar">
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              user ? getInitials(user.fullName) : "..."
            )}
          </div>
          <div className="info md:block hidden">
            <div className="name">{user ? user.fullName : "Loading..."}</div>
            <div className="role">{user ? user.role : ""}</div>
          </div>
        </div>
 
        {/* Logout — only for admin/superadmin (old layout) */}
        {!isNewLayout && (
          <button
            type="button"
            onClick={handleLogout}
            className="neo-action-box logout"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
 
      </div>
 
    </div>
  );
};
 
export default Header;
 
 