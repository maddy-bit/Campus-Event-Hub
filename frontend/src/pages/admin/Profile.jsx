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
    collegeName: ""
  });

  const [stats, setStats] = useState({
    eventsCreated: 0,
    totalParticipants: 0,
    activeEvents: 0,
    completedEvents: 0
  });

  const [activeTab, setActiveTab] = useState("Personal Info");



  /* FETCH PROFILE */

  const fetchProfile = async () => {
    try {

      const res = await api.get("/admin/profile");
      console.log("PROFILE RESPONSE:", res.data);

      const data = res.data.data;

      setProfile({
        id: data._id,
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        role: data.role || "",
        collegeName: data.collegeId?.name || ""
      });

      setStats(data.stats || {});

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

    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

  };



  /* SAVE PROFILE */

  const handleSave = async () => {
    try {

      await api.put("/admin/profile", {
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber
      });

      toast.success("Profile updated successfully");

    } catch (err) {

      toast.error("Failed to update profile");

    }
  };



  if (loading) {
    return <div className="loading-state">Loading profile...</div>;
  }



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
          <div className="avatar-circle">
            {profile.fullName
              ?.split(" ")
              .map(n => n[0])
              .join("")
              .slice(0,2)}
          </div>
          </div>

          <h3>{profile.fullName}</h3>
          <span className="designation">{profile.role}</span>


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

          </div>



          <div className="profile-meta">

            <p>College</p>
            <span>{profile.collegeName}</span>

            <p style={{marginTop:"12px"}}>User ID</p>
            <span>{profile.id?.slice(-6)}</span>

          </div>

        </div>



        {/* RIGHT FORM CARD */}

        <div className="profile-form-card">

          {/* TABS */}

          <div className="tabs-container">

            {["Personal Info", "Security", "Access Levels"].map(tab => (
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
                  <label>OFFICIAL EMAIL</label>
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
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
                  <label>ROLE</label>
                  <input
                    value={profile.role}
                    
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



              <button
                className="btn-primary"
                onClick={handleSave}
              >
                Save Profile Changes
              </button>

            </div>

          )}



          {/* SECURITY TAB */}

          {activeTab === "Security" && (

            <div className="profile-form">

              <div className="form-group">
                <label>CURRENT PASSWORD</label>
                <input type="password"/>
              </div>

              <div className="form-group">
                <label>NEW PASSWORD</label>
                <input type="password"/>
              </div>

              <button className="btn-primary">
                Update Password
              </button>

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
              </ul>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;