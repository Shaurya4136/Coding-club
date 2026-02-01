import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/college";

export default function CollegeAdminConsole() {
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadUsers();
  }, []);

  const loadDashboard = async () => {
    const res = await axios.get(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data);
  };

  const loadUsers = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data || []);
  };

  const blockUser = async (id) => {
    const res = await axios.put(`${API}/users/${id}/block`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.map(u => u._id === id ? res.data.user : u));
  };

  const unblockUser = async (id) => {
    const res = await axios.put(`${API}/users/${id}/unblock`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.map(u => u._id === id ? res.data.user : u));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎓 College Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        {["overview", "users"].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn">
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <Card title="Departments" value={stats.departments} />
          <Card title="Clubs" value={stats.clubs} />
          <Card title="Events" value={stats.events} />
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="bg-gray-800 p-4 rounded flex justify-between">
              <div>
                <p className="font-bold">{u.name}</p>
                <p className="text-sm">{u.email} • {u.role}</p>
                <p className={u.status === "Blocked" ? "text-red-400" : "text-green-400"}>
                  {u.status}
                </p>
              </div>

              {u.status === "Blocked" ? (
                <button onClick={() => unblockUser(u._id)} className="bg-green-600 px-3 py-1 rounded">
                  Unblock
                </button>
              ) : (
                <button onClick={() => blockUser(u._id)} className="bg-red-600 px-3 py-1 rounded">
                  Block
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Card = ({ title, value }) => (
  <div className="bg-gray-800 p-4 rounded">
    <p className="text-gray-400">{title}</p>
    <h2 className="text-2xl font-bold">{value || 0}</h2>
  </div>
);