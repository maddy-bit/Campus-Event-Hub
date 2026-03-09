import React from "react";
import { GraduationCap, MapPin, CheckCircle } from "lucide-react";

const ViewInstitutions = () => {
  const data = {
    count: 2,
    colleges: [
      {
        _id: "69ac5ff0340489f1b90b9af0",
        name: "Global Engineering College",
        location: "Pune",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af1",
        name: "National Institute of Technology",
        location: "Mumbai",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af0",
        name: "Global Engineering College",
        location: "Pune",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af1",
        name: "National Institute of Technology",
        location: "Mumbai",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af0",
        name: "Global Engineering College",
        location: "Pune",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af1",
        name: "National Institute of Technology",
        location: "Mumbai",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af0",
        name: "Global Engineering College",
        location: "Pune",
        logo: null,
        isVerified: true,
      },
      {
        _id: "69ac5ff0340489f1b90b9af1",
        name: "National Institute of Technology",
        location: "Mumbai",
        logo: null,
        isVerified: true,
      },
    ],
  };

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
          Total Colleges: {data.count}
        </p>
      </header>

      <main className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {data.colleges.map((c) => (
          <div
            key={c._id}
            className="group bg-white border border-gray-200 rounded-xl p-5
            hover:shadow-md hover:-translate-y-1 transition-all duration-300"
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

          </div>
        ))}

      </main>
    </div>
  );
};

export default ViewInstitutions;