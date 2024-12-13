import React, { useState } from "react";
import { FaBook, FaUsers, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { GrResources } from "react-icons/gr";
import { VscFileSubmodule } from "react-icons/vsc";
import { MdOutlineSettingsApplications, MdOutlineLink } from "react-icons/md";
import { Link } from "react-router-dom";
import Logo from "./assets/Logooo.png"; // Import the logo

const Sidebar = ({ isHidden }) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const toggleResourcesMenu = () => {
    setIsResourcesOpen(!isResourcesOpen);
  };

  return (
    <aside
      className={`w-64 text-white flex flex-col h-full transition-transform duration-300 ${
        isHidden ? "-translate-x-full" : "translate-x-0"
      }`}
      style={{ backgroundColor: "#4f6932" }}
    >
      <div className="p-6 text-center border-b border-lime-900">
        <img src={Logo} alt="CceCaya Logo" className="mx-auto mb-2 w-16 h-16" />
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
            >
              <RiDashboardHorizontalFill className="mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/record"
              className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
            >
              <FaBook className="mr-3" />
              Record
            </Link>
          </li>
          <li>
            <div>
              <button
                onClick={toggleResourcesMenu}
                className="w-full flex items-center px-4 py-2 rounded hover:bg-lime-700 justify-between"
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
                    <a
                      href="#module"
                      className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
                    >
                      <VscFileSubmodule className="mr-3" />
                      Module
                    </a>
                  </li>
                  <li>
                    <a
                      href="#application"
                      className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
                    >
                      <MdOutlineSettingsApplications className="mr-3" />
                      Application
                    </a>
                  </li>
                  <li>
                    <a
                      href="#website-link"
                      className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
                    >
                      <MdOutlineLink className="mr-3" />
                      Website Link
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <a
              href="#users"
              className="flex items-center px-4 py-2 rounded hover:bg-lime-700"
            >
              <FaUsers className="mr-3" />
              Users
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
