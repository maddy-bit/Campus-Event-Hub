import React from "react";
import { GraduationCap } from "lucide-react";

const CollegeMarquee = ({ colleges }) => {
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

  return (
    <section className="marquee-section" id="colleges">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">🏫 Partner Colleges</span>
          <h2 className="section-title">
            Trusted by <span className="title-accent">leading institutions</span>
          </h2>
          <p className="section-subtitle">
            Students from these colleges are already on CampusEventHub
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
