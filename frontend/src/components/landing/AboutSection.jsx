import React, { useEffect, useRef, useState } from "react";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Globe, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: <Calendar size={32} />,
    title: "Event Discovery",
    description: "Browse hundreds of campus events — workshops, hackathons, and cultural fests — all in one unified hub.",
    color: "from-indigo-500 to-blue-500",
    shadow: "shadow-indigo-100",
  },
  {
    icon: <Users size={32} />,
    title: "Networking Hub",
    description: "Connect with students from your college and beyond. Build your network through shared interests.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-100",
  },
  {
    icon: <Trophy size={32} />,
    title: "Gamified Experience",
    description: "Earn points for every event you attend. Climb leaderboards and showcase your campus spirit.",
    color: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-100",
  },
  {
    icon: <Globe size={32} />,
    title: "Cross-College",
    description: "Break the campus bubble. Join public events hosted by colleges across the country.",
    color: "from-rose-400 to-red-600",
    shadow: "shadow-rose-100",
  },
];

/**
 * AboutSection Redesign
 * Rendered as 'App' for preview environment compatibility
 */
export default function AboutSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);

  // --- Three.js Background (Subtle Grid Wave) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, plane, geometry, animationFrameId;

    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create a grid of points
      const width = 20, height = 20;
      geometry = new THREE.PlaneGeometry(width, height, 40, 40);
      const material = new THREE.PointsMaterial({ 
        color: 0x6366f1, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.2 
      });
      
      plane = new THREE.Points(geometry, material);
      plane.rotation.x = -Math.PI / 2.5;
      scene.add(plane);
    };

    const animate = () => {
      const time = Date.now() * 0.001;
      const positions = geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1];
        // Create wave effect
        positions[i+2] = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
      }
      geometry.attributes.position.needsUpdate = true;
      
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
    if (!headerRef.current || !cardsRef.current || !sectionRef.current) return;

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

      // Cards Stagger Animation
      const cards = cardsRef.current.querySelectorAll(".about-card");
      gsap.set(cards, { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: cardsRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
          });
        },
        once: true,
      });

      // Card 3D Tilt Effect
      cards.forEach(card => {
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 12;
          const rotateY = (centerX - x) / 12;

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            scale: 1.02,
            duration: 0.4,
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
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-24 overflow-hidden bg-white"
      id="about"
    >
      {/* Three.js Grid Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-30" 
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-6 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles size={14} className="animate-pulse" />
              Inside the Platform
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Everything your campus life needs, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500">
              in one powerful hub.
            </span>
          </h2>
          
          <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Infy Event Hub bridges the gap between massive events and personal growth, 
            creating an ecosystem where students thrive together.
          </p>
        </div>

        {/* Feature Grid */}
        <div 
          ref={cardsRef} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="about-card group relative bg-white border border-zinc-100 p-8 rounded-[32px] shadow-2xl shadow-zinc-200/50 hover:border-zinc-200 transition-colors duration-500 cursor-default overflow-hidden"
            >
              {/* Decorative Gradient Background (visible on hover) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              <div className="relative z-10 space-y-8">
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-xl ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed font-medium text-[13px]">
                    {feature.description}
                  </p>
                </div>


              </div>

              {/* Bottom accent bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </div>
          ))}
        </div>
      </div>

      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-violet-100/20 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}