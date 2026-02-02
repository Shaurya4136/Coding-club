import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
// import StudentNavbar from "../../components/StudentNavbar";
import { jwtDecode } from "jwt-decode";


function StudentsQuestion() {
  const [userId, setUserId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerInput, setAnswerInput] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswer, setEditedAnswer] = useState("");

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const token = localStorage.getItem("token");

  // Decode token to get userId
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  const API = axios.create({
    baseURL: "https://coding-club-1.onrender.com/api/student-questions",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch questions for logged-in user
  const fetchQuestions = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setQuestions([]);
      setFilteredQuestions([]);

      const res = await API.get("/");
      console.log("Fetched questions:", res.data);

      setQuestions(
        res.data.map((q) => ({
          ...q,
          answers:
            q.answers?.map((a) => ({
              ...a,
              profile: a.profile || {},
              likes: a.likes || [],
            })) || [],
          profile: q.profile || {},
          datePosted: q.datePosted || "Unknown",
          timePosted: q.timePosted || "Unknown",
        }))
      );
    } catch (err) {
      console.error("Error fetching questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  // Apply filters
  useEffect(() => {
    let temp = [...questions];

    if (filterRole) temp = temp.filter((q) => q.profile?.role === filterRole);
    if (filterDate)
      temp = temp.filter((q) => {
        // Ensure both sides are YYYY-MM-DD
        const qDateFormatted = q.datePosted.includes("-")
          ? q.datePosted
          : q.datePosted
              .split("/")
              .reverse()
              .join("-"); // e.g., 7/9/2025 -> 2025-09-07
        return qDateFormatted === filterDate;
      });
    if (searchKeyword.trim() !== "")
      temp = temp.filter((q) =>
        q.question.toLowerCase().includes(searchKeyword.toLowerCase())
      );

    setFilteredQuestions(temp);
  }, [questions, filterDate, filterRole, searchKeyword]);

  // Question actions
  const handleNewQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      const res = await API.post("/", { question: newQuestion });
      setQuestions((prev) => [res.data, ...prev]);
      setNewQuestion("");
    } catch (err) {
      console.error("Error submitting question", err);
    }
  };

  const handleEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await API.put(`/${id}`, { question: editText });
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, ...res.data } : q))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating question", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Error deleting question", err);
    }
  };

  // Answer actions
  const handleAddAnswer = async (questionId) => {
    if (!answerInput.trim()) return;
    try {
      const res = await API.post(`/${questionId}/answers`, { answer: answerInput });
      setQuestions((prev) => prev.map((q) => (q._id === questionId ? res.data : q)));
      setAnswerInput("");
    } catch (err) {
      console.error("Error adding answer", err);
    }
  };

  const handleSaveEditAnswer = async (questionId, answerId) => {
    if (!editedAnswer.trim()) return;
    try {
      const res = await API.put(`/${questionId}/answers/${answerId}`, { answer: editedAnswer });
      setQuestions((prev) => prev.map((q) => (q._id === questionId ? res.data : q)));
      setEditingAnswerId(null);
      setEditedAnswer("");
    } catch (err) {
      console.error("Error editing answer", err);
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    try {
      const res = await API.delete(`/${questionId}/answers/${answerId}`);
      setQuestions((prev) => prev.map((q) => (q._id === questionId ? res.data : q)));
    } catch (err) {
      console.error("Error deleting answer", err);
    }
  };

  const handleLikeAnswer = async (questionId, answerId) => {
    try {
      const res = await API.put(`/${questionId}/answers/${answerId}/like`);
      setQuestions((prev) => prev.map((q) => (q._id === questionId ? res.data : q)));
    } catch (err) {
      console.error("Error liking answer", err);
    }
  };

  const hasLiked = (ans) =>
    ans.likes?.some((like) =>
      typeof like === "object" ? String(like._id) === String(userId) : String(like) === String(userId)
    );

  return (
    <>
      {/* <StudentNavbar /> */}
      <div className="p-6 max-w-5xl mx-auto bg-gray-900 min-h-screen text-gray-100 font-sans">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-400 tracking-wide">
          Student Q&A Forum
        </h2>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-gray-700 text-gray-100 p-2 rounded-lg border border-gray-600"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-700 text-gray-100 p-2 rounded-lg border border-gray-600"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Club">Club</option>
            <option value="College">College</option>
          </select>
          <input
            type="text"
            placeholder="Search keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="bg-gray-700 text-gray-100 p-2 rounded-lg border border-gray-600 flex-1"
          />
          <button
            onClick={() => {
              setFilterDate("");
              setFilterRole("");
              setSearchKeyword("");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reset
          </button>
        </div>

        {/* New Question */}
        <form
          onSubmit={handleNewQuestionSubmit}
          className="mb-10 bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-700"
        >
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="💡 Share your thoughts or ask a question..."
            className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            className="mt-4 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md"
          >
            🚀 Post Question
          </button>
        </form>

        {loading && <p className="text-center text-indigo-300">Loading questions...</p>}

        {filteredQuestions.length === 0 && !loading ? (
          <p className="text-gray-400 text-center italic">No questions match the filters.</p>
        ) : (
          <ul className="space-y-6">
            {filteredQuestions.map((q) => (
              <li
                key={q._id}
                className="p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all"
              >
                {/* Question */}
                {editingId === q._id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-xl p-3 mb-4"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSaveEdit(q._id)}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={q.profile?.avatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border border-gray-600"
                      />
                      <div>
                        <p className="font-bold text-xl text-indigo-300">{q.question}</p>
                        <small className="text-gray-400 block text-sm">
                          📅 {q.datePosted} ⏰ {q.timePosted} | {q.profile?.name} ({q.profile?.role})
                        </small>
                      </div>
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() => handleEdit(q._id, q.question)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}

                {/* Toggle answers */}
                <button
                  onClick={() =>
                    setSelectedQuestion(selectedQuestion === q._id ? null : q._id)
                  }
                  className="mt-5 text-indigo-400 font-semibold hover:underline"
                >
                  {selectedQuestion === q._id
                    ? "Hide Answers"
                    : `View Answers (${q.answers?.length || 0})`}
                </button>

                {/* Answers Section */}
                <AnimatePresence>
                  {selectedQuestion === q._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-5 border-t border-gray-700 pt-5 overflow-hidden"
                    >
                      {/* Add answer */}
                      <div className="flex mb-4">
                        <input
                          type="text"
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          placeholder="✍️ Write your answer..."
                          className="flex-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                        />
                        <button
                          onClick={() => handleAddAnswer(q._id)}
                          className="ml-3 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Submit
                        </button>
                      </div>

                      {/* Answer list */}
                      {q.answers?.length > 0 ? (
                        q.answers.map((ans) => (
                          <motion.div
                            key={ans._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 border border-gray-700 rounded-xl mb-3 bg-gray-700"
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <img
                                src={ans.profile?.avatar || "/default-avatar.png"}
                                alt="avatar"
                                className="w-8 h-8 rounded-full border border-gray-600"
                              />
                              <p className="text-gray-100 font-semibold">
                                {ans.profile?.name} ({ans.profile?.role})
                              </p>
                            </div>

                            {editingAnswerId === ans._id ? (
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={editedAnswer}
                                  onChange={(e) => setEditedAnswer(e.target.value)}
                                  className="flex-1 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg p-2"
                                />
                                <button
                                  onClick={() => handleSaveEditAnswer(q._id, ans._id)}
                                  className="ml-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingAnswerId(null);
                                    setEditedAnswer("");
                                  }}
                                  className="ml-2 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="text-gray-100 mb-2">{ans.answer}</p>
                            )}

                            <div className="flex flex-wrap gap-3 mt-2">
                              <button
                                onClick={() => handleLikeAnswer(q._id, ans._id)}
                                className={`px-3 py-1 rounded-lg ${
                                  hasLiked(ans)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }`}
                              >
                                👍 {ans.likes.length}
                              </button>

                              {(String(ans.userId) === String(userId) ||
                                String(q.userId) === String(userId)) && (
                                <>
                                  {String(ans.userId) === String(userId) && (
                                    <button
                                      onClick={() => {
                                        setEditingAnswerId(ans._id);
                                        setEditedAnswer(ans.answer);
                                      }}
                                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAnswer(q._id, ans._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-400">No answers yet.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default StudentsQuestion;
