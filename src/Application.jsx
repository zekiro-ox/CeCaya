import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";

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

const Application = () => {
  const [applications, setApplications] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]); // Dynamically updated courses
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    logo: null,
    applicationName: "",
    status: "",
    institute: "",
    course: "",
    description: "",
    uploader: "", // New field
  });

  const [viewApplication, setViewApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [professors, setProfessors] = useState([]);
  const totalRecords = applications.length;
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [modalAction, setModalAction] = useState(null); // Action to confirm (save or delete)
  const [applicationToDelete, setApplicationToDelete] = useState(null);

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
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedInstitute]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const professorSnapshot = await getDocs(collection(db, "professor"));
        const professorList = professorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfessors(professorList);
      } catch (error) {
        console.error("Error fetching professors:", error);
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "applications"));
        const appList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(appList);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

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

  const handleAddApplication = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Prevent default only if event exists

    try {
      const docRef = await addDoc(collection(db, "applications"), formData);
      setApplications([...applications, { id: docRef.id, ...formData }]);
      setFormData({
        logo: null,
        applicationName: "",
        status: "",
        institute: "",
        course: "",
        description: "",
        uploader: "",
      });
      showToast("Added successfully!", "success");
    } catch (error) {
      console.error("Error adding application:", error);
      showToast("Error adding.", "error");
    }
  };

  const handleEditRecord = (application) => {
    setEditingRecord(application.id);

    // Set the selected institute ID to load its courses
    const selectedInstitute = institutes.find(
      (institute) => institute.id === application.institute
    );
    if (selectedInstitute) {
      setSelectedInstitute(selectedInstitute.id);
    }

    // Fetch courses dynamically for the selected institute
    const fetchCoursesForEdit = async () => {
      try {
        const snapshot = await getDocs(coursesRef);
        const fetchedCourses = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((course) => course.foreignKey === application.institute);

        setCourses(fetchedCourses);

        // Set formData including the selected course
        setFormData({
          ...application,
          course: application.course, // Ensure the course is pre-selected
        });
      } catch (error) {
        console.error("Error fetching courses during edit:", error);
      }
    };

    fetchCoursesForEdit();
  };

  const handleSaveChanges = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Prevent default behavior if `e` exists

    try {
      const appRef = doc(db, "applications", editingRecord);
      await updateDoc(appRef, formData);

      setApplications(
        applications.map((app) =>
          app.id === editingRecord ? { id: editingRecord, ...formData } : app
        )
      );
      setEditingRecord(null);
      setFormData({
        logo: null,
        applicationName: "",
        status: "",
        institute: "",
        course: "",
        description: "",
        uploader: "",
      });
      setIsModalOpen(false);
      showToast("Save changes successfully!", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast("Error saving.", "error");
    }
  };

  const handleRemoveApplication = async () => {
    if (!applicationToDelete || !applicationToDelete.id) {
      console.error("No application selected for deletion.");
      return;
    }

    try {
      await deleteDoc(doc(db, "applications", applicationToDelete.id));
      setApplications(
        applications.filter((app) => app.id !== applicationToDelete.id)
      );
      setIsModalOpen(false);
      showToast("Deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting application:", error);
      showToast("Error deleting", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "institute") {
      setSelectedInstitute(value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        institute: value,
        course: "", // Reset course when the institute changes
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", "cecaya_preset"); // Replace with your actual preset name
    uploadFormData.append("folder", "applications"); // Optional: specify a folder in Cloudinary

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dqslazit0/image/upload", // Replace with your cloud name
        uploadFormData
      );

      const fileUrl = response.data.secure_url; // Get the URL of the uploaded image
      setFormData((prevFormData) => ({
        ...prevFormData,
        logo: fileUrl, // Save the Cloudinary URL
      }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      toast.error("Failed to upload file. Please try again.");
    }
  };

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

  const currentApplications = applications.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleViewApplication = (application) => {
    setViewApplication(application);
    setShowModal(true);
  };
  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Application Management
          </h1>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Application Logo
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Application Name
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
            {currentApplications.map((application, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {application.id}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <img
                    src={application.logo}
                    alt="logo"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {application.applicationName}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {application.status}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewApplication(application)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(application)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      if (!application) {
                        console.error("Application is undefined.");
                        return;
                      }
                      setApplicationToDelete(application);
                      setModalAction("delete");
                      setIsModalOpen(true);
                    }}
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
          {editingRecord ? "Edit Application" : "Add New Application"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form behavior
            // Show the modal instead of directly submitting
            setModalAction(editingRecord ? "save" : "add");
            setIsModalOpen(true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute
            </label>
            <select
              name="institute"
              value={formData.institute}
              onChange={handleInputChange}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <input
              type="text"
              name="applicationName"
              value={formData.applicationName}
              onChange={handleInputChange}
              placeholder="Enter application name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Logo
            </label>
            {editingRecord && formData.logo && (
              <div className="mb-2">
                <img
                  src={formData.logo}
                  alt="Current logo"
                  className="h-16 w-16 object-cover mb-2"
                />
                <p className="text-sm text-gray-500">
                  (Current logo - upload a new one if you wish to replace it.)
                </p>
              </div>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!editingRecord} // Only required when adding a new application
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a description for the application"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Uploader
            </label>
            <select
              name="uploader"
              value={formData.uploader}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select Uploader
              </option>
              {professors.map((professor) => (
                <option
                  key={professor.id}
                  value={`${professor.firstName} ${professor.lastName}`}
                >
                  {professor.firstName} {professor.lastName}
                </option>
              ))}
            </select>
          </div>
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
              <option value="Approved">Approved</option>
              <option value="Not Approved">Not Approved</option>
            </select>
          </div>
          <button
            type="button" // Change to "button" to prevent form submission
            className="w-full bg-lime-800 text-white p-2 rounded hover:bg-lime-900"
            onClick={() => {
              setModalAction(editingRecord ? "save" : "add");
              setIsModalOpen(true); // Open the modal
            }}
          >
            {editingRecord ? "Save Changes" : "Add Application"}
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Application Details
            </h2>
            <p>
              <strong>ID:</strong> {viewApplication.id}
            </p>
            <p>
              <strong>Application Logo:</strong>{" "}
              <img
                src={viewApplication.logo}
                alt="logo"
                className="h-24 w-24 object-cover"
              />
            </p>
            <p>
              <strong>Application Name:</strong>{" "}
              {viewApplication.applicationName}
            </p>
            <p>
              <strong>Description:</strong> {viewApplication.description}
            </p>
            <p>
              <strong>Uploader:</strong> {viewApplication.uploader}
            </p>

            <p>
              <strong>Status:</strong> {viewApplication.status}
            </p>
            <p>
              <strong>Institute:</strong> {viewApplication.institute}
            </p>
            <p>
              <strong>Course:</strong> {viewApplication.course}
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
      <Modal
        isOpen={isModalOpen}
        message={
          modalAction === "delete"
            ? "Are you sure you want to delete this application?"
            : modalAction === "save"
            ? "Are you sure you want to save changes?"
            : "Are you sure you want to add this application?"
        }
        onClose={() => setIsModalOpen(false)} // Close modal without action
        onConfirm={() => {
          if (modalAction === "delete") handleRemoveApplication();
          if (modalAction === "save") {
            setIsModalOpen(false); // Close modal first
            handleSaveChanges(); // Then save changes
          }
          if (modalAction === "add") {
            setIsModalOpen(false); // Close modal first
            handleAddApplication(); // Then add the application
          }
        }}
      />
    </main>
  );
};

export default Application;
