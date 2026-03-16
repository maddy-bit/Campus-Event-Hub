import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  Send,
  ArrowLeft,
} from "lucide-react";
import api from "./api";

const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEvent();
    fetchComments();
  }, []);

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
      setComments(res.data.comments || res.data);
    } catch (err) {
      console.error(err);
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments([...comments, res.data.comment || res.data]);
      setText("");
    } catch (err) {
      console.error(err);
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
    return <div className="p-10 font-mono">Event not found</div>;
  }

  return (
    <div className="w-full font-mono min-h-screen p-6">

      {/* Header */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 flex items-center gap-2 border-2 border-black px-4 py-2 font-black text-xs uppercase bg-white shadow-[3px_3px_0px_#000] hover:bg-black hover:text-[#B6FF60]"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE EVENT INFO */}
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
              <div className="flex items-center justify-center h-full text-6xl font-black text-gray-300">
                EVENT
              </div>
            )}
          </div>

          {/* Event Content */}
          <div className="p-6">

            <h1 className="text-3xl font-black uppercase tracking-tight mb-6 border-b-4 border-black pb-3">
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
            <div className="border-2 border-black p-4 mb-6 text-sm leading-relaxed">
              {event.description || "No description provided."}
            </div>

            {/* Register Button */}
            <button
              className="flex items-center gap-2 border-4 border-black px-6 py-3 font-black text-xs uppercase bg-[#B6FF60] shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#B6FF60]"
            >
              <Ticket size={15} />
              Register Event
            </button>

          </div>
        </div>

        {/* RIGHT SIDE COMMENTS */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_#000] flex flex-col">

          <div className="border-b-4 border-black px-4 py-3 font-black text-sm uppercase bg-black text-[#B6FF60]">
            Comments
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {comments.length === 0 && (
              <div className="text-xs text-gray-400 font-bold uppercase">
                No comments yet
              </div>
            )}

            {comments.map((c, i) => (
              <div
                key={i}
                className="border-2 border-black p-3 text-sm bg-gray-50"
              >
                <div className="text-[10px] font-black uppercase text-gray-400">
                  {c.user?.fullName || "Student"}
                </div>
                <p>{c.text}</p>
              </div>
            ))}

          </div>

          {/* Comment input */}
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