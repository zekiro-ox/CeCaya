import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./config/firebase";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import Logo from "./assets/CCECAYALOGO.png";
import { ToastContainer, toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA component
import "react-toastify/dist/ReactToastify.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false); // CAPTCHA state
  const navigate = useNavigate();

  // Load lockout time from local storage on component mount
  useEffect(() => {
    const savedLockoutTime = localStorage.getItem("lockoutTime");
    if (savedLockoutTime) {
      setLockoutTime(Number(savedLockoutTime));
    }
  }, []);

  useEffect(() => {
    if (lockoutTime && Date.now() < lockoutTime) {
      const interval = setInterval(() => {
        const timeLeft = lockoutTime - Date.now();
        if (timeLeft <= 0) {
          setLockoutTime(null);
          setRemainingTime(null);
          localStorage.removeItem("lockoutTime");
          clearInterval(interval);
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000)); // Convert milliseconds to seconds
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 60000);
      toast.error(
        `Account locked. Please try again after ${remainingTime} minutes.`,
        {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(153 27 27)", color: "white" },
        }
      );
      return;
    }

    if (failedAttempts >= 3 && !captchaVerified) {
      toast.error("Please verify the CAPTCHA before logging in.", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(153 27 27)", color: "white" },
      });
      return;
    }

    setLoading(true);

    try {
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );

      const user = userCredential.user;

      // Check if the user is a superAdmin first
      const superAdminRef = collection(db, "superAdmin");
      const superAdminQuery = query(
        superAdminRef,
        where("uid", "==", user.uid)
      );
      const superAdminSnap = await getDocs(superAdminQuery);

      if (!superAdminSnap.empty) {
        // SuperAdmin can log in without email verification
        toast.success("Super Admin Login Successful!", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(63 98 18)", color: "white" },
        });

        onLogin("superadmin");
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
        return;
      }

      // If the user is not a superAdmin, enforce email verification for professor/student
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.warn(
          "A verification email has been sent to your email address. Please verify before logging in.",
          {
            position: "top-right",
            autoClose: 5000,
            style: { backgroundColor: "rgb(202 138 4)", color: "white" },
          }
        );
        auth.signOut(); // Sign out unverified user
        setLoading(false);
        return;
      }

      // Check if the user is a professor
      const professorRef = collection(db, "professor");
      const professorQuery = query(professorRef, where("uid", "==", user.uid));
      const professorSnap = await getDocs(professorQuery);

      if (!professorSnap.empty) {
        toast.success("Professor Login Successful!", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(63 98 18)", color: "white" },
        });

        onLogin("professor");
        setTimeout(() => {
          navigate("/professor-dashboard");
        }, 3000);
        return;
      }

      // Check if the user is a student
      const studentRef = collection(db, "student");
      const studentQuery = query(studentRef, where("uid", "==", user.uid));
      const studentSnap = await getDocs(studentQuery);

      if (!studentSnap.empty) {
        toast.success("Student Login Successful!", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(63 98 18)", color: "white" },
        });

        onLogin("student");
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 3000);
        return;
      }

      // Unauthorized user
      toast.error("Unauthorized access!", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(153 27 27)", color: "white" },
      });
      auth.signOut();
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);

      if (failedAttempts + 1 >= 3) {
        const lockTime = Date.now() + 10 * 60 * 1000; // Lockout for 10 minutes
        setLockoutTime(lockTime);
        localStorage.setItem("lockoutTime", lockTime);
        setFailedAttempts(0);
        toast.error(
          "Too many failed attempts. You are locked out for 10 minutes.",
          {
            position: "top-right",
            autoClose: 3000,
            style: { backgroundColor: "rgb(153 27 27)", color: "white" },
          }
        );
      } else {
        toast.error("Invalid credentials. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "rgb(153 27 27)", color: "white" },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // CAPTCHA verification handler
  const handleCaptchaVerify = (value) => {
    if (value) {
      setCaptchaVerified(true);
      toast.success("CAPTCHA verified!", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "rgb(63 98 18)", color: "white" },
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
          {lockoutTime && Date.now() < lockoutTime && (
            <div className="mb-4 text-red-500 text-sm">
              Account locked. Please try again after{" "}
              {Math.ceil((lockoutTime - Date.now()) / 60000)} minutes.
            </div>
          )}
          {failedAttempts >= 3 && (
            <ReCAPTCHA
              sitekey="6LdOvLAqAAAAAAR158NGCeeHPJQGe4jElBvbLe2B" // Replace with your site key
              onChange={handleCaptchaVerify}
            />
          )}
          <button
            type="submit"
            className="w-full bg-lime-800 text-white py-2 rounded-md hover:bg-lime-900 transition duration-200"
            disabled={loading || (lockoutTime && Date.now() < lockoutTime)} // Disable button if locked out
          >
            {lockoutTime && Date.now() < lockoutTime ? (
              <div>Locked out for {remainingTime} seconds</div>
            ) : loading ? (
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
