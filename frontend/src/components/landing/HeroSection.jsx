import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Target, 
  Zap, 
  ChevronRight, 
  Users, 
  MapPin, 
  Rocket 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Registration of GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const App = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const statsRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // --- Three.js Background Animation (Optimized) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    
    let scene, camera, renderer, starPoints, animationFrameId;
    const starCount = 2500;
    
    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const scales = new Float32Array(starCount);

      const colorPalette = [
        new THREE.Color("#6366f1"), // Indigo
        new THREE.Color("#a855f7"), // Purple
        new THREE.Color("#ec4899"), // Pink
        new THREE.Color("#ffffff")  // White
      ];

      for (let i = 0; i < starCount; i++) {
        // Spherical distribution for a more "portal" feel
        const r = 10 + Math.random() * 20;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        scales[i] = Math.random();
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      starPoints = new THREE.Points(geometry, material);
      scene.add(starPoints);
    };

    const animate = () => {
      if (starPoints) {
        starPoints.rotation.y += 0.0005;
        starPoints.rotation.x += 0.0002;
        
        // Dynamic pulse based on mouse or hover state
        const time = Date.now() * 0.001;
        starPoints.scale.setScalar(1 + Math.sin(time) * 0.05);
      }
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
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
      renderer.dispose();
    };
  }, []);

  // --- GSAP Magnetic & Parallax Interactions ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal Sequence
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.from(".reveal-item", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        delay: 0.2
      });

      // Magnetic Cards Logic
      const cards = document.querySelectorAll(".magnetic-card");
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        cards.forEach((card, index) => {
          const depth = (index + 1) * 15;
          const moveX = (clientX - centerX) / depth;
          const moveY = (clientY - centerY) / depth;
          
          gsap.to(card, {
            x: moveX,
            y: moveY,
            rotateY: moveX / 10,
            rotateX: -moveY / 10,
            duration: 1,
            ease: "power2.out"
          });
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Magnetic Button Helper using quickSetter for performance
  const handleMagnetic = (e, intensity = 0.4) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * intensity;
    const y = (e.clientY - (rect.top + rect.height / 2)) * intensity;
    
    gsap.to(btn, {
      x,
      y,
      duration: 0.3,
      ease: "power3.out"
    });
  };

  const resetMagnetic = (e) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)"
    });
  };

  const stats = [
    { label: "Active Events", val: "850+", icon: <Zap size={14} /> },
    { label: "Verified Users", val: "25K+", icon: <Users size={14} /> },
    { label: "Campus Nodes", val: "120+", icon: <MapPin size={14} /> },
  ];

  return (
    <div className="bg-zinc-50 min-h-screen selection:bg-indigo-100 selection:text-indigo-700">
      <section 
        ref={sectionRef}
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Three.js Background Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" 
        />

        {/* Ambient Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="text-center lg:text-left space-y-10">
              <div className="reveal-item">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 shadow-sm shadow-indigo-100/50 cursor-default"
                >
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 pl-1">
                    Joined by 2,000+ students this week
                  </span>
                </motion.div>
              </div>

              <div className="reveal-item space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[0.95]">
                  Your Campus. <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500">
                      Fully Unlocked.
                    </span>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="absolute bottom-2 left-0 h-3 bg-indigo-100/60 -z-10 -rotate-1"
                    />
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  The definitive platform for student leaders. Organize events, 
                  track impact, and build a legacy that outlasts your graduation.
                </p>
              </div>

              <div className="reveal-item flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <button
                  onMouseMove={(e) => handleMagnetic(e, 0.2)}
                  onMouseLeave={resetMagnetic}
                  className="group relative w-full sm:w-auto overflow-hidden bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200/50 transition-all hover:bg-zinc-800 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Claim Your Profile
                    <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onMouseMove={(e) => handleMagnetic(e, 0.15)}
                  onMouseLeave={resetMagnetic}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/50 backdrop-blur-md border border-zinc-200 px-10 py-5 rounded-2xl font-bold text-lg hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  Browse Hubs
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Stats Bar */}
              <div ref={statsRef} className="reveal-item grid grid-cols-3 gap-4 pt-10 border-t border-zinc-200/60">
                {stats.map((stat, i) => (
                  <div key={i} className="group flex flex-col items-center lg:items-start">
                    <div className="flex items-center gap-1.5 text-indigo-500 mb-1">
                      {stat.icon}
                      <span className="text-sm font-bold uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-3xl font-black text-zinc-900 tabular-nums">
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Composition */}
            <div className="relative h-[600px] hidden lg:flex items-center justify-center">
              {/* Main "Glass" Interface Mockup */}
              <div className="magnetic-card relative w-[340px] h-[480px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden z-30">
                <div className="h-44 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-4">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <h3 className="text-white font-bold text-xl leading-tight">University Hackathon <br/>Spring '26</h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-full bg-zinc-100 rounded-full" />
                      <div className="h-2 w-2/3 bg-zinc-100 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase">Prize Pool</p>
                      <p className="text-lg font-black text-indigo-600">$5,000</p>
                    </div>
                    <div className="h-24 rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Slots Left</p>
                      <p className="text-lg font-black text-zinc-900">12/100</p>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm">
                    Register Now
                  </button>
                </div>
              </div>

              {/* Decorative Floating Badges */}
              <div className="magnetic-card absolute top-[10%] right-[-5%] z-40 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-50">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Ranked</p>
                  <p className="text-sm font-black text-zinc-900">#1 Top Org</p>
                </div>
              </div>

              <div className="magnetic-card absolute bottom-[10%] left-[-10%] z-40 bg-indigo-600 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Target size={20} />
                </div>
                <div className="text-white">
                  <p className="text-[10px] font-bold opacity-60 uppercase">Impact Goal</p>
                  <p className="text-sm font-black">92% Complete</p>
                </div>
              </div>

              {/* Background Shapes */}
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-indigo-100/50 rounded-full -z-10"
              />
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-50 to-transparent pointer-events-none z-[1]" />
      </section>

      {/* Visual Indicator for Scrolling */}
      
    </div>
  );
};

export default App;