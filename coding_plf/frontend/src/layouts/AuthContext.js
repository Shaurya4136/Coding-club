import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

/* Decode JWT safely */
const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded) return;

    // ⛔ Auto logout if expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      window.location.href = "/Login";
      return;
    }

    setRole(decoded.role?.toLowerCase());
    setUser(decoded);

    // ⏱ Auto logout when token expires
    const timeout = setTimeout(() => {
      localStorage.clear();
      window.location.href = "/Login";
    }, decoded.exp * 1000 - Date.now());

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthContext.Provider value={{ role, user }}>
      {children}
    </AuthContext.Provider>
  );
};

/* Hook */
export const useAuth = () => useContext(AuthContext);
