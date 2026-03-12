import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, AppWindow, X } from "lucide-react";
import { toast } from "sonner";
import api from "../api";

const LogoBlock = () => (
  <div className="px-6 pt-8 pb-8">
    <Link to="/admin/dashboard" className="flex items-center gap-3">
      <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-md">
        <AppWindow size={20} color="white" strokeWidth={2.5} />
      </div>
      <span className="font-extrabold text-xl tracking-tight text-black leading-none mt-1">
        INFYevnthub
      </span>
    </Link>
  </div>
);

const AdminSidebar = ({ menuItems, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out safely");
    } catch { /* silent */ }
    navigate("/login");
  };

  const NavContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full  overflow-hidden ">
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                           (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
             <Link
               key={index}
               to={item.path}
               onClick={onNavClick}
               className={`flex items-center gap-3.5 px-4 py-3.5 rounded-[12px] md:rounded-2xl transition-all duration-300 font-bold text-[14px] leading-none
                 ${
                   isActive
                     ? "bg-black text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]"
                     : "text-[#64748b] hover:bg-gray-100 hover:text-black"
                 }`}
             >
               <Icon size={18} strokeWidth={isActive ? 3 : 2.5} />
               <span>{item.name}</span>
             </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6 mt-4 ">
        <button
          onClick={() => {
            onNavClick?.();
            handleLogout();
          }}
          className="flex items-center  gap-3.5 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-[14px] w-full text-left group leading-none"
        >
          <LogOut size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar (fixed) ── */}
      <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-white shrink-0 fixed top-0 left-0 z-40 border-r border-[#e2e8f0] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
        <LogoBlock />
        <NavContent />
      </aside>

      {/* ── Mobile: Drawer ── */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[998] backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen?.(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 w-[280px] h-full bg-white z-[999] flex flex-col shadow-2xl transition-transform transform translate-x-0">
            {/* Top: Logo + Close */}
            <div className="flex items-center justify-between pr-4">
              <LogoBlock />
              <button
                onClick={() => setIsOpen?.(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-[#64748b] hover:text-black hover:bg-gray-200"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <NavContent onNavClick={() => setIsOpen?.(false)} />
          </aside>
        </>
      )}
    </>
  );
};

export default AdminSidebar;