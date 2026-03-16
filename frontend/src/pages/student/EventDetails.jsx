import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/EventDetails.css";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  Send,
  ArrowLeft
} from "lucide-react";
import api from "../../api";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
  const dummyEvent = {
    _id: "123",
    title: "AI Hackathon 2026",
    description:
      "Join us for an exciting AI hackathon where students build innovative machine learning solutions.",
    posterUrl:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    eventDate: "2026-04-10",
    startTime: "10:00 AM",
    location: "Main Auditorium",
    maxSeats: 120,
  };

  const dummyComments = [
    {
      text: "This event looks amazing!",
      user: { fullName: "Rahul Sharma" },
    },
    {
      text: "Looking forward to participating 🚀",
      user: { fullName: "Ananya Patel" },
    },
    {
      text: "Will certificates be provided?",
      user: { fullName: "Kiran Reddy" },
    },
  ];

  setEvent(dummyEvent);
  setComments(dummyComments);
  setLoading(false);
}, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event || res.data);
    } catch (err) {
      console.error("Fetch event error:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(res.data.comments || res.data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(
        `/comments/${id}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setComments((prev) => [...prev, res.data.comment || res.data]);
      setText("");
    } catch (err) {
      console.error("Post comment error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-mono">
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-10 font-mono text-center">
        Event not found
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-mono p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase bg-white shadow-[3px_3px_0px_#000] hover:bg-black hover:text-[#B6FF60]"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* EVENT INFO */}
        <div className="lg:col-span-2 border-4 border-black bg-white shadow-[6px_6px_0px_#000]">

          {/* Poster */}
          <div className="h-64 border-b-4 border-black overflow-hidden bg-gray-100">
            {event.posterUrl ? (
              <img
                src={
                  event.posterUrl.startsWith("http")
                    ? event.posterUrl
                    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${event.posterUrl}`
                }
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl font-black text-gray-300">
                EVENT
              </div>
            )}
          </div>

          <div className="p-6">

            {/* Title */}
            <h1 className="text-3xl font-black uppercase border-b-4 border-black pb-3 mb-6">
              {event.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-bold uppercase">

              <div className="border-2 border-black p-3 flex gap-2 items-center">
                <Calendar size={14} />
                {new Date(event.eventDate).toDateString()}
              </div>

              <div className="border-2 border-black p-3 flex gap-2 items-center">
                <Clock size={14} />
                {event.startTime || "TBA"}
              </div>

              <div className="border-2 border-black p-3 flex gap-2 items-center">
                <MapPin size={14} />
                {event.location || "TBA"}
              </div>

              <div className="border-2 border-black p-3 flex gap-2 items-center">
                <Users size={14} />
                {event.maxSeats || 100} seats
              </div>

            </div>

            {/* Description */}
            <div className="border-2 border-black p-4 mb-6 text-sm">
              {event.description || "No description provided."}
            </div>

            {/* Register */}
            <button className="flex items-center gap-2 border-4 border-black px-6 py-3 text-xs font-black uppercase bg-[#B6FF60] shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#B6FF60]">
              <Ticket size={15} />
              Register Event
            </button>

          </div>
        </div>

        {/* COMMENTS PANEL */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_#000] flex flex-col">

          <div className="border-b-4 border-black px-4 py-3 font-black text-sm uppercase bg-black text-[#B6FF60]">
            Comments
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {comments.length === 0 && (
              <div className="text-xs text-gray-400 uppercase font-bold">
                No comments yet
              </div>
            )}

            {comments.map((c, i) => (
              <div
                key={i}
                className="border-2 border-black p-3 bg-gray-50 text-sm"
              >
                <div className="text-[10px] font-black uppercase text-gray-400">
                  {c.user?.fullName || "Student"}
                </div>
                <p>{c.text}</p>
              </div>
            ))}

          </div>

          {/* Comment Input */}
          <div className="border-t-4 border-black flex">

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add comment..."
              className="flex-1 p-3 text-sm font-bold outline-none"
            />

            <button
              onClick={postComment}
              className="border-l-4 border-black px-4 bg-[#B6FF60] hover:bg-black hover:text-[#B6FF60]"
            >
              <Send size={16} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;