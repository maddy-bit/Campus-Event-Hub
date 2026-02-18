import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../api";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/verify-reset-otp", {
        otp,
      });

      alert("OTP verified");
      navigate("/reset-password");
    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="auth-subtitle">Enter OTP sent to email</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            required
          />

          <button className="auth-btn">Verify OTP</button>
        </form>

        <div className="auth-link">
          Didn't receive? <span>Resend</span>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
