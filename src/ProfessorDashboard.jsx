import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { FaUsers } from "react-icons/fa";
import { VscFileSubmodule } from "react-icons/vsc";
import { LuNotebookText } from "react-icons/lu";
import { MdOutlineSettingsApplications, MdOutlineLink } from "react-icons/md";
import { HiAcademicCap } from "react-icons/hi2";
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfessorDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [totalApprovedApplications, setTotalApprovedApplications] = useState(0);
  const [totalApprovedWebsites, setTotalApprovedWebsites] = useState(0);
  const [totalInstitutes, setTotalInstitutes] = useState(0); // New state for total institutes
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState({});
  const [professorDetails, setProfessorDetails] = useState({
    name: "",
    institute: "",
    course: "",
  });

  useEffect(() => {
    fetchProfessorDetails();
    fetchUsers();
    fetchSubjects();
    fetchModules();
    fetchApprovedApplications();
    fetchApprovedWebsites();
    fetchInstitutes(); // Call fetchInstitutes function
    fetchAnnouncements(); // Fetch announcements
  }, []);

  const fetchProfessorDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const professorQuery = query(
          collection(db, "professor"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(professorQuery);

        if (!querySnapshot.empty) {
          const professorData = querySnapshot.docs[0].data();
          setProfessorDetails({
            name: `${professorData.firstName} ${professorData.lastName}`,
            institute: professorData.institute,
            course: professorData.course,
          });
        }
      } catch (error) {
        console.error("Error fetching professor details:", error);
        showToast("Error fetching professor details.", "error");
      }
    }
  };

  const fetchUsers = async () => {
    const adminSnapshot = await getDocs(collection(db, "student"));
    const professorSnapshot = await getDocs(collection(db, "professor"));
    setTotalUsers(adminSnapshot.size + professorSnapshot.size);
  };

  const fetchSubjects = async () => {
    const subjectsSnapshot = await getDocs(collection(db, "subjects"));
    setTotalSubjects(subjectsSnapshot.size);
  };

  const fetchModules = async () => {
    const modulesSnapshot = await getDocs(collection(db, "module"));
    setTotalModules(modulesSnapshot.size);
  };

  const fetchApprovedApplications = async () => {
    const applicationsSnapshot = await getDocs(collection(db, "applications"));
    const approvedApplications = applicationsSnapshot.docs.filter(
      (doc) => doc.data().status === "Approved"
    );
    setTotalApprovedApplications(approvedApplications.length);
  };

  const fetchApprovedWebsites = async () => {
    const websitesSnapshot = await getDocs(collection(db, "website"));
    const approvedWebsites = websitesSnapshot.docs.filter(
      (doc) => doc.data().status === "Approved"
    );
    setTotalApprovedWebsites(approvedWebsites.length);
  };

  const fetchInstitutes = async () => {
    const institutesSnapshot = await getDocs(collection(db, "courses"));
    setTotalInstitutes(institutesSnapshot.size);
  };

  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(
        collection(db, "announcement"),
        orderBy("timestamp", "desc")
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(announcementsData);

      // Fetch comments for each announcement
      announcementsData.forEach(async (announcement) => {
        const commentsData = await fetchComments(announcement.id);
        setComments((prevComments) => ({
          ...prevComments,
          [announcement.id]: commentsData,
        }));
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showToast("Error fetching announcements.", "error");
    }
  };

  const fetchComments = async (announcementId) => {
    const commentsQuery = collection(
      db,
      "announcement",
      announcementId,
      "comments"
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    return commentsSnapshot.docs.map((doc) => doc.data());
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncement(e.target.value);
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();

    if (
      !professorDetails.name ||
      !professorDetails.institute ||
      !professorDetails.course
    ) {
      showToast(
        "Professor details are not loaded yet. Please try again.",
        "error"
      );
      return;
    }

    try {
      await addDoc(collection(db, "announcement"), {
        message: announcement,
        uploader: professorDetails.name,
        institute: professorDetails.institute,
        course: professorDetails.course,
        timestamp: new Date(),
      });

      setAnnouncement("");
      showToast("Announcement uploaded successfully!", "success");
      fetchAnnouncements(); // Refresh the list of announcements
    } catch (error) {
      console.error("Error uploading announcement:", error);
      showToast("Error uploading announcement.", "error");
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

  return (
    <main
      className="flex-1 p-4 sm:p-6 lg:p-10"
      style={{ backgroundColor: "#f7f9f6" }}
    >
      <ToastContainer />
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
              Total Courses
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

        {/* Total Approved Websites */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <MdOutlineLink className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Approved Links
            </h2>
            <p className="text-gray-500">{totalApprovedWebsites}</p>
          </div>
        </div>
      </section>

      {/* Announcement Section */}
      <section className="mt-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-4">
          Upload Announcement
        </h2>
        <form
          onSubmit={handleAnnouncementSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="announcement"
              className="block text-gray-700 font-medium mb-2"
            >
              Announcement Message
            </label>
            <textarea
              id="announcement"
              value={announcement}
              onChange={handleAnnouncementChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
          >
            Upload Announcement
          </button>
        </form>
      </section>

      {/* Announcements List Section */}
      <section className="mt-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-4">
          Announcements
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="mb-4">
              <h3 className="text-md font-semibold text-gray-800">
                {announcement.message}
              </h3>
              <p className="text-sm text-gray-600">
                By {announcement.uploader} on{" "}
                {new Date(
                  announcement.timestamp.seconds * 1000
                ).toLocaleString()}
              </p>
              <div className="mt-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Comments:
                </h4>
                <ul className="list-disc list-inside">
                  {comments[announcement.id] &&
                    comments[announcement.id].map((comment, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {comment.comment} - By {comment.uploader} on{" "}
                        {new Date(
                          comment.timestamp.seconds * 1000
                        ).toLocaleString()}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProfessorDashboard;
