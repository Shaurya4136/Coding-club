// src/components/Loader.js
import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>

      {/* Text */}
      <p className="mt-4 text-sm tracking-wide text-gray-300">
        {text}
      </p>
    </div>
  );
};

export default Loader;