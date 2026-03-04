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
  return `${dt.getDate().toString().padStart(2, "0")} ${dt.toLocaleString("en-US", {
    month: "short",
  })} ${dt.getFullYear()}`;
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white border-4 border-black shadow-[8px_8px_0px_#000] w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#ff6b6b] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Trash2 size={18} className="text-white" />
          </div>

          <h3 className="font-black text-sm uppercase">
            Delete Notification?
          </h3>
        </div>

        <p className="text-[11px] font-bold text-gray-500 normal-case mb-2 leading-relaxed">
          This will permanently delete
          <span className="text-black font-black"> "{title}" </span>
          and remove it from all student inboxes.
        </p>

        <p className="text-[9px] font-bold text-gray-400 uppercase mb-5">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ff6b6b] text-white border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000]"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}

            {deleting ? "DELETING..." : "DELETE"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000]"
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

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });

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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!form.eventId) {
      toast.error("Please select an event");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.message.trim()) {
      toast.error("Message is required");
      return;
    }

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
      toast.error(
        err.response?.data?.message || "Failed to send notification"
      );
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
    setDeleteDialog({
      open: true,
      id: n._id,
      title: n.title,
    });
  };

  return (
    <div className="min-h-screen font-mono text-black uppercase">
      {/* UI JSX CONTINUES HERE */}
    </div>
  );
};

export default SendNotification;