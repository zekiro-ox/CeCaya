import React from "react";

const StudentDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#4f6932] text-gray-100 p-6">
        <ul>
          <li className="py-2 px-4 hover:bg-lime-700 cursor-pointer">Home</li>
          <li className="py-2 px-4 hover:bg-lime-700 cursor-pointer">Module</li>
          <li className="py-2 px-4 hover:bg-lime-700 cursor-pointer">
            Application
          </li>
          <li className="py-2 px-4 hover:bg-lime-700 cursor-pointer">
            Websites
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <header className="bg-[#5e7543] text-gray-100 p-4 mb-6 rounded-md shadow">
          <h1 className="text-2xl font-bold">
            Welcome to the Student Dashboard
          </h1>
        </header>

        {/* Content */}
        <div className="content">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard Overview
          </h2>
          {/* Additional content can go here */}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
