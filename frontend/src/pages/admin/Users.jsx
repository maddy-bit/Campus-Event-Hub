import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Search, X, Plus, Users, Layers, ChevronRight, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";

const CLUB_CATEGORIES = ["Technical", "Cultural", "Sports", "Literary", "Social Service", "Other"];

const EditUserModal = ({ show, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: "", email: "", role: "student", department: "", yearOfStudy: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "student",
        department: user.department || "",
        yearOfStudy: user.yearOfStudy || "",
      });
    }
  }, [user]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${user._id}`, formData);
      toast.success("User updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm bg-white">
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === "student" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year of Study</label>
                <input type="text" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm" />
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors cursor-pointer">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClubDetailModal = ({ show, club, students, onClose, onAssign, assigning, onRemove, removing }) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  if (!show || !club) return null;

  const filteredStudents = (students || []).filter(s =>
    !s.isDeleted && (s.role === "student") &&
    (s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900">{club.name}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="Category" value={club.category || "N/A"} />
            <InfoField label="Created" value={club.createdAt ? new Date(club.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
          </div>
          {club.description && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</p>
              <p className="text-sm text-gray-700">{club.description}</p>
            </div>
          )}
          {club.organizer && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Organizer</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {club.organizer.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{club.organizer.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{club.organizer.email}</p>
                  </div>
                </div>
                {onRemove && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${club.organizer.fullName} from this club?`)) {
                        onRemove(club._id, club.organizer._id);
                      }
                    }}
                    disabled={removing}
                    className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-slate-900 hover:bg-red-50 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                    title="Remove Organizer"
                  >
                    {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Assign Student as Organizer</p>
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 mb-2"
            />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 mb-3"
            >
              <option value="">Select a student</option>
              {filteredStudents.map(s => (
                <option key={s._id} value={s._id}>{s.fullName} — {s.email}</option>
              ))}
            </select>
            <button
              onClick={() => { if (selectedStudent) onAssign(club._id, selectedStudent); }}
              disabled={!selectedStudent || assigning}
              className="w-full px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {assigning ? "Assigning..." : "Assign as Organizer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
    <p className="text-sm text-gray-800 font-medium">{value}</p>
  </div>
);

const CreateClubModal = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: "", category: "Technical", description: "" });
  const [creating, setCreating] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Club name is required");
    try {
      setCreating(true);
      const res = await api.post("/admin/clubs", form);
      toast.success(res.data.message || "Club created");
      setForm({ name: "", category: "Technical", description: "" });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create club");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900">Create Club</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Club Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm" placeholder="Enter club name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm bg-white">
              {CLUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm resize-none" placeholder="Brief description of the club" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {creating ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, studentsCount: 0, organizersCount: 0 });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("Active Users");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showClubDetail, setShowClubDetail] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, clubsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/clubs").catch(() => ({ data: { clubs: [] } })),
      ]);
      setStats(usersRes.data.stats || { totalUsers: 0, studentsCount: 0, organizersCount: 0 });
      setUsers(usersRes.data.users || []);
      setClubs(clubsRes.data.clubs || []);
    } catch (error) {
      console.error("fetch error:", error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to soft delete this user?")) return;
    try {
      await api.patch(`/admin/users/${userId}/delete`);
      toast.success("User soft deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditClick = (user) => { setEditingUser(user); setShowEditModal(true); };

  const handleClubClick = (club) => { setSelectedClub(club); setShowClubDetail(true); };

  const handleAssignOrganizer = async (clubId, userId) => {
    try {
      setAssigning(true);
      const res = await api.post("/admin/clubs/assign-organizer", { clubId, userId });
      toast.success(res.data.message || "Organizer assigned");
      setShowClubDetail(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign organizer");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveOrganizer = async (clubId, userId) => {
    try {
      setRemoving(true);
      const res = await api.post("/admin/clubs/remove-organizer", { clubId, userId });
      toast.success(res.data.message || "Organizer removed");
      setShowClubDetail(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove organizer");
    } finally {
      setRemoving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try { return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return "N/A"; }
  };

  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false;
    const matchesSearch = (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter.toLowerCase();
    let matchesStatus = true;
    if (statusFilter === "Active Users") matchesStatus = !user.isDeleted;
    if (statusFilter === "Deleted Users") matchesStatus = !!user.isDeleted;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const roleBadge = (role) => {
    const styles = { student: "bg-sky-100 text-sky-600", organizer: "bg-amber-100 text-amber-600", admin: "bg-red-100 text-red-500" };
    return styles[role] || "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
        <span className="font-semibold">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 font-sans max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">Identity & Access</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users Directory</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-3xl font-black text-gray-900">{stats.totalUsers}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Students</div>
          <div className="text-3xl font-black text-gray-900">{stats.studentsCount}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Organizers</div>
          <div className="text-3xl font-black text-gray-900">{stats.organizersCount}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-gray-900">College Administrators</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(users || []).filter(u => u && u.role === "admin" && !u.isDeleted).length === 0 && (
            <div className="px-6 py-4 text-sm text-slate-400">No active administrators found.</div>
          )}
          {(users || []).filter(u => u && u.role === "admin" && !u.isDeleted).map((admin) => (
            <div key={admin._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(admin.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900 truncate">{admin.fullName}</div>
                <div className="text-xs text-slate-400 truncate">{admin.email}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 capitalize shrink-0">{admin.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold text-gray-900">College Clubs</h2>
            <span className="text-xs text-slate-400 ml-1">({clubs.length})</span>
          </div>
          <button
            onClick={() => setShowCreateClub(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Plus size={13} /> New Club
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {clubs.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No clubs created yet. Create one to get started.</div>
          )}
          {clubs.map((club) => (
            <div
              key={club._id}
              onClick={() => handleClubClick(club)}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900 truncate">{club.name}</div>
                <div className="text-xs text-slate-400">{club.category || "Uncategorized"}</div>
              </div>
              {club.organizer ? (
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {club.organizer.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-500">{club.organizer.fullName}</span>
                </div>
              ) : (
                <span className="text-xs text-amber-500 font-medium mr-2">No organizer</span>
              )}
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-black outline-none min-w-[120px]"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>All Roles</option>
          <option>Admin</option>
          <option>Organizer</option>
          <option>Student</option>
        </select>
        <select
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-black outline-none min-w-[130px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>Any Status</option>
          <option>Active Users</option>
          <option>Deleted Users</option>
        </select>
        <button
          onClick={() => { setSearchTerm(""); setRoleFilter("All Roles"); setStatusFilter("Active Users"); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-gray-900">Users List</h2>
          <span className="text-xs text-slate-400 font-medium">
            {filteredUsers.length === 0 ? "0 results" : `${(currentPage - 1) * usersPerPage + 1}–${Math.min(currentPage * usersPerPage, filteredUsers.length)} of ${filteredUsers.length}`}
          </span>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedUsers.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No users found.</div>
          )}
          {paginatedUsers.map((user) => (
            <div key={user._id} className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{user.fullName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${roleBadge(user.role)}`}>{user.role}</span>
                </div>
                <div className="text-xs text-slate-400 truncate mb-1">{user.email}</div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatDate(user.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isDeleted ? "bg-slate-300" : "bg-emerald-400"}`} />
                    {user.isDeleted ? "Deleted" : "Active"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleEditClick(user)} disabled={user.isDeleted} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-slate-300 disabled:opacity-40 transition-colors cursor-pointer">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(user._id)} disabled={user.isDeleted} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 disabled:opacity-40 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 && (
                <tr><td colSpan="6" className="py-12 text-center text-sm text-slate-400">No users found matching your filters.</td></tr>
              )}
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{user.fullName}</div>
                        <div className="text-xs text-slate-400">UID: {(user._id || "").slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className={`w-2 h-2 rounded-full ${user.isDeleted ? "bg-slate-300" : "bg-emerald-400"}`} />
                      {user.isDeleted ? "Deleted" : "Active"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(user)} disabled={user.isDeleted} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-slate-300 disabled:opacity-40 transition-colors cursor-pointer">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} disabled={user.isDeleted} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 disabled:opacity-40 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer">Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors cursor-pointer ${currentPage === page ? "bg-black text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>{page}</button>
            );
          })}
          {totalPages > 5 && <span className="text-slate-400">...</span>}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer">Next</button>
        </div>
      )}

      <EditUserModal show={showEditModal} user={editingUser} onClose={() => setShowEditModal(false)} onSuccess={fetchData} />
      <ClubDetailModal show={showClubDetail} club={selectedClub} students={users} onClose={() => setShowClubDetail(false)} onAssign={handleAssignOrganizer} assigning={assigning} onRemove={handleRemoveOrganizer} removing={removing} />
      <CreateClubModal show={showCreateClub} onClose={() => setShowCreateClub(false)} onSuccess={fetchData} />
    </div>
  );
};

export default AdminUsers;
