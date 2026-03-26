import React, { useState, useEffect } from "react";
import { Trophy, Globe, MapPin, Medal, Star } from "lucide-react";
import api from "../../api";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userContext, setUserContext] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const init = async () => {
      try {
        const { data: userData } = await api.get("/auth/me");
        setUserContext(userData);
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let endpoint = "/leaderboard";
        if (activeTab === "local" && userContext?.collegeId) {
          endpoint += `?collegeId=${userContext.collegeId}`;
        }
        
        const [lbRes, rankRes] = await Promise.all([
          api.get(endpoint),
          api.get("/leaderboard/me")
        ]);

        setLeaderboard(lbRes.data.leaderboard);
        setMyRank(rankRes.data);
      } catch (err) {
        console.error("Leaderboard fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "global" || (activeTab === "local" && userContext)) {
      fetchLeaderboard();
    }
  }, [activeTab, userContext]);

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-[#FFD700] text-black border-2 border-black"; // Gold
    if (rank === 2) return "bg-[#C0C0C0] text-black border-2 border-black"; // Silver
    if (rank === 3) return "bg-[#CD7F32] text-white border-2 border-black"; // Bronze
    return "bg-black text-white border-2 border-black";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-mono selection:bg-[#ccff00]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 flex items-center gap-3">
            <Trophy size={40} className="text-yellow-500" />
            STANDINGS
          </h1>
          <div className="bg-black text-[#B6FF60] px-3 py-1 inline-flex items-center gap-2 text-[10px] font-bold uppercase border-2 border-black">
            <span>Gamification Points</span>
            <span className="text-gray-500">//</span>
            <span>Real-time Rankings</span>
          </div>
        </div>

        {myRank && (
          <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Your Global Rank</span>
              <span className="text-2xl font-black">#{myRank.rank}</span>
            </div>
            <div className="h-10 w-1 bg-black"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Points</span>
              <span className="text-2xl font-black text-[#B6FF60] bg-black px-2">{myRank.totalPoints}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 flex justify-center items-center gap-2 p-3 border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
            activeTab === "global" ? "bg-[#B6FF60]" : "bg-white hover:bg-gray-50"
          }`}
        >
          <Globe size={18} /> Global
        </button>
        <button
          onClick={() => setActiveTab("local")}
          className={`flex-1 flex justify-center items-center gap-2 p-3 border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
            activeTab === "local" ? "bg-[#B6FF60]" : "bg-white hover:bg-gray-50"
          }`}
        >
          <MapPin size={18} /> Local (College)
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black text-white p-3 flex justify-between items-center px-4 border-b-2 border-black">
          <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <Medal size={16} /> Top_Students
          </h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            Top 50
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase animate-pulse">
            Fetching Rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase">
            No students found on this leaderboard.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4 border-l-2 border-black">Student</th>
                  <th className="p-4 border-l-2 border-black w-24 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {leaderboard.map((student) => (
                  <tr 
                    key={student._id} 
                    className={`hover:bg-gray-50 transition-colors ${userContext && student._id === userContext._id ? "bg-[#B6FF60]/20" : ""}`}
                  >
                    <td className="p-4 text-center">
                      <span className={`inline-block w-8 h-8 leading-7 text-xs font-black ${getRankColor(student.rank)}`}>
                        {student.rank}
                      </span>
                    </td>
                    <td className="p-4 border-l-2 border-black">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {student.profilePicture ? (
                            <img src={`${API_BASE}/${student.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-xs uppercase bg-gray-100 text-gray-500">
                              {student.fullName.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tight flex items-center gap-1">
                            {student.fullName}
                            {userContext && student._id === userContext._id && (
                              <span className="bg-[#B6FF60] text-black text-[9px] px-1 border border-black ml-1">YOU</span>
                            )}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {student.department || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-l-2 border-black text-right">
                      <div className="inline-flex items-center gap-1 bg-black text-[#B6FF60] border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Star size={12} fill="#B6FF60" />
                        <span className="text-xs font-black">{student.totalPoints}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
