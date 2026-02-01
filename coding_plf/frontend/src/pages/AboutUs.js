import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommunitySection from "../components/CommunitySectionHomepage";

const AboutOverview = () => {
  return (
    <div className="bg-gray-900 text-white">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="py-24 px-6 text-center bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          alt="University Coding Club"
          className="mx-auto mb-10 rounded-xl shadow-lg max-w-5xl w-full"
        />

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          University <span className="text-indigo-400">Coding Club</span>
        </h1>
        <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-300">
          The University Coding Club is a student-driven technical community
          dedicated to strengthening programming fundamentals, encouraging
          innovation, and preparing students for real-world technical challenges
          through structured learning and collaboration.
        </p>
      </section>

      {/* ================= ACHIEVEMENTS ================= */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          🏆 Achievements & Gallery
        </h2>

        <p className="text-center max-w-4xl mx-auto text-gray-300 mb-12">
          The achievements of the Coding Club reflect the continuous efforts of
          its members to learn, practice, and apply technical knowledge beyond
          the classroom. These accomplishments highlight both individual and
          team success across various technical domains.
        </p>

        {/* Gallery Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998"
            alt="Hackathon"
            className="rounded-lg shadow-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
            alt="Workshop"
            className="rounded-lg shadow-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786"
            alt="Coding Community"
            className="rounded-lg shadow-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Achievement text="Consistent participation and victories in inter-college and university-level hackathons." />
          <Achievement text="Recognition in national-level coding competitions and online programming platforms." />
          <Achievement text="Successful organization of multiple hands-on workshops and coding bootcamps." />
          <Achievement text="Development and deployment of real-world student projects and applications." />
          <Achievement text="Active involvement in open-source development and collaborative repositories." />
          <Achievement text="Improved placement outcomes through structured DSA and interview preparation." />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-gray-950 py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          🚀 Club Activities & Learning Framework
        </h2>

        <p className="text-center max-w-4xl mx-auto text-gray-300 mb-14">
          The Coding Club follows a structured learning framework that focuses on
          building strong fundamentals, practical skills, and professional
          confidence. Each activity is designed to complement academic learning
          and bridge the gap between theory and real-world implementation.
        </p>

        <div className="max-w-6xl mx-auto space-y-10">
          <FeatureBlock
            title="Hands-on Technical Workshops"
            desc="Regular hands-on workshops covering Web Development, Data Structures, Algorithms, Databases, Artificial Intelligence, Machine Learning, and emerging technologies with a strong focus on practical implementation."
          />

          <FeatureBlock
            title="Competitive Programming & Logical Skill Development"
            desc="Weekly problem-solving sessions and coding contests that strengthen analytical thinking, time complexity awareness, and interview-level problem-solving skills."
          />

          <FeatureBlock
            title="Real-World Project Development"
            desc="Team-based development of real-world and full-stack projects that expose students to software development life cycles, version control, and deployment practices."
          />

          <FeatureBlock
            title="Hackathons, Career Guidance & Mentorship"
            desc="Mentorship and guidance for hackathons, internships, placements, and higher studies through mock interviews, technical talks, and peer mentoring."
          />
        </div>
      </section>

      {/* ================= COMMUNITY ================= */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          🤝 Join Our Community
        </h2>

        <p className="text-center max-w-4xl mx-auto text-gray-300 mb-10">
          The Coding Club fosters a collaborative and inclusive environment where
          students learn from each other, share ideas, mentor juniors, and grow
          together. The focus is on teamwork, consistency, and long-term skill
          development rather than short-term outcomes.
        </p>

        <CommunitySection />
      </section>

      {/* ================= EVENTS ================= */}
      <section className="bg-gray-950 py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          📅 Upcoming Events
        </h2>

        <p className="text-center max-w-4xl mx-auto text-gray-300 mb-12">
          Technical events organized by the Coding Club provide students with
          opportunities to apply their skills, collaborate under real-world
          constraints, and gain competitive exposure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Event
            title="CodeSprint University Hackathon"
            img="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
            desc="A 24-hour hackathon focused on building innovative solutions using modern technologies."
          />
          <Event
            title="Web Development Bootcamp"
            img="https://images.unsplash.com/photo-1581090700227-1e37b190418e"
            desc="An intensive hands-on program covering frontend, backend, and deployment practices."
          />
          <Event
            title="DSA Placement Marathon"
            img="https://images.unsplash.com/photo-1553877522-43269d4ea984"
            desc="A focused event designed to strengthen problem-solving and interview skills."
          />
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          📞 Get in Touch
        </h2>

        <p className="text-center max-w-3xl mx-auto text-gray-300 mb-10">
          Students, faculty members, and collaborators are welcome to connect
          with the Coding Club for membership, collaboration, or technical
          initiatives.
        </p>

        <div className="max-w-4xl mx-auto bg-black p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Details</h3>
              <p className="text-gray-300">University Campus, Coding Club Office</p>
              <p className="text-gray-300">Email: codingclub@university.edu</p>
              <p className="text-gray-300">Phone: +91 XXXXX XXXXX</p>
            </div>

            <form>
              <input className="w-full mb-3 p-3 bg-gray-800 rounded" placeholder="Your Full Name" />
              <input className="w-full mb-3 p-3 bg-gray-800 rounded" placeholder="Your Email Address" />
              <textarea className="w-full mb-3 p-3 bg-gray-800 rounded" rows="4" placeholder="Write your message here"></textarea>
              <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-500 transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Achievement = ({ text }) => (
  <div className="bg-black p-6 rounded-lg shadow-lg text-center">
    <p className="text-gray-300">{text}</p>
  </div>
);

const FeatureBlock = ({ title, desc }) => (
  <div className="bg-black p-8 rounded-lg shadow-lg">
    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const Event = ({ title, desc, img }) => (
  <div className="bg-black p-6 rounded-lg shadow-lg">
    <img src={img} alt={title} className="rounded-lg mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{desc}</p>
  </div>
);

export default AboutOverview;
