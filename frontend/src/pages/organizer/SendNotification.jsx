import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Send,
  Bell,
  Mail,
  Loader2,
  ChevronDown,
  Clock,
  Users,
  Megaphone,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  X,
  Trash2,
} from "lucide-react";
import api from "../../api";

const NOTIF_TYPES = [
  { value: "Announcement", label: "ANNOUNCEMENT", icon: Megaphone, color: "bg-[#B6FF60]" },
  { value: "Reminder", label: "REMINDER", icon: Clock, color: "bg-[#c2d9ff]" },
  { value: "Alert", label: "ALERT", icon: AlertTriangle, color: "bg-[#ff6b6b] text-white" },
  { value: "Update", label: "UPDATE", icon: RefreshCw, color: "bg-[#fff35c]" },
];

const RECIPIENT_TYPES = [
  "All Participants",
  "Paid Only",
  "Pending Payment",
  "Waitlisted",
];

const TAG_COLORS = {
  Announcement: "bg-[#B6FF60]",
  Reminder: "bg-[#c2d9ff]",
  Alert: "bg-[#ff6b6b]",
  Update: "bg-[#fff35c]",
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, "0")} ${dt.toLocaleString("en-US", { month: "short" })} ${dt.getFullYear()}`;
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
  return `${days}d ago`;
};

/* ── Delete Confirmation Dialog ─────────────────────── */
const DeleteDialog = ({ isOpen, onClose, onConfirm, title, deleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white border-4 border-black shadow-[8px_8px_0px_#000] w-full max-w-[90%] sm:max-w-sm p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#ff6b6b] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Trash2 size={18} className="text-white" />
          </div>
          <h3 className="font-black text-sm uppercase">Delete Notification?</h3>
        </div>
        <p className="text-[11px] font-bold text-gray-500 normal-case mb-2 leading-relaxed">
          This will permanently delete <span className="text-black font-black">"{title}"</span> and remove it from all student inboxes.
        </p>
        <p className="text-[9px] font-bold text-gray-400 uppercase mb-5">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ff6b6b] text-white border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? "DELETING..." : "DELETE"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────── */
const SendNotification = () => {
  const [activeTab, setActiveTab] = useState("in-app");
  const [events, setEvents] = useState([]);
  const [sentHistory, setSentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: "" });

  const [form, setForm] = useState({
    eventId: "",
    type: "Announcement",
    recipientType: "All Participants",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, historyRes] = await Promise.all([
        api.get("/notifications/my-events"),
        api.get("/notifications/sent"),
      ]);
      setEvents(eventsRes.data.events || []);
      setSentHistory(historyRes.data.notifications || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm({
      eventId: "",
      type: "Announcement",
      recipientType: "All Participants",
      title: "",
      message: "",
    });
  };

  const handleSend = async () => {
    if (!form.eventId) { toast.error("Please select an event"); return; }
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.message.trim()) { toast.error("Message is required"); return; }

    try {
      setSending(true);
      const payload = {
        eventId: form.eventId,
        title: form.title,
        message: form.message,
        type: form.type,
        channel: activeTab === "email" ? "Email" : "In-App",
        recipientType: form.recipientType,
      };

      const res = await api.post("/notifications/send", payload);
      toast.success(res.data.message || "Notification sent!");
      handleClear();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteDialog;
    if (!id) return;

    try {
      setDeletingId(id);
      await api.delete(`/notifications/${id}`);
      setSentHistory((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
      setDeleteDialog({ open: false, id: null, title: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (n) => {
    setDeleteDialog({ open: true, id: n._id, title: n.title });
  };

  // Filter history by channel
  const filteredHistory = sentHistory.filter((n) =>
    activeTab === "email" ? n.channel === "Email" : n.channel === "In-App"
  );

  // Stats
  const totalSent = sentHistory.length;
  const inAppCount = sentHistory.filter((n) => n.channel === "In-App").length;
  const emailCount = sentHistory.filter((n) => n.channel === "Email").length;
  const totalReach = sentHistory.reduce((sum, n) => sum + (n.reachCount || 0), 0);

  return (
    <div className="min-h-screen px-3 sm:px-5 md:px-8 font-mono text-black uppercase">
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}
        onConfirm={handleDelete}
        title={deleteDialog.title}
        deleting={deletingId === deleteDialog.id}
      />

      {/* ── Page Header ── */}
      <div className="mb-6">
        <p className="text-[10px] text-gray-500 font-bold mb-1">ORGANIZER // NOTIFICATIONS</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">SEND_NOTIFICATION</h1>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
          <p className="text-2xl font-black">{String(totalSent).padStart(2, "0")}</p>
          <p className="text-[9px] font-bold text-gray-500">TOTAL SENT</p>
        </div>
        <div className="bg-[#B6FF60] border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
          <p className="text-2xl font-black">{String(inAppCount).padStart(2, "0")}</p>
          <p className="text-[9px] font-bold">IN-APP</p>
        </div>
        <div className="bg-[#c2d9ff] border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
          <p className="text-2xl font-black">{String(emailCount).padStart(2, "0")}</p>
          <p className="text-[9px] font-bold">EMAILS</p>
        </div>
        <div className="bg-[#fff35c] border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
          <p className="text-2xl font-black">{totalReach}</p>
          <p className="text-[9px] font-bold">TOTAL REACH</p>
        </div>
      </div>

      {/* ── Channel Tabs ── */}
      <div className="border-4 border-black inline-flex bg-white shadow-[4px_4px_0px_#000] mb-6">
        <button
          onClick={() => setActiveTab("in-app")}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs flex items-center gap-2 border-r-4 border-black text-xs font-bold transition-all ${
            activeTab === "in-app" ? "bg-[#B6FF60]" : "hover:bg-gray-100"
          }`}
        >
          <Bell size={14} /> IN-APP
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs flex items-center gap-2 text-xs font-bold transition-all ${
            activeTab === "email" ? "bg-black text-[#B6FF60]" : "hover:bg-gray-100"
          }`}
        >
          <Mail size={14} /> EMAIL
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">

        {/* ── LEFT: Compose Form ── */}
        <div className="md:col-span-2 lg:col-span-2">
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="bg-black text-white px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-2">
                {activeTab === "email" ? <Mail size={16} /> : <Bell size={16} />}
                COMPOSE_{activeTab === "email" ? "EMAIL" : "MESSAGE"}
              </span>
              <span className="text-[9px] text-gray-400 font-bold">
                {activeTab === "email" ? "VIA ZEPTOMAIL" : "IN-APP DELIVERY"}
              </span>
            </div>

            <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">

              {/* Event Selector */}
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block">
                  SELECT EVENT ★
                </label>
                <div className="relative">
                  <select
                    name="eventId"
                    value={form.eventId}
                    onChange={handleChange}
                    className="w-full border-3 border-black p-3 pr-10 font-bold text-sm bg-white appearance-none focus:outline-none"
                  >
                    <option value="">— Choose an event —</option>
                    {events.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.title} ({fmtDate(e.eventDate)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Type Selector */}
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block">
                  NOTIFICATION TYPE ★
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIF_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                      className={`flex items-center gap-2 px-3 py-2 border-2 border-black text-[10px] font-black transition-all
                        ${form.type === t.value ? `${t.color} shadow-none` : "bg-white shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"}`}
                    >
                      <t.icon size={12} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Type */}
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block">
                  SEND TO
                </label>
                <div className="flex flex-wrap gap-2">
                  {RECIPIENT_TYPES.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setForm((p) => ({ ...p, recipientType: rt }))}
                      className={`px-3 py-1.5 border-2 border-black text-[9px] font-black transition-all
                        ${form.recipientType === rt ? "bg-black text-[#B6FF60]" : "bg-white shadow-[2px_2px_0px_#000]"}`}
                    >
                      {rt.toUpperCase().replace(/ /g, "_")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block">
                  NOTIFICATION TITLE ★
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Venue Change — Main Hall"
                  className="w-full border-3 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm resize-none focus:outline-none"
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block">
                  MESSAGE ★
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your message. Be clear and concise..."
                  className="w-full border-3 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm resize-none resize-none focus:outline-none normal-case"
                  maxLength={1000}
                />
                <p className="text-[9px] font-bold text-gray-400 mt-1">{form.message.length}/1000</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 bg-[#B6FF60] border-3 border-black py-3 font-black text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all hover:bg-black hover:text-[#B6FF60] disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? "SENDING..." : "SEND_NOW"}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 border-3 border-black bg-white font-black text-xs shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Preview */}
            {form.title && (
              <div className="border-t-4 border-black p-5 bg-gray-50">
                <p className="text-[9px] font-black text-gray-400 mb-3 flex items-center gap-2">
                  <Info size={10} /> LIVE PREVIEW — {activeTab === "email" ? "EMAIL" : "IN-APP NOTIFICATION"}
                </p>
                <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
                  <div className={`inline-block px-2 py-0.5 border-2 border-black text-[8px] font-black mb-2 ${TAG_COLORS[form.type] || "bg-gray-100"}`}>
                    {form.type.toUpperCase()}
                  </div>
                  <h4 className="font-black text-sm mb-1">{form.title}</h4>
                  <p className="text-[11px] text-gray-600 normal-case leading-relaxed">{form.message || "Your message will appear here..."}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-[8px] font-bold text-gray-400">
                      TYPE: {form.type.toUpperCase()} // {form.recipientType.toUpperCase().replace(/ /g, "_")}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400">
                      {activeTab === "email" ? "📧 EMAIL" : "🔔 IN-APP"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sent History ── */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="bg-black text-white px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between">
              <span className="font-black text-sm">SENT_HISTORY</span>
              <span className="text-[8px] font-bold text-gray-400">
                {filteredHistory.length} {activeTab === "email" ? "EMAILS" : "NOTIFICATIONS"}
              </span>
            </div>

            <div className="divide-y-2 divide-black max-h-[650px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={30} className="animate-spin text-gray-400" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-16 text-center">
                  <Bell className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-sm font-black text-gray-400">NO {activeTab === "email" ? "EMAIL" : "IN-APP"} NOTIFICATIONS SENT YET</p>
                  <p className="text-[10px] text-gray-400 mt-1">Send your first notification above.</p>
                </div>
              ) : (
                filteredHistory.map((n) => (
                  <div key={n._id} className="p-5 hover:bg-gray-50 transition-all group/item">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-2 py-0.5 border-2 border-black text-[8px] font-black shrink-0 ${TAG_COLORS[n.type] || "bg-gray-100"}`}>
                          {n.type?.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 truncate">
                          {n.event?.title || "Unknown Event"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-bold text-gray-400">{fmtAgo(n.createdAt)}</span>
                        <button
                          onClick={() => openDeleteDialog(n)}
                          className="w-7 h-7 flex items-center justify-center border-2 border-black bg-white hover:bg-[#ff6b6b] hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all opacity-0 group-hover/item:opacity-100"
                          title="Delete notification"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-black text-sm mb-1">{n.title}</h4>
                    <p className="text-[11px] text-gray-500 normal-case line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex gap-2">
                        <span className="text-[8px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5">
                          {n.channel === "Email" ? "📧 EMAIL" : "🔔 IN-APP"}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5">
                          → {n.recipientType?.toUpperCase().replace(/ /g, "_")}
                        </span>
                      </div>
                      <div className="bg-[#B6FF60] border-2 border-black px-2 py-0.5 text-[10px] font-black">
                        {n.reachCount || 0}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* History Footer */}
            <div className="bg-black text-gray-400 px-5 py-2 text-[9px] font-bold flex justify-between">
              <span>{filteredHistory.length} NOTIFICATIONS</span>
              <span>TOTAL REACH: {filteredHistory.reduce((s, n) => s + (n.reachCount || 0), 0)} PARTICIPANTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
