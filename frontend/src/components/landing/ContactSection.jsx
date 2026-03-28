import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Globe,
  ArrowRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * ContactSection Redesign
 * Rendered as 'App' for preview environment compatibility
 */
export default function ContactSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const infoRef = useRef(null);
  const formCardRef = useRef(null);
  
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState("");

  // ... (previous useEffect hooks for Three.js and GSAP are below)

  // --- Three.js Background (Interactive "Network Nodes") ---
  useEffect(() => {
    if (!canvasRef.current) return;
    let scene, camera, renderer, particles, animationFrameId;

    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.BufferGeometry();
      const count = 60;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.1,
        transparent: true,
        opacity: 0.3,
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

  // --- GSAP Animations ---
  useEffect(() => {
    if (!sectionRef.current || !formCardRef.current) return;

    const ctx = gsap.context(() => {
      // Info side staggered entrance
      const infoChildren = document.querySelectorAll(".contact-info-child");
      gsap.set(infoChildren, { x: -50, opacity: 0 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(infoChildren, {
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out",
          });
        },
        once: true,
      });

      // Form card slide & scale
      gsap.set(formCardRef.current, { x: 50, opacity: 0, scale: 0.95 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(formCardRef.current, {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
          });
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const response = await axios.post(`${API}/public/contact`, form);
      if (response.data.success) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setErrorMsg(response.data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Unable to reach the server. Please try again later.");
    }
  };

  // Magnetic Button Effect
  const handleMagnetic = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const resetMagnetic = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative px-16 min-h-screen py-24 bg-white overflow-hidden flex items-center" 
      id="contact"
    >
      {/* 3D Network Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-40" 
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Info & Messaging */}
          <div ref={infoRef} className="space-y-10">
            <div className="contact-info-child">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] uppercase">
                <MessageSquare size={14} className="animate-pulse" />
                Get in Touch
              </span>
            </div>

            <h2 className="contact-info-child text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[0.95]">
              Have questions? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500">
                Let's talk.
              </span>
            </h2>

            <p className="contact-info-child text-lg text-zinc-500 font-medium leading-relaxed max-w-lg">
              Whether you're curious about a feature, a partnership, or just want to 
              say hello, our team is ready to connect and help you grow.
            </p>

            <div className="contact-info-child space-y-6 pt-6">
              {[
                { icon: <Zap size={20} />, text: "Quick response within 24 hours", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: <Globe size={20} />, text: "Partnership opportunities", color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: <Sparkles size={20} />, text: "Feature requests & feedback", color: "text-indigo-500", bg: "bg-indigo-50" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    {item.icon}
                  </div>
                  <span className="text-zinc-600 font-bold tracking-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Glassmorphism Form */}
          <div 
            ref={formCardRef} 
            className="relative p-1 bg-gradient-to-br from-zinc-100 to-white rounded-[32px] shadow-2xl shadow-zinc-200/50"
          >
            <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[30px] border border-white/50 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 font-medium text-zinc-900"
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane@college.edu"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 font-medium text-zinc-900"
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Your Message</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 font-medium text-zinc-900 resize-none"
                  />
                </div>

                <button
                  onMouseMove={handleMagnetic}
                  onMouseLeave={resetMagnetic}
                  disabled={status === "sending"}
                  className={`w-full relative flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden ${
                    status === "sending" ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-indigo-600 shadow-xl shadow-zinc-200"
                  }`}
                >
                  {status === "sending" ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : status === "success" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {status === "success" && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={18} />
                    <span className="text-xs font-bold">Sent! We'll be in touch soon.</span>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold">{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-50 rounded-full blur-[120px] pointer-events-none opacity-50" />
    </section>
  );
}