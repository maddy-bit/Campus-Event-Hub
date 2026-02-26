import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/auth/me");

        // If user exists redirect
        if (data.role === "superadmin") navigate("/superadmin/dashboard");
        else if (data.role === "admin") navigate("/admin/dashboard");
        else if (data.role === "organizer") navigate("/organizer/dashboard");
        else if (data.role === "student") navigate("/student/dashboard");

      } catch (err) {
        console.log(err);
        
      }
    };

    checkUser();
  }, [navigate]);

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
      const res = await api.post("/auth/login", formData);

      toast.success(res.data.message);

      const role = res.data.user.role;

      if (role === "superadmin") navigate("/superadmin/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else if (role === "organizer") navigate("/organizer/dashboard");
      else if (role === "student") navigate("/student/dashboard");

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

          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;