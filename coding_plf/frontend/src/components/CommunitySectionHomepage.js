import React, { useEffect, useRef, useState } from "react";

const CommunitySection = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    projects: 0,
  });

  /* ================= SCROLL ANIMATION ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* ================= COUNTER ANIMATION ================= */
  useEffect(() => {
    if (!visible) return;

    const targets = { members: 250, events: 35, projects: 60 };
    const interval = setInterval(() => {
      setStats((prev) => ({
        members: prev.members < targets.members ? prev.members + 5 : targets.members,
        events: prev.events < targets.events ? prev.events + 1 : targets.events,
        projects: prev.projects < targets.projects ? prev.projects + 2 : targets.projects,
      }));
    }, 40);

    return () => clearInterval(interval);
  }, [visible]);

  const images = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  ];

  return (
    <div ref={sectionRef} className="bg-gray-900 text-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* ================= TITLE ================= */}
        {/* <h2
          className={`text-3xl md:text-4xl font-extrabold text-center mb-6 transition-all duration-700
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          🤝 Join Our Community
        </h2> */}

        {/* <p
          className={`text-center max-w-3xl mx-auto text-gray-300 mb-14 transition-all duration-700 delay-150
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          The University Coding Club is a collaborative learning community where
          students grow together by sharing knowledge, building projects, and
          preparing for real-world technical challenges.
        </p> */}

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-20">
          <Stat label="Active Members" value={stats.members} />
          <Stat label="Events Conducted" value={stats.events} />
          <Stat label="Projects Built" value={stats.projects} />
        </div>

        {/* ================= IMAGE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Community"
              onClick={() => setLightboxImg(img)}
              className={`cursor-pointer rounded-xl shadow-lg transition-all duration-500 hover:scale-105
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            />
          ))}
        </div>

        {/* ================= COMMUNITY CARDS ================= */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Peer Networking"
            desc="Collaborate with students across departments who share a passion for coding, innovation, and problem-solving."
            visible={visible}
          />
          <Card
            title="Technical Events"
            desc="Participate in hackathons, workshops, bootcamps, and coding contests conducted throughout the academic year."
            visible={visible}
          />
          <Card
            title="Mentorship & Growth"
            desc="Receive guidance from seniors and mentors for projects, internships, placements, and career planning."
            visible={visible}
          />
        </div>
      </div>

      {/* ================= LIGHTBOX ================= */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-4xl w-full rounded-xl shadow-lg"
          />
          <button
            className="absolute top-6 right-6 text-white text-3xl"
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const Stat = ({ label, value }) => (
  <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
    <h3 className="text-4xl font-extrabold text-indigo-400">{value}+</h3>
    <p className="mt-2 text-gray-300">{label}</p>
  </div>
);

const Card = ({ title, desc, visible }) => (
  <div
    className={`bg-gray-800 rounded-xl p-6 shadow-lg transition-all duration-700
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
  >
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default CommunitySection;
