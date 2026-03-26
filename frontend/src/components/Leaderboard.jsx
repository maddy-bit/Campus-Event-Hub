import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Globe, MapPin, Medal, Star, ChevronDown } from "lucide-react";
import api from "../../src/api";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  // Fetch leaderboard data (page 1 or appending)
  const fetchLeaderboard = useCallback(async (pageNum, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const endpoint = activeTab === "local"
        ? `/leaderboard/local?page=${pageNum}&limit=10`
        : `/leaderboard/global?page=${pageNum}&limit=10`;

      const [lbRes, rankRes] = await Promise.all([
        api.get(endpoint),
        api.get("/leaderboard/me")
      ]);

      if (append) {
        setLeaderboard(prev => [...prev, ...lbRes.data.leaderboard]);
      } else {
        setLeaderboard(lbRes.data.leaderboard);
      }
      setHasMore(lbRes.data.hasMore);
      setMyRank(rankRes.data);
    } catch (err) {
      console.error("Leaderboard fetch error", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeTab]);

  // Reset and fetch on tab change
  useEffect(() => {
    setPage(1);
    setLeaderboard([]);
    setHasMore(false);
    fetchLeaderboard(1, false);
  }, [activeTab, fetchLeaderboard]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLeaderboard(nextPage, true);
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

      {/* Leaderboard Content */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-black text-white p-3 flex justify-between items-center px-4 border-b-2 border-black">
          <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <Medal size={16} /> Top_Students
          </h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {activeTab === "global" ? "All Colleges" : "Your College"}
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
          <div>
            {/* Podium */}
            <div className="flex justify-center items-end gap-2 md:gap-8 pt-12 pb-0 px-4 mt-8 bg-[#f5f5f0] border-b-4 border-black relative">
              
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center w-28 md:w-36">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 rounded-full">
                     {leaderboard[1].profilePicture ? (
                       <img src={`${API_BASE}/${leaderboard[1].profilePicture}`} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center font-black text-xl bg-[#C0C0C0] text-black border-2 border-black">
                         {leaderboard[1].fullName.substring(0,2).toUpperCase()}
                       </div>
                     )}
                  </div>
                  <div className="w-full h-28 bg-[#C0C0C0] border-4 border-black border-b-0 flex flex-col items-center justify-start pt-3 relative hover:-translate-y-2 transition-transform cursor-default">
                     <span className="text-3xl font-black">2</span>
                     <span className="text-[10px] font-bold text-center px-1 truncate w-full mt-2">{leaderboard[1].fullName}</span>
                     {activeTab === "global" && leaderboard[1].collegeName && (
                       <span className="text-[8px] font-bold text-center px-1 truncate w-full mt-0.5" style={{color: "rgba(0,0,0,0.6)"}}>{leaderboard[1].collegeName}</span>
                     )}
                     <span className="text-xs font-black bg-black text-[#B6FF60] px-2 py-0.5 border border-black mt-1">{leaderboard[1].totalPoints} pts</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center w-32 md:w-44 z-10">
                  <div className="relative">
                    <Trophy size={20} fill="#B6FF60" className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                    <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-black bg-[#FFD700] overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 text-center rounded-full">
                       {leaderboard[0].profilePicture ? (
                         <img src={`${API_BASE}/${leaderboard[0].profilePicture}`} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center font-black text-2xl bg-[#FFD700] text-black">
                           {leaderboard[0].fullName.substring(0,2).toUpperCase()}
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="w-full h-36 bg-[#FFD700] border-4 border-black border-b-0 flex flex-col items-center justify-start pt-3 relative hover:-translate-y-2 transition-transform cursor-default">
                     <span className="text-4xl font-black drop-shadow-[2px_2px_0px_#fff]">1</span>
                     <span className="text-xs font-black text-center px-1 truncate w-full mt-3">{leaderboard[0].fullName}</span>
                     {activeTab === "global" && leaderboard[0].collegeName && (
                       <span className="text-[9px] font-bold text-center px-1 truncate w-full mt-0.5" style={{color: "rgba(0,0,0,0.6)"}}>{leaderboard[0].collegeName}</span>
                     )}
                     <span className="text-sm font-black bg-black text-[#B6FF60] px-2 py-0.5 border-2 border-black mt-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{leaderboard[0].totalPoints} pts</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center w-28 md:w-36">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-black bg-[#CD7F32] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 rounded-full">
                     {leaderboard[2].profilePicture ? (
                       <img src={`${API_BASE}/${leaderboard[2].profilePicture}`} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center font-black text-xl bg-[#CD7F32] text-white">
                         {leaderboard[2].fullName.substring(0,2).toUpperCase()}
                       </div>
                     )}
                  </div>
                  <div className="w-full h-24 bg-[#CD7F32] border-4 border-black border-b-0 flex flex-col items-center justify-start pt-3 relative hover:-translate-y-2 transition-transform cursor-default">
                     <span className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_#000]">3</span>
                     <span className="text-[10px] font-bold text-center px-1 truncate w-full mt-2 text-white">{leaderboard[2].fullName}</span>
                     {activeTab === "global" && leaderboard[2].collegeName && (
                       <span className="text-[8px] font-bold text-center px-1 truncate w-full mt-0.5" style={{color: "rgba(255,255,255,0.7)"}}>{leaderboard[2].collegeName}</span>
                     )}
                     <span className="text-xs font-black bg-black text-[#B6FF60] px-2 py-0.5 border border-black mt-1">{leaderboard[2].totalPoints} pts</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rest of table */}
            {leaderboard.length > 3 && (
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-4 border-black bg-gray-100 text-[10px] font-black tracking-widest uppercase shadow-[0_4px_0_#000]">
                      <th className="p-4 w-16 text-center text-black">Rank</th>
                      <th className="p-4 border-l-4 border-black text-black">Student</th>
                      <th className="p-4 border-l-4 border-black w-24 text-right text-black">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {leaderboard.slice(3).map((student) => (
                      <tr 
                        key={student._id} 
                        className={`transition-colors ${userContext && student._id === userContext._id ? "bg-[#B6FF60]" : "hover:bg-gray-100"}`}
                      >
                        <td className="p-4 text-center">
                          <span className="inline-block w-8 h-8 leading-7 text-xs font-black bg-black text-white border-2 border-black">
                            {student.rank}
                          </span>
                        </td>
                        <td className="p-4 border-l-4 border-black">
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
                                  <span className="bg-black text-[#B6FF60] text-[9px] px-1 ml-1 font-bold">YOU</span>
                                )}
                              </span>
                              <span className={`text-[9px] font-bold uppercase ${userContext && student._id === userContext._id ? "text-gray-800" : "text-gray-400"}`}>
                                {student.department || "N/A"} 
                                {activeTab === "global" && student.collegeName && (
                                  <span className="text-gray-500 font-extrabold ml-1">[{student.collegeName}]</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-l-4 border-black text-right">
                          <div className={`inline-flex items-center gap-1 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${userContext && student._id === userContext._id ? "bg-white text-black" : "bg-black text-[#B6FF60]"}`}>
                            <Star size={12} fill={userContext && student._id === userContext._id ? "black" : "#B6FF60"} />
                            <span className="text-xs font-black">{student.totalPoints}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 flex justify-center border-t-2 border-black">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 bg-black text-[#B6FF60] border-2 border-black px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
