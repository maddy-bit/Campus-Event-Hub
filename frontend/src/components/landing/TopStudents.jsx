import React, { useEffect, useRef } from "react";
import { Crown, Medal, Award, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TopStudents = ({ students, loading }) => {
  const sectionRef = useRef(null);
  const podiumRef = useRef(null);

  useEffect(() => {
    if (loading || students.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = podiumRef.current?.querySelectorAll(".podium-card");
      if (cards && cards.length) {
        gsap.set(cards, { y: 60, opacity: 0, scale: 0.88 });
        ScrollTrigger.create({
          trigger: podiumRef.current,
          start: "top 90%",
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.18,
              ease: "back.out(1.4)",
            });
          },
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, students]);

  if (loading) {
    return (
      <section className="leaderboard-section" id="leaderboard" ref={sectionRef}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">🏆 Leaderboard</span>
            <h2 className="section-title">Top Performers</h2>
          </div>
          <div className="leaderboard-grid">
            {[...Array(3)].map((_, i) => (
              <div className="leaderboard-card-skeleton" key={i}>
                <div className="skeleton-avatar" />
                <div className="skeleton-line w-1/2" />
                <div className="skeleton-line w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Reorder: #2, #1, #3 for podium layout
  const podiumOrder = students.length >= 3
    ? [students[1], students[0], students[2]]
    : students;

  const rankConfig = {
    1: {
      icon: <Crown size={28} />,
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      glow: "0 0 40px rgba(251, 191, 36, 0.4)",
      label: "🥇",
      size: "champion",
    },
    2: {
      icon: <Medal size={28} />,
      gradient: "linear-gradient(135deg, #94a3b8, #64748b)",
      glow: "0 0 30px rgba(148, 163, 184, 0.3)",
      label: "🥈",
      size: "runner",
    },
    3: {
      icon: <Award size={28} />,
      gradient: "linear-gradient(135deg, #cd7f32, #a0522d)",
      glow: "0 0 30px rgba(205, 127, 50, 0.3)",
      label: "🥉",
      size: "runner",
    },
  };

  return (
    <section className="leaderboard-section" id="leaderboard" ref={sectionRef}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">🏆 Leaderboard</span>
          <h2 className="section-title">
            Campus <span className="title-accent">Top Performers</span>
          </h2>
          <p className="section-subtitle">
            The most active students on Infy Event Hub — rising through events, earning points, and leading the way.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="events-empty">
            <p className="events-empty-text">🏅 No leaderboard data yet — start participating to earn points!</p>
          </div>
        ) : (
          <div className="leaderboard-podium" ref={podiumRef}>
            {podiumOrder.map((student) => {
              const config = rankConfig[student.rank] || rankConfig[3];
              return (
                <div
                  className={`podium-card ${config.size}`}
                  key={student._id}
                  style={{ boxShadow: config.glow }}
                >
                  <div className="podium-rank-badge" style={{ background: config.gradient }}>
                    {config.label}
                  </div>

                  <div className="podium-avatar-wrapper">
                    {student.profilePicture ? (
                      <img
                        src={student.profilePicture}
                        alt={student.fullName}
                        className="podium-avatar"
                      />
                    ) : (
                      <div className="podium-avatar-placeholder" style={{ background: config.gradient }}>
                        {student.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="podium-rank-icon" style={{ background: config.gradient }}>
                      {config.icon}
                    </div>
                  </div>

                  <h3 className="podium-name">{student.fullName}</h3>
                  <p className="podium-college">{student.collegeName}</p>
                  <p className="podium-dept">{student.department}</p>

                  <div className="podium-points">
                    <Star size={16} className="text-yellow-400" />
                    <span>{student.totalPoints?.toLocaleString()} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopStudents;
