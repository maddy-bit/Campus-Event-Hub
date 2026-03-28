import React, { useEffect, useRef } from "react";
import { Calendar, Users, Trophy, Globe } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <Calendar size={28} />,
    title: "Event Discovery",
    description:
      "Browse hundreds of campus events — workshops, hackathons, cultural fests, sports tournaments — all in one place.",
    color: "#6366f1",
  },
  {
    icon: <Users size={28} />,
    title: "Networking Hub",
    description:
      "Connect with students from your college and beyond. Build your network through real-time chat and shared interests.",
    color: "#f59e0b",
  },
  {
    icon: <Trophy size={28} />,
    title: "Gamified Experience",
    description:
      "Earn points for every event you attend. Climb the leaderboard, unlock achievements, and showcase your campus spirit.",
    color: "#10b981",
  },
  {
    icon: <Globe size={28} />,
    title: "Cross-College",
    description:
      "Break the campus bubble. Discover and join public events hosted by colleges across the country.",
    color: "#ef4444",
  },
];

const AboutSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".about-section .section-tag", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
        },
      });

      gsap.from(".about-section .section-title", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
        },
      });

      gsap.from(".about-section .section-subtitle", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
        },
      });

      // Cards stagger
      gsap.from(".about-card", {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-grid",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about-section" id="about" ref={sectionRef}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">About the Platform</span>
          <h2 className="section-title">
            Everything your campus life needs,<br />
            <span className="title-accent">in one powerful platform</span>
          </h2>
          <p className="section-subtitle">
            Infy Event Hub brings together event management, student networking,
            and gamification to create the ultimate campus experience.
          </p>
        </div>

        <div className="about-grid">
          {features.map((feature, idx) => (
            <div className="about-card" key={idx}>
              <div
                className="about-card-icon"
                style={{ background: `${feature.color}18`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="about-card-title">{feature.title}</h3>
              <p className="about-card-desc">{feature.description}</p>
              <div
                className="about-card-border"
                style={{ background: feature.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
