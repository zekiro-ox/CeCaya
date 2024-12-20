import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const Website = () => {
  const [websites, setWebsites] = useState([
    {
      id: 1,
      logo: "path_to_logo/logo1.png",
      websiteName: "Website One",
      websiteLink: "https://www.websiteone.com",
      status: "Approved",
      institute: "Institute A",
      course: "Course X",
    },
    {
      id: 2,
      logo: "path_to_logo/logo2.png",
      websiteName: "Website Two",
      websiteLink: "https://www.websitetwo.com",
      status: "Not Approved",
      institute: "Institute B",
      course: "Course Y",
    },
    // Add more websites here
  ]);

  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    logo: null,
    websiteName: "",
    websiteLink: "",
    status: "",
    institute: "",
    course: "",
  });

  const [viewWebsite, setViewWebsite] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = websites.length;

  // Predefined institutes and courses
  const institutes = ["Institute A", "Institute B", "Institute C"];
  const courses = ["Course X", "Course Y", "Course Z"];

  const handleAddWebsite = (e) => {
    e.preventDefault();

    const updatedWebsite = {
      ...formData,
      id: websites.length + 1,
    };

    setWebsites([...websites, updatedWebsite]);
    setFormData({
      id: "",
      logo: null,
      websiteName: "",
      websiteLink: "",
      status: "",
      institute: "",
      course: "",
    });
  };

  const handleEditRecord = (website) => {
    setEditingRecord(website.id);
    setFormData({
      id: website.id,
      logo: website.logo,
      websiteName: website.websiteName,
      websiteLink: website.websiteLink,
      status: website.status,
      institute: website.institute,
      course: website.course,
    });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    const updatedWebsites = websites.map((website) =>
      website.id === formData.id ? { ...formData } : website
    );
    setWebsites(updatedWebsites);
    setEditingRecord(null);
    setFormData({
      id: "",
      logo: null,
      websiteName: "",
      websiteLink: "",
      status: "",
      institute: "",
      course: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: URL.createObjectURL(file) });
  };

  const handleRemoveWebsite = (index) => {
    const updatedWebsites = websites.filter((_, i) => i !== index);
    setWebsites(updatedWebsites);
  };

  const handleViewWebsite = (website) => {
    setViewWebsite(website);
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

  const currentWebsites = websites.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Website Management
          </h1>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Website Logo
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Website Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Website Link
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
                    className="h-8 w-8 object-cover"
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
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
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
                    onClick={() => handleRemoveWebsite(index)}
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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select Institute
              </option>
              {institutes.map((institute, index) => (
                <option key={index} value={institute}>
                  {institute}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
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
              Website Name
            </label>
            <input
              type="text"
              name="websiteName"
              value={formData.websiteName}
              onChange={handleInputChange}
              placeholder="Enter website name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website Logo
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website Link
            </label>
            <input
              type="url"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleInputChange}
              placeholder="Enter website link"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
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
            {editingRecord ? "Save Changes" : "Add Website"}
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewWebsite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Website Details
            </h2>
            <p>
              <strong>ID:</strong> {viewWebsite.id}
            </p>
            <p>
              <strong>Website Logo:</strong>{" "}
              <img
                src={viewWebsite.logo}
                alt="logo"
                className="h-12 w-12 object-cover"
              />
            </p>
            <p>
              <strong>Website Name:</strong> {viewWebsite.websiteName}
            </p>
            <p>
              <strong>Website Link:</strong>{" "}
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
    </main>
  );
};

export default Website;
