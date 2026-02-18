import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      alert("OTP sent to your email");
      navigate("/verify-otp");
    } catch {
      alert("User not found");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">We will send OTP to your email</p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email Address</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="auth-btn">Send OTP</button>
        </form>

        <div className="auth-link">
          Back to <span onClick={() => navigate("/")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
