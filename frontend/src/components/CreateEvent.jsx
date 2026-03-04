import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    Clock,
    Upload,
    Check,
    Save,
    Calendar,
    ChevronDown,
    Loader2,
    X,
    Image as ImageIcon
} from "lucide-react";
import api from "../api";
import "../styles/CreateEvent.css";

const CATEGORIES = [
    "Competition",
    "Conference",
    "Workshop",
    "Seminar",
    "Sports",
    "Cultural",
    "Other",
];

const CreateEvent = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [posterPreview, setPosterPreview] = useState(null);
    const [posterFile, setPosterFile] = useState(null);

    const [form, setForm] = useState({
        title: "",
        category: "",
        location: "",
        description: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        maxSeats: "",
        registrationDeadline: "",
        isPaidEvent: false,
        ticketPrice: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5 MB");
            return;
        }

        setPosterFile(file);
        setPosterPreview(URL.createObjectURL(file));
    };

    const removePoster = () => {
        setPosterFile(null);
        setPosterPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5 MB");
                return;
            }
            setPosterFile(file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const buildFormData = (status) => {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("location", form.location);
        formData.append("description", form.description);
        formData.append("eventDate", form.eventDate);
        formData.append("startTime", form.startTime);
        formData.append("endTime", form.endTime);
        formData.append("maxSeats", form.maxSeats || "100");
        formData.append("registrationDeadline", form.registrationDeadline);
        formData.append("isPaidEvent", form.isPaidEvent);
        formData.append("ticketPrice", form.ticketPrice || "0");
        if (posterFile) {
            formData.append("poster", posterFile);
        }
        return formData;
    };

    const validate = () => {
        if (!form.title.trim()) { toast.error("Event title is required"); return false; }
        if (!form.category) { toast.error("Category is required"); return false; }
        if (!form.location.trim()) { toast.error("Location is required"); return false; }
        if (!form.description.trim()) { toast.error("Description is required"); return false; }
        if (!form.eventDate) { toast.error("Event date is required"); return false; }
        if (!form.startTime) { toast.error("Start time is required"); return false; }
        if (!form.registrationDeadline) { toast.error("Registration deadline is required"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setSubmitting(true);
            const formData = buildFormData("Submitted");
            await api.post("/events/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Event submitted for approval!");
            navigate("/organizer/events");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!form.title.trim()) { toast.error("At least a title is required to save draft"); return; }
        try {
            setSaving(true);
            const formData = buildFormData("Draft");
            await api.post("/events/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Draft saved!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save draft");
        } finally {
            setSaving(false);
        }
    };

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

                {/* SECTION 1: Basic Info */}
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
                            name="title"
                            className="neo-input"
                            placeholder="e.g. Robo-Sprint 2025"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={80}
                        />
                        <div className="char-count">{form.title.length}/80</div>
                    </div>

                    <div className="input-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Category <span className="label-star">★</span>
                                </label>
                            </div>
                            <div className="input-with-icon">
                                <select
                                    name="category"
                                    className="neo-input"
                                    style={{ appearance: "none" }}
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a category...</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
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
                                name="location"
                                className="neo-input"
                                placeholder="Venue name or address"
                                value={form.location}
                                onChange={handleChange}
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
                            name="description"
                            className="neo-input"
                            rows="6"
                            placeholder="Describe your event — agenda, requirements, prizes..."
                            style={{ resize: "none" }}
                            value={form.description}
                            onChange={handleChange}
                            maxLength={1800}
                        ></textarea>
                        <div className="char-count">{form.description.length}/1800</div>
                    </div>
                </div>

                {/* SECTION 2: Schedule & Capacity */}
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
                                <input
                                    type="date"
                                    name="eventDate"
                                    className="neo-input"
                                    value={form.eventDate}
                                    onChange={handleChange}
                                />
                                <Calendar className="input-icon" size={16} />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Registration Deadline <span className="label-star">★</span>
                                </label>
                            </div>
                            <div className="input-with-icon">
                                <input
                                    type="date"
                                    name="registrationDeadline"
                                    className="neo-input"
                                    value={form.registrationDeadline}
                                    onChange={handleChange}
                                />
                                <Calendar className="input-icon" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="input-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">
                                    Start Time <span className="label-star">★</span>
                                </label>
                            </div>
                            <input
                                type="time"
                                name="startTime"
                                className="neo-input"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label className="neo-label">End Time</label>
                            </div>
                            <input
                                type="time"
                                name="endTime"
                                className="neo-input"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="neo-label">Max Seats</label>
                        </div>
                        <input
                            type="number"
                            name="maxSeats"
                            className="neo-input"
                            placeholder="e.g. 150 (default: 100)"
                            value={form.maxSeats}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    {/* Paid Event Toggle */}
                    <div className="neo-toggle-wrap">
                        <div className="toggle-info">
                            <h5>Paid Event?</h5>
                            <p>Enable if this event requires a fee</p>
                        </div>
                        <label className="neo-switch">
                            <input
                                type="checkbox"
                                name="isPaidEvent"
                                checked={form.isPaidEvent}
                                onChange={handleChange}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {form.isPaidEvent && (
                        <div className="input-group" style={{ marginTop: 20 }}>
                            <div className="label-row">
                                <label className="neo-label">
                                    Ticket Price (₹) <span className="label-star">★</span>
                                </label>
                            </div>
                            <input
                                type="number"
                                name="ticketPrice"
                                className="neo-input"
                                placeholder="e.g. 200"
                                value={form.ticketPrice}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    )}
                </div>

                {/* SECTION 3: Poster */}
                <div className="form-section" style={{ paddingTop: 0 }}>
                    <div className="section-title-wrap">
                        <span className="section-num">03</span>
                        <span className="section-title">Poster & Media</span>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="neo-label">Event Poster</label>
                        </div>

                        {posterPreview ? (
                            <div style={{
                                border: "2.5px solid #000",
                                position: "relative",
                                display: "inline-block",
                                maxWidth: "100%",
                                boxShadow: "4px 4px 0px #000"
                            }}>
                                <img
                                    src={posterPreview}
                                    alt="Poster Preview"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        objectFit: "cover",
                                        display: "block"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removePoster}
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        background: "#ff4d4d",
                                        color: "#fff",
                                        border: "2px solid #000",
                                        width: 32,
                                        height: 32,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: "2px 2px 0px #000"
                                    }}
                                >
                                    <X size={16} />
                                </button>
                                <div style={{
                                    background: "#000",
                                    color: "#b4ff39",
                                    padding: "6px 12px",
                                    fontSize: "10px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "1px"
                                }}>
                                    <ImageIcon size={12} style={{ display: "inline", marginRight: 6 }} />
                                    {posterFile?.name} — {(posterFile?.size / 1024).toFixed(0)} KB
                                </div>
                            </div>
                        ) : (
                            <div
                                className="neo-dropzone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="dz-icon">
                                    <Upload size={24} />
                                </div>
                                <div className="dz-text">
                                    Drag & drop your poster here
                                </div>
                                <div className="dz-subtext">
                                    PNG, JPG, WEBP — max 5 MB
                                </div>
                                <button type="button" className="dz-btn">Browse Files</button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="neo-footer-attached">
                    <div className="footer-left">
                        <Clock size={14} />
                        <span>Fill all required fields to submit</span>
                    </div>
                    <div className="footer-btns">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleSaveDraft}
                            disabled={saving || submitting}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>{saving ? "SAVING..." : "SAVE AS DRAFT"}</span>
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting || saving}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            <span>{submitting ? "SUBMITTING..." : "SUBMIT FOR APPROVAL"}</span>
                        </button>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default CreateEvent;