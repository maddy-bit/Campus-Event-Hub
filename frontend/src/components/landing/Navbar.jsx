import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import * as THREE from "three";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const canvasRef = useRef(null);
  const navRef = useRef(null);

  // --- Three.js Background Animation ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, particles, animationFrameId;
    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / 100, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, 100); // Only height of navbar

      const geometry = new THREE.BufferGeometry();
      const count = 50;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 10;
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({ size: 0.05, color: "#6366f1" });
      particles = new THREE.Points(geometry, material);
      scene.add(particles);
      camera.position.z = 5;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.y += 0.002;
      renderer.render(scene, camera);
    };

    initThree();
    animate();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
    };
  }, []);

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- GSAP Magnetic Effect for Logo ---
  const handleMouseMove = (e) => {
    const { clientX, clientY, target } = e;
    const { left, top, width, height } = target.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.5;
    const y = (clientY - (top + height / 2)) * 0.5;
    gsap.to(target, { x, y, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.target, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  const links = [
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        scrolled ? "py-3 bg-white/80 backdrop-blur-xl border-b border-zinc-200" : "py-6 bg-transparent"
      }`}
    >
      {/* Subtle Three.js Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
        {/* Logo with GSAP Magnetic Effect */}
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase">
            Infy
             <span className="bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent">
    EventHub
  </span>
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-1 bg-zinc-100/50 p-1 rounded-full border border-zinc-200/50 backdrop-blur-md">
          {links.map((link) => (
            <li key={link.href}>
              <a 
                href={link.href}
                className="px-5 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="text-sm font-bold text-zinc-700 hover:text-indigo-600 transition-all"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate("/register")}
            className="group flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-zinc-200 hover:shadow-indigo-200"
          >
            Join Hub
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-zinc-900"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu (Framer Motion) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            {links.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-zinc-800"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-zinc-100" />
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 text-zinc-600 font-bold" onClick={() => navigate("/login")}>Log In</button>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold" onClick={() => navigate("/register")}>Sign Up</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;