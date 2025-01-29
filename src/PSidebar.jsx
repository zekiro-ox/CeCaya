import React from "react";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = ["Home", "Subject", "Archive"];

  return (
    <div className="w-64 bg-[#4f6932] text-gray-100 p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4">Hello Professor</h2>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item}
            className={`py-2 px-4 cursor-pointer rounded ${
              activeMenu === item ? "bg-lime-700" : "hover:bg-lime-700"
            }`}
            onClick={() => setActiveMenu(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
