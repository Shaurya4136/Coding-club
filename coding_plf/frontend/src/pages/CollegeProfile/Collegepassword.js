import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaEllipsisV } from "react-icons/fa";
import { normalizeRole } from "../../utils/normalizeRole";

const CollegePassword = () => {
  const [users, setUsers] = useState([]);
  const [activeRole, setActiveRole] = useState("Student");
  const [editingId, setEditingId] = useState(null);
  const [passwords, setPasswords] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [menuId, setMenuId] = useState(null);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  /* =========================
     FETCH USERS
  ========================== */
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://coding-club-1.onrender.com/api/college/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const normalized = res.data.map((u) => ({
        ...u,
        normalizedRole: normalizeRole(u.role),
      }));

      setUsers(normalized);
    };

    fetchUsers();
  }, []);

  /* =========================
     RESET PASSWORD
  ========================== */
  const handleSavePassword = async (id) => {
    const token = localStorage.getItem("token");

    if (!passwords[id] || passwords[id].length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    await axios.put(
      `https://coding-club-1.onrender.com/api/college/users/${id}/password`,
      { password: passwords[id] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Password reset successful");
    setEditingId(null);
    setPasswords((p) => ({ ...p, [id]: "" }));
  };

  /* =========================
     FILTER (ROLE + SEARCH)
  ========================== */
  const filteredUsers = users.filter((u) => {
    const matchesRole = u.normalizedRole === activeRole;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        College – Password Administration
      </h1>

      {/* ROLE TABS */}
      <div className="flex justify-center gap-4 mb-6">
        {["Student", "ClubHead", "College"].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-6 py-2 rounded-lg ${
              activeRole === role
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
        />
      </div>

      {/* USERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-gray-800 p-5 rounded-xl relative"
          >
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>

            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>Role: {user.normalizedRole}</p>
              <p>Status: {user.status}</p>
              <p>Password: ********</p>
            </div>

            <button
              onClick={() =>
                setMenuId(menuId === user._id ? null : user._id)
              }
              className="absolute top-3 right-3"
            >
              <FaEllipsisV />
            </button>

            {menuId === user._id && (
              <div className="absolute top-10 right-3 bg-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => setEditingId(user._id)}
                  className="block px-4 py-2 hover:bg-gray-600 w-full text-left"
                >
                  Reset Password
                </button>
              </div>
            )}

            {editingId === user._id && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type={showPassword[user._id] ? "text" : "password"}
                  value={passwords[user._id] || ""}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      [user._id]: e.target.value,
                    })
                  }
                  placeholder="New Password"
                  className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded"
                />

                <button
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      [user._id]: !showPassword[user._id],
                    })
                  }
                >
                  {showPassword[user._id] ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>

                <button
                  onClick={() => handleSavePassword(user._id)}
                  className="px-3 py-1 bg-blue-600 rounded"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No users found
        </p>
      )}
    </div>
  );
};

export default CollegePassword;
