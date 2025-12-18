// src/pages/StudentProfile/CompilerPopup.js

import React from 'react';
import CodeEditor from '../components/Compiler';

const CompilerPopup = ({ show, onClose, onRun }) => {
  const languages = [
    { label: 'Python 3', value: 'python3' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'C++', value: 'cpp' },
    { label: 'Java', value: 'java' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Go', value: 'go' },
    // Add more languages as needed
  ];

  return show ? (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          &times;
        </button>
        <CodeEditor languages={languages} onRun={onRun} />
      </div>
    </div>
  ) : null;
};

export default CompilerPopup;
