// 📌 src/pages/ClubHeadProfile/ClubPost.js
import React, { useState, useEffect } from "react";
// import ClubNavbar from "../../components/ClubHeadNavbar";


import axios from "axios";

const ClubPostPage = () => {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("event");

  // -------------------- Form States --------------------
  const [poster, setPoster] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    image: null,
  });
  const [questionData, setQuestionData] = useState({
    title: "",
    content: "",
    tags: "",
    date: "",
  });
  const [pollData, setPollData] = useState({
    title: "",
    description: "",
    options: ["", ""],
    date: "",
  });

  // -------------------- CRUD States --------------------
  const [myPosts, setMyPosts] = useState([]);
  const [editId, setEditId] = useState(null);

  // -------------------- Comments CRUD --------------------
  const [myComments, setMyComments] = useState([]);
  const [commentInputs, setCommentInputs] = useState({}); // per-post add-comment
  const [commentText, setCommentText] = useState(""); // for editing in comments tab
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentPostId, setEditCommentPostId] = useState(null); // postId for edit

  // -------------------- Fetch My Posts --------------------
  const fetchMyPosts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/clubheadposts/mine",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts:", err);
    }
  };

  // -------------------- Fetch My Comments --------------------
  const fetchMyComments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/clubheadposts/comments/mine",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // backend returns: [{ _id, text, postId }]
      setMyComments(res.data);
    } catch (err) {
      console.error("Error fetching my comments:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchMyPosts();
    if (activeTab === "comments") fetchMyComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  // -------------------- Handlers --------------------
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setEditId(null);
    setEditCommentId(null);
    setEditCommentPostId(null);
    setCommentText("");
  };

  const handlePosterChange = (e) => setPoster(e.target.files[0]);

  // -------------------- Event Submission --------------------
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("content", eventData.description);
      formData.append("postType", "event");
      if (poster) formData.append("poster", poster);

      if (editId) {
        await axios.put(
          `http://localhost:5000/api/clubheadposts/${editId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Event updated!");
      } else {
        await axios.post("http://localhost:5000/api/clubheadposts", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Event posted!");
      }

      setEventData({ title: "", description: "", date: "", image: null });
      setPoster(null);
      setEditId(null);
      fetchMyPosts();
    } catch (err) {
      console.error("Event error:", err);
    }
  };

  // -------------------- Question Submission --------------------
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: questionData.title,
        content: questionData.content,
        postType: "question",
        tags: questionData.tags
          ?.split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editId) {
        await axios.put(
          `http://localhost:5000/api/clubheadposts/${editId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Question updated!");
      } else {
        await axios.post(
          "http://localhost:5000/api/clubheadposts",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Question posted!");
      }

      setQuestionData({ title: "", content: "", tags: "", date: "" });
      setEditId(null);
      fetchMyPosts();
    } catch (err) {
      console.error("Question error:", err);
    }
  };

  // -------------------- Poll Submission --------------------
  const handlePollSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: pollData.title,
        content: pollData.description,
        postType: "poll",
        pollOptions: pollData.options
          .map((opt) => (typeof opt === "object" ? opt.option : opt))
          .filter((opt) => opt && opt.trim() !== ""),
      };

      if (editId) {
        await axios.put(
          `http://localhost:5000/api/clubheadposts/${editId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Poll updated!");
      } else {
        await axios.post(
          "http://localhost:5000/api/clubheadposts",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Poll posted!");
      }

      setPollData({ title: "", description: "", options: ["", ""], date: "" });
      setEditId(null);
      fetchMyPosts();
    } catch (err) {
      console.error("Poll error:", err);
    }
  };

  // -------------------- Delete Post --------------------
  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/clubheadposts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyPosts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // -------------------- Like Post --------------------
  const handleLikePost = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/clubheadposts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyPosts();
    } catch (err) {
      console.error("Post like error:", err.response?.data || err);
    }
  };

  // -------------------- Like Comment --------------------
  const handleLikeComment = async (postId, commentId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/clubheadposts/${postId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyPosts();
      if (activeTab === "comments") fetchMyComments();
    } catch (err) {
      console.error("Comment like error:", err.response?.data || err);
    }
  };

  // -------------------- Comment: Add (per post) --------------------
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      // still using clubheadposts route to create;
      // feed /all will read these comments from ClubHeadPost
      await axios.post(
        `http://localhost:5000/api/clubheadposts/${postId}/comments`,
        { comment: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchMyPosts();
      if (activeTab === "comments") fetchMyComments();
      alert("Comment added!");
    } catch (err) {
      console.error("Comment add error:", err);
    }
  };

  // -------------------- Comment: Edit (from My Comments tab) --------------------
  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editCommentId || !editCommentPostId) return;

    try {
      // ✅ Use same route as Community.js:
      // PUT /api/feed/:postId/comments/:commentId  { comment }
      await axios.put(
        `http://localhost:5000/api/feed/${editCommentPostId}/comments/${editCommentId}`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Comment updated!");
      setCommentText("");
      setEditCommentId(null);
      setEditCommentPostId(null);
      fetchMyPosts();
      fetchMyComments();
    } catch (err) {
      console.error("Comment update error:", err.response?.data || err);
    }
  };

  // -------------------- Comment: Delete (both places) --------------------
  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      // ✅ Use same delete route as Community.js:
      // DELETE /api/feed/:postId/comments/:commentId
      await axios.delete(
        `http://localhost:5000/api/feed/${postId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchMyPosts();
      if (activeTab === "comments") fetchMyComments();
    } catch (err) {
      console.error("Delete comment error:", err.response?.data || err);
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* <ClubNavbar /> */}
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-cyan-400">
          Club Head Dashboard
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex justify-center space-x-3">
          {["event", "question", "poll", "comments"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold transition ${
                activeTab === tab
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* -------------------- Event Form -------------------- */}
        {activeTab === "event" && (
          <form
            onSubmit={handleEventSubmit}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editId ? "Edit Event" : "Post Event"}
            </h2>
            <input
              type="text"
              placeholder="Event Title"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <textarea
              placeholder="Event Description"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <input
              type="date"
              value={eventData.date}
              onChange={(e) =>
                setEventData({ ...eventData, date: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <input
              type="file"
              onChange={handlePosterChange}
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg"
            />
            {poster && (
              <img
                src={URL.createObjectURL(poster)}
                alt="preview"
                className="w-52 mt-3 rounded-lg shadow-md"
              />
            )}
            <button
              type="submit"
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
            >
              {editId ? "Update Event" : "Submit Event"}
            </button>
          </form>
        )}

        {/* -------------------- Question Form -------------------- */}
        {activeTab === "question" && (
          <form
            onSubmit={handleQuestionSubmit}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editId ? "Edit Question" : "Post Question"}
            </h2>
            <input
              type="text"
              placeholder="Question Title"
              value={questionData.title}
              onChange={(e) =>
                setQuestionData({ ...questionData, title: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <textarea
              placeholder="Write your question details"
              value={questionData.content}
              onChange={(e) =>
                setQuestionData({ ...questionData, content: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={questionData.tags}
              onChange={(e) =>
                setQuestionData({ ...questionData, tags: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
            >
              {editId ? "Update Question" : "Submit Question"}
            </button>
          </form>
        )}

        {/* -------------------- Poll Form -------------------- */}
        {activeTab === "poll" && (
          <form
            onSubmit={handlePollSubmit}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editId ? "Edit Poll" : "Post Poll"}
            </h2>
            <input
              type="text"
              placeholder="Poll Title"
              value={pollData.title}
              onChange={(e) =>
                setPollData({ ...pollData, title: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            <textarea
              placeholder="Poll Description"
              value={pollData.description}
              onChange={(e) =>
                setPollData({ ...pollData, description: e.target.value })
              }
              className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
              required
            />
            {pollData.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={typeof opt === "object" ? opt.option : opt}
                onChange={(e) => {
                  const newOpts = [...pollData.options];
                  if (typeof newOpts[idx] === "object")
                    newOpts[idx].option = e.target.value;
                  else newOpts[idx] = e.target.value;
                  setPollData({ ...pollData, options: newOpts });
                }}
                placeholder={`Option ${idx + 1}`}
                className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
                required
              />
            ))}
            <button
              type="button"
              onClick={() =>
                setPollData({
                  ...pollData,
                  options: [...pollData.options, ""],
                })
              }
              className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg mb-3 font-semibold"
            >
              + Add Option
            </button>
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
            >
              {editId ? "Update Poll" : "Submit Poll"}
            </button>
          </form>
        )}

        {/* -------------------- My Comments Tab -------------------- */}
        {activeTab === "comments" && (
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {editCommentId ? "Edit Comment" : "My Comments"}
            </h2>
            {myComments.length === 0 ? (
              <p className="text-gray-400">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {myComments.map((c) => (
                  <div
                    key={c._id}
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        On post:{" "}
                        <span className="text-cyan-300">{c.postId}</span>
                      </p>
                      <p className="text-gray-200 text-sm">{c.text}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditCommentId(c._id);
                          setEditCommentPostId(c.postId || null);
                          setCommentText(c.text || "");
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteComment(c._id, c.postId)
                        }
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {editCommentId && (
              <form onSubmit={handleUpdateComment} className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 mb-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
                >
                  Update Comment
                </button>
              </form>
            )}
          </div>
        )}

        {/* -------------------- My Posts -------------------- */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-6">My Posts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {myPosts.map((p) => (
              <div
                key={p._id}
                className="bg-gray-900 p-5 rounded-2xl shadow-lg hover:shadow-cyan-600/20 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl">{p.title}</h3>
                  <button
                    onClick={() => handleLikePost(p._id)}
                    className="px-3 py-1 rounded-full text-xs bg-gray-800 hover:bg-gray-700"
                  >
                    ❤️ {Array.isArray(p.likes) ? p.likes.length : 0}
                  </button>
                </div>

                <p className="mb-2 text-gray-300">{p.content}</p>
                <p className="text-sm text-cyan-400 font-semibold mb-3">
                  {p.postType}
                </p>

                {p.postType === "event" && p.image && (
                  <img
                    src={p.image}
                    alt="event"
                    className="w-full h-48 object-cover rounded-lg mb-3 shadow-md"
                  />
                )}

                {/* Comments Section */}
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Comments</h4>
                  {p.comments && p.comments.length > 0 ? (
                    <div className="space-y-3">
                      {p.comments.map((c) => (
                        <div
                          key={c._id}
                          className="bg-gray-800 p-3 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-cyan-300 font-semibold">
                                {c.profile?.name || "Unknown"}
                              </p>
                              <p className="text-gray-200">{c.comment}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleLikeComment(p._id, c._id)
                                }
                                className="px-2 py-1 rounded-full text-[11px] bg-gray-700 hover:bg-gray-600"
                              >
                                👍{" "}
                                {Array.isArray(c.likes) ? c.likes.length : 0}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(c._id, p._id)
                                }
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-semibold text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No comments yet</p>
                  )}

                  {/* Add Comment Form */}
                  <form
                    onSubmit={(e) => handleAddComment(e, p._id)}
                    className="mt-3 flex space-x-2"
                  >
                    <input
                      type="text"
                      value={commentInputs[p._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [p._id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 p-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-400 text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Post Actions */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setEditId(p._id);
                      const formattedDate = p.createdAt
                        ? new Date(p.createdAt).toISOString().split("T")[0]
                        : "";

                      if (p.postType === "event") {
                        setEventData({
                          title: p.title,
                          description: p.content,
                          date: formattedDate,
                          image: p.image || null,
                        });
                        setActiveTab("event");
                      } else if (p.postType === "question") {
                        setQuestionData({
                          title: p.title,
                          content: p.content,
                          tags: p.tags?.join(", ") || "",
                        });
                        setActiveTab("question");
                      } else if (p.postType === "poll") {
                        setPollData({
                          title: p.title,
                          description: p.content,
                          options: p.pollOptions || ["", ""],
                        });
                        setActiveTab("poll");
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(p._id)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubPostPage;
