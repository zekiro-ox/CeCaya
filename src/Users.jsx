// src/components/User.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { auth, db } from "./config/firebase"; // Import Firebase config
import { createUserWithEmailAndPassword } from "firebase/auth";
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
    status: "",
    institute: "",
    course: "",
    userType: "",
  });

  const [viewUser, setViewUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = users.length;

  const [institutes, setInstitutes] = useState([]); // To store institute data
  const [filteredCourses, setFilteredCourses] = useState([]);
  const userTypes = ["Admin", "Professor"];
  const statusOptions = ["Approved", "Not Approved"];
  const institutesCollectionRef = collection(db, "institutes");

  // References to Firestore collections
  const adminCollectionRef = collection(db, "admin");
  const professorCollectionRef = collection(db, "professor");
  const countersCollectionRef = collection(db, "counters");

  // Fetch users from Firestore on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch Admin Users
        const adminSnapshot = await getDocs(adminCollectionRef);
        const adminUsers = adminSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch Professor Users
        const professorSnapshot = await getDocs(professorCollectionRef);
        const professorUsers = professorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine both Admin and Professor users
        setUsers([...adminUsers, ...professorUsers]);
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
        const snapshot = await getDocs(institutesCollectionRef);
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

  // Handle institute selection
  const handleInstituteChange = (e) => {
    const selectedInstitute = e.target.value;
    setFormData({ ...formData, institute: selectedInstitute, course: "" }); // Reset course selection

    // Find the selected institute and its courses
    const institute = institutes.find(
      (inst) => inst.name === selectedInstitute
    );
    setFilteredCourses(institute ? institute.courses : []);
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
      !formData.status ||
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
        formData.userType === "Admin"
          ? adminCollectionRef
          : professorCollectionRef;

      // Generate formatted ID (A0001 or P0001)
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
        status: formData.status,
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
        status: "",
        institute: "",
        course: "",
        userType: "",
      });
      alert("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error.message);
      alert(`Error adding user: ${error.message}`);
    }
  };
  // Function to generate formatted ID
  const generateFormattedId = async (userType) => {
    const counterDocId = userType === "Admin" ? "admin" : "professor";

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
        const prefix = userType === "Admin" ? "A" : "P";
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
      status: user.status || "",
      institute: user.institute || "",
      course: user.course || "",
      userType: user.userType || "",
    });

    // Prepopulate courses based on the institute
    setFilteredCourses(selectedInstitute ? selectedInstitute.courses : []);
  };

  // Handle saving changes after editing
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.status ||
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
        userType === "Admin" ? adminCollectionRef : professorCollectionRef;

      // Update user data in Firestore
      await updateDoc(doc(db, userCollection.path, editingRecord), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        // Email is not editable in this form
        status: formData.status,
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
        status: "",
        institute: "",
        course: "",
        userType: "",
      });
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error.message);
      alert(`Error updating user: ${error.message}`);
    }
  };

  const handleRemoveUser = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        // Determine collection based on user type
        const userCollection =
          user.userType === "Admin"
            ? adminCollectionRef
            : professorCollectionRef;

        // Delete user from Firestore
        await deleteDoc(doc(db, userCollection.path, user.id));

        // Do not decrement the counter to prevent ID reuse issues
        // Counters should only increment for new users and not be adjusted for deletions

        // Update local state
        setUsers(users.filter((u) => u.id !== user.id));

        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error.message);
        alert(`Error deleting user: ${error.message}`);
      }
    }
  };

  // Handle viewing a user's details
  const handleViewUser = (user) => {
    setViewUser(user);
    setShowModal(true);
  };

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

  const currentUsers = users.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            User Management
          </h1>
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
                Status
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
                <td className="border border-gray-200 px-4 py-2">
                  {user.status}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!editingRecord} // Required only if adding
              disabled={editingRecord !== null} // Disable if editing
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!editingRecord} // Required only if adding
              disabled={editingRecord !== null} // Disable if editing
            />
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
              <option value="">Select Institute</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.name}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              disabled={!filteredCourses.length}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required // Disable if no courses are available
            >
              <option value="">Select Course</option>
              {filteredCourses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select Status
              </option>
              {statusOptions.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

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
              <strong>Status:</strong> {viewUser.status}
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
