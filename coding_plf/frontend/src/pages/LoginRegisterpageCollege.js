import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LoginRegisterPageCollege = () => {
  const location = useLocation();

  // ✅ Role coming from DarkThemeCards navigation
  const { role } = location.state || { role: "College" };

  // 🔍 DEBUG: Check navigation role
  console.log("ROLE RECEIVED FROM NAVIGATION:", role);
  console.log("FULL location.state:", location.state);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  /* ======================
     LOGIN
  ====================== */
  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔍 DEBUG: Role being sent to backend
    console.log("ROLE SENT TO BACKEND:", role);

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
          role: role, // ✅ SAME role that came from navigation
        }
      );

      console.log("COLLEGE LOGIN RESPONSE:", response.data);
      console.log("BACKEND REDIRECT URL:", response.data.redirectUrl);

      if (response.data.success) {
        // ✅ Save auth data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", role);

        console.log("TOKEN SAVED:", localStorage.getItem("token"));
        console.log("ROLE SAVED:", localStorage.getItem("role"));

        // ✅ Navigate to role-based community
        navigate(response.data.redirectUrl, { replace: true });
      }
    } catch (error) {
      console.error(
        "College login error:",
        error.response?.data || error.message
      );
    }
  };

  // /* ======================
  //    REGISTER
  // ====================== */
  // const handleRegister = async (e) => {
  //   e.preventDefault();

  //   console.log("ROLE SENT TO REGISTER:", role);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/auth/register",
  //       {
  //         name,
  //         email,
  //         password,
  //         role: role,
  //       }
  //     );

  //     console.log("COLLEGE REGISTER RESPONSE:", response.data);

  //     if (response.data.success) {
  //       setIsLogin(true);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "College registration error:",
  //       error.response?.data || error.message
  //     );
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center animated-gradient">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl text-cyan-500 font-bold mb-4">
          {role.toUpperCase()}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-lg w-full"
      >
        {/* Toggle */}
        <div className="flex mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 p-3 font-bold ${
              isLogin ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            Login
          </button>
          {/* <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 p-3 font-bold ${
              !isLogin ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            Register
          </button> */}
        </div>

        <motion.div
          initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 p-8 rounded-b-lg"
        >
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <Input label="Email" type="email" value={email} set={setEmail} />
              <Input
                label="Password"
                type="password"
                value={password}
                set={setPassword}
                icon={<FaLock />}
              />
              <Submit text="Login" />
            </form>
          ) : (
            {/* <form onSubmit={handleRegister}>
              <Input label="Name" type="text" value={name} set={setName} />
              <Input label="Email" type="email" value={email} set={setEmail} />
              <Input
                label="Password"
                type="password"
                value={password}
                set={setPassword}
                icon={<FaLock />}
              />
              <Submit text="Register" />
            </form> */}
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ======================
   Reusable Components
====================== */
const Input = ({ label, type, value, set, icon }) => (
  <div className="mb-4">
    <label className="block text-gray-400 mb-2">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        required
        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
      />
      {icon && (
        <span className="absolute top-3 right-3 text-gray-500">{icon}</span>
      )}
    </div>
  </div>
);

const Submit = ({ text }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    type="submit"
    className="w-full p-3 bg-cyan-500 text-white font-bold rounded-lg"
  >
    {text}
  </motion.button>
);

export default LoginRegisterPageCollege;