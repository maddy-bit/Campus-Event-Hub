import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const USE_DUMMY = true;

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
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const postComment = async () => {
    if (!text.trim()) return;

    if (USE_DUMMY) {
      const newComment = {
        text,
        user: { fullName: "You" },
      };

      setComments((prev) => [newComment, ...prev]);
      setText("");
      return;
    }

    try {
      const res = await api.post(
        `/comments/${id}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [res.data.comment, ...prev]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    commentEndRef.current?.scrollIntoView();
  }, [comments]);

  if (!event) return null;

  return (
    <div className="eventWrapper">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="backBtn"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="eventPage">

        {/* LEFT EVENT SECTION */}

        <div className="eventContent">

          <img
            src={event.posterUrl}
            className="eventImage"
            alt={event.title}
          />

          <h1>{event.title}</h1>

          <div className="eventMeta">

            <span>
              <Calendar size={12} />
              {new Date(event.eventDate).toDateString()}
            </span>

            <span>
              <Clock size={12} />
              {event.startTime}
            </span>

            <span>
              <MapPin size={12} />
              {event.location}
            </span>

            <span>
              <Users size={12} />
              {event.maxSeats} seats
            </span>

          </div>

          <p>{event.description}</p>

          <button className="registerBtn">
            <Ticket size={14} />
            Register Event
          </button>

        </div>

        {/* COMMENT PANEL */}

        <div className="commentPanel">

          <h3>COMMENTS</h3>

          <div className="commentList">

            {comments.map((c, i) => (
              <div key={i} className="comment">
                <b>{c.user?.fullName}</b>
                <p>{c.text}</p>
              </div>
            ))}

            <div ref={commentEndRef}></div>

          </div>

          <div className="commentInput">

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add comment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") postComment();
              }}
            />

            <button onClick={postComment}>
              <Send size={14} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EventDetails;