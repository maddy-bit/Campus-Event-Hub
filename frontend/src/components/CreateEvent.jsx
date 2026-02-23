import React from "react";
import {
    Search,
    Bell,
    LayoutDashboard,
    PlusSquare,
    Calendar,
    Users,
    MessageSquare,
    User,
    LogOut,
    AlertCircle,
    Clock,
    Upload,
    Check,
    Save,
    Send,
    ChevronDown
} from "lucide-react";
import "./CreateEvent.css";

const CreateEvent = () => {
    return (
        <div className="neo-brutalist-container">
            {/* SIDEBAR */}
            <aside className="neo-sidebar">
                <div className="neo-logo">
                    <div className="neo-logo-icon">HC</div>
                    <span>HUB_CTRL</span>
                </div>

                <nav className="neo-nav">
                    <div className="neo-nav-item">
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </div>
                    <div className="neo-nav-item active">
                        <PlusSquare size={18} />
                        <span>Create</span>
                    </div>
                    <div className="neo-nav-item">
                        <Calendar size={18} />
                        <span>Events</span>
                    </div>
                    <div className="neo-nav-item">
                        <Users size={18} />
                        <span>Participants</span>
                    </div>
                    <div className="neo-nav-item">
                        <MessageSquare size={18} />
                        <span>Notifs</span>
                    </div>
                </nav>

                <div className="neo-sidebar-footer">
                    <div className="neo-nav-item">
                        <User size={18} />
                        <span>Profile</span>
                    </div>
                    <div className="neo-nav-item">
                        <LogOut size={18} />
                        <span>Exit</span>
                    </div>
                </div>
            </aside>


            <main className="neo-main">

                <header className="neo-topbar">
                    <div className="src-box">
                        <Search size={16} />
                        <input type="text" placeholder="SEARCH_DATA..." />
                    </div>

                    <div className="topbar-actions">
                        <button className="icon-btn">
                            <Bell size={20} />
                        </button>
                        <div className="user-badge">
                            <div className="user-initials">SJ</div>
                            <div className="user-info">
                                <span className="name">S. JENKINS</span>
                                <span className="role">ADMIN_01</span>
                            </div>
                        </div>
                    </div>
                </header>


                <div className="neo-content">
                    <div className="page-header-actions">
                        <div className="stepper-tabs">
                            <div className="step-tab active">
                                <span className="step-num">01</span>
                                <span>Details</span>
                            </div>
                            <div className="step-tab">
                                <span className="step-num">02</span>
                                <span>Review</span>
                            </div>
                            <div className="step-tab">
                                <span className="step-num">03</span>
                                <span>Publish</span>
                            </div>
                        </div>
                    </div>


                    <div className="neo-alert">
                        <div className="alert-icon">
                            <AlertCircle size={20} />
                        </div>
                        <div className="alert-content">
                            <h4>Admin Approval Required</h4>
                            <p>This event enters a review queue after submission. An admin verifies all details before it goes live. Typical review time: 24-48 hours.</p>
                        </div>
                    </div>


                    <div className="neo-form-container">
                        <div className="neo-form-header">
                            <div>
                                <h2>Event Details</h2>
                                <div className="subtitle">All starred fields are required to submit</div>
                            </div>
                            <div className="required-tag">★ Required</div>
                        </div>


                        <div className="form-section">
                            <div className="section-title-wrap">
                                <span className="section-num">01</span>
                                <span className="section-title">Basic Information</span>
                            </div>

                            <div className="input-group">
                                <div className="label-row">
                                    <label className="neo-label">Event Title <span className="label-star">★</span></label>
                                </div>
                                <input type="text" className="neo-input" placeholder="e.g. Robo-Sprint 2025" />
                                <div className="char-count">0/50</div>
                            </div>

                            <div className="input-grid">
                                <div className="input-group">
                                    <div className="label-row">
                                        <label className="neo-label">Category <span className="label-star">★</span></label>
                                    </div>
                                    <div className="input-with-icon">
                                        <select className="neo-input" style={{ appearance: 'none' }}>
                                            <option>Select a category...</option>
                                            <option>Technical Event</option>
                                            <option>Non-Technical Event</option>
                                            <option>Workshop / Seminar</option>
                                            <option>Cultural Fest</option>
                                            <option>Guest Lecture</option>
                                            <option>Competition</option>
                                        </select>
                                        <ChevronDown className="input-icon" size={16} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div className="label-row">
                                        <label className="neo-label">Location <span className="label-star">★</span></label>
                                    </div>
                                    <input type="text" className="neo-input" placeholder="Venue name or address" />
                                </div>
                            </div>

                            <div className="input-group">
                                <div className="label-row">
                                    <label className="neo-label">Description <span className="label-star">★</span></label>
                                </div>
                                <textarea
                                    className="neo-input"
                                    rows="6"
                                    placeholder="Describe your event — agenda, requirements, prizes..."
                                    style={{ resize: 'none' }}
                                ></textarea>
                                <div className="char-count">0/1000</div>
                            </div>
                        </div>


                        <div className="form-section" style={{ paddingTop: 0 }}>
                            <div className="section-title-wrap">
                                <span className="section-num">02</span>
                                <span className="section-title">Schedule & Capacity</span>
                            </div>

                            <div className="input-grid">
                                <div className="input-group">
                                    <div className="label-row">
                                        <label className="neo-label">Event Date <span className="label-star">★</span></label>
                                    </div>
                                    <div className="input-with-icon">
                                        <input type="text" className="neo-input" placeholder="mm/dd/yyyy" />
                                        <Calendar className="input-icon" size={16} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group">
                                        <div className="label-row">
                                            <label className="neo-label">Start Time <span className="label-star">★</span></label>
                                        </div>
                                        <div className="input-with-icon">
                                            <input type="text" className="neo-input" placeholder="--:-- --" />
                                            <Clock className="input-icon" size={16} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <div className="label-row">
                                            <label className="neo-label">End Time</label>
                                        </div>
                                        <div className="input-with-icon">
                                            <input type="text" className="neo-input" placeholder="--:-- --" />
                                            <Clock className="input-icon" size={16} />
                                        </div>
                                        <div className="char-count">Optional — leave blank if open-ended</div>
                                    </div>
                                </div>
                            </div>

                            <div className="input-grid">
                                <div className="input-group">
                                    <div className="label-row">
                                        <label className="neo-label">Reg. Deadline <span className="label-star">★</span></label>
                                    </div>
                                    <div className="input-with-icon">
                                        <input type="text" className="neo-input" placeholder="mm/dd/yyyy" />
                                        <Calendar className="input-icon" size={16} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div className="label-row">
                                        <label className="neo-label">Max Seats <span className="label-star">★</span></label>
                                    </div>
                                    <input type="text" className="neo-input" placeholder="e.g. 150" />
                                </div>
                            </div>
                        </div>


                        <div className="form-section" style={{ paddingTop: 0 }}>
                            <div className="section-title-wrap">
                                <span className="section-num">03</span>
                                <span className="section-title">Poster & Media</span>
                            </div>

                            <div className="input-group">
                                <div className="label-row">
                                    <label className="neo-label">Event Poster</label>
                                </div>
                                <div className="neo-dropzone">
                                    <div className="dz-icon">
                                        <Upload size={24} />
                                    </div>
                                    <div className="dz-text">Drag & drop your poster here</div>
                                    <div className="dz-subtext">PNG, JPG, WEBP — max 5 MB</div>
                                    <button className="dz-btn">Browse Files</button>
                                </div>
                            </div>
                        </div>


                        <div className="form-section" style={{ paddingTop: 0 }}>
                            <div className="section-title-wrap">
                                <span className="section-num">04</span>
                                <span className="section-title">Ticketing & Pricing</span>
                            </div>

                            <div className="neo-toggle-wrap">
                                <div className="toggle-info">
                                    <h5>PAID EVENT</h5>
                                    <p>Enable to charge a registration fee</p>
                                </div>
                                <label className="neo-switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>


                        <footer className="neo-footer-attached">
                            <div className="footer-left">
                                <Clock size={14} />
                                <span>Auto-saved · a few seconds ago</span>
                            </div>
                            <div className="footer-btns">
                                <button className="btn-secondary">
                                    <Save size={16} />
                                    <span>SAVE AS DRAFT</span>
                                </button>
                                <button className="btn-primary">
                                    <Check size={16} />
                                    <span>SUBMIT FOR APPROVAL</span>
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateEvent;
