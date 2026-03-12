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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/reset-password", { otp, newPassword: password });
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setSubmitting(false);
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

          <button className="auth-btn" disabled={submitting}>
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="auth-link" style={{ marginTop: "12px" }}>
          <span
            style={{ color: "#2563eb", cursor: "pointer", fontSize: "0.9rem" }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

