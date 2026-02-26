import api from "../api";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    navigate("/login");
  };

  return (
    <div className="sticky top-0 bg-white shadow px-6 py-4 flex justify-between items-center z-30">
      <h1 className="text-xl font-semibold">{title}</h1>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 hover:text-red-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default Header;