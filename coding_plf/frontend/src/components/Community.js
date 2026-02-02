// Community.js — Full version (likes, add/edit/delete, replies, re-fetch after actions, debugging)
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompilerPopup from "./CompilerPopup";
import axios from "axios";
import PageContainer from "../components/PageContainer";


const REFRESH_INTERVAL = 150000; // 15 seconds

const ROLE_COLORS = {
  Student: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
  Club: "bg-purple-600/20 text-purple-400 border border-purple-600/30",
  ClubHead: "bg-purple-600/20 text-purple-400 border border-purple-600/30",
  College: "bg-orange-600/20 text-orange-400 border border-orange-600/30",
  default: "bg-gray-700/20 text-gray-400 border border-gray-600/30",
};

const DEFAULT_AVATAR = "/default-avatar.png";

// ⭐ See more / See less
const ExpandableText = ({ text = "", maxChars = 160, className = "" }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxChars;
  const displayText =
    !isLong || expanded ? text : text.slice(0, maxChars) + "…";

  return (
    <p className={className}>
      {displayText}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="ml-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
};

const QuestionFilters = ({ filters, handleFilterChange }) => (
  <div className="p-4 flex flex-wrap gap-4 justify-center bg-gray-800/60 backdrop-blur-md rounded-xl shadow border border-gray-700/40">
    <input
      type="date"
      value={filters.date}
      onChange={(e) => handleFilterChange("date", e.target.value)}
      className="bg-gray-700/70 px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
    />
    <input
      type="text"
      value={filters.profile}
      onChange={(e) => handleFilterChange("profile", e.target.value)}
      className="bg-gray-700/70 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm min-w-[180px]"
      placeholder="Search by Profile"
    />
    <input
      type="text"
      value={filters.tags}
      onChange={(e) => handleFilterChange("tags", e.target.value)}
      className="bg-gray-700/70 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm min-w-[180px]"
      placeholder="Search by Tags"
    />
  </div>
);

// ⭐ Empty-state when no posts match
const EmptyState = () => (
  <div className="mt-10 rounded-2xl border border-dashed border-gray-700 bg-gray-900/60 p-8 text-center space-y-3">
    <p className="text-lg font-semibold text-gray-100">
      No posts found for these filters
    </p>
    <p className="text-sm text-gray-400">
      Try clearing the filters or be the first one to start a discussion!
    </p>
    <p className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-800/80 px-3 py-1 rounded-full mt-2">
      <span>💡 Tip</span>
      <span>Ask a doubt, share a resource, or post an update.</span>
    </p>
  </div>
);

const Community = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({ date: "", profile: "", tags: "" });
  const [showCompilerPopup, setShowCompilerPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [answerInputs, setAnswerInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null); // which reply is being edited
  const [editText, setEditText] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postEditText, setPostEditText] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(null); // 🔑 decoded from JWT

  const fade = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeInOut" },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
  };

  const toId = (id) =>
    id === undefined || id === null ? undefined : id.toString();

  const toggleMenu = (menuId) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
  };

  // ⭐ Decode userId from JWT token
  useEffect(() => {
    if (!token) {
      setUserId(null);
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const id =
        payload.userId ||
        payload.id ||
        payload._id ||
        (payload.user && (payload.user._id || payload.user.id));

      setUserId(id || null);
      console.log("🔑 Decoded userId from token:", id);
    } catch (err) {
      console.error("❌ Error decoding token:", err);
      setUserId(null);
    }
  }, [token]);

  const normalizeItem = (item) => {
    const image =
      typeof item.image === "string"
        ? item.image
        : item.image?.data
        ? `data:${item.image.contentType};base64,${Buffer.from(
            item.image.data
          ).toString("base64")}`
        : null;

    const roleRaw = item.profile?.role || item.user?.role || "Student";
    const normalizedRole =
      roleRaw.toLowerCase() === "club head" ? "ClubHead" : roleRaw;

    // post owner userId: backend doesn't send userId on post, so we use profile._id
    const postUserId = toId(
      item.userId?._id || item.userId || item.profile?._id || item.user?._id
    );

    const postProfile = {
      _id: toId(item.profile?._id || item.user?._id),
      name: item.profile?.name || item.user?.name || "Unknown",
      avatar: item.profile?.avatar || item.user?.avatar || DEFAULT_AVATAR,
      role: normalizedRole,
    };

    const normalizedAnswers = (item.answers || []).map((a) => {
      const prof = a.profile || {};
      const answerUserId = toId(a.userId?._id || a.userId || prof._id);

      const normalizedReplies = (a.replies || []).map((r) => {
        const rProf = r.profile || {};
        const replyUserId = toId(r.userId?._id || r.userId || rProf._id);

        return {
          _id: toId(r._id),
          comment: r.comment,
          likes: Array.isArray(r.likes) ? r.likes.map(String) : [],
          userId: replyUserId,
          profile: {
            _id: toId(rProf._id),
            name: rProf.name || "Unknown User",
            role: rProf.role || "Student",
            avatar: rProf.avatar || DEFAULT_AVATAR,
          },
          dateCommented: r.dateCommented,
          timeCommented: r.timeCommented,
          replies: r.replies || [],
        };
      });

      return {
        _id: toId(a._id),
        answer: a.answer,
        likes: Array.isArray(a.likes) ? a.likes.map(String) : [],
        userId: answerUserId,
        profile: {
          _id: toId(prof._id),
          name: prof.name || "Unknown",
          role: prof.role || "Student",
          avatar: prof.avatar || DEFAULT_AVATAR,
        },
        dateAnswered: a.dateAnswered,
        timeAnswered: a.timeAnswered,
        replies: normalizedReplies,
      };
    });

    const normalizedComments = (item.comments || []).map((c) => {
      const prof = c.profile || {};
      const commentUserId = toId(c.userId?._id || c.userId || prof._id);

      const normalizedReplies = (c.replies || []).map((r) => {
        const rProf = r.profile || {};
        const replyUserId = toId(r.userId?._id || r.userId || rProf._id);

        return {
          _id: toId(r._id),
          comment: r.comment,
          likes: Array.isArray(r.likes) ? r.likes.map(String) : [],
          userId: replyUserId,
          profile: {
            _id: toId(rProf._id),
            name: rProf.name || "Unknown User",
            role: rProf.role || "Member",
            avatar: rProf.avatar || DEFAULT_AVATAR,
          },
          dateCommented: r.dateCommented,
          timeCommented: r.timeCommented,
          replies: r.replies || [],
        };
      });

      return {
        _id: toId(c._id),
        comment: c.comment,
        likes: Array.isArray(c.likes) ? c.likes.map(String) : [],
        userId: commentUserId,
        profile: {
          _id: toId(prof._id),
          name: prof.name || "Unknown User",
          role: prof.role || "Member",
          avatar: prof.avatar || DEFAULT_AVATAR,
        },
        dateCommented: c.dateCommented,
        timeCommented: c.timeCommented,
        replies: normalizedReplies,
      };
    });

    let postType = item.postType;
    if (!postType || postType === "question") {
      postType = item.question ? "student" : "clubhead";
    }

    return {
      _id: toId(item._id),
      userId: postUserId, // 🔑 who owns the post
      postType,
      date: new Date(item.createdAt || item.datePosted || Date.now()),
      content:
        item.content || item.question || item.description || item.title || "",
      image,
      tags: item.tags || [],
      likes: Array.isArray(item.likes) ? item.likes.map(String) : [],
      profile: postProfile,
      question: item.question,
      answers: normalizedAnswers,
      comments: normalizedComments,
      pollOptions: item.pollOptions || [],
      pollVotes: item.pollVotes || {},
      isStudent: postType === "student",
    };
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://coding-club-1.onrender.com/api/feed/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalized = res.data.map(normalizeItem);
      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(normalized);
      setFilteredItems(normalized);
      console.log("📦 feed loaded (normalized):", normalized);
      console.log("🧍 logged userId (state):", userId);
    } catch (err) {
      console.error("❌ Fetch feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  // auto-refresh
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      console.log("🔄 Auto-refreshing feed...");
      fetchFeed();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token]);

  // initial fetch
  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterChange = (key, value) =>
    setFilters({ ...filters, [key]: value });

  useEffect(() => {
    let filtered = items;
    if (filters.date)
      filtered = filtered.filter(
        (i) =>
          i.date.toLocaleDateString() ===
          new Date(filters.date).toLocaleDateString()
      );
    if (filters.profile)
      filtered = filtered.filter((i) =>
        i.profile?.name?.toLowerCase().includes(filters.profile.toLowerCase())
      );
    if (filters.tags)
      filtered = filtered.filter((i) =>
        i.tags?.some((tag) =>
          tag.toLowerCase().includes(filters.tags.toLowerCase())
        )
      );
    setFilteredItems(filtered);
  }, [filters, items]);

  const toggleAnswers = (id) =>
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleLike = async (item, id, isAnswer = false) => {
    try {
      let apiRoute;
      if (item.postType === "student") {
        apiRoute = isAnswer
          ? `https://coding-club-1.onrender.com/api/student-questions/${item._id}/answers/${id}/like`
          : `https://coding-club-1.onrender.com/api/student-questions/${item._id}/like`;
      } else {
        apiRoute = isAnswer
          ? `https://coding-club-1.onrender.com/api/clubheadposts/${item._id}/comments/${id}/like`
          : `https://coding-club-1.onrender.com/api/clubheadposts/${item._id}/like`;
      }

      await axios.put(apiRoute, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchFeed();
    } catch (err) {
      console.error("❌ Like error:", err.response?.data || err);
    }
  };

  const handleAddAnswer = async (item) => {
    const text = (answerInputs[item._id] || "").trim();
    if (!text) return;
    try {
      const apiRoute = item.isStudent
        ? `https://coding-club-1.onrender.com/api/student-questions/${item._id}/answers`
        : `https://coding-club-1.onrender.com/api/clubheadposts/${item._id}/comments`;
      const body = item.isStudent ? { answer: text } : { comment: text };
      await axios.post(apiRoute, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnswerInputs((prev) => ({ ...prev, [item._id]: "" }));
      await fetchFeed();
    } catch (err) {
      console.error("❌ Error adding comment:", err);
    }
  };

  const handleAddReply = async (item, parent) => {
    const key = parent._id;
    const text = (replyInputs[key] || "").trim();
    if (!text) return;

    try {
      let apiRoute;
      if (item.isStudent) {
        apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/answers/${parent._id}/replies`;
      } else {
        apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${parent._id}/replies`;
      }

      await axios.post(
        apiRoute,
        { comment: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplyInputs((prev) => ({ ...prev, [key]: "" }));
      await fetchFeed();
    } catch (err) {
      console.error("❌ Error adding reply:", err.response?.data || err);
    }
  };

  const handleLikeReply = async (item, parentId, replyId) => {
    try {
      let apiRoute;
      if (item.isStudent) {
        apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/answers/${parentId}/replies/${replyId}/like`;
      } else {
        apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${parentId}/replies/${replyId}/like`;
      }

      await axios.put(apiRoute, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchFeed();
    } catch (err) {
      console.error("❌ Error liking reply:", err.response?.data || err);
    }
  };

  const handleEditComment = async (item, commentId) => {
    if (!editText.trim()) {
      console.log("⚠️ No text to save");
      return;
    }

    try {
      const apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${commentId}`;
      const body = { comment: editText };

      const res = await axios.put(apiRoute, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Edit response:", res.status, res.data);

      setEditingComment(null);
      setEditingReply(null);
      setEditText("");
      await fetchFeed();
    } catch (err) {
      console.error(
        "❌ Error editing comment:",
        err.response?.status,
        err.response?.data || err
      );
    }
  };

 const handleDeleteComment = async (item, commentId) => {
  if (!window.confirm("Are you sure you want to delete this comment?")) return;

  try {
    // ✅ Same route for student answers AND club comments
    const apiRoute = `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${commentId}`;

    await axios.delete(apiRoute, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchFeed();
  } catch (err) {
    console.error("❌ Error deleting comment:", err.response?.data || err);
  }
};


  // edit nested reply
  const handleEditReply = async (item, parentId, replyId) => {
    if (!editText.trim()) {
      console.log("⚠️ No text to save for reply");
      return;
    }
    try {
      const apiRoute = item.isStudent
        ? `https://coding-club-1.onrender.com/api/feed/${item._id}/answers/${parentId}/replies/${replyId}`
        : `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${parentId}/replies/${replyId}`;

      const body = { comment: editText };

      const res = await axios.put(apiRoute, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Reply edit response:", res.status, res.data);

      setEditingReply(null);
      setEditingComment(null);
      setEditText("");
      await fetchFeed();
    } catch (err) {
      console.error(
        "❌ Error editing reply:",
        err.response?.status,
        err.response?.data || err
      );
    }
  };

  // delete nested reply
  const handleDeleteReply = async (item, parentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const apiRoute = item.isStudent
        ? `https://coding-club-1.onrender.com/api/feed/${item._id}/answers/${parentId}/replies/${replyId}`
        : `https://coding-club-1.onrender.com/api/feed/${item._id}/comments/${parentId}/replies/${replyId}`;

      await axios.delete(apiRoute, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchFeed();
    } catch (err) {
      console.error("❌ Error deleting reply:", err);
    }
  };

  // edit main post
  const handleEditPost = async (item) => {
    if (!postEditText.trim()) {
      console.log("⚠️ No text to save for post");
      return;
    }

    try {
      const apiRoute = item.isStudent
        ? `https://coding-club-1.onrender.com/api/student-questions/${item._id}`
        : `https://coding-club-1.onrender.com/api/clubheadposts/${item._id}`;

      const body = item.isStudent
        ? { question: postEditText }
        : { content: postEditText };

      const res = await axios.put(apiRoute, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Post edit response:", res.status, res.data);

      setEditingPostId(null);
      setPostEditText("");
      await fetchFeed();
    } catch (err) {
      console.error(
        "❌ Error editing post:",
        err.response?.status,
        err.response?.data || err
      );
    }
  };

  // delete main post
  const handleDeletePost = async (item) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const apiRoute = item.isStudent
        ? `https://coding-club-1.onrender.com/api/student-questions/${item._id}`
        : `https://coding-club-1.onrender.com/api/clubheadposts/${item._id}`;

      await axios.delete(apiRoute, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchFeed();
    } catch (err) {
      console.error("❌ Error deleting post:", err.response?.data || err);
    }
  };

  // Threaded nested replies renderer
  const ReplyThread = ({ item, parentId, replies = [], depth = 0 }) => {
    if (!replies.length) return null;

    const depthClasses = ["ml-8", "ml-12", "ml-16", "ml-20"];
    const indentClass =
      depthClasses[Math.min(depth, depthClasses.length - 1)] || "ml-8";

    return (
      <div
        className={`mt-2 ${indentClass} pl-3 border-l border-gray-700 space-y-2`}
      >
        {replies.map((r) => {
          const replyOwnerId = toId(r.userId || r.profile?._id);
          const postOwnerId = toId(item.userId || item.profile?._id);
          const replyOwner = replyOwnerId === toId(userId);
          const isPostOwner = postOwnerId === toId(userId);
          const canEdit = replyOwner;
          const canDelete = replyOwner || isPostOwner;
          const menuId = `reply-${parentId}-${r._id}`;
          const isEditingThisReply =
            editingReply &&
            editingReply.replyId === r._id &&
            editingReply.parentId === parentId &&
            editingReply.itemId === item._id;

          return (
            <div key={r._id} className="flex items-start gap-2">
              <span className="w-1 h-1 mt-3 rounded-full bg-cyan-500" />
              <img
                src={r.profile?.avatar || DEFAULT_AVATAR}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-cyan-700/50 object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">
                    {r.profile?.name || "User"}{" "}
                    <span className="text-[10px] text-gray-500">
                      {r.dateCommented} {r.timeCommented}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeReply(item, parentId, r._id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] transition-all ${
                        Array.isArray(r.likes) &&
                        r.likes.map(String).includes(userId)
                          ? "bg-green-600/70 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      ❤️ {r.likes?.length || 0}
                    </button>

                    {canEdit || canDelete ? (
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(menuId)}
                          className="px-1 py-0.5 rounded-full text-xs text-gray-300 hover:bg-gray-700"
                        >
                          ⋮
                        </button>
                        {openMenuId === menuId && (
                          <div className="absolute right-0 mt-1 w-28 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingReply({
                                    itemId: item._id,
                                    parentId,
                                    replyId: r._id,
                                  });
                                  setEditingComment(null);
                                  setEditText(r.comment || "");
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-800"
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDeleteReply(item, parentId, r._id);
                                }}
                                className="block w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-800"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-500 italic">
                        [no permission]
                      </span>
                    )}
                  </div>
                </div>

                {isEditingThisReply ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows="2"
                      className="w-full bg-gray-900 border border-cyan-600 text-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none text-xs"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditReply(item, parentId, r._id)}
                        className="px-3 py-1 bg-cyan-600 rounded-lg text-white text-[11px] hover:bg-cyan-500"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingReply(null);
                          setEditText("");
                        }}
                        className="px-3 py-1 bg-gray-700 rounded-lg text-gray-300 text-[11px] hover:bg-gray-600"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ExpandableText
                      text={r.comment}
                      maxChars={140}
                      className="text-xs text-gray-200 mt-1"
                    />

                    {Array.isArray(r.replies) && r.replies.length > 0 && (
                      <ReplyThread
                        item={item}
                        parentId={parentId}
                        replies={r.replies}
                        depth={depth + 1}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ⭐ Derived stats for sidebar (fills right side space)
  const totalPosts = filteredItems.length;
  const totalQuestions = filteredItems.filter((i) => i.isStudent).length;
  const totalClubPosts = totalPosts - totalQuestions;
  const totalReplies = filteredItems.reduce((sum, item) => {
    const list = item.isStudent ? item.answers : item.comments;
    return sum + (list?.length || 0);
  }, 0);

  const tagCounts = {};
  items.forEach((i) => {
    (i.tags || []).forEach((tag) => {
      const key = tag.trim();
      if (!key) return;
      tagCounts[key] = (tagCounts[key] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
<PageContainer>
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
              Community Feed
            </h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              Ask doubts, share knowledge, and stay updated with everything
              happening around your coding club and campus.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-800/80 border border-gray-700 px-3 py-1 text-[11px] text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Auto-refresh: every 15 seconds</span>
            </div>
          </div>

          <button
            onClick={fetchFeed}
            className="self-start lg:self-auto inline-flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-3 py-1.5 transition"
          >
            🔄 Refresh now
          </button>
        </div>

        {/* Main layout: Feed + Sidebar */}
        <div className="
  grid gap-6
  grid-cols-1
  xl:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]
">
          {/* LEFT: Filters + Feed */}
          <div className="space-y-6">
            <QuestionFilters
              filters={filters}
              handleFilterChange={handleFilterChange}
            />

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className="h-40 rounded-xl bg-gray-800/70 border border-gray-700/70 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredItems.length === 0 && <EmptyState />}

                {filteredItems.map((item, idx) => {
                  // ✅ POST OWNER: check userId (from backend) first, then fallback profile._id
                  const postOwnerId = toId(item.userId || item.profile?._id);
                  const isPostOwner = postOwnerId === toId(userId);
                  const postMenuId = `post-${item._id}`;

                  return (
                    <motion.div
                      key={item._id}
                      variants={fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 hover:border-cyan-400/30 transition-all duration-300"
                    >
                      {console.groupCollapsed &&
                        console.groupCollapsed(`📦 Post ${idx + 1} Debug`)}
                      {console.log && console.log("Post ID:", item._id)}
                      {console.log &&
                        console.log(
                          "Post ownerId (userId/profile):",
                          postOwnerId,
                          "Logged userId:",
                          userId
                        )}
                      {console.groupEnd && console.groupEnd()}

                      {/* Header with hamburger for post */}
                      <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-700/40">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.profile?.avatar || DEFAULT_AVATAR}
                            alt="avatar"
                            className="w-12 h-12 rounded-full border border-cyan-600 object-cover"
                          />
                          <div>
                            <p
                              className={`inline-block text-sm font-semibold px-2 py-1 rounded-md ${
                                ROLE_COLORS[item.profile?.role]
                              }`}
                            >
                              {item.profile?.name}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {item.date.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {isPostOwner && (
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(postMenuId)}
                              className="px-2 py-1 rounded-full text-xs text-gray-300 hover:bg-gray-700"
                            >
                              ⋮
                            </button>
                            {openMenuId === postMenuId && (
                              <div className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-30">
                                <button
                                  onClick={() => {
                                    setEditingPostId(item._id);
                                    setPostEditText(item.content || "");
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-800"
                                >
                                  ✏️ Edit Post
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDeletePost(item);
                                  }}
                                  className="block w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-800"
                                >
                                  🗑️ Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-3">
                        {editingPostId === item._id ? (
                          <div>
                            <textarea
                              value={postEditText}
                              onChange={(e) => setPostEditText(e.target.value)}
                              rows="3"
                              className="w-full bg-gray-900 border border-cyan-600 text-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEditPost(item)}
                                className="px-4 py-1.5 bg-cyan-600 rounded-lg text-white text-sm hover:bg-cyan-500"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPostId(null);
                                  setPostEditText("");
                                }}
                                className="px-4 py-1.5 bg-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-600"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <ExpandableText
                            text={item.content}
                            maxChars={220}
                            className="text-gray-200 text-base leading-relaxed font-light"
                          />
                        )}

                        {item.image && (
                          <img
                            src={item.image}
                            alt="post"
                            className="w-full rounded-lg object-cover max-h-80 border border-gray-700"
                          />
                        )}

                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <button
                            onClick={() => handleLike(item, item._id, false)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              Array.isArray(item.likes) &&
                              item.likes.map(String).includes(userId)
                                ? "bg-green-600/70 text-white"
                                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            }`}
                          >
                            ❤️ {item.likes?.length || 0}
                          </button>

                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                            <button
                              onClick={() => toggleAnswers(item._id)}
                              className="hover:text-cyan-400 transition"
                            >
                              💬{" "}
                              {expandedQuestions[item._id]
                                ? "Hide Comments"
                                : "View Comments"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowCompilerPopup(true);
                              }}
                              className="hover:text-blue-400 transition"
                            >
                              🖥️ Open Compiler
                            </button>
                          </div>
                        </div>

                        {/* Optional tags under post */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-700 text-gray-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedQuestions[item._id] && (
                          <motion.div
                            variants={fade}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="p-4 border-t border-gray-700/50 bg-gray-900/60 rounded-b-xl"
                          >
                            <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
                              {(item.isStudent ? item.answers : item.comments)?.map(
                                (c) => {
                                  const userData = c.profile || {};

                                  // ✅ COMMENT OWNER: use c.userId if present, else profile._id
                                  const commentOwnerId = toId(
                                    c.userId || userData._id
                                  );
                                  const isOwner =
                                    commentOwnerId === toId(userId) && !!userId;
                                  const isPostOwner =
                                    toId(item.userId || item.profile?._id) ===
                                    toId(userId);
                                  const menuId = `comment-${c._id}`;

                                  return (
                                    <motion.div
                                      key={c._id}
                                      className="flex items-start gap-3 bg-gray-800/70 p-3 rounded-lg border border-gray-700 hover:border-cyan-400/20 shadow-sm transition-all"
                                    >
                                      <img
                                        src={
                                          userData.avatar || DEFAULT_AVATAR
                                        }
                                        alt="avatar"
                                        className="w-11 h-11 rounded-full border border-cyan-700/50 object-cover shadow-sm"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <p
                                              className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                                                ROLE_COLORS[userData.role] ||
                                                ROLE_COLORS.default
                                              }`}
                                            >
                                              {userData.name || "Unknown User"}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                              ({userData.role || "Member"})
                                            </span>
                                          </div>

                                          <div className="flex gap-2 items-center">
                                            <button
                                              onClick={() =>
                                                handleLike(item, c._id, true)
                                              }
                                              className={`px-3 py-1 rounded-full text-xs transition-all ${
                                                Array.isArray(c.likes) &&
                                                c.likes
                                                  .map(String)
                                                  .includes(userId)
                                                  ? "bg-green-600/70 text-white"
                                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                              }`}
                                            >
                                              👍 {c.likes?.length || 0}
                                            </button>

                                            {isOwner || isPostOwner ? (
                                              <div className="relative">
                                                <button
                                                  onClick={() =>
                                                    toggleMenu(menuId)
                                                  }
                                                  className="px-1 py-0.5 rounded-full text-xs text-gray-300 hover:bg-gray-700"
                                                >
                                                  ⋮
                                                </button>
                                                {openMenuId === menuId && (
                                                  <div className="absolute right-0 mt-1 w-28 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
                                                    {isOwner && (
                                                      <button
                                                        onClick={() => {
                                                          setEditingComment(
                                                            c._id
                                                          );
                                                          setEditingReply(null);
                                                          setEditText(
                                                            c.answer ||
                                                              c.comment ||
                                                              ""
                                                          );
                                                          setOpenMenuId(null);
                                                        }}
                                                        className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-800"
                                                      >
                                                        ✏️ Edit
                                                      </button>
                                                    )}
                                                    <button
                                                      onClick={() => {
                                                        setOpenMenuId(null);
                                                        handleDeleteComment(
                                                          item,
                                                          c._id
                                                        );
                                                      }}
                                                      className="block w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-800"
                                                    >
                                                      🗑️ Delete
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-gray-500 italic">
                                                [no permission]
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {editingComment === c._id ? (
                                          <div className="mt-2">
                                            <textarea
                                              value={editText}
                                              onChange={(e) =>
                                                setEditText(e.target.value)
                                              }
                                              rows="2"
                                              className="w-full bg-gray-900 border border-cyan-600 text-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none"
                                            />
                                            <div className="flex gap-2 mt-2">
                                              <button
                                                onClick={() =>
                                                  handleEditComment(item, c._id)
                                                }
                                                className="px-3 py-1 bg-cyan-600 rounded-lg text-white text-xs hover:bg-cyan-500"
                                              >
                                                💾 Save
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingComment(null);
                                                  setEditText("");
                                                }}
                                                className="px-3 py-1 bg-gray-700 rounded-lg text-gray-300 text-xs hover:bg-gray-600"
                                              >
                                                ❌ Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <ExpandableText
                                              text={c.answer || c.comment}
                                              maxChars={180}
                                              className="text-gray-300 text-sm mt-2 leading-snug italic"
                                            />

                                            <ReplyThread
                                              item={item}
                                              parentId={c._id}
                                              replies={c.replies || []}
                                              depth={0}
                                            />

                                            <div className="flex gap-2 mt-2 ml-8">
                                              <input
                                                type="text"
                                                placeholder={
                                                  item.isStudent
                                                    ? "Reply to this answer..."
                                                    : "Reply to this comment..."
                                                }
                                                value={replyInputs[c._id] || ""}
                                                onChange={(e) =>
                                                  setReplyInputs((prev) => ({
                                                    ...prev,
                                                    [c._id]: e.target.value,
                                                  }))
                                                }
                                                className="flex-1 p-1.5 rounded-lg bg-gray-900 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                              />
                                              <button
                                                onClick={() =>
                                                  handleAddReply(item, c)
                                                }
                                                className="px-3 py-1 bg-cyan-600 rounded-lg text-white text-[11px] hover:bg-cyan-500"
                                              >
                                                Reply
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                }
                              )}
                            </div>

                            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700/50">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={answerInputs[item._id] || ""}
                                onChange={(e) =>
                                  setAnswerInputs((prev) => ({
                                    ...prev,
                                    [item._id]: e.target.value,
                                  }))
                                }
                                className="flex-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                              />
                              <button
                                onClick={() => handleAddAnswer(item)}
                                className="px-4 py-2 bg-cyan-600 rounded-lg text-white font-semibold hover:bg-cyan-500 transition text-sm"
                              >
                                Post
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar to fill empty space */}
          <aside className="space-y-4 hidden xl:block">
            {/* Welcome / user card */}
            <div className="rounded-2xl bg-gray-900/70 border border-gray-800 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Your space
              </p>
              <p className="text-sm text-gray-200">
                Welcome back{" "}
                <span className="font-semibold text-cyan-400">
                  {userId ? "member" : "guest"}
                </span>
                !
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Answer questions, help juniors, and grow with your community.
              </p>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Activity overview
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-800/80 p-3 text-center">
                  <p className="text-lg font-semibold text-cyan-400">
                    {totalPosts}
                  </p>
                  <p className="text-[11px] text-gray-400">Total posts</p>
                </div>
                <div className="rounded-xl bg-gray-800/80 p-3 text-center">
                  <p className="text-lg font-semibold text-blue-400">
                    {totalQuestions}
                  </p>
                  <p className="text-[11px] text-gray-400">Student Q&amp;A</p>
                </div>
                <div className="rounded-xl bg-gray-800/80 p-3 text-center">
                  <p className="text-lg font-semibold text-purple-400">
                    {totalClubPosts}
                  </p>
                  <p className="text-[11px] text-gray-400">Club posts</p>
                </div>
                <div className="rounded-xl bg-gray-800/80 p-3 text-center">
                  <p className="text-lg font-semibold text-emerald-400">
                    {totalReplies}
                  </p>
                  <p className="text-[11px] text-gray-400">Answers &amp; comments</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Keep interacting to make this feed more insightful for everyone.
              </p>
            </div>

            {/* Trending tags */}
            <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Trending tags
              </p>
              {trendingTags.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Tags will appear here once posts start using them.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800/80 border border-gray-700 text-gray-200"
                    >
                      #{tag}{" "}
                      <span className="text-[10px] text-gray-500">
                        ({count})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tip card */}
            <div className="rounded-2xl bg-gradient-to-br from-cyan-700/40 via-blue-700/30 to-purple-700/40 border border-cyan-500/40 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-200 mb-1">
                Pro tip
              </p>
              <p className="text-sm text-gray-100">
                Use clear titles and tags when posting questions so others can
                quickly find and answer them.
              </p>
            </div>
          </aside>
        </div>

        {showCompilerPopup && selectedItem && (
          <CompilerPopup
            show={showCompilerPopup}
            onClose={() => setShowCompilerPopup(false)}
            language={selectedItem?.language || "javascript"}
          />
        )}
        </PageContainer>
      </div>
  );
};

export default Community;
