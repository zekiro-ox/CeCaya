import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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

const Website = () => {
  const [websites, setWebsites] = useState([]);
  const [formData, setFormData] = useState({
    logo: null,
    websiteName: "",
    websiteLink: "",
    status: "",
    institute: "",
    course: "",
    description: "",
    uploader: "", // Add description field
  });

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewWebsite, setViewWebsite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = websites.length;

  const [institutesData, setInstitutesData] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const websitesRef = collection(db, "website");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // Fetch websites from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const [websitesSnapshot, professorsSnapshot] = await Promise.all([
        getDocs(websitesRef),
        getDocs(collection(db, "professor")),
      ]);

      // Map websites data
      const websitesData = websitesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWebsites(websitesData);

      // Map professors data
      const professorsData = professorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
      }));
      setProfessors(professorsData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "institutes"));
        const fetchedInstitutes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutesData(fetchedInstitutes);
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

  // Updated handleInstituteChange to use ID
  const handleInstituteChange = (e) => {
    const selectedInstituteId = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      institute: selectedInstituteId,
      course: "", // Reset course when the institute changes
    }));
  };

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

  // Add new website to Firestore
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    const newWebsite = { ...formData };
    const docRef = await addDoc(websitesRef, newWebsite);
    setWebsites([...websites, { id: docRef.id, ...newWebsite }]);
    setFormData({
      logo: null,
      websiteName: "",
      websiteLink: "",
      status: "",
      institute: "",
      course: "",
      description: "",
      uploader: "", // Reset description
    });
  };

  // Update website in Firestore
  // Delete Confirmation Handler
  const handleDeleteConfirmation = (website) => {
    setModuleToDelete(website); // Set website to delete
    setModalAction("delete"); // Specify the action
    setIsModalOpen(true); // Open modal
  };

  // Save Changes Confirmation Handler
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setModalAction("save"); // Specify the action
    setIsModalOpen(true); // Open modal
  };

  // Confirm Delete Website
  const handleRemoveWebsiteConfirmation = async () => {
    try {
      const websiteDoc = doc(db, "website", moduleToDelete.id);
      await deleteDoc(websiteDoc);

      setWebsites(
        websites.filter((website) => website.id !== moduleToDelete.id)
      );
      setIsModalOpen(false); // Close modal
      showToast("Website deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting website:", error);
      showToast("Error deleting website.", "error");
    }
  };

  // Confirm Save Changes
  const handleSaveChangesConfirmation = async () => {
    try {
      const websiteDoc = doc(db, "website", editingRecord);
      await updateDoc(websiteDoc, formData);

      setWebsites(
        websites.map((website) =>
          website.id === editingRecord
            ? { id: editingRecord, ...formData }
            : website
        )
      );
      setEditingRecord(null);
      setIsModalOpen(false); // Close modal
      showToast("Changes saved successfully!", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast("Error saving changes.", "error");
    }
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // View website details
  const handleViewWebsite = (website) => {
    setViewWebsite(website);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cecaya_preset");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dqslazit0/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            console.log(`Upload Progress: ${progress}%`);
          },
        }
      );

      const logoUrl = response.data.secure_url;
      setFormData({ ...formData, logo: logoUrl });
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
    }
  };
  const handleEditRecord = (website) => {
    setEditingRecord(website.id);

    // Find the institute's courses and populate them
    const selectedInstituteData = institutesData.find(
      (institute) => institute.name === website.institute
    );
    setCourses(selectedInstituteData?.courses || []);

    // Populate the formData with all fields
    setFormData({
      logo: website.logo || null,
      websiteName: website.websiteName || "",
      websiteLink: website.websiteLink || "",
      status: website.status || "",
      institute: website.institute || "",
      course: website.course || "",
      description: website.description || "",
      uploader: website.uploader || "", // Set description
    });
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

  const currentWebsites = websites.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Link Management
          </h1>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Logo
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Link
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
            {currentWebsites.map((website, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {website.id}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <img
                    src={website.logo}
                    alt="logo"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {website.websiteName}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <a
                    href={website.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {website.websiteLink}
                  </a>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {website.status}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewWebsite(website)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(website)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirmation(website)}
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
          {editingRecord ? "Edit Website" : "Add New Website"}
        </h2>
        <form
          onSubmit={editingRecord ? handleSaveChanges : handleAddWebsite}
          className="space-y-4"
        >
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
              {institutesData.map((institute) => (
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
              Name
            </label>
            <input
              type="text"
              name="websiteName"
              value={formData.websiteName}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo
            </label>

            {/* Show the current logo if editing and a logo exists */}
            {formData.logo && (
              <div className="mb-2">
                <img
                  src={formData.logo}
                  alt="Current Logo"
                  className="h-16 w-16 object-cover rounded border"
                />
                <button
                  type="button"
                  className="mt-2 text-red-600 hover:underline text-sm"
                  onClick={() => setFormData({ ...formData, logo: null })}
                >
                  Remove Logo
                </button>
              </div>
            )}

            {/* File input for logo */}
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required={!formData.logo} // Required only if no logo exists
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Link
            </label>
            <input
              type="url"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleInputChange}
              placeholder="Enter link"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
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
              placeholder="Enter a description"
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
                Select professor
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
            type="submit"
            className="w-full bg-lime-800 text-white p-2 rounded hover:bg-lime-900"
          >
            {editingRecord ? "Save Changes" : "Add Link"}
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewWebsite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Details
            </h2>
            <p>
              <strong>ID:</strong> {viewWebsite.id}
            </p>
            <p>
              <strong>Logo:</strong>{" "}
              <img
                src={viewWebsite.logo}
                alt="logo"
                className="h-16 w-16 object-cover"
              />
            </p>
            <p>
              <strong>Name:</strong> {viewWebsite.websiteName}
            </p>
            <p>
              <strong>Link:</strong>{" "}
              <a
                href={viewWebsite.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {viewWebsite.websiteLink}
              </a>
            </p>
            <p>
              <strong>Description:</strong> {viewWebsite.description}
            </p>
            <p>
              <strong>Uploader:</strong> {viewWebsite.uploader}
            </p>
            <p>
              <strong>Status:</strong> {viewWebsite.status}
            </p>
            <p>
              <strong>Institute:</strong> {viewWebsite.institute}
            </p>
            <p>
              <strong>Course:</strong> {viewWebsite.course}
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
            ? "Are you sure you want to delete this website?"
            : "Are you sure you want to save changes?"
        }
        onClose={handleCloseModal}
        onConfirm={
          modalAction === "delete"
            ? handleRemoveWebsiteConfirmation
            : handleSaveChangesConfirmation
        }
      />
    </main>
  );
};

export default Website;
