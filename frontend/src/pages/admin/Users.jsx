import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import "../../styles/AdminUsers.css";
import { toast } from 'sonner';
import api from "../../api";

const EditUserModal = ({ show, user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "student",
        department: "",
        yearOfStudy: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                role: user.role || "student",
                department: user.department || "",
                yearOfStudy: user.yearOfStudy || ""
            });
        }
    }, [user]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        <div className="admin-modal-overlay" onClick={onClose} style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000}}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ background: "#fff", padding: "24px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0 }}>Edit User</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600" }}>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
                    </div>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600" }}>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
                    </div>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600" }}>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {formData.role === "student" && (
                        <>
                            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600" }}>Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
                            </div>
                            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600" }}>Year of Study</label>
                                <input type="text" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
                            </div>
                        </>
                    )}
                    <div style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "flex-end" }}>
                        <button type="button" onClick={onClose} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Cancel</button>
                        <button type="submit" style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "#000", color: "#fff", cursor: "pointer" }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, studentsCount: 0, organizersCount: 0 });
    
    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("Active Users");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/admin/users");
            setStats(res.data.stats || { totalUsers: 0, studentsCount: 0, organizersCount: 0 });
            setUsers(res.data.users || []);
        } catch (error) {
            toast.error("Error fetching users");
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
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === "All Roles" || user.role === roleFilter.toLowerCase();
        
        let matchesStatus = true;
        if (statusFilter === "Active Users") matchesStatus = !user.isDeleted;
        if (statusFilter === "Deleted Users") matchesStatus = user.isDeleted;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    return (
        <div className="admin-users-page">
            <div className="users-header-container">
                <div className="header-title-section">
                    <div className="subtitle">Identity & Access</div>
                    <h1>Users Directory</h1>
                </div>
            </div>

            <div className="users-stats-grid">
                <div className="user-stat-card">
                    <div className="label">Total Users</div>
                    <div className="value">{stats.totalUsers}</div>
                </div>
                <div className="user-stat-card">
                    <div className="label">Students</div>
                    <div className="value">{stats.studentsCount}</div>
                </div>
                <div className="user-stat-card">
                    <div className="label">Organizers</div>
                    <div className="value">{stats.organizersCount}</div>
                </div>
            </div>

            <div className="filters-bar" style={{ flexWrap: "wrap" }}>
                <div className="search-container" style={{ position: "relative", marginRight: "auto", display: "flex", alignItems: "center" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{ padding: "10px 16px 10px 40px", borderRadius: "12px", border: "1.5px solid #f1f3f5", minWidth: "250px", fontSize: "14px" }}
                    />
                </div>

                <select className="filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                    <option>All Roles</option>
                    <option>Admin</option>
                    <option>Organizer</option>
                    <option>Student</option>
                </select>

                <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option>Any Status</option>
                    <option>Active Users</option>
                    <option>Deleted Users</option>
                </select>

                <button className="reset-filters-btn" onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("All Roles");
                    setStatusFilter("Active Users");
                    setCurrentPage(1);
                }}>Reset Filters</button>
            </div>

            <div className="users-table-container">
                <div className="table-header-info">
                    <h2>Global Users List</h2>
                    <div className="showing-count">
                        Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                    </div>
                </div>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Contact Email</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-name-cell">
                                        <div className="user-avatar mk" style={{ background: "#f8fafc", color: "#0f172a" }}>
                                            {getInitials(user.fullName)}
                                        </div>
                                        <div className="user-info-text">
                                            <span className="name">{user.fullName}</span>
                                            <span className="uid">UID: {user._id.substring(user._id.length - 6)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ textTransform: "capitalize" }} className={`role-badge ${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className="email-txt">{user.email}</span>
                                </td>
                                <td>
                                    <span className="date-txt">{formatDate(user.createdAt)}</span>
                                </td>
                                <td>
                                    <div className="status-cell">
                                        <div className={`status-dot ${user.isDeleted ? "offline" : "active"}`}></div>
                                        {user.isDeleted ? "Deleted" : "Active"}
                                    </div>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="action-btn" onClick={() => handleEditClick(user)} disabled={user.isDeleted} style={{ opacity: user.isDeleted ? 0.5 : 1 }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(user._id)} disabled={user.isDeleted} style={{ opacity: user.isDeleted ? 0.5 : 1 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    No users found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <button 
                    className="page-btn" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >Prev</button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                    <button 
                        key={idx} 
                        className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                    >{idx + 1}</button>
                ))}

                <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >Next</button>
            </div>

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
