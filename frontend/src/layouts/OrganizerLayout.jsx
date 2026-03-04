import { Outlet } from "react-router-dom";
import OrganizerSidebar from "../components/OrganizerSidebar";
import Header from "../components/Header";

import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  Users,
  BarChart3,
  UserCircle2
} from "lucide-react";


const OrganizerLayout = () => {
  return (

    <div className="flex min-h-screen bg-[#f3f1ea] font-sans selection:bg-[#ccff00]">

      <OrganizerSidebar />


      {/* Main content — shifted right on desktop for the fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-52">
        <Header
          hideMenu={true}
          variant="organizer"
        />

        <div className="p-6 ">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default OrganizerLayout;
