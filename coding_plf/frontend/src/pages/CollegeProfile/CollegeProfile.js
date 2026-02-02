import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaCircle,
  FaSignOutAlt,
  FaKey,
  FaEnvelope,
  FaUserMinus,
  FaCamera,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* ================= CONFIG ================= */
const API = "https://coding-club-1.onrender.com/api/profile";
const LOCAL_KEY = "collegeProfile";
const DEFAULT_AVATAR =
  "https://dummyimage.com/200x200/4f46e5/ffffff&text=College";

/* ================= DEFAULT PROFILE ================= */
const DEFAULT_PROFILE = {
  name: "New College",
  email: "",
  bio: "",
  avatar: DEFAULT_AVATAR,
  joinedDate: new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  }),

  responsibilities: [], // Departments
  eventsManaged: [],    // Events
  teamMembers: [],      // Clubs

  phone: "",
  address: "",
  linkedin: "",
  github: "",
};

/* ================= REUSABLE SECTION ================= */
const Section = ({ title, children }) => (
  <section className="bg-gray-800 rounded-xl p-6 space-y-2">
    <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
      {title}
    </h2>
    {children}
  </section>
);

export default function CollegeProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editData, setEditData] = useState(DEFAULT_PROFILE);
  const [showEdit, setShowEdit] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [newEmail, setNewEmail] = useState("");

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= ONLINE / OFFLINE ================= */
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /* ================= HELPERS ================= */
  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const saveLocal = (data) =>
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

  const readLocal = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY));
    } catch {
      return null;
    }
  };

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API, { headers: headers() });
        const data = await res.json();
        setProfile({ ...DEFAULT_PROFILE, ...data });
        saveLocal(data);
      } catch {
        const local = readLocal();
        if (local) setProfile(local);
        setError("Offline mode – changes saved locally");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    setProfile(editData);
    saveLocal(editData);

    try {
      if (isOnline) {
        await fetch(API, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(editData),
        });
      }
      setShowEdit(false);
    } catch {
      setError("Server unreachable – saved locally");
    }
  };

  /* ================= AVATAR ================= */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setEditData((p) => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ================= CRUD ARRAYS ================= */
  const addItem = (key) =>
    setEditData({ ...editData, [key]: [...editData[key], ""] });

  const updateItem = (key, i, val) => {
    const arr = [...editData[key]];
    arr[i] = val;
    setEditData({ ...editData, [key]: arr });
  };

  const deleteItem = (key, i) =>
    setEditData({
      ...editData,
      [key]: editData[key].filter((_, idx) => idx !== i),
    });

  /* ================= ACCOUNT ACTIONS ================= */
  const changePassword = async () => {
    try {
      await fetch(`${API}/change-password`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(passwordData),
      });
      alert("✅ Password updated");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch {
      setError("Password update failed");
    }
  };

  const changeEmail = async () => {
    try {
      const res = await fetch(`${API}/change-email`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      setProfile((p) => ({ ...p, email: data.email }));
      setNewEmail("");
      alert("✅ Email updated");
    } catch {
      setError("Email update failed");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("⚠️ Delete account permanently?")) return;
    await fetch(API, { method: "DELETE", headers: headers() });
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">

      {/* STATUS */}
      <div className="flex items-center gap-2 text-sm">
        <FaCircle className={isOnline ? "text-green-400" : "text-red-400"} />
        {isOnline ? "Online" : "Offline"}
      </div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <img
            src={profile.avatar || DEFAULT_AVATAR}
            className="w-28 h-28 rounded-full border-4 border-white object-cover"
            alt="avatar"
          />
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p>{profile.email}</p>
            <p className="text-sm opacity-80">Joined: {profile.joinedDate}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditData(profile);
              setShowEdit(true);
            }}
            className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold"
          >
            <FaEdit /> Edit Profile
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* PROFILE DATA */}
      <Section title="About College">
        <p className="text-gray-300">{profile.bio || "No description added yet"}</p>
      </Section>

      <Section title="Contact & Social">
        <p>📞 Phone: {profile.phone || "Not added"}</p>
        <p>📍 Address: {profile.address || "Not added"}</p>
        <p>🔗 LinkedIn: {profile.linkedin || "Not added"}</p>
        <p>💻 GitHub: {profile.github || "Not added"}</p>
      </Section>

      <Section title="Departments">
        {profile.responsibilities.length ? (
          <ul className="list-disc pl-5">
            {profile.responsibilities.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        ) : <p className="text-gray-400">No departments added</p>}
      </Section>

      <Section title="Events Hosted">
        {profile.eventsManaged.length ? (
          <ul className="list-disc pl-5">
            {profile.eventsManaged.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        ) : <p className="text-gray-400">No events added</p>}
      </Section>

      <Section title="Clubs & Societies">
        {profile.teamMembers.length ? (
          <ul className="list-disc pl-5">
            {profile.teamMembers.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        ) : <p className="text-gray-400">No clubs added</p>}
      </Section>

      {/* ACCOUNT ACTIONS */}
      <Section title="Change Password">
        <input className="w-full p-2 bg-gray-700 rounded mb-2"
          placeholder="Old Password" type="password"
          value={passwordData.oldPassword}
          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
        />
        <input className="w-full p-2 bg-gray-700 rounded mb-2"
          placeholder="New Password" type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
        />
        <button onClick={changePassword} className="bg-indigo-600 px-4 py-2 rounded">
          Update Password
        </button>
      </Section>

      <Section title="Change Email">
        <input className="w-full p-2 bg-gray-700 rounded mb-2"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button onClick={changeEmail} className="bg-indigo-600 px-4 py-2 rounded">
          Update Email
        </button>
      </Section>

      <Section title="Danger Zone">
        <button onClick={deleteAccount} className="bg-red-600 px-4 py-2 rounded">
          Delete My Account
        </button>
      </Section>

      {error && (
        <div className="bg-yellow-900 text-yellow-200 p-3 rounded text-center">
          {error}
        </div>
      )}

      {/* EDIT POPUP */}
      {showEdit && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center pt-10 z-50">
          <motion.div className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold">Edit Profile</h2>

            <div className="flex items-center gap-4">
              <img src={editData.avatar} className="w-24 h-24 rounded-full" />
              <label className="cursor-pointer bg-indigo-600 px-3 py-2 rounded-lg">
                <FaCamera /> Change Avatar
                <input type="file" hidden onChange={handleAvatarChange} />
              </label>
            </div>

            <input className="w-full p-2 bg-gray-700 rounded"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />

            <textarea className="w-full p-2 bg-gray-700 rounded"
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            />

            {["phone", "address", "linkedin", "github"].map((f) => (
              <input key={f} className="w-full p-2 bg-gray-700 rounded"
                placeholder={f}
                value={editData[f]}
                onChange={(e) => setEditData({ ...editData, [f]: e.target.value })}
              />
            ))}

            {["responsibilities", "eventsManaged", "teamMembers"].map((key) => (
              <div key={key}>
                {editData[key].map((item, i) => (
                  <div key={i} className="flex gap-2 mt-2">
                    <input className="flex-1 p-2 bg-gray-700 rounded"
                      value={item}
                      onChange={(e) => updateItem(key, i, e.target.value)}
                    />
                    <button onClick={() => deleteItem(key, i)} className="bg-red-600 px-2 rounded">
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem(key)} className="bg-green-600 px-3 py-1 mt-2 rounded">
                  <FaPlus /> Add
                </button>
              </div>
            ))}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEdit(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={saveProfile} className="bg-indigo-600 px-4 py-2 rounded">
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
