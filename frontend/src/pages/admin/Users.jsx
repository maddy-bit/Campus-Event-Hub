import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";

const EditUserModal = ({ show, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "student",
    department: "",
    yearOfStudy: "",
  });

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm bg-white"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === "student" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year of Study</label>
                <input
                  type="text"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                />
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, studentsCount: 0, organizersCount: 0 });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("Active Users");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setStats(res.data.stats || { totalUsers: 0, studentsCount: 0, organizersCount: 0 });
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to soft delete this user?")) return;
    try {
      await api.patch(`/admin/users/${userId}/delete`);
      toast.success("User soft deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false;
    const matchesSearch =
      (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "All Roles" || user.role === roleFilter.toLowerCase();
    let matchesStatus = true;
    if (statusFilter === "Active Users") matchesStatus = !user.isDeleted;
    if (statusFilter === "Deleted Users") matchesStatus = !!user.isDeleted;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const roleBadge = (role) => {
    const styles = {
      student: "bg-sky-100 text-sky-600",
      organizer: "bg-amber-100 text-amber-600",
      admin: "bg-red-100 text-red-500",
    };
    return styles[role] || "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
        <span className="font-semibold">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 font-sans">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">Identity & Access</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users Directory</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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

      {/* Admins Overview */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-8 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-gray-900">College Administrators</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(users || []).filter((u) => u && u.role === "admin" && !u.isDeleted).length === 0 && (
            <div className="px-5 py-4 text-sm text-slate-400">No active administrators found.</div>
          )}
          {(users || [])
            .filter((u) => u && u.role === "admin" && !u.isDeleted)
            .map((admin) => (
              <div key={admin._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(admin.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900 truncate">{admin.fullName}</div>
                  <div className="text-xs text-slate-400 truncate hidden sm:block">{admin.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 capitalize shrink-0">
                  {admin.role}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Filters */}
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
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-gray-900">Users List</h2>
          <span className="text-xs text-slate-400 font-medium">
            {filteredUsers.length === 0
              ? "0 results"
              : `${(currentPage - 1) * usersPerPage + 1}–${Math.min(currentPage * usersPerPage, filteredUsers.length)} of ${filteredUsers.length}`}
          </span>
        </div>

        {/* Mobile card view */}
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
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${roleBadge(user.role)}`}>
                    {user.role}
                  </span>
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
                <button
                  onClick={() => handleEditClick(user)}
                  disabled={user.isDeleted}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-slate-300 disabled:opacity-40 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  disabled={user.isDeleted}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 disabled:opacity-40 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{user.fullName}</div>
                        <div className="text-xs text-slate-400">
                          UID: {(user._id || "").slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className={`w-2 h-2 rounded-full ${user.isDeleted ? "bg-slate-300" : "bg-emerald-400"}`} />
                      {user.isDeleted ? "Deleted" : "Active"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        disabled={user.isDeleted}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-slate-300 disabled:opacity-40 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={user.isDeleted}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 disabled:opacity-40 transition-colors"
                      >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                  currentPage === page
                    ? "bg-black text-white"
                    : "border border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            );
          })}
          {totalPages > 5 && <span className="text-slate-400">...</span>}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <EditUserModal
        show={showEditModal}
        user={editingUser}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminUsers;
