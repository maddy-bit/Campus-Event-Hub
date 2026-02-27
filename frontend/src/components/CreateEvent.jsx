import React from "react";
import {
    AlertCircle,
    Clock,
    Upload,
    Check,
    Save,
    Calendar,
    ChevronDown
} from "lucide-react";

import "../styles/CreateEvent.css";

const CreateEvent = () => {
    return (
        <div className="space-y-6">

            {/* STEPPER */}
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

            {/* ALERT */}
            <div className="neo-alert">
                <div className="alert-icon">
                    <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                    <h4>Admin Approval Required</h4>
                    <p>
                        This event enters a review queue after submission.
                        An admin verifies all details before it goes live.
                        Typical review time: 24-48 hours.
                    </p>
                </div>
            </div>

            {/* FORM */}
            <div className="neo-form-container">

                <div className="neo-form-header">
                    <div>
                        <h2>Event Details</h2>
                        <div className="subtitle">
                            All starred fields are required to submit
                        </div>
                    </div>
                    <div className="required-tag">★ Required</div>
                </div>

                {/* SECTION 1 */}
                <div className="form-section">
                    <div className="section-title-wrap">
                        <span className="section-num">01</span>
                        <span className="section-title">Basic Information</span>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="neo-label">
                                Event Title <span className="label-star">★</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            className="neo-input"
                            placeholder="e.g. Robo-Sprint 2025"
                        />
                        <div className="char-count">0/50</div>
                    </div>

                    <div className="input-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Category <span className="label-star">★</span>
                                </label>
                            </div>
                            <div className="input-with-icon">
                                <select className="neo-input" style={{ appearance: "none" }}>
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
                                <label className="neo-label">
                                    Location <span className="label-star">★</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                className="neo-input"
                                placeholder="Venue name or address"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="neo-label">
                                Description <span className="label-star">★</span>
                            </label>
                        </div>
                        <textarea
                            className="neo-input"
                            rows="6"
                            placeholder="Describe your event — agenda, requirements, prizes..."
                            style={{ resize: "none" }}
                        ></textarea>
                        <div className="char-count">0/1000</div>
                    </div>
                </div>

                {/* SECTION 2 */}
                <div className="form-section" style={{ paddingTop: 0 }}>
                    <div className="section-title-wrap">
                        <span className="section-num">02</span>
                        <span className="section-title">Schedule & Capacity</span>
                    </div>

                    <div className="input-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Event Date <span className="label-star">★</span>
                                </label>
                            </div>
                            <div className="input-with-icon">
                                <input type="text" className="neo-input" placeholder="mm/dd/yyyy" />
                                <Calendar className="input-icon" size={16} />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Max Seats <span className="label-star">★</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                className="neo-input"
                                placeholder="e.g. 150"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 3 */}
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
                            <div className="dz-text">
                                Drag & drop your poster here
                            </div>
                            <div className="dz-subtext">
                                PNG, JPG, WEBP — max 5 MB
                            </div>
                            <button className="dz-btn">Browse Files</button>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
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
    );
};

export default CreateEvent;