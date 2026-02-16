import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3000/auth/reset-password", {
        otp,
        newPassword: password,
      });

      alert("Password updated");
      navigate("/");

    } catch {
      alert("Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Create a new password
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button className="auth-btn">
            Update Password
          </button>

        </form>

      </div>
    </div>
  );
}

export default ResetPassword;
