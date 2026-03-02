import React, { useState } from "react";
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
  X
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="profile-container">
      {/* 1. Breadcrumb */}
      <div className="breadcrumb">
        DASHBOARD / <span>PROFILE</span>
      </div>

      {/* 2. Profile Black Header Box */}
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
        {/* Left Column (Width fixed at around 340-360px) */}
        <div className="profile-left-col">
          {/* Avatar and Basic Info Card */}
          <div className="nb-card profile-info-card">
            <div className="avatar-header">
              <div className="avatar-wrapper">
                <div className="avatar-init">SJ</div>
                <button className="avatar-upload-btn">
                  <Upload size={14} strokeWidth={3} />
                </button>
              </div>
              <h2 className="user-full-name">SARAH JENKINS</h2>
              <p className="user-role-label">ORGANIZER · <span className="admin-id">ADMIN_01</span></p>
            </div>

            <div className="info-list">
              <div className="info-item">
                <div className="info-square">
                  <Mail size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Email</span>
                  <span className="item-value">sarah.j@nitrichy.edu</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square">
                  <Phone size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Phone</span>
                  <span className="item-value">+91 98765 43210</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">College</span>
                  <span className="item-value">NIT Trichy</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-square active-icon">
                  <Users size={16} strokeWidth={2.5} />
                </div>
                <div className="item-content">
                  <span className="item-label">Club</span>
                  <span className="item-value">RoboNIT Club</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="nb-card stats-card">
            <div className="panel-top-header">
              <h3>ORGANIZER STATS</h3>
              <div className="pill-badge active-pill">ACTIVE</div>
            </div>
            <div className="stats-2x2-grid">
              <div className="stat-tile">
                <div className="stat-num">8</div>
                <div className="stat-name">Events Hosted</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num">847</div>
                <div className="stat-name">Total Participants</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num highlight-num">12</div>
                <div className="stat-name">Notifications</div>
              </div>
              <div className="stat-tile">
                <div className="stat-num">2</div>
                <div className="stat-name">Co-Organizers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Takes remaining width) */}
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
                  <input type="text" className="nb-input-field" defaultValue="RoboNIT Club" />
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Club Category</label>
                  <select className="nb-select-field">
                    <option>Technical</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                  </select>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">First Name <span className="red-star">*</span></label>
                  <input type="text" className="nb-input-field" defaultValue="Sarah" />
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Last Name <span className="red-star">*</span></label>
                  <input type="text" className="nb-input-field" defaultValue="Jenkins" />
                </div>

                <div className="nb-form-group">
                  <div className="label-with-tag">
                    <label className="nb-form-label">Email Address</label>
                    <span className="readonly-pips">READ-ONLY</span>
                  </div>
                  <input type="email" className="nb-input-field readonly" defaultValue="sarah.j@nitrichy.edu" readOnly />
                  <p className="field-hint">Contact support to change your email address.</p>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Phone Number <span className="red-star">*</span></label>
                  <input type="text" className="nb-input-field" defaultValue="+91 98765 43210" />
                </div>

                <div className="nb-form-group">
                  <div className="label-with-tag">
                    <label className="nb-form-label">College / Institution</label>
                    <span className="readonly-pips">READ-ONLY</span>
                  </div>
                  <input type="text" className="nb-input-field readonly" defaultValue="National Institute of Technology, Tiruchirappalli" readOnly />
                  <p className="field-hint">Institution is set by your admin.</p>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Department</label>
                  <select className="nb-select-field">
                    <option>Computer Science & Engineering</option>
                    <option>Electronics & Communication</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>

                <div className="nb-form-group nb-full-width">
                  <label className="nb-form-label">Club Description</label>
                  <textarea className="nb-textarea-field" rows="4" defaultValue="RoboNIT is the premier robotics and automation club at NIT Trichy, organizing competitions, workshops, and hackathons since 2014."></textarea>
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
                <div className="nb-upload-placeholder">RN</div>
                <div className="nb-upload-text">
                  <h4>UPLOAD CLUB LOGO</h4>
                  <p>PNG, JPG, SVG SUPPORTED</p>
                  <p>MAX SIZE: 2MB · RECOMMENDED: 256×256PX</p>
                </div>
                <button className="nb-round-upload-btn">
                  <Upload size={20} strokeWidth={3} />
                </button>
              </div>
              <p className="field-hint" style={{ marginTop: "15px" }}>This logo will appear on your event pages and participant communications.</p>
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
                    <input type={showCurrentPassword ? "text" : "password"} className="nb-input-field" placeholder="Enter your current password" />
                    <button className="nb-eye-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">New Password <span className="red-star">*</span></label>
                  <div className="nb-password-wrapper">
                    <input type={showNewPassword ? "text" : "password"} className="nb-input-field" placeholder="Min. 8 characters" />
                    <button className="nb-eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>

                <div className="nb-form-group">
                  <label className="nb-form-label">Confirm Password <span className="red-star">*</span></label>
                  <div className="nb-password-wrapper">
                    <input type={showConfirmPassword ? "text" : "password"} className="nb-input-field" placeholder="Repeat new password" />
                    <button className="nb-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="nb-requirements-container">
                <label className="requirements-title">Password Requirements</label>
                <div className="requirements-grid">
                  <div className="req-row met">
                    <div className="req-dot"></div>
                    <span>At least 8 characters</span>
                  </div>
                  <div className="req-row">
                    <div className="req-dot"></div>
                    <span>One uppercase letter</span>
                  </div>
                  <div className="req-row">
                    <div className="req-dot"></div>
                    <span>One number</span>
                  </div>
                  <div className="req-row">
                    <div className="req-dot"></div>
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Button Area */}
          <div className="nb-action-bar">
            <div className="action-status">
              <div className="unsaved-tag">
                <div className="black-dot"></div>
                UNSAVED CHANGES
              </div>
              <span className="save-timestamp">Last saved: 3 days ago</span>
            </div>
            <div className="action-btns">
              <button className="nb-btn-secondary">
                <X size={16} strokeWidth={3} />
                Cancel
              </button>
              <button className="nb-btn-primary">
                <ShieldCheck size={16} strokeWidth={3} />
                Save Changes
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
