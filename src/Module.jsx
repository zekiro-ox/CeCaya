import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const Module = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      subjectCode: "MTH101",
      moduleName: "Calculus Basics",
      moduleFile: {
        name: "calculus_basics.pdf",
        url: "path_to_file/calculus_basics.pdf",
      },
      uploader: "John Doe",
      dateUploaded: "2024-12-20",
    },
    {
      id: 2,
      subjectCode: "PHY101",
      moduleName: "Quantum Physics Intro",
      moduleFile: {
        name: "quantum_physics.ppt",
        url: "path_to_file/quantum_physics.ppt",
      },
      uploader: "Jane Smith",
      dateUploaded: "2024-12-18",
    },
    // Add more modules here
  ]);

  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    subjectCode: "",
    moduleName: "",
    moduleFile: null,
    uploader: "",
    dateUploaded: "",
  });

  const [viewModule, setViewModule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = modules.length;

  // Predefined subject codes and users
  const subjectCodes = ["MTH101", "PHY101", "CSE201"];
  const users = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Lee"];

  const handleAddModule = (e) => {
    e.preventDefault();

    const updatedModule = {
      ...formData,
      id: modules.length + 1,
      dateUploaded: new Date().toISOString().split("T")[0],
    };

    setModules([...modules, updatedModule]);
    setFormData({
      id: "",
      subjectCode: "",
      moduleName: "",
      moduleFile: null,
      uploader: "",
      dateUploaded: "",
    });
  };

  const handleEditRecord = (module) => {
    setEditingRecord(module.id);
    setFormData({
      id: module.id,
      subjectCode: module.subjectCode,
      moduleName: module.moduleName,
      moduleFile: module.moduleFile,
      uploader: module.uploader,
      dateUploaded: module.dateUploaded,
    });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    const updatedModules = modules.map((module) =>
      module.id === formData.id ? { ...formData } : module
    );
    setModules(updatedModules);
    setEditingRecord(null);
    setFormData({
      id: "",
      subjectCode: "",
      moduleName: "",
      moduleFile: null,
      uploader: "",
      dateUploaded: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      moduleFile: { name: file.name, url: URL.createObjectURL(file) },
    });
  };

  const handleRemoveModule = (index) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    setModules(updatedModules);
  };

  const handleViewModule = (module) => {
    setViewModule(module);
    setShowModal(true);
  };

  // Pagination Logic
  const handleNextPage = () => {
    if (currentPage < totalRecords / recordsPerPage) {
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

  const currentModules = modules.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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
            {currentModules.map((module, index) => (
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
                    onClick={() => handleRemoveModule(index)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Code
            </label>
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
              {subjectCodes.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
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
            <input
              type="file"
              accept=".doc,.docx,.ppt,.pptx,.pdf"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
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
              {users.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
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
