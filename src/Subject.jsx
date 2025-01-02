import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    institute: "",
    course: "",
  });

  const [institutes, setInstitutes] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewSubject, setViewSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "institutes"));
        const instituteList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutes(instituteList);
      } catch (error) {
        console.error("Error fetching institutes: ", error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        const subjectsList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSubjects(subjectsList);
      } catch (error) {
        console.error("Error fetching subjects: ", error);
      }
    };

    fetchInstitutes();
    fetchSubjects();
  }, []);

  const handleAddOrEditSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        const docRef = doc(db, "subjects", editingRecord.code);
        await updateDoc(docRef, formData);
        setSubjects((prevSubjects) =>
          prevSubjects.map((subject) =>
            subject.code === editingRecord.code ? formData : subject
          )
        );
        setEditingRecord(null);
      } else {
        const docRef = doc(db, "subjects", formData.code);
        await setDoc(docRef, formData);
        setSubjects([...subjects, formData]);
      }

      setFormData({
        code: "",
        name: "",
        description: "",
        institute: "",
        course: "",
      });
    } catch (error) {
      console.error("Error adding/updating subject: ", error);
    }
  };

  const handleInstituteChange = (e) => {
    const selectedInstitute = e.target.value;
    setFormData({ ...formData, institute: selectedInstitute, course: "" });

    // Find courses for the selected institute
    const institute = institutes.find(
      (inst) => inst.name === selectedInstitute
    );
    if (institute) {
      setAvailableCourses(institute.courses || []);
    } else {
      setAvailableCourses([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditRecord = (subject) => {
    setEditingRecord(subject);
    setFormData(subject);
  };

  const handleRemoveSubject = async (index) => {
    const subjectToRemove = subjects[index];
    try {
      const docRef = doc(db, "subjects", subjectToRemove.code);
      await deleteDoc(docRef);
      setSubjects(subjects.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting subject: ", error);
    }
  };

  const handleViewSubject = (subject) => {
    setViewSubject(subject);
    setShowModal(true);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(subjects.length / recordsPerPage)) {
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
    setCurrentPage(1);
  };

  const currentRecords = subjects.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      {/* Table Section */}
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
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
            {currentRecords.map((subject, index) => (
              <tr key={index} className="hover :bg-gray-50">
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
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditRecord(subject)}
                  >
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
              disabled={
                currentPage >= Math.ceil(subjects.length / recordsPerPage)
              }
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
          {editingRecord ? "Edit Subject" : "Add New Subject"}
        </h2>
        <form onSubmit={handleAddOrEditSubject} className="space-y-4">
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
                Select an institute
              </option>
              {institutes.map((institute) => (
                <option key={institute.id} value={institute.name}>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              required
              disabled={!availableCourses.length}
            >
              <option value="" disabled>
                Select a course
              </option>
              {availableCourses.map((courses, index) => (
                <option key={index} value={courses}>
                  {courses}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
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
              value={formData.name}
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
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2"
              rows="3"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
          >
            {editingRecord ? "Save Changes" : "Add Subject"}
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
