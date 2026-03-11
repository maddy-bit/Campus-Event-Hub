import React, { useState } from "react";
import {
    Plus,
    Send,
    History,
    MessageSquare,
    Eye,
    Bell,
    Mail,
    Megaphone,
    Clock,
    AlertTriangle,
    FileText,
    Search,
    Flag
} from "lucide-react";
import "../../styles/AdminNotifications.css";

const NotifyHub = () => {
    const [activeTab, setActiveTab] = useState("In-App Notification");
    const [activeType, setActiveType] = useState("Announcement");
    const [activeAudience, setActiveAudience] = useState("All Participants");

    const sentHistory = [
        {
            id: 1,
            event: "TECHNOVA 2024",
            title: "Welcome to Robo-Sprint!",
            preview: "Dear participants, we are thrilled to welcome you to the hackathon...",
            type: "ANNOUNCEMENT",
            date: "20 OCT 2024, 10:14",
            reached: "120 REACHED",
            colorClass: "announcement"
        },
        {
            id: 2,
            event: "SPORTS MEET",
            title: "Payment Deadline — 24 HRS",
            preview: "This is a reminder that your registration payment is due within...",
            type: "REMINDER",
            date: "19 OCT 2024, 16:45",
            reached: "18 REACHED",
            colorClass: "reminder"
        },
        {
            id: 3,
            event: "HACKNITE V.3",
            title: "Venue Change — Hall B",
            preview: "IMPORTANT: The event has been moved from Hall A to Hall B...",
            type: "ALERT",
            date: "17 OCT 2024, 08:30",
            reached: "86 REACHED",
            colorClass: "alert"
        },
        {
            id: 4,
            event: "CODEOLYMPICS 2024",
            title: "Problem Set Released",
            preview: "The practice problems are now live on the portal. You have...",
            type: "UPDATE",
            date: "15 OCT 2024, 12:00",
            reached: "200 REACHED",
            colorClass: "update"
        }
    ];

    return (
        <div className="notify-hub-page">
            <div className="notify-header-container">
                <div className="subtitle">Communications</div>
                <h1>Notify Hub</h1>
            </div>

            <div className="notify-grid">
                <div className="left-column">
                    <div className="notify-card">
                        <div className="card-title">
                            <Megaphone size={20} />
                            COMPOSE MESSAGE
                        </div>

                        <div className="compose-tabs">
                            <button
                                className={`tab-btn ${activeTab === "In-App Notification" ? "active" : ""}`}
                                onClick={() => setActiveTab("In-App Notification")}
                            >
                                In-App Notification
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "Email Broadcast" ? "active" : ""}`}
                                onClick={() => setActiveTab("Email Broadcast")}
                            >
                                Email Broadcast
                            </button>
                        </div>

                        <div className="form-group">
                            <label>SELECT EVENT</label>
                            <select className="form-select">
                                <option>-- Choose an active event --</option>
                                <option>TECHNOVA 2024</option>
                                <option>SPORTS MEET</option>
                                <option>HACKNITE V.3</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>NOTIFICATION TYPE</label>
                            <div className="type-grid">
                                <div
                                    className={`type-option ${activeType === "Announcement" ? "active" : ""}`}
                                    onClick={() => setActiveType("Announcement")}
                                >
                                    <div className="type-icon"><Flag size={18} /></div>
                                    <div className="type-label">Announcement</div>
                                </div>
                                <div
                                    className={`type-option ${activeType === "Reminder" ? "active" : ""}`}
                                    onClick={() => setActiveType("Reminder")}
                                >
                                    <div className="type-icon"><Clock size={18} /></div>
                                    <div className="type-label">Reminder</div>
                                </div>
                                <div
                                    className={`type-option ${activeType === "Alert" ? "active" : ""}`}
                                    onClick={() => setActiveType("Alert")}
                                >
                                    <div className="type-icon"><AlertTriangle size={18} /></div>
                                    <div className="type-label">Alert</div>
                                </div>
                                <div
                                    className={`type-option ${activeType === "Update" ? "active" : ""}`}
                                    onClick={() => setActiveType("Update")}
                                >
                                    <div className="type-icon"><FileText size={18} /></div>
                                    <div className="type-label">Update</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="send-to-header">
                                <label>SEND TO</label>
                                <input type="text" className="search-recipients" placeholder="Search recipients..." />
                            </div>
                            <div className="audience-tags">
                                {["All Participants", "Paid Only", "Pending Payment", "Volunteers", "Waitlisted"].map(tag => (
                                    <div
                                        key={tag}
                                        className={`audience-tag ${activeAudience === tag ? "active" : ""}`}
                                        onClick={() => setActiveAudience(tag)}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>NOTIFICATION TITLE</label>
                            <input type="text" className="form-input" placeholder="e.g. Venue Change — Main Hall" />
                        </div>

                        <div className="form-group">
                            <label>MESSAGE</label>
                            <textarea className="form-textarea" placeholder="Write your message here. Be clear and concise..."></textarea>
                        </div>

                        <div className="checkbox-group">
                            <input type="checkbox" id="schedule-later" />
                            <label htmlFor="schedule-later">SCHEDULE FOR LATER</label>
                        </div>

                        <button className="send-btn">
                            SEND NOW
                            <Send size={18} />
                        </button>
                    </div>

                    <div className="notify-card preview-card">
                        <div className="card-title">
                            <Eye size={20} />
                            LIVE PREVIEW
                        </div>
                        <div className="preview-content">
                            <div className="preview-badge">HUB_CTRL - NOTIFICATION PREVIEW</div>
                            <div className="preview-title">NOTIFICATION TITLE WILL APPEAR HERE</div>
                            <div className="preview-text">Your message preview will appear here as you type...</div>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="notify-card">
                        <div className="card-title">
                            <Clock size={20} />
                            SENT HISTORY
                        </div>
                        <div className="history-list">
                            {sentHistory.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-icon">
                                        {item.type === "ANNOUNCEMENT" && <Megaphone size={18} />}
                                        {item.type === "REMINDER" && <Clock size={18} />}
                                        {item.type === "ALERT" && <AlertTriangle size={18} />}
                                        {item.type === "UPDATE" && <FileText size={18} />}
                                    </div>
                                    <div className="history-details">
                                        <div className="history-event">{item.event}</div>
                                        <div className="history-title">{item.title}</div>
                                        <div className="history-preview">{item.preview}</div>
                                        <div className="history-meta">
                                            <div className="meta-left">
                                                <span className={`status-tag ${item.colorClass}`}>{item.type}</span>
                                                <span className="history-date">{item.date}</span>
                                            </div>
                                            <span className="reached-count">{item.reached}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a href="#" className="load-more">Load More Notifications</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotifyHub;
