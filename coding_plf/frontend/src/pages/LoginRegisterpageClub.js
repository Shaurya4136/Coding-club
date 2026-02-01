import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

/* ================= ROLE NORMALIZER ================= */
const normalizeRole = (role) => {
  if (!role) return "";

  const map = {
    "Club Head": "ClubHead",
    clubhead: "ClubHead",
    ClubHead: "ClubHead",
    Student: "Student",
    student: "Student",
    College: "College",
    college: "College",
  };

  return map[role] || role;
};

const LoginRegisterPageclub = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState(location.state?.role || "");
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [roleSelected, setRoleSelected] = useState(!!role);

  // ⭐ approval UX
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
      setRoleSelected(true);
    }
  }, [location.state]);

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    const finalRole = normalizeRole(role);
    if (!finalRole) return alert("Please select a role.");

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
        role: finalRole, // ✅ FIXED
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate(res.data.redirectUrl);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();

    const finalRole = normalizeRole(role);
    if (!finalRole) return alert("Please select a role.");

    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
        role: finalRole, // ✅ FIXED
      });

      // ⭐ ClubHead → approval UX
      if (finalRole === "ClubHead") {
        setPendingApproval(true);
        setPendingEmail(email);
        return;
      }

      if (res.data.success) {
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center animated-gradient">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-lg w-full"
      >
        <h1 className="text-3xl text-cyan-400 font-bold text-center mb-4">
          {role ? normalizeRole(role).toUpperCase() : "USER"}
        </h1>

        {/* ================= APPROVAL MESSAGE ================= */}
        <AnimatePresence>
          {pendingApproval && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900/40 border border-green-500 text-green-300 p-4 rounded-lg text-center"
            >
              <h2 className="text-lg font-bold mb-2">
                ✅ Request Sent Successfully
              </h2>
              <p className="text-sm">
                Your registration request for
                <br />
                <span className="font-semibold text-white">
                  {pendingEmail}
                </span>
                <br />
                has been sent to the college admin.
              </p>
              <p className="mt-2 text-xs text-gray-300">
                ⏳ Please wait for approval before logging in.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= FORM ================= */}
        {!pendingApproval && (
          <>
            <div className="flex mb-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`w-1/2 p-3 font-bold ${
                  isLogin
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`w-1/2 p-3 font-bold ${
                  !isLogin
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                Register
              </button>
            </div>

            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {!roleSelected && (
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setRoleSelected(true);
                  }}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Student">Student</option>
                  <option value="Club Head">Club Head</option>
                  <option value="College">College</option>
                </select>
              )}

              {!isLogin && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white"
                required
              />

              <button
                type="submit"
                className="w-full p-3 bg-cyan-500 rounded font-bold hover:bg-cyan-600 transition"
              >
                {isLogin ? "Login" : "Register"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LoginRegisterPageclub;
