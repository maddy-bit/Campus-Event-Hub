import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';

import "./App.css";

import Login from "./components/Login";
import RegistrationPage from "./components/RegistrationPage";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import LandingPage from "./components/LandingPage";
import CreateEvent from "./components/CreateEvent";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
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
      </Router>
    </>
  );
}

export default App;
