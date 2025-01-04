import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Logo from "./assets/CCECAYALOGO.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    try {
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username, // Firebase expects email as the username
        password
      );

      const user = userCredential.user;

      // Fetch the superAdmin document
      const superAdminRef = doc(db, "superAdmin", "1001");
      const superAdminSnap = await getDoc(superAdminRef);
      const isSuperAdmin =
        superAdminSnap.exists() && superAdminSnap.data().uid === user.uid;

      // Query the admin collection for a matching uid
      const adminRef = collection(db, "admin");
      const adminQuery = query(adminRef, where("uid", "==", user.uid));
      const adminSnap = await getDocs(adminQuery);
      const isAdmin = !adminSnap.empty; // If any document matches, `isAdmin` is true

      if (isSuperAdmin || isAdmin) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(63 98 18)", color: "white" },
        });

        onLogin();
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        toast.error("Unauthorized access!", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(153 27 27)", color: "white" },
        });
        auth.signOut(); // Sign out unauthorized users
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(153 27 27)", color: "white" },
      });
    } finally {
      setLoading(false); // Stop loading once the login attempt is complete
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
              Email
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email"
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
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin border-4 border-t-transparent border-lime-400 rounded-full w-5 h-5 mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
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
