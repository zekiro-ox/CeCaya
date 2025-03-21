// src/components/User.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdLockReset } from "react-icons/md";
import { auth, db } from "./config/firebase"; // Import Firebase config
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    institute: "",
    course: "",
    userType: "",
  });

  const [viewUser, setViewUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All"); // Added filter state
  const [searchQuery, setSearchQuery] = useState("");
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = users.length;
  const [institutes, setInstitutes] = useState([]); // To store institute data
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const userTypes = ["Student", "Professor"];
  const studentCollectionRef = collection(db, "student");
  const professorCollectionRef = collection(db, "professor");
  const countersCollectionRef = collection(db, "counters");
  const [courses, setCourses] = useState([]);

  // Fetch users from Firestore on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch Student Users
        const studentSnapshot = await getDocs(studentCollectionRef);
        const studentUsers = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch Professor Users
        const professorSnapshot = await getDocs(professorCollectionRef);
        const professorUsers = professorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine both Student and Professor users
        setUsers([...studentUsers, ...professorUsers]);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "institutes"));
        const fetchedInstitutes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutes(fetchedInstitutes);
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };

    fetchInstitutes();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.institute) return;

      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const filteredCourses = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((course) => course.foreignKey === formData.institute);

        setCourses(filteredCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [formData.institute]);

  const showToast = (message, type) => {
    if (type === "success") {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
      });
    } else if (type === "error") {
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Updated handleInstituteChange to use ID
  const handleInstituteChange = (e) => {
    const selectedInstituteId = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      institute: selectedInstituteId,
      course: "", // Reset course when the institute changes
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.institute ||
      !formData.course ||
      !formData.userType
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;

      // Determine collection based on user type
      const userCollection =
        formData.userType === "Student"
          ? studentCollectionRef
          : professorCollectionRef;

      // Generate formatted ID (S0001 or P0001)
      const formattedId = await generateFormattedId(formData.userType);

      // Save user data to Firestore with formatted ID
      await setDoc(doc(db, userCollection.path, formattedId), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        uid: uid,
        institute: formData.institute,
        course: formData.course,
        userType: formData.userType,
      });

      // Update local state for UI purposes
      setUsers([...users, { id: formattedId, ...formData, uid: uid }]);

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        institute: "",
        course: "",
        userType: "",
      });
      showToast("User added successfully!", "success");
    } catch (error) {
      console.error("Error adding user:", error.message);
      showToast("Error adding user.", "error");
    }
  };
  // Function to generate formatted ID
  const generateFormattedId = async (userType) => {
    const counterDocId = userType === "Student" ? "student" : "professor";

    try {
      const newId = await runTransaction(db, async (transaction) => {
        const counterDocRef = doc(countersCollectionRef, counterDocId);
        const counterDoc = await transaction.get(counterDocRef);

        if (!counterDoc.exists()) {
          throw new Error("Counter document does not exist!");
        }

        const currentId = counterDoc.data().lastId;
        const updatedId = currentId + 1;
        transaction.update(counterDocRef, { lastId: updatedId });

        // Format ID with prefix and leading zeros
        const prefix = userType === "Student" ? "S" : "P";
        const formattedId = `${prefix}${updatedId.toString().padStart(4, "0")}`;
        return formattedId;
      });

      return newId;
    } catch (error) {
      console.error("Error generating formatted ID:", error);
      throw error;
    }
  };

  // Handle editing a user
  const handleEditRecord = (user) => {
    setEditingRecord(user.id);

    // Find the institute to prepopulate courses
    const selectedInstitute = institutes.find(
      (inst) => inst.name === user.institute
    );

    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "", // Email is not editable
      password: "", // Password is not editable here
      confirmPassword: "",
      institute: user.institute || "",
      course: user.course || "",
      userType: user.userType || "",
    });

    // Prepopulate courses based on the institute
    setCourses(selectedInstitute ? selectedInstitute.courses : []);
  };

  // Handle saving changes after editing
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.institute ||
      !formData.course ||
      !formData.userType
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Determine collection based on user type
      const userType = formData.userType;
      const userCollection =
        userType === "Student" ? studentCollectionRef : professorCollectionRef;

      // Update user data in Firestore
      await updateDoc(doc(db, userCollection.path, editingRecord), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        // Email is not editable in this form
        institute: formData.institute,
        course: formData.course,
        userType: formData.userType,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editingRecord ? { ...user, ...formData } : user
        )
      );

      // Clear form and editing state
      setEditingRecord(null);
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",

        institute: "",
        course: "",
        userType: "",
      });
      showToast("User updated successfully!", "success");
    } catch (error) {
      console.error("Error updating user:", error.message);
      showToast("Error updating user.", "error");
    }
  };

  const handleRemoveUser = async (user) => {
    const currentUser = auth.currentUser; // Get the logged-in user from Firebase Authentication

    // Prevent student from deleting their own account
    if (currentUser && currentUser.uid === user.uid) {
      showToast("You cannot delete your own account!", "error");
      return; // Exit the function if the user is trying to delete their own account
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        // Determine collection based on user type
        const userCollection =
          user.userType === "Student"
            ? studentCollectionRef
            : professorCollectionRef;

        // Delete user from Firestore
        await deleteDoc(doc(db, userCollection.path, user.id));

        // Do not decrement the counter to prevent ID reuse issues
        // Counters should only increment for new users and not be adjusted for deletions

        // Update local state
        setUsers(users.filter((u) => u.id !== user.id));

        showToast("User deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting user:", error.message);
        showToast("Error deleting the user.", "error");
      }
    }
  };

  const handleResetPassword = async (userEmail) => {
    try {
      await sendPasswordResetEmail(auth, userEmail);
      showToast("Successfully sent a password reset email", "success");
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      showToast("Failed to send password reset email", "success");
    }
  };

  // Handle viewing a user's details
  const handleViewUser = (user) => {
    setViewUser(user);
    setShowModal(true);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Pagination Logic
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalRecords / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when changing records per page
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  // Filter users based on the selected filter
  const filteredUsers = users.filter((user) => {
    if (filter !== "All" && user.userType !== filter) return false;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            User Management
          </h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 border rounded-md"
            />
            <button
              className={`px-4 py-2 rounded ${
                filter === "Student" ? "bg-lime-800 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleFilterChange("Student")}
            >
              Student
            </button>
            <button
              className={`px-4 py-2 rounded ${
                filter === "Professor"
                  ? "bg-lime-800 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => handleFilterChange("Professor")}
            >
              Professor
            </button>
            <button
              className={`px-4 py-2 rounded ${
                filter === "All" ? "bg-lime-800 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleFilterChange("All")}
            >
              All
            </button>
          </div>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Email
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">{user.id}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.firstName} {user.lastName}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.email}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewUser(user)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(user)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleResetPassword(user.email)}
                    className="bg-blue-800 text-white p-2 rounded hover:bg-blue-900 flex items-center"
                  >
                    <MdLockReset />
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user)}
                    className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <label
              htmlFor="recordsPerPage"
              className="text-sm font-medium text-gray-700"
            >
              Records Per Page:
            </label>
            <select
              id="recordsPerPage"
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="ml-2 p-2 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * recordsPerPage >= totalRecords}
              className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editingRecord ? "Edit User" : "Add New User"}
        </h2>
        <form
          onSubmit={editingRecord ? handleSaveChanges : handleAddUser}
          className="space-y-4"
        >
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
              disabled={editingRecord !== null} // Disable if editing
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!editingRecord} // Required only if adding
              disabled={editingRecord !== null} // Disable if editing
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!editingRecord} // Required only if adding
              disabled={editingRecord !== null} // Disable if editing
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
              disabled={editingRecord !== null} // Disable if editing
            >
              <option value="" disabled>
                Select User Type
              </option>
              {userTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Institute */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute
            </label>
            <select
              name="institute"
              value={formData.institute}
              onChange={handleInstituteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select Institute
              </option>
              {institutes.map((institute) => (
                <option key={institute.id} value={institute.id}>
                  {institute.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2 ${
                !formData.institute ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              required
              disabled={!formData.institute}
            >
              <option value="" disabled>
                Select Course
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-lime-800 text-white p-2 rounded hover:bg-lime-900"
          >
            {editingRecord ? "Save Changes" : "Add User"}
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              User Details
            </h2>
            <p>
              <strong>ID:</strong> {viewUser.id}
            </p>
            <p>
              <strong>Name:</strong> {viewUser.firstName} {viewUser.lastName}
            </p>
            <p>
              <strong>Username:</strong> {viewUser.username}
            </p>
            <p>
              <strong>Email:</strong> {viewUser.email}
            </p>

            <p>
              <strong>Institute:</strong> {viewUser.institute}
            </p>
            <p>
              <strong>Course:</strong> {viewUser.course}
            </p>
            <p>
              <strong>User Type:</strong> {viewUser.userType}
            </p>
            <button
              className="mt-4 bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default User;
