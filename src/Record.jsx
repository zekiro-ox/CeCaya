import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const Record = () => {
  const [viewRecord, setViewRecord] = useState(null); // To store the record being viewed
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const [editingRecord, setEditingRecord] = useState(null); // To store the record being edited
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    courses: [""],
  });

  // Generate sample data
  const records = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    name: `Institute ${i + 1}`,
    logo: "https://via.placeholder.com/40",
    courses: [`Course ${i + 1}`],
  }));

  const handleAddCourse = () => {
    setFormData((prevData) => ({
      ...prevData,
      courses: [...prevData.courses, ""],
    }));
  };

  const handleCourseChange = (index, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      courses: updatedCourses,
    }));
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = formData.courses.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      courses: updatedCourses,
    }));
  };

  const handleViewRecord = (record) => {
    setViewRecord(record);
    setShowModal(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      logo: record.logo,
      courses: record.courses,
    });
  };

  const handleSaveChanges = () => {
    // Update the record in the records array
    const updatedRecords = records.map((record) =>
      record.id === editingRecord.id ? { ...record, ...formData } : record
    );
    setEditingRecord(null); // Clear editing state
    setFormData({ name: "", logo: "", courses: [""] }); // Reset form
    alert("Record updated successfully!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        logo: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Academic Management
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
                Institute
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {record.id}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <img
                    src={record.logo}
                    alt="Institute Logo"
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {record.name}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleViewRecord(record)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(record)}
                  >
                    <FaEdit />
                  </button>
                  <button className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center">
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal Section */}
      {showModal && viewRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Record Details
            </h2>
            <p>
              <strong>ID:</strong> {viewRecord.id}
            </p>
            <p>
              <strong>Institute Name:</strong> {viewRecord.name}
            </p>
            <p>
              <strong>Courses:</strong> {viewRecord.courses.join(", ")}
            </p>
            <p>
              <strong>Logo:</strong>{" "}
              <img src={viewRecord.logo} alt="Logo" className="w-20 h-20" />
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

      {/* Form Section */}
      <section className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editingRecord ? "Edit Record" : "Add New Record"}
        </h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter institute name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Courses
            </label>
            {formData.courses.map((course, index) => (
              <div key={index} className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  placeholder={`Course ${index + 1}`}
                  value={course}
                  onChange={(e) => handleCourseChange(index, e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
                />
                {formData.courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCourse}
              className="mt-2 bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
            >
              Add More Course
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
            onClick={editingRecord ? handleSaveChanges : undefined}
          >
            {editingRecord ? "Save Changes" : "Add Record"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Record;
