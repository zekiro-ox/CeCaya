import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const Subject = () => {
  const [subjects, setSubjects] = useState([
    {
      code: "MTH101",
      name: "Mathematics",
      description: "Basic Algebra and Calculus",
      institute: "Institute A",
      course: "Course X",
    },
  ]);
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    description: "",
    institute: "",
    course: "",
  });
  const [viewSubject, setViewSubject] = useState(null); // To store subject to be viewed
  const [showModal, setShowModal] = useState(false); // To control modal visibility

  const institutes = ["Institute A", "Institute B", "Institute C"]; // Institute options
  const courses = ["Course X", "Course Y", "Course Z"]; // Course options

  const handleAddSubject = (e) => {
    e.preventDefault();
    setSubjects([...subjects, newSubject]);
    setNewSubject({
      code: "",
      name: "",
      description: "",
      institute: "",
      course: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  const handleViewSubject = (subject) => {
    setViewSubject(subject);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
            Subject Management
          </h1>
        </header>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Subject Code
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                Subject Name
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
            {subjects.map((subject, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {subject.code}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {subject.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {subject.description.split(" ").slice(0, 4).join(" ")}...
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleViewSubject(subject)}
                  >
                    <FaEye />
                  </button>
                  <button className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemoveSubject(index)}
                    className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Form Section */}
      <section className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Add New Subject
        </h2>
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              name="code"
              value={newSubject.code}
              onChange={handleInputChange}
              placeholder="Enter subject code"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Name
            </label>
            <input
              type="text"
              name="name"
              value={newSubject.name}
              onChange={handleInputChange}
              placeholder="Enter subject name"
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
              value={newSubject.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute
            </label>
            <select
              name="institute"
              value={newSubject.institute}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select an institute
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
              value={newSubject.course}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
          >
            Add Subject
          </button>
        </form>
      </section>

      {/* Modal Section */}
      {showModal && viewSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 sm:w-1/2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Subject Details
            </h2>
            <p>
              <strong>Code:</strong> {viewSubject.code}
            </p>
            <p>
              <strong>Name:</strong> {viewSubject.name}
            </p>
            <p>
              <strong>Description:</strong> {viewSubject.description}
            </p>
            <p>
              <strong>Institute:</strong> {viewSubject.institute}
            </p>
            <p>
              <strong>Course:</strong> {viewSubject.course}
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

export default Subject;
