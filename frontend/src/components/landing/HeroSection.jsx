import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero content stagger animation
      gsap.from(contentRef.current.children, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });

      // Floating cards entrance from right
      gsap.from(".hero-float-card", {
        x: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        delay: 0.6,
      });

      // Continuous float for cards
      gsap.to(".hero-float-card-1", {
        y: -14,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".hero-float-card-2", {
        y: -10,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });
      gsap.to(".hero-float-card-3", {
        y: -16,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" id="hero" ref={sectionRef}>
      {/* Animated background blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-content" ref={contentRef}>
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
      <div className="hero-visual" ref={visualRef}>
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
