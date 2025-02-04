import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./config/firebase";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { BiSolidArchiveIn } from "react-icons/bi";
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
const ProfessorModule = () => {
  const [modules, setModules] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    subjectCode: "",
    moduleName: "",
    moduleFile: null,
    uploader: "",
    description: "",
  });

  const [viewModule, setViewModule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = modules.length;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const [subjectCodes, setSubjectCodes] = useState([]);
  const [users, setUsers] = useState([""]);
  const [fileSizeError, setFileSizeError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    // Fetch subject codes from Firestore
    const fetchSubjectCodes = async () => {
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const codes = querySnapshot.docs.map((doc) => doc.id); // Extract document IDs
      setSubjectCodes(codes);
    };
    // Fetch admin data from Firestore
    const fetchAdmins = async () => {
      const querySnapshot = await getDocs(collection(db, "professor"));
      const adminData = querySnapshot.docs.map((doc) => {
        const { firstName, lastName } = doc.data();
        return `${firstName} ${lastName}`; // Combine first and last names
      });
      setUsers(adminData);
    };

    fetchSubjectCodes();
    fetchAdmins();
  }, []);

  const fetchProfessorModules = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Get professor's full name
        const professorQuery = query(
          collection(db, "professor"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(professorQuery);

        if (!querySnapshot.empty) {
          const professorData = querySnapshot.docs[0].data();
          const fullName = `${professorData.firstName} ${professorData.lastName}`;

          // Query modules where uploader matches professor's full name
          const modulesQuery = query(
            collection(db, "module"),
            where("uploader", "==", fullName),
            where("archive", "==", false) // Only fetch active modules
          );

          const moduleSnapshot = await getDocs(modulesQuery);
          const moduleData = moduleSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setModules(moduleData);
        }
      } catch (error) {
        console.error("Error fetching professor modules:", error);
      }
    }
  };

  // Run once when the component mounts
  useEffect(() => {
    fetchProfessorModules();
  }, []);
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const fetchProfessorModules = async () => {
        try {
          // Get professor's full name
          const professorQuery = query(
            collection(db, "professor"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(professorQuery);

          if (!querySnapshot.empty) {
            const professorData = querySnapshot.docs[0].data();
            const fullName = `${professorData.firstName} ${professorData.lastName}`;

            // Query modules where uploader matches professor's full name
            const modulesQuery = query(
              collection(db, "module"),
              where("uploader", "==", fullName),
              where("archive", "==", false) // Only fetch active modules
            );

            const moduleSnapshot = await getDocs(modulesQuery);
            const moduleData = moduleSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setModules(moduleData);
          }
        } catch (error) {
          console.error("Error fetching professor modules:", error);
        }
      };

      fetchProfessorModules();
    }
  }, []);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cecaya_preset"); // Replace with your Cloudinary upload preset
    formData.append("folder", "modules"); // Optional: specify a folder in Cloudinary

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dqslazit0/auto/upload`, // Replace with your Cloudinary URL
      formData
    );

    return response.data.secure_url; // Return the file's Cloudinary URL
  };

  const handleAddModule = async (e) => {
    e.preventDefault();

    try {
      const fileUrl = await uploadToCloudinary(formData.moduleFile);

      const docRef = await addDoc(collection(db, "module"), {
        subjectCode: formData.subjectCode,
        moduleName: formData.moduleName,
        moduleFile: { name: formData.moduleFile.name, url: fileUrl },
        uploader: formData.uploader,
        description: formData.description, // Save description
        dateUploaded: new Date().toISOString().split("T")[0],
        archive: false,
      });

      setModules([
        ...modules,
        {
          id: docRef.id,
          subjectCode: formData.subjectCode,
          moduleName: formData.moduleName,
          moduleFile: { name: formData.moduleFile.name, url: fileUrl }, // Store file URL here
          uploader: formData.uploader,
        },
      ]);

      setFormData({
        subjectCode: "",
        moduleName: "",
        moduleFile: null,
        description: "",
        uploader: "",
      });
      showToast("Module added successfully!", "success");
    } catch (error) {
      console.error("Error uploading file or saving module:", error);
      showToast("Error adding module.", "error");
    }
  };

  const handleEditRecord = (module) => {
    setEditingRecord(module.id);
    setFormData({
      subjectCode: module.subjectCode,
      moduleName: module.moduleName,
      moduleFile: module.moduleFile, // Store file URL and name (not the file object)
      uploader: module.uploader,
      description: module.description,
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setModalAction("save"); // Set modal action to save
    setIsModalOpen(true); // Open the modal
  };

  const handleSaveChangesConfirmation = async () => {
    const moduleRef = doc(db, "module", editingRecord);

    try {
      let updatedModuleFile = formData.moduleFile;

      // Handle file upload only if a new file is provided
      if (formData.moduleFile instanceof File) {
        const fileUrl = await uploadToCloudinary(formData.moduleFile);
        updatedModuleFile = { name: formData.moduleFile.name, url: fileUrl };
      }

      const updatedData = {
        subjectCode: formData.subjectCode,
        moduleName: formData.moduleName,
        moduleFile: updatedModuleFile,
        uploader: formData.uploader,
        description: formData.description,
      };

      // Update Firestore document
      await updateDoc(moduleRef, updatedData);

      // Update state
      setModules(
        modules.map((module) =>
          module.id === editingRecord
            ? { id: editingRecord, ...updatedData }
            : module
        )
      );

      setEditingRecord(null);
      setFormData({
        subjectCode: "",
        moduleName: "",
        moduleFile: null,
        uploader: "",
        description: "",
      });
      setIsModalOpen(false); // Close the modal
      showToast("Updated successfully!", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast("Error saving changes.", "error");
    }
  };

  const handleDeleteConfirmation = (module) => {
    setModuleToDelete(module); // Set module to be deleted
    setModalAction("delete"); // Set modal action to delete
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRemoveModule = async () => {
    try {
      await deleteDoc(doc(db, "module", moduleToDelete.id)); // Delete the module from Firestore
      setModules(modules.filter((module) => module.id !== moduleToDelete.id)); // Update the state
      setIsModalOpen(false); // Close the modal after successful deletion
      showToast("Module deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting module:", error);
      showToast("Error deleting module.", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    // Check if the file size is less than or equal to 10MB
    if (file && file.size <= 10 * 1024 * 1024) {
      // 10MB in bytes
      setFileSizeError(""); // Clear error message if file size is valid
      setFormData({
        ...formData,
        moduleFile: file, // Store the raw file for upload
      });
    } else {
      setFileSizeError("The file must be less than or equal to 10MB.");
    }
  };

  const handleArchiveModule = async (module) => {
    try {
      const moduleRef = doc(db, "module", module.id);

      // Update the archive field to true
      await updateDoc(moduleRef, { archive: true });

      // Update the state to reflect the change
      setModules(
        modules.map((mod) =>
          mod.id === module.id ? { ...mod, archive: true } : mod
        )
      );
      fetchProfessorModule();

      showToast("Module archived successfully!", "success");
    } catch (error) {
      console.error("Error archiving module:", error);
      showToast("Error archiving module.", "error");
    }
  };

  const handleNextPage = () => {
    if (currentPage * recordsPerPage < totalRecords) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };
  const handleViewModule = (module) => {
    setViewModule(module);
    setShowModal(true);
  };

  const currentModules = modules.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Module Management
          </h1>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Subject Code
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Module Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Module File
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {module.id}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {module.subjectCode}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {module.moduleName}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <a
                    href={module.moduleFile?.url}
                    download={module.moduleFile?.name}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {module.moduleFile?.name || "No file uploaded"}
                  </a>
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewModule(module)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(module)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center"
                    onClick={() => handleDeleteConfirmation(module)}
                  >
                    <FaTrashAlt />
                  </button>
                  <button
                    className="text-white bg-gray-800 p-2 rounded hover:bg-gray-900 flex items-center"
                    onClick={() => handleArchiveModule(module)}
                  >
                    <BiSolidArchiveIn />
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
          {editingRecord ? "Edit Module" : "Add New Module"}
        </h2>
        <form
          onSubmit={editingRecord ? handleSaveChanges : handleAddModule}
          className="space-y-4"
        >
          <select
            name="subjectCode"
            value={formData.subjectCode}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            required
          >
            <option value="" disabled>
              Select a subject code
            </option>
            {subjectCodes?.length > 0 ? (
              subjectCodes.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No subject codes available
              </option>
            )}
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Module Name
            </label>
            <input
              type="text"
              name="moduleName"
              value={formData.moduleName}
              onChange={handleInputChange}
              placeholder="Enter module name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Module File
            </label>
            {editingRecord && formData.moduleFile ? (
              <div className="mt-2 mb-2">
                <a
                  href={formData.moduleFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {formData.moduleFile.name}
                </a>
                <p className="text-sm text-gray-500">
                  (Current file - upload a new one if you wish to replace it)
                </p>
              </div>
            ) : null}
            <input
              type="file"
              accept=".doc,.docx,.ppt,.pptx,.pdf"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
            {fileSizeError && (
              <p className="text-red-600 text-sm mt-2">{fileSizeError}</p> // Display the error message
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Module Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a description for the module"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-lime-800 text-white p-2 rounded hover:bg-lime-900"
          >
            {editingRecord ? "Save Changes" : "Add Module"}
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Module Details
            </h2>
            <p>
              <strong>ID:</strong> {viewModule.id}
            </p>
            <p>
              <strong>Subject Code:</strong> {viewModule.subjectCode}
            </p>
            <p>
              <strong>Module Name:</strong> {viewModule.moduleName}
            </p>
            <p>
              <strong>Module File:</strong>{" "}
              <a
                href={viewModule.moduleFile.url}
                download={viewModule.moduleFile.name}
                className="text-blue-600 hover:text-blue-800"
              >
                {viewModule.moduleFile.name}
              </a>
            </p>
            <p>
              <strong>Description:</strong> {viewModule.description}
            </p>

            <p>
              <strong>Uploader:</strong> {viewModule.uploader}
            </p>
            <p>
              <strong>Date Uploaded:</strong> {viewModule.dateUploaded}
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
            ? "Are you sure you want to delete this module?"
            : "Are you sure you want to save changes?"
        }
        onClose={handleCloseModal} // Close modal function
        onConfirm={
          modalAction === "delete"
            ? handleRemoveModule
            : handleSaveChangesConfirmation
        }
      />
    </main>
  );
};

export default ProfessorModule;
