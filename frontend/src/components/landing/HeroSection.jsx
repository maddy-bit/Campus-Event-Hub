import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section" id="hero">
      {/* Animated background blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>The #1 Campus Event Platform</span>
        </div>

        <h1 className="hero-title">
          Discover, Join &<br />
          <span className="hero-title-accent">Own Your Campus Life</span>
        </h1>

        <p className="hero-description">
          One platform to explore events, compete on leaderboards, connect with peers
          across colleges, and build your campus legacy. Made for students, by students.
        </p>

        <div className="hero-cta-group">
          <button
            onClick={() => navigate("/register")}
            className="btn-brutal-primary"
          >
            Get Started Free
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => {
              document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-brutal-outline"
          >
            Explore Events
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">500+</span>
            <span className="hero-stat-label">Active Events</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">10K+</span>
            <span className="hero-stat-label">Students</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">50+</span>
            <span className="hero-stat-label">Colleges</span>
          </div>
        </div>
      </div>

      {/* Hero illustration / visual */}
      <div className="hero-visual">
        <div className="hero-card-stack">
          <div className="hero-float-card hero-float-card-1">
            <div className="float-card-icon">🏆</div>
            <div>
              <p className="float-card-title">Leaderboard</p>
              <p className="float-card-sub">Rank #1 this week</p>
            </div>
          </div>
          <div className="hero-float-card hero-float-card-2">
            <div className="float-card-icon">🎯</div>
            <div>
              <p className="float-card-title">Event Registered</p>
              <p className="float-card-sub">Hackathon 2026</p>
            </div>
          </div>
          <div className="hero-float-card hero-float-card-3">
            <div className="float-card-icon">🔥</div>
            <div>
              <p className="float-card-title">+50 Points</p>
              <p className="float-card-sub">Achievement unlocked!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
