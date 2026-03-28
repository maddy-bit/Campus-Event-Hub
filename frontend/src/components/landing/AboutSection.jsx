import React from "react";
import { Calendar, Users, Trophy, Globe } from "lucide-react";

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
  return (
    <section className="about-section" id="about">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">About the Platform</span>
          <h2 className="section-title">
            Everything your campus life needs,<br />
            <span className="title-accent">in one powerful platform</span>
          </h2>
          <p className="section-subtitle">
            CampusEventHub brings together event management, student networking,
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
