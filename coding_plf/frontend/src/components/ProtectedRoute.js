import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setCheckingAuth(false);
  }, []);

  // ⏳ Wait until auth check finishes
  if (checkingAuth) {
    return null; // or loader if you want
  }

  // ❌ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // ✅ Authenticated
  return children;
};

export default ProtectedRoute;
