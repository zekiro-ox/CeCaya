import React from "react";
import { FaHome, FaFolder, FaLink, FaArchive } from "react-icons/fa";
import { LuNotebookText } from "react-icons/lu"; // Import icons

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { name: "Home", icon: <FaHome /> },
    { name: "Module", icon: <LuNotebookText /> },
    { name: "Link", icon: <FaLink /> },
    { name: "Archive", icon: <FaArchive /> },
  ];

  return (
    <div className="w-64 bg-[#4f6932] text-gray-100 p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4">Hello Professor</h2>
      <ul className="space-y-2">
        {menuItems.map(({ name, icon }) => (
          <li
            key={name}
            className={`py-2 px-4 cursor-pointer rounded flex items-center space-x-2 ${
              activeMenu === name ? "bg-lime-700" : "hover:bg-lime-700"
            }`}
            onClick={() => setActiveMenu(name)}
          >
            {icon} {/* Display icon */}
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
