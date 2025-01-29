import React, { useState } from "react";
import Header from "./PHeader";
import Sidebar from "./PSidebar";
import Content from "./PContent";

const ProfessorDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header activeMenu={activeMenu} />

        {/* Content Area */}
        <Content activeMenu={activeMenu} />
      </div>
    </div>
  );
};

export default ProfessorDashboard;
