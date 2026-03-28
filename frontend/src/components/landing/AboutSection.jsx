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
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll(".about-card");
      if (cards && cards.length) {
        gsap.set(cards, { y: 50, opacity: 0 });
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: "top 90%",
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: "power2.out",
            });
          },
          once: true,
        });
      }
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

        <div className="about-grid" ref={cardsRef}>
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
