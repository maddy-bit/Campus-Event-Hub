import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeroSection from "./landing/HeroSection";
import AboutSection from "./landing/AboutSection";
import TrendingEvents from "./landing/TrendingEvents";
import TopStudents from "./landing/TopStudents";
import CollegeMarquee from "./landing/CollegeMarquee";
import ContactSection from "./landing/ContactSection";
import Footer from "./landing/Footer";
import Navbar from "./landing/Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LandingPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, studentsRes, collegesRes] = await Promise.allSettled([
          axios.get(`${API}/public/events/trending`),
          axios.get(`${API}/public/students/top`),
          axios.get(`${API}/public/colleges`),
        ]);

        if (eventsRes.status === "fulfilled") setEvents(eventsRes.value.data.events || []);
        if (studentsRes.status === "fulfilled") setStudents(studentsRes.value.data.students || []);
        if (collegesRes.status === "fulfilled") setColleges(collegesRes.value.data.colleges || []);
      } catch (err) {
        console.error("Failed to fetch landing page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="landing-root">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <TrendingEvents events={events} loading={loading} />
        <TopStudents students={students} loading={loading} />
        <CollegeMarquee colleges={colleges} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
