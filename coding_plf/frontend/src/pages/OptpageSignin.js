import React, { useState } from "react";
import { FaUserGraduate, FaUsers, FaUniversity } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Footer from "../components/Footer";

const DarkThemeCards = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNavigation = (path, role) => {
    navigate(path, { state: { role } }); // Pass the role as state
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  const handleMouseEnter = (cardName) => {
    setHoveredCard(cardName);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <div>
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-black via-gray-900 to-black">
        <video className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
          <source src='' type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full p-4">

          {/* Student Card */}
          <div
            className="relative card p-8 rounded-lg bg-gray-900 text-center transition duration-300 ease-in-out transform hover:scale-110 cursor-pointer hover:shadow-[0_0_25px_15px_rgba(0,191,255,0.8)] border border-gray-700 hover:border-cyan-500"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => handleMouseEnter("Student")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavigation('/StudentLoginRegister', 'Student')} // Pass role
            style={{ background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 191, 255, 0.3), transparent 60%)' }}
          >
            <FaUserGraduate className="text-cyan-300 text-6xl mb-4 mx-auto transition-transform duration-300 transform hover:scale-125" />
            <h2 className="text-3xl font-bold mb-4 text-white tracking-wide">Student</h2>
            <p className="text-gray-400">This card represents the student profile with detailed information.</p>
            {hoveredCard === "Student" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2 p-2 bg-cyan-700 text-white rounded-md shadow-lg">
                Student Profile Info
              </div>
            )}
          </div>

          {/* Club Head Card */}
          <div
            className="relative card p-8 rounded-lg bg-gray-900 text-center transition duration-300 ease-in-out transform hover:scale-110 cursor-pointer hover:shadow-[0_0_25px_15px_rgba(0,191,255,0.8)] border border-gray-700 hover:border-cyan-500"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => handleMouseEnter("Club Head")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavigation('/ClubHeadLoginRegister', 'Club Head')} // Pass role
            style={{ background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 191, 255, 0.3), transparent 60%)' }}
          >
            <FaUsers className="text-cyan-300 text-6xl mb-4 mx-auto transition-transform duration-300 transform hover:scale-125" />
            <h2 className="text-3xl font-bold mb-4 text-white tracking-wide">Club Head</h2>
            <p className="text-gray-400">This card represents the club head role and associated activities.</p>
            {hoveredCard === "Club Head" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2 p-2 bg-cyan-700 text-white rounded-md shadow-lg">
                Club Head Info
              </div>
            )}
          </div>

          {/* College Card */}
          <div
            className="relative card p-8 rounded-lg bg-gray-900 text-center transition duration-300 ease-in-out transform hover:scale-110 cursor-pointer hover:shadow-[0_0_25px_15px_rgba(0,191,255,0.8)] border border-gray-700 hover:border-cyan-500"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => handleMouseEnter("College")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavigation('/CollegeLoginRegister', 'College')} // Pass role
            style={{ background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 191, 255, 0.3), transparent 60%)' }}
          >
            <FaUniversity className="text-cyan-300 text-6xl mb-4 mx-auto transition-transform duration-300 transform hover:scale-125" />
            <h2 className="text-3xl font-bold mb-4 text-white tracking-wide">College</h2>
            <p className="text-gray-400">This card provides information about the college and its departments.</p>
            {hoveredCard === "College" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2 p-2 bg-cyan-700 text-white rounded-md shadow-lg">
                College Info
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DarkThemeCards;
