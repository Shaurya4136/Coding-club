import React, { useState } from "react";
import { FaUserGraduate, FaUsers, FaUniversity, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
// import Navbar from "../components/Navbar";

const DarkThemeCards = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const handleNavigation = (path, role) => {
    navigate(path, { state: { role } });
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* <Navbar /> */}

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-20 left-6 z-50 flex items-center gap-2
                   bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full
                   text-sm text-gray-300 hover:text-white
                   hover:bg-gray-800 transition shadow-lg"
      >
        <FaArrowLeft />
        Back to Home
      </button>

      {/* Page Content */}
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        
        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Choose Your Role
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Select how you want to continue. Each role unlocks a tailored experience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">

          {/* Student */}
          <RoleCard
            icon={<FaUserGraduate />}
            title="Student"
            description="Access coding challenges, events, and your student dashboard."
            hovered={hoveredCard}
            setHovered={setHoveredCard}
            onMove={handleMouseMove}
            onClick={() => handleNavigation("/StudentLoginRegister", "Student")}
          />

          {/* Club Head */}
          <RoleCard
            icon={<FaUsers />}
            title="Club Head"
            description="Manage club members, events, and announcements."
            hovered={hoveredCard}
            setHovered={setHoveredCard}
            onMove={handleMouseMove}
            onClick={() => handleNavigation("/ClubHeadLoginRegister", "Club Head")}
          />

          {/* College */}
          <RoleCard
            icon={<FaUniversity />}
            title="College"
            description="Oversee departments, clubs, and institutional activities."
            hovered={hoveredCard}
            setHovered={setHoveredCard}
            onMove={handleMouseMove}
            onClick={() => handleNavigation("/CollegeLoginRegister", "College")}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

/* ---------------- ROLE CARD COMPONENT ---------------- */

const RoleCard = ({
  icon,
  title,
  description,
  hovered,
  setHovered,
  onMove,
  onClick,
}) => (
  <div
    onMouseMove={onMove}
    onMouseEnter={() => setHovered(title)}
    onMouseLeave={() => setHovered(null)}
    onClick={onClick}
    tabIndex={0}
    role="button"
    className="
      relative cursor-pointer rounded-2xl p-8 text-center
      bg-gray-900 border border-gray-700
      transition-all duration-300
      hover:scale-105 hover:border-cyan-400
      hover:shadow-[0_0_40px_rgba(0,191,255,0.25)]
      focus:outline-none focus:ring-2 focus:ring-cyan-500
    "
    style={{
      background:
        "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(0,191,255,0.18), transparent 65%)",
    }}
  >
    <div className="text-cyan-300 text-6xl mb-6 mx-auto transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>

    <h2 className="text-2xl font-bold mb-3">{title}</h2>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

    {hovered === title && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2
                      bg-cyan-600 text-white text-xs px-3 py-1
                      rounded-full shadow-md">
        Click to continue
      </div>
    )}
  </div>
);

export default DarkThemeCards;
