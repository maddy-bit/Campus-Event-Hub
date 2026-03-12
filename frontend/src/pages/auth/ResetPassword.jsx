import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/auth.css";
import api from "../../api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(location.state?.otp || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        otp,
        newPassword: password,
      });

      toast.success("Password updated");
      navigate("/login");
    } catch {
      toast.error("Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Create a new password</p>

        <form onSubmit={handleSubmit}>
          {!location.state?.otp && (
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          )}

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

          <button className="auth-btn">Update Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
