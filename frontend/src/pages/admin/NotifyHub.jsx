import React, { useState, useEffect } from "react";
import { Send, Bell, Mail, Megaphone, Clock, AlertTriangle, FileText, Flag, Trash2, Users, User } from "lucide-react";
import api from "../../api";
import { toast } from "sonner";

const NotifyHub = () => {
  const [channelTab, setChannelTab] = useState("In-App");
  const [audienceTab, setAudienceTab] = useState("students");
  const [notifType, setNotifType] = useState("Announcement");
  const [recipientType, setRecipientType] = useState("All Participants");

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => { fetchEvents(); fetchClubs(); fetchHistory(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/admin/events");
      setEvents(res.data.events || []);
    } catch { /* silent */ }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get("/admin/clubs");
      setClubs(res.data.clubs || res.data || []);
    } catch { /* silent */ }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/notifications/sent");
      setHistory(res.data.notifications || []);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  };

  const resetForm = () => {
    setTitle(""); setMessage(""); setSelectedId(""); setRecipientType("All Participants");
  };

  const handleSend = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!message.trim()) return toast.error("Message is required");
    if (audienceTab === "students" && !selectedId) return toast.error("Please select an event");
    if (audienceTab === "organizers" && !selectedId) return toast.error("Please select a club");

    try {
      setSending(true);
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        channel: channelTab,
        recipientType,
      };

      if (audienceTab === "students") {
        payload.eventId = selectedId;
      } else {
        payload.clubId = selectedId;
      }

      await api.post("/notifications/send", payload);
      toast.success("Notification sent successfully!");
      resetForm();
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send notification");
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Deleted");
      fetchHistory();
    } catch { toast.error("Failed to delete"); }
  };

  const formatDate = (d) => {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  const typeIcon = (t) => {
    const map = { Announcement: Flag, Reminder: Clock, Alert: AlertTriangle, Update: FileText };
    const Icon = map[t] || Flag;
    return <Icon size={14} />;
  };

  const typeBadgeColor = (t) => {
    const map = { Announcement: "bg-blue-100 text-blue-600", Reminder: "bg-amber-100 text-amber-600", Alert: "bg-red-100 text-red-600", Update: "bg-emerald-100 text-emerald-600" };
    return map[t] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="pb-24 font-sans">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">Communications</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notify Hub</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose - Left */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Megaphone size={18} className="text-black" />
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Compose</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Channel Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Channel</label>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  {[{ key: "In-App", icon: Bell, label: "In-App" }, { key: "Email", icon: Mail, label: "Email" }].map(ch => (
                    <button key={ch.key} onClick={() => setChannelTab(ch.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${channelTab === ch.key ? "bg-white text-black shadow-sm" : "text-slate-500"}`}>
                      <ch.icon size={15} /> {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Send To</label>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  {[{ key: "students", icon: Users, label: "Students" }, { key: "organizers", icon: User, label: "Organizers" }].map(a => (
                    <button key={a.key} onClick={() => { setAudienceTab(a.key); setSelectedId(""); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${audienceTab === a.key ? "bg-white text-black shadow-sm" : "text-slate-500"}`}>
                      <a.icon size={15} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {audienceTab === "students" ? "Select Event" : "Select Club"}
                </label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none bg-white">
                  <option value="">-- {audienceTab === "students" ? "Choose an event" : "Choose a club"} --</option>
                  {audienceTab === "students"
                    ? (events || []).map(e => <option key={e._id} value={e._id}>{e.title}</option>)
                    : (clubs || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                  }
                </select>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ key: "Announcement", icon: Flag }, { key: "Reminder", icon: Clock }, { key: "Alert", icon: AlertTriangle }, { key: "Update", icon: FileText }].map(t => (
                    <button key={t.key} onClick={() => setNotifType(t.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all ${notifType === t.key ? "border-black bg-black text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      <t.icon size={16} />
                      <span className="hidden sm:inline">{t.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Filter (students only) */}
              {audienceTab === "students" && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Filter</label>
                  <div className="flex flex-wrap gap-2">
                    {["All Participants", "Paid Only", "Pending Payment", "Waitlisted"].map(tag => (
                      <button key={tag} onClick={() => setRecipientType(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${recipientType === tag ? "bg-black text-white border-black" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
                  placeholder="e.g. Venue Change — Main Hall"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none" />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={4}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none resize-none" />
                <div className="text-xs text-slate-400 mt-1 text-right">{message.length}/1000</div>
              </div>

              {/* Send */}
              <button onClick={handleSend} disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-gray-800 disabled:opacity-60">
                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send size={16} /> Send {channelTab === "Email" ? "Email" : "Notification"}</>}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</span>
            </div>
            <div className="p-6">
              <div className={`rounded-xl p-5 ${channelTab === "Email" ? "bg-slate-50 border border-slate-200" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${channelTab === "Email" ? typeBadgeColor(notifType) : "bg-white/20 text-white"}`}>
                    {notifType}
                  </span>
                  <span className={`text-[10px] ${channelTab === "Email" ? "text-slate-400" : "text-white/50"}`}>
                    {channelTab === "Email" ? "📧 Email" : "🔔 In-App"}
                  </span>
                </div>
                <div className={`text-lg font-bold mb-2 ${channelTab === "Email" ? "text-gray-900" : "text-white"}`}>
                  {title || "Notification title will appear here"}
                </div>
                <div className={`text-sm leading-relaxed ${channelTab === "Email" ? "text-slate-600" : "text-white/70"}`}>
                  {message || "Your message preview will appear here as you type..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History - Right */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-black" />
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sent History</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{history.length} sent</span>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">No notifications sent yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                {history.map(item => (
                  <div key={item._id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeBadgeColor(item.type)}`}>
                        {typeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          {typeof item.event === "object" && item.event?.title ? item.event.title : typeof item.club === "object" && item.club?.name ? item.club.name : "—"}
                        </div>
                        <div className="text-sm font-bold text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeBadgeColor(item.type)}`}>{item.type}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                          <span className="text-[10px] font-bold text-slate-500 ml-auto">{item.reachCount || 0} reached</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(item._id)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyHub;
