import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  GraduationCap,
  UserCheck,
  Edit3,
  X,
  Check,
  Loader2,
  Camera,
  Trash2,
  School,
  Calendar,
  Shield,
  Sparkles,
  User,
  Tag,
  Plus,
  Trophy,
  History,
  ArrowUpCircle,
  LogOutIcon,
} from "lucide-react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
 
const ProfilePortal = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [interestInput, setInterestInput] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pointHistory, setPointHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteReason, setPromoteReason] = useState("");
  const [submittingPromote, setSubmittingPromote] = useState(false);

 
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
 
  useEffect(() => {
    fetchProfile();
  }, []);
 
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      setUser(res.data.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };
 
  const openEditModal = () => {
    setEditForm({
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",

      department: user?.department || "",
      yearOfStudy: user?.yearOfStudy || "",
      interests: user?.interests || [],
    });
    setInterestInput("");
    setIsEditing(true);
  };
 
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put("/profile/basic", editForm);
      setUser(res.data.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
 
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
 
    const formData = new FormData();
    formData.append("profilePicture", file);
 
    try {
      setUploading(true);
      const res = await api.post("/profile/upload/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, profilePicture: res.data.data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };
 
  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      await api.delete("/profile/profile-picture");
      setUser((prev) => ({ ...prev, profilePicture: null }));
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove picture");
    } finally {
      setUploading(false);
    }
  };
 
  const fmtDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

    const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out safely");
      navigate("/login");
    } catch { /* silent */ }
    navigate("/login");
  };

  const openHistoryModal = async () => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get("/leaderboard/history");
      setPointHistory(res.data.history || []);
    } catch (err) {
      toast.error("Failed to fetch point history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRequestPromotion = async () => {
    try {
      if (!promoteReason.trim()) {
        return toast.error("Please provide a reason");
      }
      setSubmittingPromote(true);
      await api.post("/profile/promotion-request", { reason: promoteReason.trim() });
      toast.success("Promotion request submitted successfully!");
      setShowPromoteModal(false);
      fetchProfile(); // refresh user data to show pending state
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmittingPromote(false);
    }
  };
 
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={36} />
          <p className="font-mono text-sm font-bold uppercase text-gray-400">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }
 
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono font-bold uppercase text-gray-500">Failed to load profile data.</p>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen font-mono text-black uppercase">
      <div className="max-w-4xl mx-auto">
 
        {/* ── HERO BANNER ── */}
        <div className="bg-[#B6FF60] border-4 border-black shadow-[8px_8px_0px_#000] p-6 md:p-8 mb-8 relative overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
 
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 border-4 border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden flex items-center justify-center shrink-0">
                {user.profilePicture ? (
                  <img
                    src={`${API_BASE}/${user.profilePicture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black">{initials}</span>
                )}
              </div>
 
              {/* Avatar actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-[#B6FF60] transition-colors"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                {user.profilePicture && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploading}
                    className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-[#ff6b6b] hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
 
            {/* Name + Role */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-black/50 mb-1">PORTAL IDENTITY</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-2 break-words">
                {user.fullName?.toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black text-white text-[9px] px-2 py-0.5 font-bold tracking-wider">
                  {user.role?.toUpperCase()}
                </span>
                {user.isEmailVerified && (
                  <span className="bg-white border-2 border-black text-[9px] px-2 py-0.5 font-bold flex items-center gap-1 shadow-[2px_2px_0px_#000]">
                    <UserCheck size={10} /> VERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
 
        {/* ── INFO CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 
          {/* Contact Info */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="bg-black text-white px-5 py-3 flex items-center gap-2">
              <Phone size={14} />
              <span className="font-black text-sm">CONTACT_INFO</span>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mb-1">
                  <Mail size={10} /> PRIMARY EMAIL
                </div>
                <p className="text-base font-black break-all normal-case">{user.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mb-1">
                  <Phone size={10} /> PHONE NUMBER
                </div>
                <p className="text-base font-black">{user.phoneNumber || "Not set"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mb-1">
                  <Shield size={10} /> ACCOUNT STATUS
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#B6FF60] border-2 border-black px-3 py-1 text-[9px] font-black shadow-[2px_2px_0px_#000]">
                  <UserCheck size={11} />
                  {user.isEmailVerified ? "EMAIL VERIFIED" : "UNVERIFIED"}
                </div>
              </div>
            </div>
          </div>
 
          {/* Academic Info */}
          <div className="bg-[#e5d4ff] border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="bg-black text-white px-5 py-3 flex items-center gap-2">
              <GraduationCap size={14} />
              <span className="font-black text-sm">ACADEMIC_INFO</span>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 mb-1">
                  <School size={10} /> COLLEGE / INSTITUTE
                </div>
                <p className="text-base font-black">{user.collegeId?.name || "Not set"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 mb-1">
                  <GraduationCap size={10} /> DEPARTMENT
                </div>
                <p className="text-base font-black">{user.department || "Not set"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 mb-1">
                  <Calendar size={10} /> YEAR OF STUDY
                </div>
                <p className="text-base font-black">{user.yearOfStudy || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── INTERESTS ── */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden mb-6">
          <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
             <div className="flex items-center gap-2">
              <Tag size={14} />
              <span className="font-black text-sm">NETWORKING_INTERESTS</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Match with peers</span>
          </div>
          <div className="p-5 flex flex-wrap gap-2.5">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="border-[2px] border-black text-black text-[10px] font-black px-3 py-1.5 shadow-[2px_2px_0px_#000] uppercase tracking-wider bg-[#c6ff00]"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-sm font-bold text-gray-400 italic">No interests added yet. Add some to start networking!</p>
            )}
          </div>
        </div>
 
        {/* ── ACCOUNT META ── */}
        <div className="bg-[#c2d9ff] border-4 border-black shadow-[6px_6px_0px_#000] p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[9px] font-bold text-gray-500 mb-1">SYSTEM ROLE</p>
            <p className="text-xl font-black tracking-tight">{user.role?.toUpperCase()}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[9px] font-bold text-gray-500 mb-1">MEMBER SINCE</p>
            <p className="text-sm font-black">{fmtDate(user.createdAt)}</p>
          </div>
        </div>

        {/* ── GAMIFICATION ── */}
        <div className="bg-[#B6FF60] border-4 border-black shadow-[6px_6px_0px_#000] p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[9px] font-bold text-black/50 mb-1">TOTAL GAMIFICATION POINTS</p>
            <p className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Trophy size={28} /> {user.totalPoints || 0}
            </p>
          </div>
          <div>
            <button
              onClick={openHistoryModal}
              className="bg-black text-[#B6FF60] border-2 border-transparent px-4 py-2 font-black text-xs flex items-center gap-2 hover:bg-white hover:text-black hover:border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <History size={16} /> VIEW HISTORY
            </button>
          </div>
        </div>
 
        {/* ── ACTIONS ── */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={openEditModal}
            className="bg-white border-4 border-black px-6 py-3 font-black text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000] hover:bg-[#fff35c] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
          >
            <Edit3 size={16} /> EDIT PROFILE
          </button>

          {!user.promotionRequest || user.promotionRequest.status !== "pending" ? (
            <button
              onClick={() => setShowPromoteModal(true)}
              className="bg-[#c6ff00] border-4 border-black px-6 py-3 font-black text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000] hover:bg-[#aadd00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
            >
              <ArrowUpCircle size={16} /> REQUEST ORGANIZER
            </button>
          ) : (
            <div className="bg-gray-200 border-4 border-black px-6 py-3 font-black text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000] opacity-70 cursor-not-allowed text-gray-600">
               <ArrowUpCircle size={16} /> PROMOTION PENDING
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={saving}
            className="bg-red-400 border-4 border-black px-6 py-3 font-black text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000] hover:bg-[#eefd22] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
              >
                <LogOutIcon size={16} />
                LOGOUT
              </button>
        </div>
      </div>
 
      {/* ── EDIT MODAL ── */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div
            className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-2">
                <Edit3 size={14} /> EDIT_PROFILE
              </span>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
 
            {/* Form */}
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name", key: "fullName", placeholder: "John Doe" },
                { label: "Phone Number", key: "phoneNumber", placeholder: "9876543210" },
                { label: "Department", key: "department", placeholder: "Computer Science" },
                { label: "Year of Study", key: "yearOfStudy", placeholder: "2026" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={editForm[key] || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border-3 border-black p-3 font-bold text-sm focus:outline-none focus:bg-[#fff8e1] transition-colors"
                  />
                </div>
              ))}

              {/* Interests Input */}
              <div>
                <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase">
                  Networking Interests
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (interestInput.trim() && !editForm.interests?.includes(interestInput.trim().toUpperCase())) {
                          setEditForm(prev => ({ ...prev, interests: [...(prev.interests || []), interestInput.trim().toUpperCase()] }));
                          setInterestInput("");
                        }
                      }
                    }}
                    placeholder="e.g. AI, REACT, UI/UX"
                    className="flex-1 border-3 border-black p-3 font-bold text-sm focus:outline-none focus:bg-[#fff8e1] transition-colors uppercase"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (interestInput.trim() && !editForm.interests?.includes(interestInput.trim().toUpperCase())) {
                        setEditForm(prev => ({ ...prev, interests: [...(prev.interests || []), interestInput.trim().toUpperCase()] }));
                        setInterestInput("");
                      }
                    }}
                    className="bg-[#c6ff00] border-3 border-black px-4 flex items-center justify-center shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#c6ff00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all"
                  >
                    <Plus size={20} className="stroke-[3px]" />
                  </button>
                </div>
                
                {/* Interest Tags Display */}
                <div className="flex flex-wrap gap-2">
                  {editForm.interests?.map((interest, idx) => (
                    <span
                      key={idx}
                      className="border-[2px] border-black text-black text-[10px] font-black px-2 py-1 flex items-center gap-1 shadow-[2px_2px_0px_#000] uppercase tracking-wider bg-white cursor-pointer hover:bg-red-400 hover:text-white transition-colors group"
                      onClick={() => setEditForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))}
                    >
                      {interest}
                      <X size={10} className="group-hover:text-white" />
                    </span>
                  ))}
                </div>
              </div>
 
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#B6FF60] border-3 border-black py-3 font-black text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#B6FF60] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 mt-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY MODAL ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowHistoryModal(false)}>
          <div
            className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] w-full max-w-lg relative flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black text-white px-5 py-3 flex items-center justify-between shrink-0">
              <span className="font-black text-sm flex items-center gap-2">
                <History size={14} /> POINT_HISTORY
              </span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : pointHistory.length === 0 ? (
                <p className="text-sm font-bold text-gray-400 text-center py-8">No points earned yet.</p>
              ) : (
                <div className="space-y-3">
                  {pointHistory.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between border-2 border-black p-3 bg-gray-50 shadow-[2px_2px_0px_#000]">
                      <div>
                        <p className="font-black text-sm">{tx.action.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                        <p className="text-[10px] text-gray-500 font-bold max-w-[200px] truncate">{tx.eventId?.title || "Unknown Event"}</p>
                        <p className="text-[9px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-[#B6FF60] border-2 border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_#000]">
                        +{tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROMOTE MODAL ── */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowPromoteModal(false)}>
          <div
            className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-2">
                <ArrowUpCircle size={14} /> REQUEST_ORGANIZER
              </span>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                disabled={submittingPromote}
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-gray-600">
                Submit a request to your college Admin to become an Organizer. Write a short reason explaining which club you want to manage or why you'd like an upgrade.
              </p>
              <div>
                <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase">Reason for Promotion</label>
                <textarea
                  value={promoteReason}
                  onChange={(e) => setPromoteReason(e.target.value)}
                  placeholder="I am the president of the Coding Club..."
                  className="w-full border-3 border-black p-3 font-bold text-sm focus:outline-none focus:bg-[#fff8e1] transition-colors resize-none h-28"
                />
              </div>

              <button
                onClick={handleRequestPromotion}
                disabled={submittingPromote}
                className="w-full bg-[#B6FF60] border-3 border-black py-3 font-black text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#B6FF60] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 mt-2 text-black"
              >
                {submittingPromote ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {submittingPromote ? "SUBMITTING..." : "SUBMIT REQUEST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ProfilePortal;
 