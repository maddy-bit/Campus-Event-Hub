import React, { useEffect, useRef } from "react";
import { GraduationCap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CollegeMarquee = ({ colleges }) => {
  const sectionRef = useRef(null);

  // Double the array for seamless infinite scroll
  const displayColleges = colleges.length > 0
    ? [...colleges, ...colleges, ...colleges]
    : [];

  // Fallback colleges if none from API
  const fallbackColleges = [
    { name: "IIT Bombay", location: "Mumbai" },
    { name: "BITS Pilani", location: "Rajasthan" },
    { name: "NIT Trichy", location: "Tamil Nadu" },
    { name: "VIT Vellore", location: "Vellore" },
    { name: "IIIT Hyderabad", location: "Hyderabad" },
    { name: "DTU Delhi", location: "Delhi" },
    { name: "KJSCE Mumbai", location: "Mumbai" },
    { name: "MIT Manipal", location: "Karnataka" },
  ];

  const items = displayColleges.length > 0
    ? displayColleges
    : [...fallbackColleges, ...fallbackColleges, ...fallbackColleges];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".marquee-section .section-header > *", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".marquee-section",
          start: "top 80%",
        },
      });

      gsap.from(".marquee-wrapper", {
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".marquee-wrapper",
          start: "top 90%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="marquee-section" id="colleges" ref={sectionRef}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">🏫 Partner Colleges</span>
          <h2 className="section-title">
            Trusted by <span className="title-accent">leading institutions</span>
          </h2>
          <p className="section-subtitle">
            Students from these colleges are already on Infy Event Hub
          </p>
        </div>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-fade marquee-fade-left" />
        <div className="marquee-fade marquee-fade-right" />

        <div className="marquee-track">
          {items.map((college, idx) => (
            <div className="marquee-item" key={idx}>
              <div className="marquee-icon">
                {college.logo ? (
                  <img src={college.logo} alt={college.name} className="marquee-logo" />
                ) : (
                  <GraduationCap size={24} />
                )}
              </div>
              <div>
                <p className="marquee-name">{college.name}</p>
                {college.location && (
                  <p className="marquee-location">{college.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollegeMarquee;
