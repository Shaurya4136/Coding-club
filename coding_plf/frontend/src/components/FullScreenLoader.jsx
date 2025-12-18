import React from "react";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-3">
        {/* Spinning loader */}
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>

        {/* Optional loading text */}
        <p className="text-cyan-300 text-sm tracking-wider animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
