import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { sidebarConfig } from "../config/sidebarConfig";

const AppLayout = ({ children, role }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const menuItems = Array.isArray(sidebarConfig[role])
    ? sidebarConfig[role]
    : [];

  return (
    <div
      className="
        h-screen w-full
        bg-gray-950 text-white
        grid
        transition-all duration-300
      "
      style={{
        gridTemplateColumns: collapsed
          ? "64px 1fr"        // collapsed (all screens)
          : "256px 1fr",     // expanded (default)
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <div className="relative z-50 h-full">
        <Sidebar
          items={menuItems}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="
          relative z-10
          h-full
          overflow-y-auto
          p-4 sm:p-5 md:p-6 lg:p-8
        "
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
