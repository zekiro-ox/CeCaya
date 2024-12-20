import React, { useState } from "react";
import {
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaSignOutAlt, // Importing logout icon
} from "react-icons/fa";

const Header = ({ onLogout, toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header
      className="w-full text-white flex justify-between items-center p-4 border-b border-lime-900"
      style={{ backgroundColor: "#5e7543" }}
    >
      <button onClick={toggleSidebar} className="text-white text-2xl lg:hidden">
        <FaBars />
      </button>
      <div className="text-xl font-semibold">CceCaya</div>
      <div className="relative">
        <button className="flex items-center text-lg" onClick={toggleDropdown}>
          <FaUserCircle className="mr-2" />
          {isDropdownOpen ? (
            <FaChevronUp className="ml-2" />
          ) : (
            <FaChevronDown className="ml-2" />
          )}
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg border border-black">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md flex items-center"
              onClick={onLogout}
            >
              <FaSignOutAlt className="mr-2" />{" "}
              {/* Adding the logout icon here */}
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
