import React, { useState } from "react";
import { GraduationCap, User, Eye, EyeOff, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";

const CollegeSetup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormdata] = useState({
  collegeName: "",
  location: "",
  domain: "",
  adminName: "",
  adminEmail: "",
  phoneNumber: "",
  password: ""
});
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  setFormdata((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formdata.collegeName || !formdata.adminName || !formdata.adminEmail || !formdata.phoneNumber || !formdata.password) {
    return toast.error("Please fill in all required fields.");
  }
  
  try {
    setLoading(true);
    
    const collegeRes = await api.post("/superadmin/colleges", {
      name: formdata.collegeName,
      location: formdata.location,
      domain: formdata.domain
    });
    
    toast.success("College created successfully!");
    const newCollegeId = collegeRes.data.college._id;
    
    await api.post("/superadmin/admins", {
      fullName: formdata.adminName,
      email: formdata.adminEmail,
      phoneNumber: formdata.phoneNumber,
      password: formdata.password,
      collegeId: newCollegeId
    });
    
    toast.success("College and Admin created successfully!");
    
    setFormdata({
      collegeName: "",
      location: "",
      domain: "",
      adminName: "",
      adminEmail: "",
      phoneNumber: "",
      password: ""
    });
    
  } catch (err) {
    toast.error(err.response?.data?.message || "An error occurred during setup.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-full bg-[#f8fafc] p-6 lg:p-10 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-sm font-bold text-slate-500 tracking-tight mb-1">
            Institutional Expansion
          </p>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Setup New College Admin
          </h1>
        </header>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-10 shadow-sm">
            <h2 className="flex items-center gap-3 font-bold text-lg text-gray-900 mb-8 uppercase tracking-wider pb-4 border-b border-slate-100">
              <GraduationCap size={24} className="text-black" strokeWidth={2.5} />
              1. COLLEGE INFRASTRUCTURE
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                  OFFICIAL COLLEGE NAME (REQUIRED)
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formdata.collegeName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                  placeholder="e.g. Aloysius College of Engineering"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                    LOCATION / CITY
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formdata.location}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                    placeholder="e.g. Pilani, Rajasthan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                    INSTITUTIONAL DOMAIN
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formdata.domain}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                    placeholder="e.g. bits-pilani.ac.in"
                  />
                  <p className="mt-2 text-xs italic text-slate-400">Required for domain-based user verification</p>
                </div>
              </div>
            </div>
          </div>

            {/* card 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-10 shadow-sm">
            <h2 className="flex items-center gap-3 font-bold text-lg text-gray-900 mb-8 uppercase tracking-wider pb-4 border-b border-slate-100">
              <User size={24} className="text-black" strokeWidth={2.5} />
              2. ADMIN IDENTITY & SECURITY
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                  ADMIN FULL NAME (REQUIRED)
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formdata.adminName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                  placeholder="e.g. Prof. Priya Lakshmi"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                    OFFICIAL ADMIN EMAIL (REQUIRED)
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formdata.adminEmail}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                    placeholder="admin@college.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                    PHONE NUMBER (REQUIRED)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formdata.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                    placeholder="10-digit mobile number"
                    required
                  />
                  <p className="mt-2 text-xs italic text-slate-400">Example: 9876543210</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">
                  SET INITIAL PASSWORD (REQUIRED)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formdata.password}
                    onChange={handleChange}
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-slate-400 transition-colors"
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="mt-2 text-xs italic text-slate-400">Admin can reset this later via their profile</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Submitting this form will create the <strong className="font-semibold text-slate-700">College</strong> record and a <strong className="font-semibold text-slate-700">User</strong> record with the role set to 'admin'. A confirmation and setup link will be dispatched immediately.
            </p>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold text-sm tracking-widest uppercase py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-900 active:scale-[0.99] transition-all shadow-xl shadow-black/10 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Send size={18} />
                  CREATE INSTANCE & NOTIFY ADMIN
                </>
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default CollegeSetup;
