import React, { useState } from "react";
import {
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaUserShield,
  FaArchive,
  FaLink,
} from "react-icons/fa";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { GrResources } from "react-icons/gr";
import { VscFileSubmodule } from "react-icons/vsc";
import { LuNotebookText } from "react-icons/lu";
import { HiAcademicCap } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";
import Logo from "./assets/Logooo.png"; // Import the logo

const Sidebar = ({ isHidden }) => {
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
          <FaUserShield className="text-4xl" /> {/* Admin icon */}
          <span className="text-3xl font-bold">Admin</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                isActive("/dashboard") ? "bg-lime-700" : ""
              }`}
            >
              <RiDashboardHorizontalFill className="mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/record"
              className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                isActive("/record") ? "bg-lime-700" : ""
              }`}
            >
              <HiAcademicCap className="mr-3" />
              Academic
            </Link>
          </li>
          <li>
            <div>
              <button
                onClick={toggleResourcesMenu}
                className="w-full flex items-center px-4 py-2 rounded hover:bg-lime-600 justify-between"
              >
                <div className="flex items-center">
                  <GrResources className="mr-3" />
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
                      to="/subject"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/subject") ? "bg-lime-700" : ""
                      }`}
                    >
                      <VscFileSubmodule className="mr-3" />
                      Subject
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/module"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/module") ? "bg-lime-700" : ""
                      }`}
                    >
                      <LuNotebookText className="mr-3" />
                      Module
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/website"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/website") ? "bg-lime-700" : ""
                      }`}
                    >
                      <FaLink className="mr-3" />
                      Links
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/archive"
                      className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                        isActive("/archive") ? "bg-lime-700" : ""
                      }`}
                    >
                      <FaArchive className="mr-3" />
                      Archive
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <Link
              to="/users"
              className={`flex items-center px-4 py-2 rounded hover:bg-lime-600 ${
                isActive("/users") ? "bg-lime-700" : ""
              }`}
            >
              <FaUsers className="mr-3" />
              Users
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
