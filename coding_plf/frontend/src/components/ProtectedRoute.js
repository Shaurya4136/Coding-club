// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem('token'); // You can use your authentication logic here

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // If authenticated, render the children (protected component)
  return children;
};

export default ProtectedRoute;
