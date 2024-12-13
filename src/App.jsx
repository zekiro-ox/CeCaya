import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./Login";
import Dashboard from "./Dashboard";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Record from "./Record";

function ProtectedLayout({ onLogout }) {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };

  const handleResize = () => {
    const isNowMobile = window.innerWidth <= 768;
    setIsMobile(isNowMobile);
    if (!isNowMobile) {
      setIsSidebarHidden(false); // Ensure sidebar is visible on larger screens
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen">
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-10 transition-transform duration-500 ease-in-out ${
          isSidebarHidden && isMobile ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <Sidebar />
      </div>
      <div
        className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
          isSidebarHidden && isMobile ? "ml-0" : "ml-64"
        }`}
      >
        <Header onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/record" element={<Record />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <ProtectedLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
