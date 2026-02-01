import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../layouts/AuthContext";

const Sidebar = ({ items = [], collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [profile, setProfile] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  /* ===============================
     Fetch Profile
  ================================ */
 

  /* ===============================
     Online / Offline Indicator
  ================================ */
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !role) return;

      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalizedProfile = {
        ...res.data,
        avatar: res.data?.avatar || "/default-avatar.png",
      };

      setProfile(normalizedProfile);
    } catch (err) {
      console.error(
        "Sidebar profile fetch failed:",
        err.response?.data || err.message
      );
    }
  };

  fetchProfile();
}, [role]);


  /* ===============================
     Logout
  ================================ */
  const logout = () => {
    localStorage.clear();
    navigate("/Login");
  };

  return (
    <aside
      className={`
        h-full sticky top-0 z-50 ...
        
        bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
        border-r border-gray-800
        text-white
        transition-all duration-300 ease-in-out
        ${
  collapsed
    ? "w-16 md:w-20"
    : "w-52 md:w-60 lg:w-64"
}

      `}
    >
      {/* ================= HEADER ================= */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-800">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide">
            Coding Community
          </span>
        )}

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-gray-800 transition"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* ================= PROFILE ================= */}
      <div className="shrink-0 flex flex-col items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="relative">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/40"
            />
          ) : (
            <FaUserCircle className="text-6xl text-gray-500" />
          )}

          <span
            className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-gray-900
            ${online ? "bg-green-500" : "bg-gray-500"}`}
          />
        </div>

        {!collapsed && (
          <>
            <h3 className="text-sm font-medium text-gray-100">
              {profile?.name || "Loading..."}
            </h3>
            <p className="text-xs text-gray-400 truncate max-w-[180px]">
              {profile?.email}
            </p>

            {role && (
              <NavLink
                to={`/${role}-profile`}
                className="mt-1 text-xs px-3 py-1 rounded-full
                bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition"
              >
                Edit Profile
              </NavLink>
            )}
          </>
        )}
      </div>

      {/* ================= MENU (SCROLLABLE ONLY) ================= */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            No menu available
          </p>
        )}

        {items.map(({ label, path, icon: Icon }) => (
          <div key={path} className="relative group">
            <NavLink
              to={path}
              className={({ isActive }) =>
                `
                flex items-center gap-4 px-4 py-3 rounded-xl text-sm
                transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 shadow-inner"
                    : "text-gray-300 hover:bg-gray-800/60"
                }
              `
              }
            >
              <Icon className="text-lg shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>

            {collapsed && (
              <span
                className="absolute left-16 top-1/2 -translate-y-1/2
                bg-black text-white text-xs px-2 py-1 rounded-md
                opacity-0 group-hover:opacity-100 transition
                shadow-lg whitespace-nowrap z-50"
              >
                {label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="shrink-0 p-3 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
          text-red-400 hover:bg-red-600/20 hover:text-red-300 transition"
        >
          <FaSignOutAlt />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
