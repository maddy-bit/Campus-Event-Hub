import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
 
import "../styles/registrationPage.css"; // reuse same CSS
 
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
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: formData.email,
        password: formData.password,
      });
 
      alert(res.data.message);
 
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
 
      navigate("/dashboard");
 
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };
 
  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Welcome Back</h2>
        <p>Please login to your account</p>
 
        <form onSubmit={handleSubmit}>
          {/* Email */}
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
 
          {/* Password */}
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
 
          {/* Forgot Password */}
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