import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import '../styles/registrationPage.css';

const RegistrationPage = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        collegeName: '',
        phoneNumber: '',
        department: '',
        yearOfStudy: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const yearMap = {
    "1": "2023",
    "2": "2024",
    "3": "2025",
    "4": "2026",
  };

  const mappedYear = yearMap[formData.yearOfStudy];

  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      fullName: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      collegeName: formData.collegeName,
      department: formData.department,
      yearOfStudy: mappedYear,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    alert(res.data.message);
navigate("/verify-email");


  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Registration failed");
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
                        <label>College Name</label>
                        <input
                            type="text"
                            name="collegeName"
                            placeholder="Enter college name"
                            value={formData.collegeName}
                            onChange={handleChange}
                            required
                        />
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
                            <option value="" disabled>Select year</option>
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

                    <button type="submit" className="submit-btn">Register</button>
                </form>

                <div className="footer-text">
                    Already have an account? <a href="#">Login</a>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
