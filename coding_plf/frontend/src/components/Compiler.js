// src/pages/StudentProfile/CodeEditor.js

import React, { useState } from 'react';

const CodeEditor = ({ languages, initialLanguage = 'python3', onRun }) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
  
      const data = await response.json();
      setOutput(data.output || 'No output');
    } catch (error) {
      setOutput('Error: Unable to execute the code.');
    }
  };

  return (
    <section id="editor" className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Online Compiler</h1>
      <div className="md:flex md:w-full">
        <div className="md:w-2/3 p-4 bg-gray-700 rounded-lg">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="mb-4 p-2 bg-gray-600 text-white rounded"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <textarea
            value={code}
            onChange={handleCodeChange}
            rows="10"
            className="w-full p-4 bg-gray-600 text-white rounded"
            placeholder="Write your code here..."
          />
          <button
            onClick={handleRunCode}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition"
          >
            Run
          </button>
        </div>
        <div className="md:w-1/3 md:ml-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-lg font-semibold">Output:</p>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </section>
  );
};

export default CodeEditor;
