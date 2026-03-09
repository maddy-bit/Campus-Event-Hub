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
  Users,
  CalendarDays,
  Eye,
  Trash2,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import api from "../../api";

const TABS = ["Admins", "Organizers", "Students", "Events"];

const CollegeDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Admins");
  const [searchQuery, setSearchQuery] = useState("");

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

    return list.filter(
      (item) =>
        item.fullName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phoneNumber?.includes(q)
    );
  }, [data, activeTab, searchQuery]);

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

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredList.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No {activeTab.toLowerCase()} found
            </div>
          ) : (
            filteredList.map((item) => (
              <div key={item._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                {activeTab === "Events" ? (
                  <EventRow item={item} />
                ) : (
                  <UserRow item={item} role={activeTab} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};



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

const EventRow = ({ item }) => (
  <>
    <div className="flex items-center gap-3">
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
