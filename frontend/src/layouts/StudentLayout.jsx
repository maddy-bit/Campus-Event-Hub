import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  User
} from "lucide-react";

const studentMenuItems = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { name: "Browse Events", path: "/student/events", icon: CalendarDays },
  { name: "My Registrations", path: "/student/registrations", icon: Ticket },
  { name: "Profile", path: "/student/profile", icon: User },
];

const StudentLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar menuItems={studentMenuItems} />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="Student Panel" />

        <div className="p-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default StudentLayout;