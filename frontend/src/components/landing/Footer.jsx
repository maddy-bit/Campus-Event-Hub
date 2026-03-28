import React from "react";
import { Github, Twitter, Linkedin, Instagram, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "About", href: "#about" },
      { label: "Events", href: "#events" },
      { label: "Leaderboard", href: "#leaderboard" },
      { label: "Contact", href: "#contact" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Community", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  const socials = [
    { icon: <Github size={18} />, href: "#", label: "GitHub" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="landing-footer">
      <div className="section-container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-text">Infy Event Hub</span>
            </div>
            <p className="footer-tagline">
              The ultimate platform for campus events, networking, and student engagement.
            </p>
            <div className="footer-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="footer-social-link" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div className="footer-col" key={title}>
              <h4 className="footer-col-title">{title}</h4>
              <ul className="footer-col-links">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="footer-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Infy Event Hub. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with <Heart size={14} className="heart-icon" /> by Team 1
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
