import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle,
  MailOpen,
  Loader2,
  Megaphone,
  Clock,
  AlertTriangle,
  RefreshCw,
  Frown,
  Calendar,
  Sparkles,
  Archive,
  Filter,
  FileCheck,
  UserPlus,
} from "lucide-react";
import api from "../../api";

const TYPE_CONFIG = {
  Announcement:      { icon: Megaphone,      color: "bg-[#B6FF60]", accent: "#B6FF60" },
  Reminder:          { icon: Clock,           color: "bg-[#c2d9ff]", accent: "#c2d9ff" },
  Alert:             { icon: AlertTriangle,   color: "bg-[#ff6b6b]", accent: "#ff6b6b" },
  Update:            { icon: RefreshCw,       color: "bg-[#fff35c]", accent: "#fff35c" },
  Submission_Update: { icon: FileCheck,       color: "bg-[#c4b5fd]", accent: "#c4b5fd" },
  Registration:      { icon: UserPlus,        color: "bg-[#67e8f9]", accent: "#67e8f9" },
};

const fmtAgo = (d) => {
  const now = new Date();
  const diff = now - new Date(d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

const NotifCard = ({ n, onMarkRead, markingId }) => {
  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.Announcement;
  const Icon = config.icon;

  return (
    <div
      className={`relative bg-white border-4 border-black overflow-hidden transition-all duration-200 group
        ${n.isRead
          ? "opacity-50 shadow-[3px_3px_0px_#000] hover:opacity-70"
          : "shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000]"
        }`}
    >
      <div className={`h-1.5 ${config.color}`} />

      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 ${config.color} border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs uppercase tracking-tight">
                  {n.sender?.fullName || "SYSTEM"}
                </span>
                <span className={`px-1.5 py-0.5 border border-black text-[7px] font-black uppercase ${config.color}`}>
                  {n.type?.replace("_", " ")}
                </span>
              </div>
              {n.event && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar size={9} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase truncate">
                    {typeof n.event === "object" ? n.event.title : n.event}
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap shrink-0">
            {fmtAgo(n.createdAt)}
          </span>
        </div>

        <h4 className="font-black text-sm uppercase tracking-tight mb-1.5 leading-snug">
          {n.title}
        </h4>

        <p className="text-[12px] font-bold text-gray-500 leading-relaxed normal-case mb-4">
          {n.message}
        </p>

        <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
          {n.isRead ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase">
                <CheckCircle size={11} /> Read
              </span>
              <span className="text-[8px] font-bold text-gray-300 uppercase">
                // auto-clears in 24h
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#B6FF60] border border-black animate-pulse" />
              <span className="text-[9px] font-black uppercase text-black">NEW</span>
            </div>
          )}
          {!n.isRead && (
            <button
              onClick={() => onMarkRead(n._id)}
              disabled={markingId === n._id}
              className="flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-[9px] font-black uppercase bg-white hover:bg-black hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              {markingId === n._id ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <MailOpen size={11} />
              )}
              Mark Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OrganizerNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications/my");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      setMarkingId(id);
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      toast.success("Marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "All") return notifications;
    if (filter === "Unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unread = filtered.filter((n) => !n.isRead);
  const read = filtered.filter((n) => n.isRead);

  const filters = ["All", "Unread", "Submission_Update", "Announcement", "Alert", "Update", "Reminder"];

  return (
    <div className="min-h-screen px-3 sm:px-5 md:px-8 font-mono text-black uppercase">
      <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">

        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <Sparkles size={10} /> ORGANIZER // NOTIFICATIONS
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                INBOX_FEED
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              {unreadCount > 0 && (
                <div className="bg-[#B6FF60] border-2 border-black px-3 py-1 font-black text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                  <Bell size={12} /> {unreadCount} NEW
                </div>
              )}
              <div className="bg-black text-gray-400 px-3 py-1 text-[9px] font-bold">
                {notifications.length} TOTAL
              </div>
            </div>
          </div>

          <div className="bg-[#c4b5fd] border-3 border-black px-4 py-2.5 mb-5 shadow-[3px_3px_0px_#000] flex items-center gap-3">
            <FileCheck size={14} className="shrink-0" />
            <p className="text-[10px] font-bold normal-case">
              You'll receive notifications when your events are approved/rejected by admin and when students register for your events.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-black pb-4">
            <div className="flex gap-1.5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 font-black text-[9px] border-2 border-black transition-all ${
                    filter === f
                      ? "bg-black text-[#B6FF60]"
                      : "bg-white shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  }`}
                >
                  {f === "All" ? (
                    <span className="flex items-center gap-1"><Filter size={9} /> ALL</span>
                  ) : (
                    f.replace("_", " ").toUpperCase()
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="flex items-center gap-1.5 border-2 border-black px-4 py-1.5 text-[9px] font-black bg-white hover:bg-black hover:text-white shadow-[2px_2px_0px_#000] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              {markingAll ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
              Mark All Read
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-black" size={36} />
            <p className="text-sm font-bold text-gray-400">LOADING NOTIFICATIONS...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-4 border-dashed border-black bg-white p-16 text-center shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <Frown className="mx-auto mb-4 text-gray-300" size={52} />
            <p className="text-base font-black text-gray-500 mb-1">
              {filter === "All" ? "NO NOTIFICATIONS YET" : `NO ${filter.replace("_", " ").toUpperCase()} NOTIFICATIONS`}
            </p>
            <p className="text-[11px] text-gray-400 normal-case font-bold">
              {filter === "All"
                ? "Create events to start receiving approval and registration notifications."
                : "Try selecting a different filter."}
            </p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <section className="mb-8">
                <div className="bg-black text-[#B6FF60] px-4 py-2 text-[10px] font-black tracking-widest mb-4 flex items-center justify-between shadow-[3px_3px_0px_#000]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#B6FF60] animate-pulse" />
                    UNREAD ({unread.length})
                  </span>
                </div>
                <div className="space-y-4">
                  {unread.map((n) => (
                    <NotifCard key={n._id} n={n} onMarkRead={handleMarkRead} markingId={markingId} />
                  ))}
                </div>
              </section>
            )}

            {read.length > 0 && (
              <section className="mb-10">
                <div className="bg-gray-200 border-2 border-black px-4 py-2 text-[10px] font-black tracking-widest mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Archive size={11} /> READ — CLEARING SOON ({read.length})
                  </span>
                </div>
                <div className="space-y-4">
                  {read.map((n) => (
                    <NotifCard key={n._id} n={n} onMarkRead={handleMarkRead} markingId={markingId} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="bg-black py-3 px-5 text-center mt-10">
          <p className="text-[9px] text-gray-500 font-bold">
            FEED_ACTIVE // {notifications.length} RECORDS // {unreadCount} UNREAD // AUTO-CLEAR: 24H AFTER READ
          </p>
        </footer>
      </div>
    </div>
  );
};

export default OrganizerNotification;
