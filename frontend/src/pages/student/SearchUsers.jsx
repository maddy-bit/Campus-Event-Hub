import React from "react";
import { Search, UserPlus } from "lucide-react";

const SearchUsers = () => {
  const users = [
    {
      initial: "S",
      name: "SARAH_J",
      role: "STUDENT",
      uni: "GLOBAL_UNI",
      tags: [
        { label: "AI", highlight: true },
        { label: "PYTHON", highlight: true },
        { label: "UI/UX", highlight: false },
        { label: "ROBOTICS", highlight: true },
      ],
    },
    {
      initial: "N",
      name: "NINA_P",
      role: "STUDENT",
      uni: "GLOBAL_UNI",
      tags: [
        { label: "NODE", highlight: true },
        { label: "ROBOTICS", highlight: true },
        { label: "AI", highlight: true },
      ],
    },
    {
      initial: "E",
      name: "ELENA_D",
      role: "STUDENT",
      uni: "METRO_POLY",
      tags: [
        { label: "OPEN-SOURCE", highlight: true },
        { label: "PYTHON", highlight: true },
        { label: "HARDWARE", highlight: false },
      ],
    },
    {
      initial: "A",
      name: "ALEX_K",
      role: "STUDENT",
      uni: "TECH_INSTITUTE",
      tags: [
        { label: "ROBOTICS", highlight: true },
        { label: "ELECTRONICS", highlight: false },
        { label: "C++", highlight: false },
      ],
    },
    {
      initial: "M",
      name: "MARCUS_V",
      role: "STUDENT",
      uni: "TECH_INSTITUTE",
      tags: [
        { label: "BLOCKCHAIN", highlight: false },
        { label: "NODE", highlight: true },
        { label: "CYBERSEC", highlight: false },
      ],
    },
    {
      initial: "V",
      name: "VICTOR_W",
      role: "RESEARCHER",
      uni: "TECH_INSTITUTE",
      tags: [
        { label: "MATHEMATICS", highlight: false },
        { label: "ALGORITHMS", highlight: false },
      ],
    },
  ];

  return (
    <div className="font-mono selection:bg-[#c6ff00] selection:text-black">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Search Bar */}
        <div className="w-full flex border-[4px] border-black bg-white mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
          <input
            type="text"
            placeholder="SEARCH_PEERS_OR_INTERESTS..."
            className="flex-1 px-6 py-4 outline-none text-black font-bold uppercase tracking-widest text-sm sm:text-base placeholder:text-gray-500"
          />
          <button className="bg-black text-[#c6ff00] px-8 py-4 font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-900 transition-colors">
            <Search size={18} />
            <span className="hidden sm:inline">FIND</span>
          </button>
        </div>

        {/* Users Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200"
            >
              {/* Header */}
              <div className="flex items-center p-5 gap-4 border-b-[4px] border-black">
                <div className="w-12 h-12 border-[3px] border-black flex items-center justify-center font-black text-xl italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white">
                  {user.initial}
                </div>
                <div className="flex flex-col">
                  <span className="font-black italic text-xl tracking-wider text-black">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-black mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 border-b-[4px] border-black flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-4 bg-[#c6ff00] border border-black"></div>
                  <span className="font-bold text-xs uppercase tracking-widest text-black">
                    {user.uni}
                  </span>
                </div>
                
                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3">
                  INTEREST_PROFILE
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {user.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className={`border-[2px] border-black text-black text-[10px] font-black px-2.5 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider ${
                        tag.highlight ? "bg-[#c6ff00]" : "bg-white"
                      }`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer / Button */}
              <div className="p-5">
                <button className="w-full bg-[#c6ff00] border-[3px] border-black py-3 px-4 font-black text-xs uppercase hover:bg-[#b0e600] flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <UserPlus size={16} strokeWidth={2.5} />
                  <span className="tracking-widest">SEND_CONNECT_SIGNAL</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
