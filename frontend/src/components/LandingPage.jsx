import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
    { label: "Verify Email", path: "/verify-email" },
    { label: "Forgot Password", path: "/forgot-password" },
    { label: "Verify OTP", path: "/verify-otp" },
    { label: "Reset Password", path: "/reset-password" },
  ];

  return (
    <div className="flex gap-7 flex-col items-center justify-center h-screen ">
      Landing page  Will be created at the end of the project
      {actions.map((action) => (
        <button
          className="bg-red-400 block rounded-lg text-white py-6"
          key={action.path}
          onClick={() => navigate(action.path)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default LandingPage;
