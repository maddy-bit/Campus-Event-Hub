import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../../styles/registrationPage.css";
import api from "../../api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
  const checkUser = async () => {
    try {
      const { data } = await api.get("/auth/me");

      if (data?.role === "student") {
        navigate(`/${data.role}/events`);
      } else if (data?.role) {
        navigate(`/${data.role}/dashboard`);
      }

    } catch (err) {
      console.log("Not authenticated, staying on login.");
    } finally {
      setLoading(false);
    }
  };

  checkUser();
}, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", formData);
      toast.success(res.data.message || "Login successful");

      const role = res.data.user.role;
       if (role === "student") {
        navigate(`/${role}/events`);
      } else if (role) {
        navigate(`/${role}/dashboard`);
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <div className="registration-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Welcome Back</h2>
        <p>Please login to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ textAlign: "right", marginBottom: "1.2rem" }}>
            <span
              style={{ fontSize: "0.85rem", color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>
          <button type="submit" className="submit-btn" style={{ marginBottom: "1rem" }}>
            Login
          </button>
        </form>

        <div className="footer-text" style={{ textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
          Don't have an account?{" "}
          <span 
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }} 
            onClick={() => navigate("/register")}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;