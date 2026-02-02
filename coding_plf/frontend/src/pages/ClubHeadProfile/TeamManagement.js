import React, { useEffect, useState } from "react";
import axios from "axios";

/* ===================== NESTED COMMENTS ===================== */
const NestedComments = ({ items = [], level = 0, highlightUserId }) => {
  return (
    <div className={`ml-${Math.min(level * 4, 12)}`}>
      {items.map((item) => {
        const isHighlighted =
          item.userId?.toString() === highlightUserId?.toString();

        return (
          <div
            key={item._id}
            className={`mt-2 pl-3 border-l rounded ${
              isHighlighted
                ? "border-yellow-400 bg-yellow-500/10"
                : "border-gray-700"
            }`}
          >
            <p className="text-sm">
              <span className="text-blue-400 font-medium">
                {item.profile?.name}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({item.profile?.role})
              </span>
              <span className="ml-2 text-gray-300">
                {item.comment || item.reply || item.answer}
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-1">
              👍 {item.likes?.length || 0}
            </p>

            {item.replies?.length > 0 && (
              <NestedComments
                items={item.replies}
                level={level + 1}
                highlightUserId={highlightUserId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ===================== COLLAPSIBLE POST ===================== */
const CollapsiblePost = ({ post, highlightUserId }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg mb-4 border border-gray-800">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex justify-between items-start hover:bg-gray-800 rounded-lg"
      >
        <div>
          <p className="font-medium">
            {post.question || post.title || post.content}
          </p>

          {/* TAGS / TOKENS */}
          {post.tags?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {post.tags.map((t, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-1">
            👍 {post.likes?.length || 0} likes
          </p>
        </div>

        <span className="text-xs text-gray-400">
          {open ? "▲ Hide" : "▼ View"}
        </span>
      </button>

      {/* BODY */}
      {open && (
        <div className="p-4 border-t border-gray-800 space-y-4">

          {/* LIKES LIST */}
          <div>
            <p className="text-sm font-semibold">
              👍 Liked by ({post.likes?.length || 0})
            </p>

            {post.likes?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {post.likes.map((u) => (
                  <span
                    key={u._id || u}
                    className="text-xs bg-gray-800 px-2 py-1 rounded"
                  >
                    {u.name || "User"} {u.role && `(${u.role})`}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No likes</p>
            )}
          </div>

          {/* STUDENT ANSWERS */}
          {post.answers && (
            <div>
              <p className="text-sm font-semibold">💬 Answers</p>
              <NestedComments
                items={post.answers.map((a) => ({
                  ...a,
                  comment: a.answer,
                  replies: a.replies || [],
                }))}
                highlightUserId={highlightUserId}
              />
            </div>
          )}

          {/* CLUB COMMENTS */}
          {post.comments && (
            <div>
              <p className="text-sm font-semibold">💬 Comments</p>
              <NestedComments
                items={post.comments}
                highlightUserId={highlightUserId}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ===================== MAIN PAGE ===================== */
const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeUser, setActiveUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const token = localStorage.getItem("token");

  /* ===================== FETCH USERS ===================== */
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get("https://coding-club-1.onrender.com/api/club/team", {
        params: {
          search,
          role: roleFilter !== "All" ? roleFilter : undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Fetch users error:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ===================== FETCH USER OVERVIEW ===================== */
  const openUser = async (user) => {
    setActiveUser(user);
    setOverview(null);

    try {
      setLoadingProfile(true);
      const res = await axios.get(
        `https://coding-club-1.onrender.com/api/club/user/${user._id}/overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOverview(res.data);
    } catch (err) {
      console.error("❌ Overview fetch error:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* ===================== BLOCK REQUEST ===================== */
 const requestBlock = async () => {
  const reason = prompt("Enter reason for blocking this user");
  if (!reason) return;

  try {
    await axios.post(
      "https://coding-club-1.onrender.com/api/club/block-request",
      { userId: activeUser._id, reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Block request submitted");

    // 👇 instant UI update
    setActiveUser(prev => ({
      ...prev,
      status: "BlockRequested",
    }));
  } catch (err) {
    alert(err.response?.data?.message || "❌ Failed to submit block request");
  }
};

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col md:flex-row">

      {/* ===================== LEFT PANEL ===================== */}
      <div className="md:w-[38%] w-full border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">

        <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
          <h1 className="text-xl font-bold mb-3">Team Management</h1>

          <input
            placeholder="Search name or email..."
            className="w-full p-2 mb-3 bg-gray-800 rounded outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2">
            <select
              className="flex-1 bg-gray-800 p-2 rounded"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="ClubHead">Club Head</option>
              <option value="College">College</option>
            </select>

            <select
              className="flex-1 bg-gray-800 p-2 rounded"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
              <option value="BlockRequested">Block Requested</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loadingUsers ? (
            <p className="text-center text-gray-400 mt-10">Loading users...</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => openUser(u)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition
                  ${
                    activeUser?._id === u._id
                      ? "bg-gray-800 border border-blue-500/40"
                      : "hover:bg-gray-900"
                  }`}
              >
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-500">
                  {u.role} • {u.status}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===================== RIGHT PANEL ===================== */}
      <div className="flex-1 overflow-y-auto p-6">
        {!activeUser ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a user to view profile & activity
          </div>
        ) : loadingProfile || !overview ? (
          <p className="text-gray-400">Loading profile...</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">{overview.user.name}</h2>
                <p className="text-gray-400">
                  {overview.user.role} • {overview.user.status}
                </p>
              </div>

              {overview.user.role === "Student" && (
                <button
                  onClick={requestBlock}
                  className="bg-red-600/90 hover:bg-red-700 px-4 py-2 rounded text-sm"
                >
                  🚫 Request Block
                </button>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-3">
              Posts, Comments & Likes
            </h3>

            {overview.posts.length === 0 ? (
              <p className="text-gray-500">No posts found</p>
            ) : (
              overview.posts.map((post) => (
                <CollapsiblePost
                  key={post._id}
                  post={post}
                  highlightUserId={overview.user._id}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;

