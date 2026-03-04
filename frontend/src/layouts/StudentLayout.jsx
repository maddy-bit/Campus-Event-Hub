import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";

const StudentLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f3f1ea] font-sans selection:bg-[#ccff00]">

      <StudentSidebar />

      {/* Main content — shifted right on desktop for the fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-52">
        <Header
          hideMenu={true}
          variant="student"
        />


        <div className="p-6 pb-28 md:pb-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default StudentLayout;
