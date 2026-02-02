import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { FaBell, FaSearch } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= CONFIG ================= */
const API = "https://coding-club-1.onrender.com/api/college";

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

/* ================= KPI COLORS ================= */
const KPI_COLORS = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
  red: "bg-red-600",
};

const KPI = ({ title, value, color }) => (
  <div className={`rounded-xl p-5 shadow ${KPI_COLORS[color]}`}>
    <p className="text-sm text-white/80">{title}</p>
    <h2 className="text-3xl font-bold text-white">{value ?? 0}</h2>
  </div>
);

export default function CollegeAdminConsole() {
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [blockRequests, setBlockRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [search, setSearch] = useState("");
  const [notificationsSeen, setNotificationsSeen] = useState(false);

  /* ================= LOAD ALL ================= */
  const loadAll = async () => {
    const [d, u, r, b, n] = await Promise.all([
      authFetch(`${API}/dashboard`).then(r => r.json()),
      authFetch(`${API}/users`).then(r => r.json()),
      authFetch(`${API}/registration-requests`).then(r => r.json()),
      authFetch(`${API}/block-requests`).then(r => r.json()),
      authFetch(`${API}/notifications`).then(r => r.json()),
    ]);

    setStats(d);
    setUsers(u);
    setRegistrationRequests(r);
    setBlockRequests(b);
    setNotifications(n);
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= REALTIME ================= */
  useEffect(() => {
    const socket = io("https://coding-club-1.onrender.com");

    socket.on("notification", () => {
      setNotificationsSeen(false); // 🔔 show badge again
      loadAll();
    });

    return () => socket.disconnect();
  }, []);

  /* ================= ACTIONS ================= */
  const approveRegistration = async (id) => {
    await authFetch(`${API}/registration-requests/${id}/approve`, {
      method: "PUT",
    });
    loadAll();
  };

  const rejectRegistration = async (id) => {
    await authFetch(`${API}/registration-requests/${id}/reject`, {
      method: "PUT",
    });
    loadAll();
  };

  const approveBlock = async (id) => {
    await authFetch(`${API}/block-requests/${id}/approve`, {
      method: "PUT",
    });
    loadAll();
  };

  const rejectBlock = async (id) => {
    await authFetch(`${API}/block-requests/${id}/reject`, {
      method: "PUT",
    });
    loadAll();
  };

  /* ================= FILTER USERS ================= */
  const filteredUsers = useMemo(
    () =>
      users.filter(u => {
        // ❌ hide pending ClubHead registrations
        if (u.role === "ClubHead" && u.status === "BlockRequested") return false;

        return search
          ? u.name.toLowerCase().includes(search.toLowerCase())
          : true;
      }),
    [users, search]
  );

  /* ================= TABS ================= */
  const tabs = [
    { key: "overview", label: "OVERVIEW" },
    { key: "users", label: "USERS" },
    {
      key: "registration",
      label: "REGISTRATION REQUESTS",
      badge: registrationRequests.length,
      color: "bg-green-600",
    },
    {
      key: "block",
      label: "BLOCK REQUESTS",
      badge: blockRequests.length,
      color: "bg-red-600",
    },
    {
      key: "notifications",
      label: "NOTIFICATIONS",
      badge: notificationsSeen ? 0 : notifications.length,
      color: "bg-yellow-600",
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">

      <h1 className="text-3xl font-bold">College Super Admin Dashboard</h1>

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-700 text-sm">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === "notifications") setNotificationsSeen(true);
            }}
            className={`relative pb-2 ${
              tab === t.key
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400"
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span
                className={`absolute -top-2 -right-3 ${t.color} text-xs px-2 py-0.5 rounded-full`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI title="Users" value={stats.users} color="blue" />
            <KPI title="Students" value={stats.students} color="green" />
            <KPI title="Club Heads" value={stats.clubHeads} color="purple" />
            <KPI title="Blocked" value={stats.blockedUsers} color="red" />
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: "Users", value: stats.users },
                  { name: "Students", value: stats.students },
                  { name: "Club Heads", value: stats.clubHeads },
                ]}
              >
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* USERS */}
      {tab === "users" && (
        <>
          <div className="flex items-center bg-gray-800 px-3 rounded w-72">
            <FaSearch />
            <input
              placeholder="Search user..."
              className="bg-transparent p-2 outline-none w-full"
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredUsers.map(u => (
            <div key={u._id} className="bg-gray-800 p-4 rounded">
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
              <p className="text-xs text-yellow-400">{u.status}</p>
            </div>
          ))}
        </>
      )}

      {/* REGISTRATION REQUESTS */}
      {tab === "registration" &&
        registrationRequests.map(u => (
          <div key={u._id} className="bg-gray-800 p-4 rounded flex justify-between">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
              <p className="text-xs text-green-400">Club Head Signup</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approveRegistration(u._id)}
                className="bg-green-600 px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => rejectRegistration(u._id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

      {/* BLOCK REQUESTS */}
      {tab === "block" &&
        blockRequests.map(r => (
          <div key={r._id} className="bg-gray-800 p-4 rounded flex justify-between">
            <div>
              <p className="font-semibold">{r.targetUser?.name}</p>
              <p className="text-xs text-gray-400">
                Requested by {r.requestedBy?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approveBlock(r._id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Block
              </button>
              <button
                onClick={() => rejectBlock(r._id)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

      {/* NOTIFICATIONS */}
      {tab === "notifications" &&
        notifications.map(n => (
          <div key={n._id} className="bg-gray-800 p-3 rounded flex gap-2">
            <FaBell /> {n.message}
          </div>
        ))}
    </div>
  );
}
