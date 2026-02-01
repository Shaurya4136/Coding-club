import React, { useEffect, useRef, useState } from "react";

const CodeEditor = ({ languages, initialLanguage = "python3" }) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const codeRef = useRef(null);

  /* ---------- Run Code ---------- */
  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please write some code first.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/compiler/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            stdin: input.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Execution failed");

      const data = await response.json();
      setOutput(data.output || "No output");
    } catch {
      setError("Error: Unable to execute code.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Clear Output ---------- */
  const handleClearOutput = () => {
    setOutput("");
    setError("");
  };

  /* ---------- Ctrl + Enter (editor only) ---------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.ctrlKey &&
        e.key === "Enter" &&
        document.activeElement === codeRef.current
      ) {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [code, language, input]);

  return (
    <section className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Online Compiler</h1>

      <div className="md:flex gap-4">
        {/* -------- Code Area -------- */}
        <div className="md:w-2/3 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 bg-gray-700 rounded"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-400">
              Ctrl + Enter (Run)
            </span>
          </div>

          <textarea
            ref={codeRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows="10"
            className="w-full p-4 bg-gray-700 rounded font-mono"
            placeholder="Write your code here..."
          />

          {/* -------- Input -------- */}
          <div className="mt-4">
            <label className="text-sm text-gray-400 mb-1 block">
              Optional Input (stdin)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows="3"
              className="w-full p-3 bg-gray-700 rounded font-mono"
              placeholder={`Example:\nHello World\n123`}
            />
          </div>

          <button
            onClick={handleRunCode}
            disabled={loading}
            className={`mt-4 px-6 py-3 rounded-lg transition
              ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            {loading ? "Running..." : "Run"}
          </button>
        </div>

        {/* -------- Output Area -------- */}
        <div className="md:w-1/3 p-4 bg-gray-800 rounded-lg flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-semibold">Output</p>

            <button
              onClick={handleClearOutput}
              disabled={!output && !error}
              className={`text-sm px-3 py-1 rounded transition
                ${
                  output || error
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
            >
              Clear
            </button>
          </div>

          {error && (
            <pre className="text-red-400 whitespace-pre-wrap flex-1">
              {error}
            </pre>
          )}

          {!error && (
            <pre className="text-green-400 whitespace-pre-wrap flex-1">
              {output || "—"}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};

export default CodeEditor;
