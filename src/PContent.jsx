import React from "react";
import Home from "./PHome";

const Content = ({ activeMenu }) => {
  return (
    <div className="flex-1 p-6">
      <div className="p-4 rounded-lg shadow-lg">
        {/* Conditionally render the Home component when activeMenu is 'Posts' */}
        {activeMenu === "Home" && <Home />}
      </div>
    </div>
  );
};

export default Content;
