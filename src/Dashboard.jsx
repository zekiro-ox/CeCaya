import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config/firebase";
import { FaUsers } from "react-icons/fa";
import { VscFileSubmodule } from "react-icons/vsc";
import { LuNotebookText } from "react-icons/lu";
import { MdOutlineSettingsApplications, MdOutlineLink } from "react-icons/md";
import { HiAcademicCap } from "react-icons/hi2";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [totalApprovedApplications, setTotalApprovedApplications] = useState(0);
  const [totalApprovedWebsites, setTotalApprovedWebsites] = useState(0);
  const [totalInstitutes, setTotalInstitutes] = useState(0); // New state for total institutes

  useEffect(() => {
    // Fetch total users from 'admin' and 'professor' collections
    const fetchUsers = async () => {
      const adminSnapshot = await getDocs(collection(db, "admin"));
      const professorSnapshot = await getDocs(collection(db, "professor"));
      setTotalUsers(adminSnapshot.size + professorSnapshot.size);
    };

    // Fetch total subjects from 'subjects' collection
    const fetchSubjects = async () => {
      const subjectsSnapshot = await getDocs(collection(db, "subjects"));
      setTotalSubjects(subjectsSnapshot.size);
    };

    // Fetch total modules from 'module' collection
    const fetchModules = async () => {
      const modulesSnapshot = await getDocs(collection(db, "module"));
      setTotalModules(modulesSnapshot.size);
    };

    // Fetch approved applications from 'applications' collection
    const fetchApprovedApplications = async () => {
      const applicationsSnapshot = await getDocs(
        collection(db, "applications")
      );
      const approvedApplications = applicationsSnapshot.docs.filter(
        (doc) => doc.data().status === "Approved"
      );
      setTotalApprovedApplications(approvedApplications.length);
    };

    // Fetch approved websites from 'website' collection
    const fetchApprovedWebsites = async () => {
      const websitesSnapshot = await getDocs(collection(db, "website"));
      const approvedWebsites = websitesSnapshot.docs.filter(
        (doc) => doc.data().status === "Approved"
      );
      setTotalApprovedWebsites(approvedWebsites.length);
    };

    // Fetch total institutes from 'institutes' collection
    const fetchInstitutes = async () => {
      const institutesSnapshot = await getDocs(collection(db, "institutes"));
      setTotalInstitutes(institutesSnapshot.size);
    };

    fetchUsers();
    fetchSubjects();
    fetchModules();
    fetchApprovedApplications();
    fetchApprovedWebsites();
    fetchInstitutes(); // Call fetchInstitutes function
  }, []);

  return (
    <main
      className="flex-1 p-4 sm:p-6 lg:p-10"
      style={{ backgroundColor: "#f7f9f6" }}
    >
      <header className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
          Welcome Back!
        </h1>
      </header>

      {/* Statistics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaUsers className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Total Users
            </h2>
            <p className="text-gray-500">{totalUsers}</p>
          </div>
        </div>

        {/* Total Institutes */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <HiAcademicCap className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Total Institutes
            </h2>
            <p className="text-gray-500">{totalInstitutes}</p>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <VscFileSubmodule className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Total Subjects
            </h2>
            <p className="text-gray-500">{totalSubjects}</p>
          </div>
        </div>

        {/* Total Modules */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <LuNotebookText className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Total Modules
            </h2>
            <p className="text-gray-500">{totalModules}</p>
          </div>
        </div>

        {/* Total Approved Applications */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <MdOutlineSettingsApplications className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Approved Applications
            </h2>
            <p className="text-gray-500">{totalApprovedApplications}</p>
          </div>
        </div>

        {/* Total Approved Websites */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <MdOutlineLink className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Approved Websites
            </h2>
            <p className="text-gray-500">{totalApprovedWebsites}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
