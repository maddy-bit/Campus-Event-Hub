import { Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCircle,
  Clock,
  Bell,
  GraduationCapIcon
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

// Sidebar Menu items to match the screenshot "Admin Theme"
const adminMenuItems = [
  { name: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Events", path: "/superadmin/events", icon: CalendarDays },
  { name: "College Setup", path: "/superadmin/setup", icon: CalendarDays },
  { name: "Institutions", path: "/superadmin/institutions", icon: GraduationCapIcon },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      
      <AdminSidebar 
        menuItems={adminMenuItems} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        
        <AdminHeader 
          title="Admin" 
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="p-4 md:p-8 pt-2 md:pt-4">
          <div className="max-w-[1400px] mx-auto w-full">
             <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
