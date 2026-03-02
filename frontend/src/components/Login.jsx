import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../styles/registrationPage.css";
import api from "../api";

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

        if (data && data.role) {
          const path = `/${data.role}/dashboard`;
          navigate(path);
        }
      } catch (err) {
        // if /auth/me fails, user is not logged in. 
        // we stay on the login page, so just stop the loading state.
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
      navigate(`/${role}/dashboard`);

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