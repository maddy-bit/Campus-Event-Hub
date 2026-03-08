import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../../styles/registrationPage.css";
import api from "../../api";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    phoneNumber: "",
    department: "",
    yearOfStudy: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get("/colleges");
        setColleges(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to load colleges:", err);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const yearMap = {
      1: "2023",
      2: "2024",
      3: "2025",
      4: "2026",
    };

    try {
      const res = await api.post("/auth/signup", {
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        collegeId: formData.collegeId,
        department: formData.department,
        yearOfStudy: yearMap[formData.yearOfStudy],
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(res.data.message);
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Student Registration</h2>
        <p>Register Here To Explore</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter college email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>College</label>
            <select
              name="collegeId"
              value={formData.collegeId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select your college
              </option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              placeholder="Enter department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Year of Study</label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select year
              </option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>

        <div className="footer-text">
          Already have an account? <a href="#">Login</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
