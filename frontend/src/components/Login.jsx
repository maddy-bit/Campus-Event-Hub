import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../styles/registrationPage.css";
import api from "../api";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/login", formData);
      toast.success("Login successfull");


      const { data } = await api.get("/auth/me");

      toast.success("Login successful");

      //  redirect based on role
      if (data.role === "super_admin") {
        navigate("/superadmin");
      } else if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "organizer") {
        navigate("/organizer");
      } else if (data.role === "student") {
        navigate("/student");
      } else {
        navigate("/");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

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

          <div className="form-group">
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

          <div style={{ textAlign: "right", marginBottom: "15px" }}>
            <span
              style={{
                fontSize: "0.85rem",
                color: "#2563eb",
                cursor: "pointer",
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>

        <div className="footer-text">
          Don’t have an account?
          <a onClick={() => navigate("/register")}> Register</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;