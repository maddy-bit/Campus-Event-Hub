import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Users,
  User,
  Lock,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  TriangleAlert,
  Save,
  X,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import "./Profile.css";

const Profile = () => {
  // ── State ──
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form data for profile fields
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    department: "",
    clubName: "",
    clubCategory: "Technical",
    clubDescription: "",
  });

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File input refs
  const avatarInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // ── Fetch Profile ──
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      const data = res.data.data;
      setUser(data);
      setFormData({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        department: data.department || "",
        clubName: data.clubId?.name || "",
        clubCategory: data.clubId?.category || "Technical",
        clubDescription: data.clubId?.description || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Password Validation ──
  const passwordChecks = {
    minLength: passwordData.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordData.newPassword),
    hasNumber: /[0-9]/.test(passwordData.newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Update basic profile
      const basicRes = await api.put("/profile/basic", {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
      });

      // Update club info
      await api.put("/profile/club", {
        name: formData.clubName,
        category: formData.clubCategory,
        description: formData.clubDescription,
      });

      setUser(basicRes.data.data);
      setHasChanges(false);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Change Password ──
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Please fill in all password fields");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setChangingPassword(true);
      await api.put("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Avatar Upload ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profilePicture", file);

    try {
      setUploadingAvatar(true);
      const res = await api.post("/profile/upload/profile-picture", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, profilePicture: res.data.data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Failed to upload picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploadingAvatar(true);
      await api.delete("/profile/profile-picture");
      setUser((prev) => ({ ...prev, profilePicture: null }));
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Club Logo Upload ──
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("clubLogo", file);

    try {
      setUploadingLogo(true);
      const res = await api.post("/profile/upload/club-logo", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, clubLogo: res.data.data.clubLogo }));
      toast.success("Club logo updated!");
    } catch (err) {
      toast.error("Failed to upload club logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setUploadingLogo(true);
      await api.delete("/profile/club-logo");
      setUser((prev) => ({ ...prev, clubLogo: null }));
      toast.success("Club logo removed");
    } catch (err) {
      toast.error("Failed to remove club logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Cancel Changes ──
  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        department: user.department || "",
        clubName: user.clubId?.name || "",
        clubCategory: user.clubId?.category || "Technical",
        clubDescription: user.clubId?.description || "",
      });
    }
    setHasChanges(false);
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="profile-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: "12px", fontWeight: 800, color: "#bcbcbc", textTransform: "uppercase", letterSpacing: "1px" }}>
            LOADING PROFILE...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <p style={{ fontWeight: 800, color: "#999" }}>Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />

      {/* 1. Breadcrumb */}
      <div className="breadcrumb">
        DASHBOARD / <span>PROFILE</span>
      </div>

      {/* 2. Profile Header */}
      <div className="profile-header-box-v3">
        <div className="green-side-indicator"></div>
        <div className="header-info">
          <h1>PROFILE</h1>
          <div className="header-nav">
            <span className="active">ACCOUNT</span>
            <span className="dot">·</span>
            <span>CLUB</span>
            <span className="dot">·</span>
            <span>SECURITY</span>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-left-col">
          {/* Avatar and Basic Info Card */}
          <div className="nb-card profile-info-card">
            <div className="avatar-header">
              <div className="avatar-wrapper">
                <div className="avatar-init" style={{ position: "relative", overflow: "hidden" }}>
                  {user.profilePicture ? (
                    <img
                      src={`${API_BASE}/${user.profilePicture}`}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    getInitials(user.fullName)
                  )}
                </div>
                <button
                  className="avatar-upload-btn"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} strokeWidth={3} />}
                </button>
              </div>
              <h2 className="user-full-name">{user.fullName?.toUpperCase() || "UNKNOWN"}</h2>
              <p className="user-role-label">
                {user.role?.toUpperCase()} · <span className="admin-id">ID_{user._id?.slice(-6).toUpperCase()}</span>
              </p>
            </div>

            <div className="info-list">
              <div className="info-item">
                <div className="info-square">
                  <Mail size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Email</span>
                  <span className="item-value" style={{ textTransform: "none" }}>{user.email}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square">
                  <Phone size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Phone</span>
                  <span className="item-value">{user.phoneNumber || "Not set"}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">College</span>
                  <span className="item-value">{user.collegeId?.name || "Not set"}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square active-icon">
                  <Users size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Club</span>
                  <span className="item-value">{user.clubId?.name || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* Delete avatar button */}
            {user.profilePicture && (
              <div style={{ padding: "0 25px 20px" }}>
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "10px",
                    fontWeight: 800,
                    border: "2px solid #0d0d0d",
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  <Camera size={12} /> REMOVE PHOTO
                </button>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="nb-card stats-card">
            <div className="panel-top-header">
              <h3>ORGANIZER STATS</h3>
              <div className="pill-badge active-pill">ACTIVE</div>
            </div>
            <div className="stats-2x2-grid">
              <div className="stat-tile">
                <div className="stat-num">{user.stats?.eventsCreated || 0}</div>
                <div className="stat-name">Events Created</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num">{user.stats?.totalParticipants || 0}</div>
                <div className="stat-name">Total Participants</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num highlight-num">{user.stats?.activeEvents || 0}</div>
                <div className="stat-name">Active Events</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num">{user.stats?.completedEvents || 0}</div>
                <div className="stat-name">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right-col">
          {/* Profile Information Panel */}
          <div className="nb-card">
            <div className="panel-top-header dark">
              <div className="header-icon-box green">
                <User size={18} strokeWidth={3} />
              </div>
              <h3 className="card-title">PROFILE INFORMATION</h3>
              <span className="mini-subtext">PERSONAL DETAILS</span>
            </div>

            <div className="panel-body">
              <div className="nb-form-grid">
                <div className="nb-form-group">
                  <label className="nb-form-label">Club Name <span className="red-star">*</span></label>
                  <input
                    type="text"
                    className="nb-input-field"
                    value={formData.clubName}
                    onChange={(e) => handleFormChange("clubName", e.target.value)}
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Club Category</label>
                  <select
                    className="nb-select-field"
                    value={formData.clubCategory}
                    onChange={(e) => handleFormChange("clubCategory", e.target.value)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Literary">Literary</option>
                    <option value="Social Service">Social Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Full Name <span className="red-star">*</span></label>
                  <input
                    type="text"
                    className="nb-input-field"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange("fullName", e.target.value)}
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Department</label>
                  <input
                    type="text"
                    className="nb-input-field"
                    value={formData.department}
                    onChange={(e) => handleFormChange("department", e.target.value)}
                  />
                </div>

                <div className="nb-form-group">
                  <div className="label-with-tag">
                    <label className="nb-form-label">Email Address</label>
                    <span className="readonly-pips">READ-ONLY</span>
                  </div>
                  <input type="email" className="nb-input-field readonly" value={user.email || ""} readOnly />
                  <p className="field-hint">Contact support to change your email address.</p>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Phone Number <span className="red-star">*</span></label>
                  <input
                    type="text"
                    className="nb-input-field"
                    value={formData.phoneNumber}
                    onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                  />
                </div>

                <div className="nb-form-group">
                  <div className="label-with-tag">
                    <label className="nb-form-label">College / Institution</label>
                    <span className="readonly-pips">READ-ONLY</span>
                  </div>
                  <input type="text" className="nb-input-field readonly" value={user.collegeId?.name || ""} readOnly />
                  <p className="field-hint">Institution is set by your admin.</p>
                </div>

                <div className="nb-form-group">
                  <div className="label-with-tag">
                    <label className="nb-form-label">Year of Study</label>
                    <span className="readonly-pips">READ-ONLY</span>
                  </div>
                  <input type="text" className="nb-input-field readonly" value={user.yearOfStudy || ""} readOnly />
                </div>

                <div className="nb-form-group nb-full-width">
                  <label className="nb-form-label">Club Description</label>
                  <textarea
                    className="nb-textarea-field"
                    rows="4"
                    value={formData.clubDescription}
                    onChange={(e) => handleFormChange("clubDescription", e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Club Logo Panel */}
          <div className="nb-card">
            <div className="panel-top-header dark">
              <div className="header-icon-box yellow">
                <ImageIcon size={18} strokeWidth={3} />
              </div>
              <h3 className="card-title">CLUB LOGO</h3>
              <span className="mini-subtext">BRANDING</span>
            </div>
            <div className="panel-body">
              <div className="nb-upload-area">
                <div className="nb-upload-placeholder" style={{ overflow: "hidden" }}>
                  {user.clubLogo ? (
                    <img
                      src={`${API_BASE}/${user.clubLogo}`}
                      alt="Club Logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(user.clubId?.name || user.fullName)
                  )}
                </div>
                <div className="nb-upload-text">
                  <h4>{user.clubLogo ? "CHANGE CLUB LOGO" : "UPLOAD CLUB LOGO"}</h4>
                  <p>PNG, JPG, SVG SUPPORTED</p>
                  <p>MAX SIZE: 2MB · RECOMMENDED: 256×256PX</p>
                </div>
                <button
                  className="nb-round-upload-btn"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} strokeWidth={3} />}
                </button>
              </div>
              {user.clubLogo && (
                <button
                  onClick={handleDeleteLogo}
                  disabled={uploadingLogo}
                  style={{
                    marginTop: "15px",
                    padding: "8px 16px",
                    fontSize: "10px",
                    fontWeight: 800,
                    border: "2px solid #0d0d0d",
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  <Trash2 size={12} /> REMOVE LOGO
                </button>
              )}
              <p className="field-hint" style={{ marginTop: "15px" }}>
                This logo will appear on your event pages and participant communications.
              </p>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="nb-card">
            <div className="panel-top-header dark">
              <div className="header-icon-box blue">
                <Lock size={18} strokeWidth={3} />
              </div>
              <h3 className="card-title">CHANGE PASSWORD</h3>
              <span className="mini-subtext">SECURITY</span>
            </div>
            <div className="panel-body">
              <div className="nb-form-grid">
                <div className="nb-form-group nb-full-width">
                  <label className="nb-form-label">Current Password <span className="red-star">*</span></label>
                  <div className="nb-password-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="nb-input-field"
                      placeholder="Enter your current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    />
                    <button className="nb-eye-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">New Password <span className="red-star">*</span></label>
                  <div className="nb-password-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="nb-input-field"
                      placeholder="Min. 8 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    />
                    <button className="nb-eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Confirm Password <span className="red-star">*</span></label>
                  <div className="nb-password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="nb-input-field"
                      placeholder="Repeat new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    />
                    <button className="nb-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="nb-requirements-container">
                <label className="requirements-title">Password Requirements</label>
                <div className="requirements-grid">
                  <div className={`req-row ${passwordChecks.minLength ? "met" : ""}`}>
                    <div className="req-dot"></div>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`req-row ${passwordChecks.hasUppercase ? "met" : ""}`}>
                    <div className="req-dot"></div>
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`req-row ${passwordChecks.hasNumber ? "met" : ""}`}>
                    <div className="req-dot"></div>
                    <span>One number</span>
                  </div>
                  <div className={`req-row ${passwordChecks.hasSpecial ? "met" : ""}`}>
                    <div className="req-dot"></div>
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              {/* Change Password Button */}
              <div style={{ marginTop: "20px" }}>
                <button
                  className="nb-btn-primary"
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  style={{ opacity: changingPassword ? 0.6 : 1 }}
                >
                  {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} strokeWidth={3} />}
                  {changingPassword ? "Changing..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer Button Area */}
          <div className="nb-action-bar">
            <div className="action-status">
              <div className="unsaved-tag" style={{ opacity: hasChanges ? 1 : 0.4 }}>
                <div className="black-dot"></div>
                {hasChanges ? "UNSAVED CHANGES" : "ALL SAVED"}
              </div>
              <span className="save-timestamp">
                Member since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
              </span>
            </div>
            <div className="action-btns">
              <button className="nb-btn-secondary" onClick={handleCancel} disabled={!hasChanges}>
                <X size={16} strokeWidth={3} />
                Cancel
              </button>
              <button
                className="nb-btn-primary"
                onClick={handleSaveProfile}
                disabled={saving || !hasChanges}
                style={{ opacity: saving || !hasChanges ? 0.6 : 1 }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} strokeWidth={3} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Danger Zone Panel */}
          <div className="nb-danger-box">
            <div className="danger-header">
              <TriangleAlert size={20} strokeWidth={3} />
              <h3>DANGER ZONE</h3>
            </div>
            <div className="danger-content">
              <p className="danger-info-text">
                Permanently delete your organizer account and all associated events.
                This action cannot be undone and all participant data will be removed.
              </p>
              <button className="nb-delete-btn">
                <Trash2 size={16} strokeWidth={3} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
