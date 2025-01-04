import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import axios from "axios";

const Module = () => {
  const [modules, setModules] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    subjectCode: "",
    moduleName: "",
    moduleFile: null,
    uploader: "",
  });

  const [viewModule, setViewModule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = modules.length;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentModules = modules.slice(indexOfFirstRecord, indexOfLastRecord);
  const [subjectCodes, setSubjectCodes] = useState([]);
  const [users, setUsers] = useState([""]);

  useEffect(() => {
    // Fetch subject codes from Firestore
    const fetchSubjectCodes = async () => {
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const codes = querySnapshot.docs.map((doc) => doc.id); // Extract document IDs
      setSubjectCodes(codes);
    };
    // Fetch admin data from Firestore
    const fetchAdmins = async () => {
      const querySnapshot = await getDocs(collection(db, "admin"));
      const adminData = querySnapshot.docs.map((doc) => {
        const { firstName, lastName } = doc.data();
        return `${firstName} ${lastName}`; // Combine first and last names
      });
      setUsers(adminData);
    };

    fetchSubjectCodes();
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const querySnapshot = await getDocs(collection(db, "module"));
    const moduleData = [];
    querySnapshot.forEach((doc) => {
      moduleData.push({ id: doc.id, ...doc.data() });
    });
    setModules(moduleData);
  };

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
        moduleFile: { name: formData.moduleFile.name, url: fileUrl }, // Store file URL here
        uploader: formData.uploader,
        dateUploaded: new Date().toISOString().split("T")[0],
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
        uploader: "",
      });
    } catch (error) {
      console.error("Error uploading file or saving module:", error);
    }
  };

  const handleEditRecord = (module) => {
    setEditingRecord(module.id);
    setFormData({
      subjectCode: module.subjectCode,
      moduleName: module.moduleName,
      moduleFile: module.moduleFile, // Store file URL and name (not the file object)
      uploader: module.uploader,
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const moduleRef = doc(db, "module", editingRecord);

    try {
      let updatedModuleFile = formData.moduleFile;

      // Check if a new file has been uploaded
      if (formData.moduleFile instanceof File) {
        const fileUrl = await uploadToCloudinary(formData.moduleFile);
        updatedModuleFile = {
          name: formData.moduleFile.name,
          url: fileUrl,
        };
      }

      const updatedData = {
        subjectCode: formData.subjectCode,
        moduleName: formData.moduleName,
        moduleFile: updatedModuleFile, // Ensure we store metadata, not the File object
        uploader: formData.uploader,
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
      });
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRemoveModule = async (id) => {
    await deleteDoc(doc(db, "module", id));
    setModules(modules.filter((module) => module.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      moduleFile: file, // Store the raw file for upload
    });
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

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
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
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
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
                    onClick={() => handleRemoveModule(module.id)}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Module Uploader
            </label>
            <select
              name="uploader"
              value={formData.uploader}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select uploader
              </option>
              {users?.length > 0 ? (
                users.map((user, index) => (
                  <option key={index} value={user}>
                    {user}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No users available
                </option>
              )}
            </select>
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
    </main>
  );
};

export default Module;
