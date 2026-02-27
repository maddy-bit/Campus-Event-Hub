import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar menuItems={adminMenuItems} />

      <div className="flex-1  flex flex-col">
        
        <Header title="Admin Panel" />

        <div className="p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;