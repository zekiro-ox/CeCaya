import React, { useState, useEffect } from "react";
import { db } from "./config/firebase"; // Ensure this is correctly set up
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";
import ICSLISLogo from "./assets/icslis.png";
import IBMLogo from "./assets/ibm.png";
import IEASLogo from "./assets/ieas.png";

const Modal = ({ isOpen, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-1/3">
        <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        <div className="mt-4 flex justify-between space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-800 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Record = () => {
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foreignKey, setForeignKey] = useState(1); // Track the increment value
  const [formData, setFormData] = useState({ courseName: "", description: "" });
  const [editingCourse, setEditingCourse] = useState(null); // To track the course being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [modalAction, setModalAction] = useState(null); // Action to confirm (save or delete)
  const [courseToDelete, setCourseToDelete] = useState(null); // Course to delete

  const institutesRef = collection(db, "institutes");
  const coursesRef = collection(db, "courses");

  // Fetch Institutes from Firestore
  useEffect(() => {
    const fetchInstitutes = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(institutesRef);
        const fetchedInstitutes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutes(fetchedInstitutes);
      } catch (error) {
        console.error("Error fetching institutes: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutes();
  }, []);

  // Fetch Courses when an Institute is Selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitute) return;

      setLoading(true);
      try {
        const snapshot = await getDocs(coursesRef);
        const fetchedCourses = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((course) => course.foreignKey === selectedInstitute);
        setCourses(fetchedCourses);

        // Find the current foreignKey increment
        const maxKey = Math.max(
          ...fetchedCourses.map((course) =>
            parseInt(course.id.split("-")[1] || "0")
          ),
          0
        );
        setForeignKey(maxKey + 1);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedInstitute]);

  // Show Toast Notification
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

  // Handle Course Addition
  const handleAddCourse = async () => {
    if (!selectedInstitute || !formData.courseName.trim()) {
      showToast("Please select an institute and enter a course name.", "error");
      return;
    }

    const courseId = `${selectedInstitute}-${String(foreignKey).padStart(
      3,
      "0"
    )}`;
    const courseRef = doc(db, "courses", courseId);

    const newCourse = {
      name: formData.courseName,
      description: formData.description, // Include description
      foreignKey: selectedInstitute,
    };

    try {
      await setDoc(courseRef, newCourse);
      setCourses((prev) => [...prev, { id: courseId, ...newCourse }]);
      setForeignKey((prev) => prev + 1);
      setFormData({ courseName: "", description: "" });
      showToast("Course added successfully!", "success");
    } catch (error) {
      console.error("Error adding course: ", error);
      showToast("Error adding course.", "error");
    }
  };

  // Handle Course Edit
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({ courseName: course.name, description: course.description });
  };

  const handleSaveChanges = async () => {
    try {
      const courseRef = doc(db, "courses", editingCourse.id);

      const docSnapshot = await getDoc(courseRef);
      if (!docSnapshot.exists()) {
        showToast("The course does not exist in the database.", "error");
        return;
      }

      await updateDoc(courseRef, {
        name: formData.courseName,
        description: formData.description,
      });

      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id
            ? {
                ...course,
                name: formData.courseName,
                description: formData.description,
              }
            : course
        )
      );

      setEditingCourse(null);
      setFormData({ courseName: "", description: "" });
      showToast("Course updated successfully!", "success");
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error updating course: ", error);
      showToast("Error updating course.", "error");
    }
  };

  // Handle Course Deletion
  const handleDeleteCourse = async () => {
    try {
      const courseRef = doc(db, "courses", courseToDelete.id);
      await deleteDoc(courseRef);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
      showToast("Course deleted successfully!", "success");
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error deleting course: ", error);
      showToast("Error deleting course.", "error");
    }
  };

  const renderInstituteLogo = (instituteId) => {
    switch (instituteId) {
      case "ICSLIS":
        return (
          <img
            src={ICSLISLogo}
            alt="ICSLIS Logo"
            className="h-16 rounded-full"
          />
        );
      case "IBM":
        return (
          <img src={IBMLogo} alt="IBM Logo" className="h-16 rounded-full" />
        );
      case "IEAS":
        return (
          <img src={IEASLogo} alt="IEAS Logo" className="h-16 rounded-full" />
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Academic Management
          </h1>
          {selectedInstitute && renderInstituteLogo(selectedInstitute)}
        </header>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Select Institute
              </label>
              <select
                value={selectedInstitute}
                onChange={(e) => setSelectedInstitute(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full shadow"
              >
                <option value="">Select an institute</option>
                {institutes.map((institute) => (
                  <option key={institute.id} value={institute.id}>
                    {institute.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedInstitute && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Courses for{" "}
                  {institutes.find((i) => i.id === selectedInstitute)?.name}
                </h2>
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                        ID
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                        Name
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                        Description
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">
                          {course.id}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {course.name}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {course.description}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex space-x-2">
                            <button
                              className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                              onClick={() => handleEditCourse(course)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center"
                              onClick={() => {
                                setCourseToDelete(course);
                                setModalAction("delete");
                                setIsModalOpen(true);
                              }}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <section className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editingCourse ? "Edit Course" : "Add Course"}
        </h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData,
                  courseName: e.target.value,
                }))
              }
              placeholder="Enter course name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData,
                  description: e.target.value,
                }))
              }
              placeholder="Enter course description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
            onClick={handleAddCourse} // Directly call handleAddCourse
          >
            {editingCourse ? "Save Changes" : "Add Course"}
          </button>
        </form>
      </section>

      <Modal
        isOpen={isModalOpen}
        message={
          modalAction === "delete"
            ? "Are you sure you want to delete this course?"
            : "Are you sure you want to save changes?"
        }
        onClose={() => setIsModalOpen(false)}
        onConfirm={
          modalAction === "delete" ? handleDeleteCourse : handleSaveChanges
        }
      />
    </main>
  );
};

export default Record;
