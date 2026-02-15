import React, { useState } from 'react';
import './RegistrationPage.css';

const RegistrationPage = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        // Add submission logic here
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
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
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
