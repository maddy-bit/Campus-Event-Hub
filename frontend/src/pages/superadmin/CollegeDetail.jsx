import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarDays,
  Phone,
  Search,
  X,
  Save,
  Mail,
  User,
  Shield,
  BookOpen,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api";

const TABS = ["Admins", "Organizers", "Students", "Events", "Clubs"];
const ROLES = ["admin", "organizer", "student"];

const CollegeDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Admins");
  const [searchQuery, setSearchQuery] = useState("");

  // user detail modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/superadmin/colleges/${id}/details`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch college details:", err);
        setError(err.response?.data?.message || "Failed to fetch college details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const filteredList = useMemo(() => {
    if (!data) return [];

    let list = [];
    switch (activeTab) {
      case "Admins":
        list = data.admins || [];
        break;
      case "Organizers":
        list = data.organizers || [];
        break;
      case "Students":
        list = data.students || [];
        break;
      case "Events":
        list = data.events || [];
        break;
      case "Clubs":
        list = data.clubs || [];
        break;
      default:
        list = [];
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();

    if (activeTab === "Events") {
      return list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q)
      );
    }

    if (activeTab === "Clubs") {
      return list.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    return list.filter(
      (item) =>
        item.fullName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phoneNumber?.includes(q)
    );
  }, [data, activeTab, searchQuery]);

  // Open user detail modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "student",
      department: user.department || "",
      yearOfStudy: user.yearOfStudy || "",
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setEditForm({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const res = await api.put(`/superadmin/users/${selectedUser._id}`, editForm);
      toast.success(res.data.message || "User updated successfully");

      const refreshed = await api.get(`/superadmin/colleges/${id}/details`);
      setData(refreshed.data);

      const updatedUser = res.data.user;
      setSelectedUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { college, stats } = data;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <Link
        to="/superadmin/institutions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black
                   transition-colors text-sm mb-6 no-underline"
      >
        <ArrowLeft size={18} />
        <span>Back to all colleges</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          {college.logo ? (
            <img
              src={college.logo}
              alt={college.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl">
              <GraduationCap size={30} className="text-gray-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              {college.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {college.location}
                </span>
              )}
              {college.domain && (
                <span className="flex items-center gap-1">
                  <Globe size={14} /> {college.domain}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  college.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {college.isVerified ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {college.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
            Primary Administrator
          </p>
          {data.admins.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                {data.admins[0].fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{data.admins[0].fullName}</p>
                <p className="text-xs text-gray-400">{data.admins[0].email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No admin assigned</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
            Ecosystem Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={stats.totalStudents} />
            <StatCard label="Total Events" value={stats.totalEvents} />
            <StatCard label="Organizers" value={stats.totalOrganizers} />
            <StatCard label="Admins" value={stats.totalAdmins} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
              className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer
                ${activeTab === tab
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Filter ${activeTab.toLowerCase()} by name, email, or ID...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredList.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No {activeTab.toLowerCase()} found
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item._id}
                onClick={() => activeTab !== "Events" && activeTab !== "Clubs" && handleUserClick(item)}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors ${
                  activeTab !== "Events" && activeTab !== "Clubs" ? "cursor-pointer" : ""
                }`}
              >
                {activeTab === "Events" ? (
                  <EventRow item={item} />
                ) : activeTab === "Clubs" ? (
                  <ClubRow item={item} />
                ) : (
                  <UserRow item={item} role={activeTab} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          editForm={editForm}
          isEditing={isEditing}
          saving={saving}
          onClose={handleCloseModal}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setIsEditing(false);
            setEditForm({
              fullName: selectedUser.fullName || "",
              email: selectedUser.email || "",
              phoneNumber: selectedUser.phoneNumber || "",
              role: selectedUser.role || "student",
              department: selectedUser.department || "",
              yearOfStudy: selectedUser.yearOfStudy || "",
            });
          }}
          onSave={handleSave}
          onFieldChange={handleFieldChange}
        />
      )}
    </div>
  );
};


/* ─── User Detail Modal ─── */

const UserDetailModal = ({
  user,
  editForm,
  isEditing,
  saving,
  onClose,
  onEdit,
  onCancel,
  onSave,
  onFieldChange,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">

        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user.fullName}</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : user.role === "organizer"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Shield size={10} />
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          <ModalField
            icon={<User size={15} />}
            label="Full Name"
            value={editForm.fullName}
            isEditing={isEditing}
            onChange={(val) => onFieldChange("fullName", val)}
          />

          <ModalField
            icon={<Mail size={15} />}
            label="Email"
            value={editForm.email}
            isEditing={isEditing}
            onChange={(val) => onFieldChange("email", val)}
            type="email"
          />

          <ModalField
            icon={<Phone size={15} />}
            label="Phone Number"
            value={editForm.phoneNumber}
            isEditing={isEditing}
            onChange={(val) => onFieldChange("phoneNumber", val)}
          />

          <div className="flex items-start gap-3">
            <div className="mt-2.5 text-gray-400">
              <Shield size={15} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Role
              </label>
              {isEditing ? (
                <select
                  value={editForm.role}
                  onChange={(e) => onFieldChange("role", e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-800 mt-1 capitalize">{editForm.role}</p>
              )}
            </div>
          </div>

          <ModalField
            icon={<BookOpen size={15} />}
            label="Department"
            value={editForm.department}
            isEditing={isEditing}
            onChange={(val) => onFieldChange("department", val)}
            placeholder="e.g. Computer Science"
          />

          <ModalField
            icon={<Calendar size={15} />}
            label="Year of Study"
            value={editForm.yearOfStudy}
            isEditing={isEditing}
            onChange={(val) => onFieldChange("yearOfStudy", val)}
            placeholder="e.g. 2026"
          />

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <ReadOnlyField label="User ID" value={user._id} />
            <ReadOnlyField label="Email Verified" value={user.isEmailVerified ? "Yes" : "No"} />
            <ReadOnlyField label="Status" value={user.isDeleted ? "Deleted" : "Active"} />
            <ReadOnlyField
              label="Joined"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            {user.clubId && (
              <ReadOnlyField
                label="Club"
                value={typeof user.clubId === "object" ? user.clubId.name : user.clubId}
              />
            )}
            {user.stats && (
              <>
                <ReadOnlyField label="Events Created" value={user.stats.eventsCreated} />
                <ReadOnlyField label="Total Participants" value={user.stats.totalParticipants} />
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200
                           transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800
                           transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800
                         transition-colors cursor-pointer"
            >
              Edit User
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



const ModalField = ({ icon, label, value, isEditing, onChange, type = "text", placeholder = "" }) => (
  <div className="flex items-start gap-3 ">
    <div className="mt-2.5 text-gray-400">{icon}</div>
    <div className="flex-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
        />
      ) : (
        <p className="text-sm text-gray-800 mt-1">{value || "—"}</p>
      )}
    </div>
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-700 font-medium text-right break-all max-w-[60%]">
      {value ?? "—"}
    </span>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
  </div>
);

const UserRow = ({ item, role }) => (
  <>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
        {item.profilePicture ? (
          <img src={item.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          item.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{item.fullName}</p>
        <p className="text-xs text-gray-400">{item.email}</p>
      </div>
    </div>
    <div className="flex items-center gap-3 text-gray-400">
      {item.phoneNumber && (
        <span className="hidden sm:flex items-center gap-1 text-xs">
          <Phone size={12} /> {item.phoneNumber}
        </span>
      )}
      {role === "Organizers" && item.clubId && (
        <span className="hidden md:inline text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
          {item.clubId.name}
        </span>
      )}
    </div>
  </>
);

const ClubRow = ({ item }) => (
  <>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
        <Layers size={16} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
        <p className="text-xs text-gray-400">
          {item.category || "uncategorized"} {item.description ? `· ${item.description.slice(0, 40)}...` : ""}
        </p>
      </div>
    </div>
    <div className="text-xs text-gray-400">
      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
    </div>
  </>
);

const EventRow = ({ item }) => (
  <>
    <div className="flex items-center gap-3 ">
      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
        <CalendarDays size={16} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-400">
          {item.category} • {item.eventDate ? new Date(item.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          item.status === "Approved"
            ? "bg-green-100 text-green-700"
            : item.status === "Rejected"
            ? "bg-red-100 text-red-600"
            : item.status === "Submitted"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {item.status}
      </span>
    </div>
  </>
);

export default CollegeDetail;
