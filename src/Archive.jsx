import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config/firebase";
import { FaEye } from "react-icons/fa";

const Archive = () => {
  const [archivedModules, setArchivedModules] = useState([]);
  const [viewModule, setViewModule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchArchivedModules();
  }, []);

  const fetchArchivedModules = async () => {
    try {
      const archivedQuery = query(
        collection(db, "module"),
        where("archive", "==", true) // Fetch only archived modules
      );

      const querySnapshot = await getDocs(archivedQuery);
      const moduleData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setArchivedModules(moduleData);
    } catch (error) {
      console.error("Error fetching archived modules:", error);
    }
  };

  const handleViewModule = (module) => {
    setViewModule(module);
    setShowModal(true);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Archived Modules
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {archivedModules.map((module, index) => (
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
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    className="text-white bg-yellow-800 p-2 rounded hover:bg-yellow-900 flex items-center"
                    onClick={() => handleViewModule(module)}
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </main>
  );
};

export default Archive;
