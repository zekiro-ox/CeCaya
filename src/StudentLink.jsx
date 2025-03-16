import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { db } from "./config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";
import { getAuth } from "firebase/auth";

const StudentLink = () => {
  const [websites, setWebsites] = useState([]);
  const [viewWebsite, setViewWebsite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = websites.length;

  useEffect(() => {
    fetchStudentLinks();
  }, []);

  const fetchStudentLinks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Get student details
        const studentQuery = query(
          collection(db, "student"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(studentQuery);

        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data();
          const { course, institute } = studentData;

          // Query links where course and institute match student's details
          const linksQuery = query(
            collection(db, "website"),
            where("course", "==", course),
            where("institute", "==", institute)
          );

          const linksSnapshot = await getDocs(linksQuery);
          const linksData = linksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setWebsites(linksData);
        }
      } catch (error) {
        console.error("Error fetching student links:", error);
        showToast("Error fetching student links.", "error");
      }
    }
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

  const handleViewWebsite = (website) => {
    setViewWebsite(website);
    setShowModal(true);
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
    </main>
  );
};

export default StudentLink;
