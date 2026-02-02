import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-950 via-black to-gray-950 text-white">
      {/* Main Section */}
      <div className="container mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        
        {/* Coding Club Info */}
        <div>
          <h2 className="text-3xl font-extrabold mb-3">
            <span className="text-purple-500">Coding</span> Club
          </h2>
          <p className="text-gray-400 leading-relaxed">
            A student-driven community to learn, build, and grow together through
            code, innovation, and collaboration.
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-gray-400 hover:text-purple-500 transition">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-500 transition">
              <FaLinkedin size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-500 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-500 transition">
              <FaDiscord size={20} />
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Explore</h3>
          <ul className="space-y-2">
            {["Home", "Events", "Workshops", "Projects", "Team"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:translate-x-1 transition inline-block"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Resources</h3>
          <ul className="space-y-2">
            {["Roadmaps", "Practice Labs", "Coding Contests", "DSA Sheets"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition inline-block"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              📧{" "}
              <a
                href="mailto:codingclub@college.edu"
                className="hover:text-white transition"
              >
                codingclub@college.edu
              </a>
            </li>
            <li>🏫 College Campus, India</li>
            <li>🤝 Open for collaborations</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Bottom */}
      <div className="text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} College Coding Club • Built by Students, for Students by Shaurya Pandey
      </div>
    </footer>
  );
};

export default Footer;
