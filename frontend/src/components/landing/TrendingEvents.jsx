import React, { useEffect, useRef } from "react";
import { CalendarDays, MapPin, Users, Tag } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categoryColors = {
  Competition: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  Conference: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  Workshop: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  Seminar: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
  Sports: { bg: "#ffe4e6", text: "#9f1239", border: "#f43f5e" },
  Cultural: { bg: "#fff7ed", text: "#9a3412", border: "#f97316" },
  Other: { bg: "#f1f5f9", text: "#475569", border: "#94a3b8" },
};

const TrendingEvents = ({ events, loading }) => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(".event-card");
      if (cards && cards.length) {
        gsap.set(cards, { y: 40, opacity: 0, scale: 0.96 });
        ScrollTrigger.create({
          trigger: gridRef.current,
          start: "top 90%",
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
            });
          },
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, events]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="events-section" id="events" ref={sectionRef}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">🔥 Trending Now</span>
          <h2 className="section-title">
            Events that are<br />
            <span className="title-accent">making waves</span>
          </h2>
          <p className="section-subtitle">
            Real-time data from our platform. These events are filling up fast!
          </p>
        </div>

        {loading ? (
          <div className="events-grid">
            {[...Array(6)].map((_, i) => (
              <div className="event-card-skeleton" key={i}>
                <div className="skeleton-img" />
                <div className="skeleton-line w-3/4" />
                <div className="skeleton-line w-1/2" />
                <div className="skeleton-line w-full" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <p className="events-empty-text">🎉 No trending events right now — be the first to create one!</p>
          </div>
        ) : (
          <div className="events-grid" ref={gridRef}>
            {events.map((event, idx) => {
              const catStyle = categoryColors[event.category] || categoryColors.Other;
              return (
                <div className="event-card" key={event._id || idx}>
                  {/* Poster */}
                  <div className="event-card-poster">
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt={event.title} loading="lazy" />
                    ) : (
                      <div className="event-card-poster-placeholder">
                        <span>📅</span>
                      </div>
                    )}
                    <div
                      className="event-card-category"
                      style={{
                        background: catStyle.bg,
                        color: catStyle.text,
                        borderColor: catStyle.border,
                      }}
                    >
                      <Tag size={12} />
                      {event.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="event-card-body">
                    <h3 className="event-card-title">{event.title}</h3>

                    <div className="event-card-meta">
                      <span className="event-meta-item">
                        <CalendarDays size={14} />
                        {formatDate(event.eventDate)}
                      </span>
                      <span className="event-meta-item">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>

                    <div className="event-card-footer">
                      <span className="event-participants">
                        <Users size={14} />
                        {event.participants} joined
                      </span>
                      <div className="event-seats-bar">
                        <div
                          className="event-seats-fill"
                          style={{
                            width: `${Math.min((event.participants / event.maxSeats) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
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

export default TrendingEvents;
