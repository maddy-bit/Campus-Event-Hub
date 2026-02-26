import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LineChart
} from "lucide-react";

const superAdminMenuItems = [
  { name: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Manage Admins", path: "/superadmin/admins", icon: ShieldCheck },
  { name: "All Users", path: "/superadmin/users", icon: Users },
  { name: "Analytics", path: "/superadmin/analytics", icon: LineChart },
  { name: "System Settings", path: "/superadmin/settings", icon: Settings },
];

const SuperAdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar menuItems={superAdminMenuItems} />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="Super Admin Panel" />

        <div className="p-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminLayout;