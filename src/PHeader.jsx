import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa"; // For the profile icon

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here (e.g., clear session, redirect)
    console.log("Logging out...");
    // Redirect to login page or clear authentication token
  };

  return (
    <header className="bg-[#5e7543] text-gray-100 p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">Professor Dashboard</h1>

      <div className="relative">
        <button
          className="flex items-center space-x-2"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <FaUserCircle size={24} /> {/* Profile Icon */}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg w-40">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
