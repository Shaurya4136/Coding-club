import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommunitySection from "../components/CommunitySectionHomepage";
import CodeEditor from "../components/Compiler";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import video from "../assets/HomePage/video1.mp4";

const HomePage = () => {

  const location = useLocation();
  const eventsRef = useRef(null);
  const cardsRef = useRef(null);

  const [gradientPositions, setGradientPositions] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [openCard, setOpenCard] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= SCROLL HANDLER ================= */
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

  /* ================= CLICK OUTSIDE ================= */
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

  /* ================= AUTO SCROLL EVENTS ================= */
  useEffect(() => {
    let scrollInterval;

    const scrollLoop = () => {
      if (!isHovered && eventsRef.current) {
        eventsRef.current.scrollLeft += 1;

        if (
          eventsRef.current.scrollLeft >=
          eventsRef.current.scrollWidth / 2
        ) {
          eventsRef.current.scrollLeft = 0;
        }
      }
      scrollInterval = requestAnimationFrame(scrollLoop);
    };

    scrollLoop();

    return () => cancelAnimationFrame(scrollInterval);
  }, [isHovered]);

  /* ================= MOUSE GRADIENT ================= */
  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGradientPositions({
      ...gradientPositions,
      [index]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
  };

  /* ================= CONTACT FORM ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "https://coding-club-1.onrender.com/api/contact",
        formData
      );

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  /* ================= EVENTS DATA ================= */
  const events = [
    {
      title: "Hackathon 2026",
      date: "12 March 2026",
      location: "Main Auditorium",
      description:
        "A 24-hour hackathon where students build innovative tech solutions.",
    },
    {
      title: "UI/UX Bootcamp",
      date: "20 March 2026",
      location: "Design Lab",
      description:
        "Hands-on UI/UX workshop focusing on wireframing and prototypes.",
    },
    {
      title: "Web Development Workshop",
      date: "28 March 2026",
      location: "Computer Lab",
      description:
        "Learn full stack development with real world projects.",
    },
  ];

  return (
    <>
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center justify-center text-white">

        <video
          autoPlay
          muted
          loop
          className="absolute w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black opacity-60"></div>

        <div className="relative z-10 text-center px-6">

          <h1 className="text-5xl font-bold mb-6">
            Crack the Code to Success
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Learn, Practice, and Grow with Coding Club
          </p>

          <Link to="/login">
            <button className="bg-gradient-to-r from-blue-500 to-teal-400 px-8 py-3 rounded-full font-semibold hover:scale-110 transition">
              Join Us
            </button>
          </Link>

        </div>
      </section>


      {/* ================= DEMO CREDENTIALS SECTION ================= */}
      <section className="bg-gray-950 text-white py-16">

        <div className="max-w-4xl mx-auto text-center px-6">

          <h2 className="text-4xl font-bold mb-4">
            Demo Access Credentials
          </h2>

          <p className="text-gray-400 mb-8">
            Use these credentials to explore the admin portal.
          </p>

          <div className="bg-black border border-gray-700 rounded-xl p-6">

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  Admin Username
                </p>

                <p className="text-lg text-blue-400 font-semibold">
                  M@gmail.com
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  Admin Password
                </p>

                <p className="text-lg text-green-400 font-semibold">
                  123
                </p>
              </div>

            </div>

            <p className="text-gray-500 mt-4 text-sm">
              Demo account for testing purposes.
            </p>

          </div>

        </div>

      </section>


      {/* ================= COMPILER SECTION ================= */}
      <section className="bg-gray-900 py-16">

        <h2 className="text-center text-4xl text-white mb-8">
          Online Compiler
        </h2>

        <div className="max-w-6xl mx-auto px-6">

          <CodeEditor
            languages={[
              { value: "python3", label: "Python" },
              { value: "javascript", label: "JavaScript" },
              { value: "java", label: "Java" },
              { value: "cpp", label: "C++" },
            ]}
          />

        </div>

      </section>


      {/* ================= COMMUNITY ================= */}
      <CommunitySection />


      {/* ================= EVENTS ================= */}
      <section className="bg-gray-950 text-white py-16">

        <h2 className="text-center text-4xl mb-10">
          Upcoming Events
        </h2>

        <div
          ref={eventsRef}
          className="flex gap-6 overflow-x-auto px-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >

          {[...events, ...events].map((event, index) => (

            <div
              key={index}
              className="min-w-[300px] bg-black p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold">
                {event.title}
              </h3>

              <p className="text-gray-400">
                {event.date}
              </p>

              <p className="text-gray-400">
                {event.location}
              </p>

              <p className="text-gray-500 mt-2">
                {event.description}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* ================= CONTACT ================= */}
      <section className="bg-gray-900 text-white py-16">

        <h2 className="text-center text-4xl mb-10">
          Contact Us
        </h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto space-y-4 px-6"
        >

          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded"
          />

          <textarea
            name="message"
            placeholder="Message"
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-500"
          >
            {loading ? "Sending..." : "Send"}
          </button>

          {submitted && (
            <p className="text-green-400">
              Message sent successfully.
            </p>
          )}

        </form>

      </section>

      <Footer />

    </>
  );
};

export default HomePage;
