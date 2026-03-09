import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin, CheckCircle, Loader2 } from "lucide-react";
import api from "../../api";

const ViewInstitutions = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const res = await api.get("/superadmin/colleges");
        setColleges(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to fetch colleges:", err);
        setError(err.response?.data?.message || "Failed to fetch colleges");
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const memoizedColleges = useMemo(() => colleges, [colleges]);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <header className="mb-10">
        <p className="text-gray-500 text-sm tracking-wide">
          Institutional Management
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-black">
          Registered Colleges
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Total Colleges: {memoizedColleges.length}
        </p>
      </header>

      <main className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {memoizedColleges.map((c, index) => (
          <Link
            to={`/superadmin/institutions/${c._id}`}
            key={`${c._id}-${index}`}
            className="group bg-white border border-gray-200 rounded-xl p-5
            hover:shadow-md hover:-translate-y-1 transition-all duration-300 no-underline"
          >

            <div className="flex items-center gap-4 mb-4">

              {c.logo ? (
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-lg">
                  <GraduationCap
                    size={26}
                    className="text-gray-600 group-hover:text-black transition"
                  />
                </div>
              )}

              <div>
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-black">
                  {c.name}
                </h2>

                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{c.location}</span>
                </div>
              </div>

            </div>

            <div className="flex bg-green-100 w-fit px-1.5 py-0.5 rounded-full items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-gray-500" />
              <span>{c.isVerified ? "Verified Institution" : "Not Verified"}</span>
            </div>

          </Link>
        ))}

      </main>
    </div>
  );
};

export default ViewInstitutions;