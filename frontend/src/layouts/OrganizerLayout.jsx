import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  Users,
  BarChart3,
  UserCircle2
} from "lucide-react";

const organizerMenuItems = [
  { name: "Dashboard", path: "/organizer/dashboard", icon: LayoutDashboard },
  { name: "Create Event", path: "/organizer/create-event", icon: CalendarPlus },
  { name: "My Events", path: "/organizer/events", icon: ListChecks },
  { name: "Participants", path: "/organizer/participants", icon: Users },
  { name: "Profile", path: "/organizer/profile", icon: UserCircle2 },
];

const OrganizerLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar menuItems={organizerMenuItems} />

      {/* Main Section */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="Organizer Panel" />

        <div className="p-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default OrganizerLayout;