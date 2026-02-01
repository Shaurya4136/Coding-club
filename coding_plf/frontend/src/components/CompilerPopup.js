// src/pages/StudentProfile/CompilerPopup.js

import React, { useEffect, useRef, useState } from "react";
import CodeEditor from "../components/Compiler";
import { FaTimes, FaExpand, FaCompress, FaMoon, FaSun } from "react-icons/fa";

const CompilerPopup = ({ show, onClose }) => {
  const languages = [
    { label: "Python 3", value: "python3" },
    { label: "JavaScript", value: "javascript" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
    { label: "Ruby", value: "ruby" },
    { label: "Go", value: "go" },
  ];

  /* ---------- State ---------- */
  const [fullscreen, setFullscreen] = useState(false);
  const [terminalTheme, setTerminalTheme] = useState("dark");

  /* ---------- Drag ---------- */
  const modalRef = useRef(null);
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!dragRef.current) return;

    const rect = modalRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  /* ---------- ESC Close ---------- */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* -------- Modal -------- */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`
          ${fullscreen ? "w-full h-full" : "w-full max-w-6xl max-h-[90vh]"}
          bg-gray-900 rounded-xl shadow-2xl
          fixed flex flex-col
          ${fullscreen ? "inset-0" : ""}
        `}
        style={!fullscreen ? { top: "10%", left: "50%", transform: "translateX(-50%)" } : {}}
      >
        {/* -------- Header (Draggable) -------- */}
        <div
          ref={dragRef}
          onMouseDown={fullscreen ? null : handleMouseDown}
          className="cursor-move flex items-center justify-between px-6 py-4
                     border-b border-gray-800 select-none"
        >
          <div>
            <h2 className="text-lg font-bold text-white">Online Compiler</h2>
            <p className="text-xs text-gray-400">
              Terminal-style execution • Judge0
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            {/* Theme Toggle */}
            <button
              onClick={() =>
                setTerminalTheme((p) => (p === "dark" ? "light" : "dark"))
              }
              title="Toggle terminal theme"
              className="hover:text-white transition"
            >
              {terminalTheme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setFullscreen((p) => !p)}
              title="Fullscreen"
              className="hover:text-white transition"
            >
              {fullscreen ? <FaCompress /> : <FaExpand />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close"
              className="hover:text-red-400 transition text-xl"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* -------- Body -------- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <CodeEditor
            languages={languages}
            terminalTheme={terminalTheme} // 👈 pass theme
          />
        </div>

        {/* -------- Footer -------- */}
        <div className="px-6 py-3 border-t border-gray-800 text-xs text-gray-500">
          Drag window • ESC to close • Ctrl + Enter to run
        </div>
      </div>
    </div>
  );
};

export default CompilerPopup;
