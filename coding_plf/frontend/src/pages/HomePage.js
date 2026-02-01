import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import Footer from '../components/Footer';
import CommunitySection from '../components/CommunitySectionHomepage';
import video from "../assets/HomePage/video1.mp4";
import CodeEditor from "../components/Compiler";
import { useLocation } from "react-router-dom";


const HomePage = () => {
  
  const [gradientPositions, setGradientPositions] = useState({});
  const eventsRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
const [openCard, setOpenCard] = useState(null);
const cardsRef = useRef(null);

const location = useLocation();
useEffect(() => {
  const handleOutsideTap = (e) => {
    if (cardsRef.current && !cardsRef.current.contains(e.target)) {
      setOpenCard(null);
    }
  };

  document.addEventListener("mousedown", handleOutsideTap);
  document.addEventListener("touchstart", handleOutsideTap);

  return () => {
    document.removeEventListener("mousedown", handleOutsideTap);
    document.removeEventListener("touchstart", handleOutsideTap);
  };
}, []);

useEffect(() => {
  if (location.state?.scrollTo) {
    const el = document.getElementById(location.state.scrollTo);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
}, [location]);


 <CodeEditor
  languages={[
    { value: "python3", label: "Python 3" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "php", label: "PHP" },
  ]}
/>

  const handleMouseMove = (e, cardIndex) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    setGradientPositions(prev => ({ ...prev, [cardIndex]: { x, y } }));
  };

  
  useEffect(() => {
    let scrollInterval;
  
    const scrollLoop = () => {
      if (!isHovered && eventsRef.current) {
        eventsRef.current.scrollLeft += 2;
  
        // Reset scroll when reaching the middle of the content
        if (eventsRef.current.scrollLeft >= eventsRef.current.scrollWidth / 2) {
          eventsRef.current.scrollLeft = 0; // Jump back to the start
        }
      }
      scrollInterval = requestAnimationFrame(scrollLoop);
    };
  
    // Start the scrolling
    scrollLoop();
  
    // Clean up on unmount
    return () => cancelAnimationFrame(scrollInterval);
  }, [isHovered]);
        
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  message: "",
});
const [submitted, setSubmitted] = useState(false);
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await axios.post("http://localhost:5000/api/contact", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  } catch (err) {
    alert("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


const events = [
  {
    title: "Hackathon 2026",
    date: "12 March 2026",
    location: "Main Auditorium",
    description:
      "A 24-hour hackathon where students build innovative tech solutions using modern frameworks and APIs.",
  },
  {
    title: "UI/UX Design Bootcamp",
    date: "20 March 2026",
    location: "Design Lab",
    description:
      "Hands-on UI/UX workshop focusing on user research, wireframing, and interactive prototypes.",
  },
  {
    title: "Web Development Workshop",
    date: "28 March 2026",
    location: "Computer Lab 2",
    description:
      "Learn full-stack web development using React, Node.js, Express, and MongoDB.",
  },
  {
    title: "AI & ML Seminar",
    date: "5 April 2026",
    location: "Seminar Hall",
    description:
      "Industry experts discuss real-world applications of Artificial Intelligence and Machine Learning.",
  },
  {
    title: "Competitive Coding Contest",
    date: "10 April 2026",
    location: "Online",
    description:
      "Test your problem-solving skills with timed coding challenges and leaderboard rankings.",
  },
  {
    title: "Startup Talk",
    date: "18 April 2026",
    location: "Conference Room",
    description:
      "Founders share insights on building startups, funding, and product-market fit.",
  },
];



  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white min-h-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <video className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="relative z-10 container mx-auto text-center w-full">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Crack the Code
            </span>
            <br /> to Success with <span className="text-indigo-400">CodeHelp</span>
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Browse our programming skills, take challenges, and unlock coding possibilities.
            </p>

            <div className="mt-10 flex justify-center space-x-6">
            <button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out">
                <i className="fas fa-book-open mr-2"></i> View Courses
            </button>
            <button className="bg-gradient-to-r from-red-500 to-pink-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out">
                <i className="fas fa-play-circle mr-2"></i> Watch Video
            </button>
            </div>
        </div>

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        </section>



      {/* Code Editor Section */}
      {/* ================= COMPILER SECTION ================= */}
<section id="editor" className="bg-gray-950 py-20 px-6">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-white text-center mb-10">
      Online Compiler
    </h2>

    <CodeEditor
      languages={[
        { value: "python3", label: "Python 3" },
        { value: "javascript", label: "JavaScript" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "php", label: "PHP" },
      ]}
    />
  </div>
</section>


      {/* Welcome Section */}
      <section id="welcome" className="relative bg-cover bg-center p-20 text-center text-white" style={{ backgroundImage: 'url(/path/to/your/background.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 mt-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Welcome to <span className="text-yellow-300">Oxnard College</span>
          </h2>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Discover endless opportunities at Oxnard College, where education meets innovation.
          </p>

          <button className="mt-4 bg-white text-black px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-yellow-300 transition duration-300 ease-in-out" onClick={() => window.location.href = '/aboutus'}>
           About Us
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="explore" className="bg-gray-900 text-white p-16 text-left">
  <h2 className="text-3xl font-bold mb-8 text-center">
    Explore Our Features
  </h2>

  <div
    ref={cardsRef}
    className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
  >
    {[1, 2, 3, 4].map((cardIndex) => {
      const isOpen = openCard === cardIndex;

      return (
        <div
          key={cardIndex}
          className={`relative bg-black p-6 rounded-lg shadow-lg
            transform transition-transform duration-300 overflow-hidden
            ${cardIndex === 1 ? "hover:shadow-[0_0_30px_5px_rgba(255,165,0,0.5)] hover:scale-105" : ""}
            ${cardIndex === 2 ? "hover:shadow-[0_0_30px_5px_rgba(255,20,147,0.5)] hover:scale-105" : ""}
            ${cardIndex === 3 ? "hover:shadow-[0_0_30px_5px_rgba(0,255,0,0.5)] hover:scale-105" : ""}
            ${cardIndex === 4 ? "hover:shadow-[0_0_30px_5px_rgba(0,0,255,0.5)] hover:scale-105" : ""}`}
          onMouseMove={(e) => handleMouseMove(e, cardIndex)}
          style={{
            background: `radial-gradient(circle at ${
              gradientPositions[cardIndex]?.x || 0
            }px ${gradientPositions[cardIndex]?.y || 0}px, rgba(0, 102, 255, 0.3), transparent)`,
          }}
        >
          {/* Corner Icon — ONLY CONTROL */}
          <div
            className="absolute top-2 right-2 z-20"
            onMouseEnter={() => setOpenCard(cardIndex)} // desktop
            onClick={(e) => {
              e.stopPropagation(); // 🔑 prevents instant close
              setOpenCard(isOpen ? null : cardIndex);
            }}
          >
            <svg
              className={`w-6 h-6 cursor-pointer transition-transform duration-300
                ${isOpen ? "rotate-90" : ""}
                ${cardIndex === 1 ? "text-orange-500" : ""}
                ${cardIndex === 2 ? "text-pink-500" : ""}
                ${cardIndex === 3 ? "text-green-500" : ""}
                ${cardIndex === 4 ? "text-blue-500" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* Content (VERTICAL OPEN ONLY) */}
          <div
            className={`transition-[max-height] duration-500 ease-in-out
              ${isOpen ? "max-h-[280px]" : "max-h-[120px]"}`}
          >
            <h3 className="text-lg font-semibold mb-2">
              Feature {cardIndex}
            </h3>

            <p
              className={`whitespace-normal break-words transition-all duration-300
                ${isOpen ? "" : "line-clamp-2"}`}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      );
    })}
  </div>
</section>



      <section>
        <div>
            {/* Community Section */}
            <CommunitySection />
        </div>
      </section>

      {/* Event Card */}
    <section className="bg-gray-900 text-white py-16" id="events">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
      Upcoming Events
    </h2>

    <div
      ref={eventsRef}
      className="flex gap-6 overflow-x-auto scrollbar-hide"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ whiteSpace: "nowrap" }}
    >
      {[...events, ...events].map((event, index) => {
        const isOpen = openCard === index;

        return (
          <div
            key={index}
            onClick={() => setOpenCard(isOpen ? null : index)}
            className="min-w-[260px] sm:min-w-[300px] md:min-w-[340px]
                       relative bg-black rounded-xl shadow-lg overflow-hidden
                       transition-all duration-500 cursor-pointer select-none"
          >
            {/* Gradient (CLICK FIX HERE) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                index % 3 === 0
                  ? "from-indigo-600 via-purple-600 to-pink-500"
                  : index % 3 === 1
                  ? "from-teal-500 via-green-600 to-blue-500"
                  : "from-yellow-500 via-orange-600 to-red-500"
              } opacity-30 pointer-events-none`}
            />

            {/* Content */}
            <div
              className={`relative z-10 p-4 sm:p-5 md:p-6 flex flex-col
                          transition-[max-height] duration-500 ease-in-out
                          ${isOpen ? "max-h-[1000px]" : "max-h-[320px]"}`}
            >
              {/* Title */}
              <h3 className="font-bold mb-2 text-lg sm:text-xl md:text-2xl">
                {event.title}
              </h3>

              {/* Meta */}
              <p className="text-gray-300 text-sm sm:text-base mb-1">
                📅 {event.date}
              </p>
              <p className="text-gray-300 text-sm sm:text-base mb-2">
                📍 {event.location}
              </p>

              {/* Description */}
              <p
                className={`text-gray-400 text-sm sm:text-base leading-relaxed
                            whitespace-normal break-words
                            transition-all duration-300
                            ${isOpen ? "mb-4" : "line-clamp-4 mb-4"}`}
              >
                {event.description}
              </p>

              {/* Hint */}
              <span className="text-xs text-gray-500 mt-auto">
                {isOpen ? "Click to collapse" : "Click to expand"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>









      {/* Contact Section */}
      <section id="contact" className="bg-gray-900 text-white p-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Get in Touch</h2>
        <div className="flex justify-center">
          <div
            className="relative group bg-black p-8 rounded-lg shadow-lg transform transition-transform duration-300 hover:shadow-[0_0_30px_5px_rgba(255,0,0,0.5),0_0_30px_5px_rgba(0,255,0,0.5),0_0_30px_5px_rgba(0,0,255,0.5)] hover:scale-105 w-full md:w-2/3 lg:w-1/2"
            onMouseMove={(e) => handleMouseMove(e, 'contact')}
            style={{
              background: `radial-gradient(circle at ${gradientPositions['contact']?.x || 0}px ${gradientPositions['contact']?.y || 0}px, rgba(0, 102, 255, 0.3), transparent)`,
            }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 pr-4 mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-4">Contact Details</h3>
                <p className="mb-2">Address: 1234 Street Name, City, Country</p>
                <p className="mb-2">Phone: +123 456 7890</p>
                <p className="mb-2">Email: contact@example.com</p>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                <form onSubmit={handleSubmit}>
  {submitted && (
    <p className="mb-4 text-green-400 font-semibold">
      ✅ Thanks! We will contact you shortly.
    </p>
  )}

  <div className="mb-4">
    <label className="block text-gray-400 mb-2">Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
      className="w-full p-3 bg-gray-800 text-white rounded"
      placeholder="Your Name"
    />
  </div>

  <div className="mb-4">
    <label className="block text-gray-400 mb-2">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
      className="w-full p-3 bg-gray-800 text-white rounded"
      placeholder="Your Email"
    />
  </div>

  <div className="mb-4">
    <label className="block text-gray-400 mb-2">Message</label>
    <textarea
      name="message"
      value={formData.message}
      onChange={handleChange}
      required
      rows="4"
      className="w-full p-3 bg-gray-800 text-white rounded"
      placeholder="Your Message"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition"
  >
    {loading ? "Sending..." : "Send Message"}
  </button>
</form>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
