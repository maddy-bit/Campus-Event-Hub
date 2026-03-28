import React, { useEffect, useRef, useState } from "react";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Tag, 
  Sparkles, 
  ArrowUpRight, 
  Flame,
  ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {Link } from "react-router-dom"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const categoryGradients = {
  Competition: "from-amber-400 to-orange-500",
  Conference: "from-blue-500 to-indigo-600",
  Workshop: "from-emerald-400 to-teal-600",
  Seminar: "from-violet-400 to-purple-600",
  Sports: "from-rose-400 to-red-600",
  Cultural: "from-pink-400 to-fuchsia-600",
  Other: "from-zinc-400 to-zinc-600",
};

/**
 * TrendingEvents Component
 * Rendered as 'App' for preview environment compatibility
 */
export default function TrendingEvents({ events = [], loading = false }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const headerRef = useRef(null);

  const displayEvents = events || [];

  // --- Three.js Background (Glowing Pulse Aura) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, particles, animationFrameId;

    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 2;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.BufferGeometry();
      const count = 100;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 5;
        colors[i] = Math.random();
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    };

    const animate = () => {
      const time = Date.now() * 0.0005;
      particles.rotation.y = time * 0.1;
      particles.rotation.x = time * 0.05;
      
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i+1] += Math.sin(time + positions[i]) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;

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

  // --- GSAP Animations ---
  useEffect(() => {
    if (loading) return;
    if (!headerRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Reveal Header
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

      // Reveal Event Cards
      const cards = gridRef.current?.querySelectorAll(".event-card");
      if (cards && cards.length) {
        gsap.set(cards, { y: 60, opacity: 0, scale: 0.95 });
        ScrollTrigger.create({
          trigger: gridRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1,
              stagger: 0.1,
              ease: "back.out(1.2)",
            });
          },
          once: true,
        });
      }

      // Card 3D Perspective Hover
      cards?.forEach(card => {
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotateX = (y - rect.height / 2) / 15;
          const rotateY = (rect.width / 2 - x) / 15;

          gsap.to(card, {
            rotateX,
            rotateY,
            scale: 1.02,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        };

        const onLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)"
          });
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, displayEvents]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen py-24 bg-[#fafafa] overflow-hidden" 
      id="events"
    >
      {/* Background Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-50" 
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-20 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black tracking-[0.2em] uppercase">
              <Flame size={14} className="animate-bounce" />
              Trending Now
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Events that are <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600">
              making waves.
            </span>
          </h2>

          <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto">
            Real-time insights from across the country. These experiences are filling 
            up fast—don't miss your chance to be part of the legacy.
          </p>
        </div>

        {/* State: Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[420px] w-full bg-white rounded-[32px] border border-zinc-100 animate-pulse flex flex-col p-5 gap-5">
                <div className="h-1/2 bg-zinc-100 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-zinc-100 rounded-full" />
                  <div className="h-4 w-1/2 bg-zinc-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
              <Sparkles className="text-zinc-400" size={32} />
            </div>
            <p className="text-xl font-bold text-zinc-400">No trending events found right now.</p>
            <button className="mt-4 text-indigo-600 font-bold hover:underline">Explore all categories</button>
          </div>
        ) : (
          /* State: Loaded Data */
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event, idx) => {
              const gradient = categoryGradients[event.category] || categoryGradients.Other;
              const seatsPercent = Math.min((event.participants / event.maxSeats) * 100, 100);
              const isUrgent = seatsPercent > 80;

              return (
                <div 
                  key={event._id || idx}
                  className="event-card group relative bg-white border border-zinc-100 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden cursor-pointer"
                >
                  {/* Poster Area */}
                  <div className="relative h-48 overflow-hidden m-3 rounded-[24px]">
                    {event.posterUrl ? (
                      <img 
                        src={event.posterUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy" 
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-20 flex items-center justify-center`}>
                        <CalendarDays className="text-zinc-400 opacity-20" size={64} />
                      </div>
                    )}
                    
                    {/* Floating Category Badge */}
                    <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm text-[10px] font-black uppercase tracking-widest text-zinc-800`}>
                       <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                       {event.category}
                    </div>

                    {/* Quick Join Arrow */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 pt-2 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-zinc-300" />
                          {formatDate(event.eventDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-zinc-300" />
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Progress / Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                           <Users size={16} className="text-zinc-400" />
                           <span className="text-sm font-black text-zinc-900">{event.participants} Joined</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-400'}`}>
                          {isUrgent ? 'ALMOST FULL' : `${event.maxSeats - event.participants} SPOTS LEFT`}
                        </span>
                      </div>
                      
                      {/* Interactive Progress Bar */}
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${seatsPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link to="/login">
                      <button className="flex items-center gap-2 text-xs font-black text-zinc-900 uppercase tracking-widest group-hover:gap-4 transition-all group-hover:text-indigo-600">
                        View Details
                        <ChevronRight size={16} />
                      </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Footer Action */}
        <div className="mt-20 flex justify-center">
          <Link  to="/login">
          <button className="flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-zinc-200">
            Discover All Events
            <ArrowUpRight size={18} />
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}