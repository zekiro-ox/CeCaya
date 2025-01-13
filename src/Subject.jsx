import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
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
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    institute: "",
    course: "",
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewSubject, setViewSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(""); // Track the modal action (save/delete)
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const institutesRef = collection(db, "institutes");
  const coursesRef = collection(db, "courses");
  const subjectsRef = collection(db, "subjects");

  // Fetch Institutes
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const snapshot = await getDocs(institutesRef);
        const fetchedInstitutes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstitutes(fetchedInstitutes);
      } catch (error) {
        console.error("Error fetching institutes: ", error);
      }
    };

    fetchInstitutes();
  }, []);

  // Fetch Courses when an Institute is Selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitute) return;
      try {
        const snapshot = await getDocs(coursesRef);
        const fetchedCourses = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((course) => course.foreignKey === selectedInstitute);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    fetchCourses();
  }, [selectedInstitute]);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(subjectsRef);
        const fetchedSubjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects: ", error);
      }
    };

    fetchSubjects();
  }, []);

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

  // Search filter function
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstituteChange = (e) => {
    const selected = e.target.value;
    setSelectedInstitute(selected);
    setFormData({ ...formData, institute: selected, course: "" });
  };

  const handleCourseChange = (e) => {
    const selectedCourse = e.target.value;
    setFormData({ ...formData, course: selectedCourse });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrEditSubject = async (e) => {
    e.preventDefault();

    // If editing, show confirmation modal
    if (editingRecord) {
      setModalAction("edit");
      setSubjectToDelete(null); // Clear delete action
      setIsModalOpen(true);
    } else {
      // If adding new subject, proceed without confirmation
      try {
        const docRef = doc(db, "subjects", formData.code);
        await setDoc(docRef, formData);
        setSubjects((prev) => [...prev, { id: formData.code, ...formData }]);
        setFormData({
          code: "",
          name: "",
          description: "",
          institute: "",
          course: "",
        });
        showToast("Subject save successfully!", "success");
      } catch (error) {
        console.error("Error saving subject: ", error);
        showToast("Error saving subject.", "error");
      }
    }
  };

  const handleEditSubject = (subject) => {
    setEditingRecord(subject);
    setFormData(subject);
    setSelectedInstitute(subject.institute);
  };

  const handleDeleteSubject = (id) => {
    setSubjectToDelete(id);
    setModalAction("delete");
    setIsModalOpen(true);
  };

  const handleConfirmModal = async () => {
    if (modalAction === "edit" && editingRecord) {
      // Save the edited subject
      const docRef = doc(db, "subjects", editingRecord.id);
      await updateDoc(docRef, formData);
      setSubjects((prev) =>
        prev.map((subj) =>
          subj.id === editingRecord.id
            ? { id: editingRecord.id, ...formData }
            : subj
        )
      );
      setEditingRecord(null);
      showToast("Subject updated successfully!", "success");
    } else if (modalAction === "delete" && subjectToDelete) {
      // Delete the subject
      const docRef = doc(db, "subjects", subjectToDelete);
      await deleteDoc(docRef);
      setSubjects((prev) => prev.filter((subj) => subj.id !== subjectToDelete));
      showToast("Subject deleted successfully!", "success"); // Success toast for delete
    }

    // Reset modal and form state after confirmation
    setIsModalOpen(false);
    setModalAction("");
    setSubjectToDelete(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      institute: "",
      course: "",
    });
  };

  const handleViewSubject = (subject) => {
    setViewSubject(subject);
    setShowModal(true);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredSubjects.length / recordsPerPage)) {
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

  const currentRecords = filteredSubjects.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <main className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6">
      <ToastContainer />
      <section className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Subject Management
          </h1>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search Subjects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded"
          />
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
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewSubject(subject)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="text-white bg-lime-800 p-2 rounded hover:bg-lime-900 flex items-center"
                    onClick={() => handleEditSubject(subject)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
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
                Select Institute
              </option>
              {institutes.map((institute) => (
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
              onChange={handleCourseChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-800 focus:ring-lime-800 sm:text-sm p-2 ${
                !courses.length ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              required
              disabled={!courses.length} // Disable only if there are no courses
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
      <Modal
        isOpen={isModalOpen}
        message={
          modalAction === "edit"
            ? "Are you sure you want to save changes?"
            : modalAction === "delete"
            ? "Are you sure you want to delete this subject?"
            : ""
        }
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmModal}
      />
    </main>
  );
};

export default Subject;
