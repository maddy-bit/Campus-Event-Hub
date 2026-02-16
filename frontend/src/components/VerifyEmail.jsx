import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/auth.css";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/verify-email",
        { otp }
      );

      alert(res.data.message);

      // After successful verification → go to login
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Invalid or expired OTP");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Verify Email</h2>

        <p className="auth-subtitle">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit}>

          <label className="auth-label">OTP</label>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Verify
          </button>

        </form>

      </div>
    </div>
  );
}

export default VerifyEmail;
