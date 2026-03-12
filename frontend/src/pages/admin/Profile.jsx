import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../api";
import "../../styles/AdminProfile.css";

const Profile = () => {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    collegeName: "",
    collegeLocation: "",
    createdAt: "",
    isEmailVerified: false,
    profilePicture: null,
  });

  const [stats, setStats] = useState({
    eventsCreated: 0,
    totalParticipants: 0,
    activeEvents: 0,
    completedEvents: 0,
  });

  const [activeTab, setActiveTab] = useState("Personal Info");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /* FETCH PROFILE */

  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      const data = res.data.data;

      setProfile({
        id: data._id,
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        role: data.role || "",
        collegeName: data.collegeId?.name || "N/A",
        collegeLocation: data.collegeId?.location || "N/A",
        createdAt: data.createdAt || "",
        isEmailVerified: data.isEmailVerified || false,
        profilePicture: data.profilePicture || null,
      });

      setStats(data.stats || {
        eventsCreated: 0,
        totalParticipants: 0,
        activeEvents: 0,
        completedEvents: 0,
      });
    } catch (err) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* HANDLE INPUT CHANGE */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* SAVE PROFILE */

  const handleSave = async () => {
    try {
      await api.put("/profile/basic", {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  /* UPDATE PASSWORD */

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Please fill in both password fields");
    }

    try {
      await api.put("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "N/A";

  return (
    <div className="admin-profile-page">
      {/* HEADER */}

      <div className="profile-header">
        <div className="management-label">ADMIN CONTROL PANEL</div>
        <h1>Admin Profile</h1>
      </div>

      <div className="profile-layout">
        {/* LEFT PROFILE CARD */}

        <div className="profile-card">
          <div className="avatar-wrapper">
            <div className="avatar-circle" style={{ overflow: "hidden" }}>
              {profile.profilePicture ? (
                <img 
                  src={`${API_BASE}/${profile.profilePicture}`} 
                  alt="Profile" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                profile.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
          </div>

          <h3>{profile.fullName}</h3>
          <span className="designation">{profile.role?.toUpperCase()}</span>

          {/* STATS */}

          <div className="stats">
            <div>
              <h4>{stats.eventsCreated}</h4>
              <span>Events</span>
            </div>

            <div>
              <h4>{stats.totalParticipants}</h4>
              <span>Participants</span>
            </div>
            
            <div>
              <h4>{stats.activeEvents}</h4>
              <span>Active</span>
            </div>
            
            <div>
              <h4>{stats.completedEvents}</h4>
              <span>Completed</span>
            </div>
          </div>

          <div className="profile-meta">
            <p>College</p>
            <span>{profile.collegeName}</span>

            <p style={{ marginTop: "12px" }}>Location</p>
            <span>{profile.collegeLocation}</span>

            <p style={{ marginTop: "12px" }}>User ID</p>
            <span>{profile.id?.slice(-6).toUpperCase()}</span>
            
            <p style={{ marginTop: "12px" }}>Member Since</p>
            <span>{joinDate}</span>
          </div>
        </div>

        {/* RIGHT FORM CARD */}

        <div className="profile-form-card">
          {/* TABS */}

          <div className="tabs-container">
            {["Personal Info", "Security", "Access Levels"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* PERSONAL INFO TAB */}

          {activeTab === "Personal Info" && (
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>OFFICIAL EMAIL (READ-ONLY)</label>
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CONTACT NUMBER</label>
                  <input
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>ROLE (READ-ONLY)</label>
                  <input 
                    value={profile.role} 
                    readOnly 
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", textTransform: "capitalize" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>BIO / PROFILE NOTE</label>

                <textarea
                  rows={3}
                  placeholder="Write something about your role..."
                />
              </div>

              <button className="btn-primary" onClick={handleSave}>
                Save Profile Changes
              </button>
            </div>
          )}

          {/* SECURITY TAB */}

          {activeTab === "Security" && (
            <div className="profile-form">
              <div className="form-group">
                <label>CURRENT PASSWORD</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>NEW PASSWORD</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min. 6 characters"
                />
              </div>

              <button className="btn-primary" onClick={handleUpdatePassword}>Update Password</button>
            </div>
          )}

          {/* ACCESS LEVELS TAB */}

          {activeTab === "Access Levels" && (
            <div className="profile-form">
              <ul className="access-list">
                <li>✔ Manage Events</li>
                <li>✔ Manage Users</li>
                <li>✔ Approve Organizers</li>
                <li>✔ View Analytics</li>
                <li>✔ Configure College Settings</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

