import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bell,
  Upload,
  LineChart,
  CheckCircle,
  UserCheck
} from "lucide-react";

const adminMenuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Manage Users", path: "/admin/users", icon: Users },
  { name: "Analytics", path: "/admin/analytics", icon: LineChart },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f1ea] font-sans selection:bg-[#ccff00]">
      
      <Sidebar 
        menuItems={adminMenuItems} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        
        <Header 
          title="Admin" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
