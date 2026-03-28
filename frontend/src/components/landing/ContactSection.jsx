import React, { useState } from "react";
import axios from "axios";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      await axios.post(`${API}/public/contact`, form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="contact-grid">
          {/* Left info */}
          <div className="contact-info">
            <span className="section-tag">💬 Get in Touch</span>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              Have questions?<br />
              <span className="title-accent">We'd love to hear from you</span>
            </h2>
            <p className="contact-description">
              Whether you're a student curious about the platform, or a college looking
              to partner with us — reach out and our team will get back to you.
            </p>

            <div className="contact-highlights">
              <div className="contact-highlight-item">
                <span className="highlight-emoji">⚡</span>
                <span>Quick response within 24 hours</span>
              </div>
              <div className="contact-highlight-item">
                <span className="highlight-emoji">🤝</span>
                <span>Partnership opportunities</span>
              </div>
              <div className="contact-highlight-item">
                <span className="highlight-emoji">💡</span>
                <span>Feature requests & feedback</span>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="contact-form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@college.edu"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-brutal-primary w-full"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>

              {status === "success" && (
                <div className="form-alert form-alert-success">
                  <CheckCircle size={18} />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              {status === "error" && (
                <div className="form-alert form-alert-error">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
