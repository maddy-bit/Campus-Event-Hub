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
import CreateEvent from "./components/CreateEvent";
import DashboardLayout from "./components/DashboardLayout";

// Importing ProtectedRoute for role-based access control
import ProtectedRoute from "./components/ProtectedRoute";

// Importing layouts for different roles
import AdminLayout from "./layouts/AdminLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import StudentLayout from "./layouts/StudentLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";


// Importing dashboards for different roles
import AdminDashboard from "./pages/admin/Dashboard";
import OrganizerDashboard from "./pages/organizer/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />

        <Routes>

          {/* super admin route */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
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
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
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
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="create-event" element={<div>Create Event Page</div>} />
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
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="events" element={<div>Browse Events</div>} />
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
