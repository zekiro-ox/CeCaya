import React, { useState } from "react";
import {
  FaHome,
  FaChevronDown,
  FaChevronUp,
  FaLink,
  FaArchive,
} from "react-icons/fa";
import { LuNotebookText } from "react-icons/lu"; // Import icons
import { Link, useLocation } from "react-router-dom";

const StudentSidebar = ({ isHidden }) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const location = useLocation(); // Get the current path

  const toggleResourcesMenu = () => {
    setIsResourcesOpen(!isResourcesOpen);
  };

  const isActive = (path) => location.pathname === path; // Helper function to check active state

  return (
    <aside
      className={`w-64 text-white flex flex-col h-full transition-transform duration-300 ${
        isHidden ? "-translate-x-full" : "translate-x-0"
      }`}
      style={{ backgroundColor: "#4f6932" }}
    >
      <div className="p-6 text-center border-b border-lime-900">
        <div className="flex justify-center items-center space-x-2">
          <FaHome className="text-4xl" /> {/* Home icon */}
          <span className="text-3xl font-bold">Student</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              to="/student/home"
              className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                isActive("/student/home") ? "bg-lime-700" : ""
              }`}
            >
              <FaHome className="mr-3" />
              Home
            </Link>
          </li>
          <li>
            <div>
              <button
                onClick={toggleResourcesMenu}
                className="w-full flex items-center px-4 py-2 rounded hover:bg-lime-600 justify-between"
              >
                <div className="flex items-center">
                  <LuNotebookText className="mr-3" />
                  Resources
                </div>
                <span>
                  {isResourcesOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              {isResourcesOpen && (
                <ul className="pl-6 mt-2 space-y-2">
                  <li>
                    <Link
                      to="/student/module"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/student/module") ? "bg-lime-700" : ""
                      }`}
                    >
                      <LuNotebookText className="mr-3" />
                      Module
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/student/link"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/student/link") ? "bg-lime-700" : ""
                      }`}
                    >
                      <FaLink className="mr-3" />
                      Link
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
