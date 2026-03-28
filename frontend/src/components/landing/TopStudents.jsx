import React, { useEffect, useRef, useState } from "react";
import { 
  Crown, 
  Medal, 
  Award, 
  Star, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  Zap
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { Link } from "react-router-dom";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Leaderboard Component
 * Rendered as 'App' for preview environment compatibility
 */
export default function TopStudents({ students = [], loading = false }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const podiumRef = useRef(null);
  const headerRef = useRef(null);

  const displayStudents = students || [];
  
  // Reorder for podium visual: [2, 1, 3]
  let podiumOrder = [];
  if (displayStudents.length >= 3) {
    podiumOrder = [displayStudents[1], displayStudents[0], displayStudents[2]];
  } else if (displayStudents.length === 2) {
    podiumOrder = [displayStudents[1], displayStudents[0]];
  } else {
    podiumOrder = displayStudents;
  }

  // --- Three.js Background (Golden Dust) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, particles, animationFrameId;

    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 3;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.BufferGeometry();
      const count = 300;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color: 0xf59e0b, // Gold color
        size: 0.04,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    };

    const animate = () => {
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    initThree();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
    };
  }, []);

  // --- GSAP Entrance & Parallax ---
  useEffect(() => {
    if (loading) return;
    if (!headerRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.set(headerRef.current.children, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.to(headerRef.current.children, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
          });
        },
        once: true,
      });

      // Podium Cards Animation
      const cards = podiumRef.current?.querySelectorAll(".podium-item");
      if (cards) {
        gsap.set(cards, { y: 100, opacity: 0, scale: 0.9 });
        ScrollTrigger.create({
          trigger: podiumRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.2,
              stagger: 0.2,
              ease: "back.out(1.5)",
            });
          },
          once: true,
        });
      }

      // Continuous float animation for achievement badges
      gsap.to(".badge-float", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: "sine.inOut"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, displayStudents]);

  const rankConfig = {
    1: {
      icon: <Crown size={32} />,
      color: "from-amber-300 via-yellow-500 to-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      tier: "h-[440px] z-20 scale-110",
      label: "CHAMPION"
    },
    2: {
      icon: <Medal size={28} />,
      color: "from-slate-300 via-slate-400 to-slate-500",
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      tier: "h-[380px] z-10",
      label: "RUNNER UP"
    },
    3: {
      icon: <Award size={28} />,
      color: "from-orange-300 via-orange-500 to-orange-700",
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
      tier: "h-[340px] z-0",
      label: "ELITE"
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen py-24 bg-white overflow-hidden" 
      id="leaderboard"
    >
      {/* Background Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-40" 
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-24 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles size={14} className="animate-pulse" />
              Top Performers
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Meet the Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-600">
              Legends.
            </span>
          </h2>

          <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto">
            These students are redefining the campus experience through relentless 
            participation, leadership, and skill development.
          </p>
        </div>

        {/* Podium Area or Empty State */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
              <Sparkles className="text-zinc-400" size={32} />
            </div>
            <p className="text-xl font-bold text-zinc-400">No top performers found yet.</p>
            <p className="text-sm mt-2 font-medium text-zinc-400">Join events and start earning points!</p>
          </div>
        ) : (
          <div 
            ref={podiumRef} 
            className="flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-0 max-w-6xl mx-auto"
          >
            {podiumOrder.map((student, idx) => {
            const config = rankConfig[student.rank] || rankConfig[3];
            return (
              <div 
                key={student._id || idx}
                className={`podium-item group relative flex flex-col items-center w-full lg:w-1/3 transition-all duration-500 ${config.tier}`}
              >
                {/* Visual Rank Indicator */}
                 <div className={`badge-float absolute -top-10 flex flex-col items-center gap-2`}>
                   <div className={`w-14 h-14 rounded-2xl bg-white border-2 ${config.border} shadow-2xl flex items-center justify-center ${config.text}`}>
                      {config.icon && React.cloneElement(config.icon, { size: 24 })}
                   </div>
                   <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${config.text}`}>
                     {config.label}
                   </span>
                </div>

                {/* Card Body */}
                <div className="w-full h-full bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center p-6 pt-12 group-hover:bg-white transition-colors duration-500">
                  {/* Avatar Section */}
                  <div className="relative mb-5">
                    <div className={`w-20 h-20 rounded-[28px] p-1 bg-gradient-to-br ${config.color} shadow-xl`}>
                      <div className="w-full h-full rounded-[24px] bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                        {student.profilePicture ? (
                          <img src={student.profilePicture} alt={student.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-2xl font-black ${config.text}`}>
                            {student.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-[10px] font-black ${config.text}`}>
                      #{student.rank}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-tight">
                      {student.fullName}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{student.collegeName}</p>
                      <p className="text-[10px] font-medium text-zinc-400">{student.department}</p>
                    </div>
                  </div>

                  {/* Stats Block */}
                  <div className={`w-full ${config.bg} rounded-2xl p-4 flex items-center justify-between border ${config.border}`}>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Growth</span>
                      <div className="flex items-center gap-1 text-emerald-500 font-bold">
                        <TrendingUp size={12} />
                        <span className="text-[10px]">+12%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total XP</span>
                      <p className={`text-lg font-black ${config.text}`}>
                        {student.totalPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <button className="mt-8 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    View Profile
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Decorative Bottom Shadow / Platform */}
                <div className={`absolute bottom-[-10px] w-4/5 h-4 bg-gradient-to-r ${config.color} opacity-20 blur-xl rounded-full`} />
              </div>
            );
          })}
          </div>
        )}

        {/* Full Ranking Link */}
        <div className="mt-24 flex flex-col items-center gap-6">
           <Link to="/login">
           <button className="flex items-center gap-3 bg-zinc-900 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-zinc-200">
              View Full Leaderboard
              <Zap size={18} fill="currentColor" />
           </button>
           </Link>
        </div>
      </div>

      {/* Background Decorative Accents */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}