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
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Main Section */}
      <div className="flex flex-col">
        <div className="p-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;