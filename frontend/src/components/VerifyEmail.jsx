import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../api";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      alert("Email not found. Please register first.");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return;

    try {
      const res = await api.post("/auth/verify-email", {
        email,
        otp,
      });

      alert(res.data.message);
      // After successful verification → go to login
      navigate("/login");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      const res = await api.post("/auth/resend-verification-otp", { email });
      alert(res.data.message || "OTP resent to your email");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Email</h2>

        <p className="auth-subtitle">Enter the OTP sent to your email</p>

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

        <div className="auth-link" style={{ marginTop: "12px" }}>
          Didn't receive OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            className="auth-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              padding: 0,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
            disabled={isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
