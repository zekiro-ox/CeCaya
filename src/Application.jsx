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
  });
  const [viewApplication, setViewApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = applications.length;

  // Fetch institutes and applications
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "institutes"));
        const instituteList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutes(instituteList); // Keep the full data to access courses later
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };

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

    fetchInstitutes();
    fetchApplications();
  }, []);

  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "applications"), formData);
      setApplications([...applications, { id: docRef.id, ...formData }]);
      setFormData({
        logo: null,
        applicationName: "",
        status: "",
        institute: "",
        course: "",
      });
    } catch (error) {
      console.error("Error adding application:", error);
    }
  };

  const handleEditRecord = (application) => {
    setEditingRecord(application.id);

    // Find the selected institute and pre-populate courses
    const selectedInstitute = institutes.find(
      (inst) => inst.name === application.institute
    );

    setCourses(selectedInstitute?.courses || []); // Set courses based on the institute
    setFormData({
      ...application, // Retain the existing form data
      logo: application.logo, // Ensure the logo URL is set
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
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
      });
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleRemoveApplication = async (id) => {
    try {
      await deleteDoc(doc(db, "applications", id));
      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "institute") {
      const selectedInstitute = institutes.find((inst) => inst.name === value);
      setCourses(selectedInstitute?.courses || []);

      // Reset the course only if a new institute is selected
      setFormData((prevFormData) => ({
        ...prevFormData,
        institute: value,
        course: prevFormData.institute === value ? prevFormData.course : "", // Reset course if the institute changes
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const uploadFormData = new FormData();

    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", "cecaya_preset"); // Replace with your Cloudinary upload preset
    uploadFormData.append("folder", "applications"); // Optional: specify a folder in Cloudinary

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dqslazit0/image/upload`, // Replace with your Cloudinary cloud name
        uploadFormData
      );

      const fileUrl = response.data.secure_url; // Get the URL of the uploaded image
      setFormData((prevFormData) => ({
        ...prevFormData,
        logo: fileUrl, // Save the Cloudinary URL
      }));
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
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
      {/* Table Section */}
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
                    className="h-8 w-8 object-cover"
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
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
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
                    onClick={() => handleRemoveApplication(application.id)}
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
          onSubmit={editingRecord ? handleSaveChanges : handleAddApplication}
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
              {institutes.map((institute, index) => (
                <option key={index} value={institute.name}>
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
              disabled={!formData.institute} // Disable if no institute selected
            >
              <option value="" disabled>
                Select Course
              </option>
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
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
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-l ime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
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
            type="submit"
            className="w-full bg-lime-800 text-white p-2 rounded hover:bg-lime-900"
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
    </main>
  );
};

export default Application;
