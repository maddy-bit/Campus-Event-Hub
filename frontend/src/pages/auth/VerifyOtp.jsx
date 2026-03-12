import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/auth.css";
import api from "../../api";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email missing. Start over.");
      navigate("/forgot-password");
      return;
    }
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP resent to your email");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/verify-reset-otp", {
        otp,
      });

      toast.success("OTP verified");
      navigate("/reset-password", { state: { otp } });
    } catch {
      toast.error("Invalid OTP");
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
          Didn't receive? <span onClick={handleResend} style={{ cursor: "pointer", color: "#2563eb" }}>Resend</span>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
