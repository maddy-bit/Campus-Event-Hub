import React, { useState } from "react";
import {
    Plus,
    ChevronDown,
    Calendar,
    MapPin,
    MoreHorizontal,
    ArrowLeft,
    ArrowRight,
    Box,
    Music,
    Tent
} from "lucide-react";
import "../../styles/AdminEvents.css";

const EventCard = ({ event }) => (
    <div className="event-card">
        <div className="card-image-area">
            {event.icon === "box" && <Box size={48} />}
            {event.icon === "music" && <Music size={48} />}
            {event.icon === "sports" && <Tent size={48} />}
            <span className={`status-badge ${event.status.toLowerCase().replace(" ", "")}`}>
                {event.status}
            </span>
        </div>
        <div className="card-content">
            <div className="event-category-tags">{event.categories.join(" • ")}</div>
            <h3 className="event-title">{event.title}</h3>

            <div className="info-item">
                <Calendar size={16} />
                <span>{event.date}</span>
            </div>
            <div className="info-item">
                <MapPin size={16} />
                <span>{event.location}</span>
            </div>

            <div className="card-footer">
                <div className="participant-avatars">
                    {event.participants.map((p, i) => (
                        <div key={i} className="avatar-circle" style={{ backgroundColor: p.color }}>
                            {p.initials}
                        </div>
                    ))}
                    {event.extraParticipants > 0 && (
                        <div className="avatar-circle more">
                            +{event.extraParticipants}
                        </div>
                    )}
                </div>
                <button className="more-btn">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>
    </div>
);

const Events = () => {
    const [activeTab, setActiveTab] = useState("All Events");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");

    const categories = ["All", "Technology", "Sports", "Arts", "Business", "Academic", "Social"];
    const sortOptions = ["Newest", "Oldest", "Most Popular", "Title (A-Z)"];

    const events = [
        {
            id: 1,
            title: "TechNova 2024: Build for Future",
            date: "Oct 25 - Oct 27, 2024",
            location: "Main Auditorium, Block C",
            categories: ["TECHNOLOGY", "HACKATHON"],
            status: "ACTIVE",
            icon: "box",
            participants: [
                { initials: "JS", color: "#f87171" },
                { initials: "RK", color: "#60a5fa" },
                { initials: "ML", color: "#34d399" }
            ],
            extraParticipants: 142
        },
        {
            id: 2,
            title: "Inter-College Cricket League",
            date: "Nov 02, 2024",
            location: "University Sports Complex",
            categories: ["SPORTS", "TOURNAMENT"],
            status: "FULL CAPACITY",
            icon: "sports",
            participants: [
                { initials: "AM", color: "#fbbf24" },
                { initials: "TD", color: "#818cf8" },
                { initials: "SY", color: "#f472b6" }
            ],
            extraParticipants: 500
        },
        {
            id: 3,
            title: "Vibrance: Annual Music Festival",
            date: "Dec 15, 2024",
            location: "Open Air Theater (OAT)",
            categories: ["ARTS", "CULTURAL"],
            status: "DRAFT",
            icon: "music",
            participants: [],
            extraParticipants: 0
        }
    ];

    return (
        <div className="admin-events-page">
            <header className="events-header">
                <div className="header-left">
                    <div className="management-label">Event Management</div>
                    <h1>Explore Events</h1>
                </div>
                <button className="create-event-btn">
                    <Plus size={18} />
                    Create Event
                </button>
            </header>

            <div className="filters-row">
                <div className="tabs-container">
                    {["All Events", "Upcoming", "Drafts", "Completed"].map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="dropdowns-container">
                    <div className="filter-dropdown-wrapper">
                        <label className="dropdown-label">Category:</label>
                        <select
                            className="filter-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="filter-dropdown-wrapper">
                        <label className="dropdown-label">Sort:</label>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="events-grid">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            <div className="pagination">
                <button className="page-btn nav">
                    <ArrowLeft size={16} />
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn nav">
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Events;
