import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  Send,
  ArrowLeft,
} from "lucide-react";
import api from "../../api";
import "../../styles/EventDetails.css";

const USE_DUMMY = false;

const dummyEvent = {
  _id: "123",
  title: "AI Hackathon 2026",
  description:
    "Join our AI Hackathon where students build innovative machine learning applications and compete for exciting prizes.",
  posterUrl:
    "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
  eventDate: "2026-04-10",
  startTime: "10:00 AM",
  location: "Main Auditorium",
  maxSeats: 120,
};

const dummyComments = [
  
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);

  const commentEndRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (USE_DUMMY) {
      setEvent(dummyEvent);
      setComments(dummyComments);
      return;
    }

    fetchEvent();
    fetchComments();
    checkRegistration();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      let eventData = res.data.event || res.data;
      if (Array.isArray(eventData)) eventData = eventData[0];
      setEvent(eventData);
    } catch (err) {
      console.error(err);
    }
  };

  const checkRegistration = async () => {
    try {
      const res = await api.get("/registrations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const regs = res.data.registrations || [];
      const hasReg = regs.some(r => r.eventId === id || r.eventId?._id === id);
      setIsRegistered(hasReg);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/registrations/comment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const postComment = async () => {
    if (!text.trim()) return;

    try {
      await api.post(
        `/registrations/comment/${id}`,
        { data: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setText("");
      fetchComments(); // Reload comments to get populated data
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handleRegister = async () => {
    try {
      setLoadingReg(true);
      await api.post(`/registrations/register`, 
        { eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Successfully registered for the event!");
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register");
    } finally {
      setLoadingReg(false);
    }
  };

  useEffect(() => {
    commentEndRef.current?.scrollIntoView();
  }, [comments]);

  if (!event) return null;

  return (
    <div className="eventWrapper">
      <button onClick={() => navigate(-1)} className="backBtn">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="eventPage">
        {/* LEFT SECTION - EVENT DETAILS */}
        <div className="eventContent">
          {/* HEADER ROW 1: Banner & Title */}
          <div className="eventHeader">
            <div className="eventImageWrapper">
              <img
                src={
                  event.posterUrl?.startsWith("http")
                    ? event.posterUrl
                    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${event.posterUrl || ""}`
                }
                className="eventImage"
                alt={event.title}
              />
            </div>
            <div className="eventTitleSection">
              <div className="eventCategory">
                {event.category || "General"}
              </div>
              <p style={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px'}}>
                POSTED: {new Date(event.createdAt || event.eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
              </p>
              <h1>{event.title}</h1>
              {event.isPaidEvent && event.ticketPrice > 0 && (
                <div className="priceTag">
                  ₹{event.ticketPrice}
                </div>
              )}
            </div>
          </div>

          {/* HEADER ROW 2: Meta Grid */}
          <div className="eventMetaGrid">
            <div className="metaItem">
              <div className="metaIcon"><Calendar size={14} /></div>
              <div className="metaContent">
                <span className="metaLabel">DATE</span>
                <span className="metaValue">{new Date(event.eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</span>
              </div>
            </div>
            <div className="metaItem">
              <div className="metaIcon"><Clock size={14} /></div>
              <div className="metaContent">
                <span className="metaLabel">TIME</span>
                <span className="metaValue">{event.startTime} - {event.endTime || "TBD"}</span>
              </div>
            </div>
            <div className="metaItem">
              <div className="metaIcon"><MapPin size={14} /></div>
              <div className="metaContent">
                <span className="metaLabel">LOCATION</span>
                <span className="metaValue">{event.location}</span>
              </div>
            </div>
            <div className="metaItem">
              <div className="metaIcon"><Users size={14} /></div>
              <div className="metaContent">
                <span className="metaLabel">CAPACITY</span>
                <span className="metaValue">{event.maxSeats || "?"} SEATS</span>
              </div>
            </div>
          </div>

          {/* BODY ROW 3: Description & Actions */}
          <div className="eventBody">
            <div className="bodyLabel">
              <Ticket size={12} /> EVENT_DESCRIPTION
            </div>
            <div className="eventDescription">
              {event.description}
            </div>

            <div className="registrationSection">
              <div className="deadlineInfo">
                <span className="deadlineLabel">REGISTRATION_DEADLINE</span>
                <span className="deadlineDate">{new Date(event.registrationDeadline || event.eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</span>
              </div>
              
              <button 
                className={`registerBtn ${isRegistered ? 'registered' : ''}`}
                onClick={handleRegister}
                disabled={isRegistered || loadingReg}
              >
                {loadingReg ? "PROCESSING..." : isRegistered ? "ALREADY_REGISTERED" : "CONFIRM_REGISTRATION"}{" "}
                {!isRegistered && !loadingReg && <Ticket size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - COMMENTS PANEL */}
        <div className="commentPanel">
          <div className="commentHeader">
            <div className="commentHeaderTitle">
              <Send size={14} /> COMMENT_LOG
            </div>
            <div className="liveIndicator">
              <div className="pulse"></div> LIVE
            </div>
          </div>

          <div className="commentList">
            {comments.length === 0 ? (
              <div style={{textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#ccc', padding: '40px 0', textTransform: 'uppercase'}}>
                No comments yet.
              </div>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="comment">
                  <div className="commenterInfo">
                    <div className="commentAvatar">
                      {(c.userName || "A")[0].toUpperCase()}
                    </div>
                    <span className="commentName">{c.userName || 'Anonymous'}</span>
                    <span className="commentRole">{c.timeAgo || 'Just now'}</span>
                  </div>
                  <div className="commentText">
                    {c.commentText}
                  </div>
                </div>
              ))
            )}
            <div ref={commentEndRef}></div>
          </div>

          <div className="commentInputWrapper">
            <div className="commentInputGroup">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ADD_COMMENT..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") postComment();
                }}
              />
              <button onClick={postComment} disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;