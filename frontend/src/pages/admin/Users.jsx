import React from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/AdminUsers.css";

const AdminUsers = () => {
    const users = [
        {
            id: 1,
            name: "James D'souza",
            uid: "#84210",
            role: "Student",
            email: "james.d@university.edu",
            joinedDate: "Oct 12, 2024",
            status: "Active",
            initials: "JD",
            avatarClass: "jd"
        },
        {
            id: 2,
            name: "Meera Kapoor",
            uid: "#84215",
            role: "Organizer",
            email: "m.kapoor@codingclub.in",
            joinedDate: "Sep 28, 2024",
            status: "Offline",
            initials: "MK",
            avatarClass: "mk"
        },
        {
            id: 3,
            name: "Admin Sarah",
            uid: "#00002",
            role: "Admin",
            email: "sarah.sys@infy.com",
            joinedDate: "Jan 05, 2024",
            status: "Active",
            initials: "AS",
            avatarClass: "as"
        },
        {
            id: 4,
            name: "Rahul Kumar",
            uid: "#84501",
            role: "Student",
            email: "rahul.k82@gmail.com",
            joinedDate: "Oct 20, 2024",
            status: "Active",
            initials: "RK",
            avatarClass: "rk"
        }
    ];

    return (
        <div className="admin-users-page">
            <div className="users-header-container">
                <div className="header-title-section">
                    <div className="subtitle">Identity & Access</div>
                    <h1>Users Directory</h1>
                </div>
                <button className="add-user-btn">
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            <div className="users-stats-grid">
                <div className="user-stat-card">
                    <div className="label">Total Users</div>
                    <div className="value">4,285</div>
                </div>
                <div className="user-stat-card">
                    <div className="label">Students</div>
                    <div className="value">312</div>
                </div>
                <div className="user-stat-card">
                    <div className="label">Organizers</div>
                    <div className="value">+124</div>
                </div>
            </div>

            <div className="filters-bar">
                <select className="filter-select">
                    <option>All Roles</option>
                    <option>Admin</option>
                    <option>Organizer</option>
                    <option>Student</option>
                </select>
                <select className="filter-select">
                    <option>Any Status</option>
                    <option>Active</option>
                    <option>Offline</option>
                </select>
                <button className="reset-filters-btn">Reset Filters</button>
            </div>

            <div className="users-table-container">
                <div className="table-header-info">
                    <h2>Global Users List</h2>
                    <div className="showing-count">Showing 1 - 10 of 4,285</div>
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
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-name-cell">
                                        <div className={`user-avatar ${user.avatarClass}`}>
                                            {user.initials}
                                        </div>
                                        <div className="user-info-text">
                                            <span className="name">{user.name}</span>
                                            <span className="uid">UID: {user.uid}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className="email-txt">{user.email}</span>
                                </td>
                                <td>
                                    <span className="date-txt">{user.joinedDate}</span>
                                </td>
                                <td>
                                    <div className="status-cell">
                                        <div className={`status-dot ${user.status.toLowerCase()}`}></div>
                                        {user.status}
                                    </div>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="action-btn">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <button className="page-btn">Prev</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">Next</button>
            </div>
        </div>
    );
};

export default AdminUsers;
