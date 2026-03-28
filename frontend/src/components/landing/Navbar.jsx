import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Colleges", href: "#colleges" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`landing-navbar ${scrolled ? "scrolled" : ""}`}
    >
      <div className="navbar-inner">
        <a href="#" className="navbar-logo">
          <span className="logo-icon">🎪</span>
          <span className="logo-text">CampusEventHub</span>
        </a>

        {/* Desktop links */}
        <ul className="navbar-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="navbar-link">{l.label}</a>
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div className="navbar-actions">
          <button onClick={() => navigate("/login")} className="btn-ghost">
            Log In
          </button>
          <button onClick={() => navigate("/register")} className="btn-brutal-sm">
            Sign Up
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="navbar-mobile">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="navbar-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="navbar-mobile-actions">
            <button onClick={() => navigate("/login")} className="btn-ghost w-full">
              Log In
            </button>
            <button onClick={() => navigate("/register")} className="btn-brutal-sm w-full">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
