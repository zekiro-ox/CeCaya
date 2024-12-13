import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Record = () => {
  const [courses, setCourses] = useState([""]);

  const handleAddCourse = () => {
    setCourses([...courses, ""]);
  };

  const handleCourseChange = (index, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = value;
    setCourses(updatedCourses);
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
            Record Management
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
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">1</td>
              <td className="border border-gray-200 px-4 py-2">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Institute Logo"
                  className="w-10 h-10 rounded-full"
                />
              </td>
              <td className="border border-gray-200 px-4 py-2">
                Sample Institute
              </td>
              <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                <button className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center">
                  <FaEdit />
                </button>
                <button className="bg-red-800 text-white p-2 rounded hover:bg-red-900 flex items-center">
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Form Section */}
      <section className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Add New Record
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute Name
            </label>
            <input
              type="text"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Courses
            </label>
            {courses.map((course, index) => (
              <div key={index} className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  placeholder={`Course ${index + 1}`}
                  value={course}
                  onChange={(e) => handleCourseChange(index, e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
                />
                {courses.length > 1 && (
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
          >
            Add Record
          </button>
        </form>
      </section>
    </main>
  );
};

export default Record;
