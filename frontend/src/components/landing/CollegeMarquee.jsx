import React, { useEffect, useRef } from "react";
import { GraduationCap, Sparkles, Building2, Landmark, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * CollegeMarquee Redesign
 * Rendered as 'App' for preview environment compatibility
 */
export default function CollegeMarquee({ colleges = [] }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const trackRef = useRef(null);
  const headerRef = useRef(null);

  const items = colleges || [];
  // Triple items for seamless loop
  const marqueeItems = items.length > 0 ? [...items, ...items, ...items] : [];

  // --- Three.js Background (Neural Network Graph) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, animationFrameId, points;

    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.BufferGeometry();
      const count = 50;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 12;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({ 
        color: 0x6366f1, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.2 
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    const animate = () => {
      points.rotation.y += 0.0005;
      points.rotation.x += 0.0003;
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

  // --- GSAP Infinite Marquee & Entrance ---
  useEffect(() => {
    if (!headerRef.current || !trackRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.set(headerRef.current.children, { y: 30, opacity: 0 });
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.to(headerRef.current.children, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
          });
        },
        once: true,
      });

      // Infinite Marquee Logic
      const track = trackRef.current;
      const trackWidth = track.scrollWidth / 3;

      gsap.to(track, {
        x: -trackWidth,
        duration: 35,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % trackWidth)
        }
      });

      // Interactive Pause
      track.addEventListener("mouseenter", () => gsap.to(track, { timeScale: 0.1, duration: 0.8 }));
      track.addEventListener("mouseleave", () => gsap.to(track, { timeScale: 1, duration: 0.8 }));
    }, sectionRef);

    return () => ctx.revert();
  }, [marqueeItems]);

  if (items.length === 0) return null;

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 bg-[#fafafa] overflow-hidden" 
      id="colleges"
    >
      {/* 3D Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-40" 
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-24 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles size={14} className="animate-pulse" />
              Partner Institutions
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Trusted by <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
              leading colleges.
            </span>
          </h2>

          <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto">
            Our platform connects students from India's most prestigious universities, 
            breaking geographical barriers for campus events.
          </p>
        </div>
      </div>

      {/* Modern Marquee UI */}
      <div className="relative w-full overflow-hidden py-10">
        {/* Edge Masking */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-20 pointer-events-none" />

        {/* Moving Track */}
        <div 
          ref={trackRef} 
          className="flex gap-8 whitespace-nowrap w-fit px-4"
        >
          {marqueeItems.map((college, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-6 bg-white border border-zinc-100 px-8 py-6 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:border-indigo-200 transition-all duration-500 cursor-default group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-indigo-100/50">
                {college.logo ? (
                  <img src={college.logo} alt={college.name} className="w-full h-full object-contain" />
                ) : (
                  college.icon || <GraduationCap size={28} />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-lg font-black text-zinc-900 tracking-tight">
                  {college.name}
                </span>
                {college.location && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <MapPin size={10} />
                    {college.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Bottom Shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none z-[1]" />
    </section>
  );
}