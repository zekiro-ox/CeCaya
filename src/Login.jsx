import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./assets/CCECAYALOGO.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "test" && password === "password") {
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(63 98 18)", color: "white" },
      });
      onLogin();
      setTimeout(() => {
        navigate("/dashboard"); // Navigate to the dashboard
      }, 3000);
    } else {
      toast.error("Invalid username or password!", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(153 27 27)", color: "white" },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={Logo}
            alt="City College of Angeles Logo"
            className="w-20 h-20 mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">CceCaya</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            />
            <label className="text-sm text-gray-600">Show password</label>
          </div>
          <button
            type="submit"
            className="w-full bg-lime-800 text-white py-2 rounded-md hover:bg-lime-900 transition duration-200"
          >
            Login
          </button>
        </form>
        <footer className="text-center text-sm text-gray-500 mt-6">
          © 2024 CceCaya • All Rights Reserved
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
