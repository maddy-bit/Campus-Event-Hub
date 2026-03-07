import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Navigate } from "react-router-dom";

import Login from "./components/Login";
import RegistrationPage from "./components/RegistrationPage";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import LandingPage from "./components/LandingPage";
import DashboardLayout from "./components/DashboardLayout";

// Importing ProtectedRoute for role-based access control
import ProtectedRoute from "./components/ProtectedRoute";

// Importing layouts for different roles
import AdminLayout from "./layouts/AdminLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import StudentLayout from "./layouts/StudentLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";


// Importing dashboards for different roles
import CreateEvent from "./pages/organizer/CreateEvent";
import AdminDashboard from "./pages/admin/Dashboard";
import OrganizerDashboard from "./pages/organizer/Dashboard";
import SendNotification from "./pages/organizer/SendNotification";
import OrganizerMyEvents from "./pages/organizer/MyEvents";
import OrganizerProfile from "./pages/organizer/Profile";
import ViewParticipants from "./pages/organizer/ViewParticipants";
import OrganizerNotification from "./pages/organizer/Notification";
import StudentEvents from "./pages/student/Events";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import StudentProfile from "./pages/student/Profile";
import Notification from "./pages/student/Notification";
import Registrations from "./pages/student/Registrations";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />

        <Routes>

          {/* super admin route */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="admins" element={<div>Manage Admins</div>} />
          </Route>

          {/* admin route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<div>Users Page</div>} />
            <Route path="analytics" element={<div>Analytics Page</div>} />
          </Route>

          {/* organizer route */}
          <Route
            path="/organizer"
            element={
              //<ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerLayout />
              //</ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="myevents" element={<OrganizerMyEvents />} />
            <Route path="view-participants" element={<ViewParticipants />} />
            <Route path="profile" element={<OrganizerProfile />} />
            <Route path="inbox" element={<OrganizerNotification />} />
            <Route path="notifications" element={<SendNotification />} />
          </Route>

          {/* student route */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="events" />} />
            <Route path="events" element={<StudentEvents />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="notification" element={<Notification />} />
            <Route path="registrations" element={<Registrations />} />
          </Route>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Routes>

    </>
  );
}

export default App;
