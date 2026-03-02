import api from "../api";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import "../styles/Header.css"; // make sure this exists

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    }
    navigate("/login");
  };

  return (
    <div className="neo-header">

      {/* LEFT SIDE */}
      <div className="neo-header-left">

        {/* Menu Button */}
        <div className="neo-menu-btn">
          <Menu size={18} />
        </div>

        {/* Search Box */}
        <div className="neo-search">
          <input
            type="text"
            placeholder="SEARCH_DATA..."
          />
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="neo-header-right">

        {/* Notification */}
        <div className="neo-icon-box">
          <Bell size={18} />
        </div>

        {/* User Badge */}
        <div className="neo-user-badge">

          <div className="neo-user-initials">
            SJ
          </div>

          <div className="neo-user-info">
            <div className="name">S. JENKINS</div>
            <div className="role">ORGANIZER</div>
          </div>

          <button
            onClick={handleLogout}
            className="neo-exit-btn"
          >
            Exit
          </button>

        </div>

      </div>

    </div>
  );
};

export default Header;