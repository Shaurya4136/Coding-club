import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfileModeration = ({ userId }) => {
  const [data, setData] = useState(null);
  const [editItem, setEditItem] = useState(null); // { text, postId, commentId }
  const [confirm, setConfirm] = useState(null); // { type, payload }
  const [deleted, setDeleted] = useState({});
  const token = localStorage.getItem("token");

  const viewer = JSON.parse(localStorage.getItem("user"));
  const canModerate = ["ClubHead", "Club Head", "Admin"].includes(viewer?.role);

  // ---------------- FETCH USER OVERVIEW ----------------
  useEffect(() => {
    axios
      .get(
        `https://coding-club-1.onrender.com/api/club/user/${userId}/overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error("Overview error:", err));
  }, [userId]);

  if (!data) return <p className="p-6 text-gray-400">Loading profile…</p>;

  const isByUser = (id) => id?.toString() === data.user._id?.toString();

  // ---------------- TIMELINE (SORTED) ----------------
  const timeline = [
    ...data.posts.map((p) => ({
      ...p,
      type: "post",
      date: p.createdAt || p.datePosted,
    })),
    ...data.likes.map((l) => ({
      ...l,
      type: "like",
      date: l.createdAt || l.datePosted,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // ---------------- SOFT DELETE ----------------
  const softDelete = (id) =>
    setDeleted((d) => ({ ...d, [id]: true }));

  const restore = (id) =>
    setDeleted((d) => {
      const copy = { ...d };
      delete copy[id];
      return copy;
    });

  // ---------------- EDIT SAVE ----------------
  const saveEdit = async () => {
    await axios.put(
      `/api/feed/${editItem.postId}/comments/${editItem.commentId}`,
      { comment: editItem.text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditItem(null);
    alert("Updated");
  };

  // ---------------- BLOCK REQUEST ----------------
  const requestBlock = async () => {
    const reason = prompt("Reason for blocking user");
    if (!reason) return;

    await axios.post(
      "https://coding-club-1.onrender.com/api/club/block-request",
      { userId: data.user._id, reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Block request sent");
  };

  return (
    <div className="p-6 text-white overflow-y-auto">

      {/* ================= USER HEADER ================= */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{data.user.name}</h2>
        <p className="text-gray-400">
          {data.user.role} • {data.user.status}
        </p>
        <p className="text-sm">{data.user.email}</p>
        {data.profile?.bio && (
          <p className="mt-2 text-gray-300">{data.profile.bio}</p>
        )}
      </div>

      {/* ================= POSTS ================= */}
      <h3 className="text-lg font-semibold mb-3">Posts & Activity</h3>

      {data.posts.map((post) => {
        if (deleted[post._id]) return null;

        return (
          <div
            key={post._id}
            className={`bg-gray-900 p-4 rounded mb-4 ${
              isByUser(post.userId) ? "border-l-4 border-yellow-400" : ""
            }`}
          >
            <p className="font-medium">
              {post.question || post.title || post.content}
            </p>

            <p className="text-xs text-gray-400">
              👍 {post.likes?.length || 0} likes
            </p>

            {/* POST ACTIONS */}
            {canModerate && (
              <div className="flex gap-3 text-xs text-red-400 mt-1">
                <button onClick={() => softDelete(post._id)}>Delete</button>
                <button onClick={() => restore(post._id)}>Restore</button>
              </div>
            )}

            {/* STUDENT ANSWERS */}
            {post.answers?.map((a) => (
              <div
                key={a._id}
                className={`ml-4 mt-3 ${
                  isByUser(a.userId) ? "border-l-2 border-yellow-400 pl-2" : ""
                }`}
              >
                <p>
                  <span className="text-blue-300">{a.profile?.name}</span>:{" "}
                  {a.answer}
                </p>

                {canModerate && (
                  <div className="text-xs text-red-400 flex gap-2">
                    <button
                      onClick={() =>
                        setEditItem({
                          text: a.answer,
                          postId: post._id,
                          commentId: a._id,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button onClick={() => softDelete(a._id)}>Delete</button>
                  </div>
                )}

                {/* ANSWER REPLIES */}
                {a.replies?.map((r) => (
                  <p
                    key={r._id}
                    className={`ml-4 text-xs text-gray-400 ${
                      isByUser(r.userId)
                        ? "border-l-2 border-yellow-400 pl-2"
                        : ""
                    }`}
                  >
                    ↳ {r.profile?.name}: {r.comment}
                  </p>
                ))}
              </div>
            ))}

            {/* CLUB COMMENTS */}
            {post.comments?.map((c) => (
              <div
                key={c._id}
                className={`ml-4 mt-3 ${
                  isByUser(c.userId) ? "border-l-2 border-yellow-400 pl-2" : ""
                }`}
              >
                <p>
                  <span className="text-blue-300">{c.profile?.name}</span>:{" "}
                  {c.comment}
                </p>

                {canModerate && (
                  <div className="text-xs text-red-400 flex gap-2">
                    <button
                      onClick={() =>
                        setEditItem({
                          text: c.comment,
                          postId: post._id,
                          commentId: c._id,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button onClick={() => softDelete(c._id)}>Delete</button>
                  </div>
                )}

                {c.replies?.map((r) => (
                  <p
                    key={r._id}
                    className={`ml-4 text-xs text-gray-400 ${
                      isByUser(r.userId)
                        ? "border-l-2 border-yellow-400 pl-2"
                        : ""
                    }`}
                  >
                    ↳ {r.profile?.name}: {r.comment}
                  </p>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      {/* ================= LIKES ================= */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Likes</h3>
      {data.likes.map((p) => (
        <p key={p._id} className="text-sm text-gray-400">
          ❤️ {p.question || p.title || p.content}
        </p>
      ))}

      {/* ================= ACTIONS ================= */}
      {canModerate && data.user.role === "Student" && (
        <button
          onClick={requestBlock}
          className="mt-6 bg-red-600 px-4 py-2 rounded"
        >
          Request Account Block
        </button>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-4 w-[500px] rounded">
            <h3 className="font-semibold mb-2">Edit</h3>
            <textarea
              className="w-full p-2 bg-gray-800 rounded"
              value={editItem.text}
              onChange={(e) =>
                setEditItem({ ...editItem, text: e.target.value })
              }
            />
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => setEditItem(null)}>Cancel</button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileModeration;
