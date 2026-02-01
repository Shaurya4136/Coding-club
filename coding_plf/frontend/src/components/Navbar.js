import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaTerminal } from "react-icons/fa";

/* ================= NAV SECTIONS CONFIG ================= */
const sections = [
  { id: "home", label: "Home", page: "/" },
  { id: "editor", label: "Compiler", page: "/" },
  { id: "welcome", label: "About Us", page: "/aboutus" },
  { id: "events", label: "Events", page: "/" },
  { id: "contact", label: "Contact", page: "/" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [visible, setVisible] = useState(true);
  const [showCompilerCTA, setShowCompilerCTA] = useState(false);

  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= SCROLL HANDLER ================= */
  useEffect(() => {
    if (location.pathname !== "/") return;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide / show navbar
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // Scroll spy (HOME PAGE ONLY)
      let current = "home";
      sections.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop - 160;
          if (currentScrollY >= top) current = id;
        }
      });
      setActive(current);

      // Sticky Compiler CTA
      const editor = document.getElementById("editor");
      if (editor) {
        const rect = editor.getBoundingClientRect();
        setShowCompilerCTA(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  /* ================= NAVIGATION + AUTO SCROLL ================= */
  const goToSection = (page, id) => {
    if (location.pathname !== page) {
      navigate(page, { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300
          ${visible ? "translate-y-0" : "-translate-y-full"}
          bg-black shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-extrabold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Code
            </span>
            <span className="text-white">Help</span>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden md:flex items-center gap-2">
            {sections.map(({ id, label, page }) => (
              <button
                key={id}
                onClick={() => goToSection(page, id)}
                className={`px-4 py-2 rounded-full text-sm transition
                  ${
                    active === id && location.pathname === "/"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/Login" className="text-gray-300 hover:text-white">
              Login
            </Link>
            <Link to="/SignUp">
              <button className="px-5 py-2 rounded-full text-sm font-semibold
                bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-xl text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {open && (
          <div className="md:hidden bg-black border-t border-gray-800">
            <div className="px-6 py-6 space-y-4">
              {sections.map(({ id, label, page }) => (
                <button
                  key={id}
                  onClick={() => goToSection(page, id)}
                  className={`block w-full text-left px-4 py-3 rounded-lg
                    ${
                      active === id && location.pathname === "/"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  {label}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Link to="/Login">
                  <button className="w-full text-left px-4 py-2 text-gray-300">
                    Login
                  </button>
                </Link>
                <Link to="/SignUp">
                  <button className="w-full py-3 rounded-full text-white font-semibold
                    bg-gradient-to-r from-blue-500 to-purple-600">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= STICKY COMPILER CTA ================= */}
      {showCompilerCTA && location.pathname === "/" && (
        <button
          onClick={() => goToSection("/", "editor")}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3
            px-5 py-3 rounded-full text-white font-semibold shadow-lg
            bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <FaTerminal />
          Open Compiler
        </button>
      )}
    </>
  );
};

export default Navbar;
