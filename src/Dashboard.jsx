import React from "react";

const Dashboard = () => {
  return (
    <main
      className="flex-1 p-4 sm:p-6 lg:p-10"
      style={{ backgroundColor: "#f7f9f6" }}
    >
      <header className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
          Welcome Back!
        </h1>
      </header>

      {/* Content Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
            Statistics
          </h2>
          <p className="text-gray-500">Some stats or summary data here.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
            Recent Activities
          </h2>
          <p className="text-gray-500">Overview of recent activities.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
            Notifications
          </h2>
          <p className="text-gray-500">Recent updates and alerts.</p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
