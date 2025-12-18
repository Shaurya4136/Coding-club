import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/">MyApp</Link>
      </div>
      <div className="space-x-6">
        <Link to="/home" className="hover:text-gray-400">Home</Link>
        <Link to="/about" className="hover:text-gray-400">About</Link>
        <Link to="/contact" className="hover:text-gray-400">Contact</Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Login</button>
        </Link>
        <Link to="/signup">
          <button className="bg-transparent border border-white hover:bg-white hover:text-black px-3 py-1 rounded">Sign Up</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
