import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { VscFileSubmodule } from "react-icons/vsc";
import { getAuth } from "firebase/auth";

const StudentDashboard = () => {
  const [studentCourse, setStudentCourse] = useState("");
  const [studentInstitute, setStudentInstitute] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState({});
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState({});

  useEffect(() => {
    // Fetch student details
    const fetchStudentDetails = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const studentQuery = query(
          collection(db, "student"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(studentQuery);

        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data();
          setStudentCourse(studentData.course);
          setStudentInstitute(studentData.institute);
          setStudentName(`${studentData.firstName} ${studentData.lastName}`);
        }
      }
    };

    fetchStudentDetails();
  }, []);

  useEffect(() => {
    if (studentCourse && studentInstitute) {
      // Fetch subjects based on course and institute
      const fetchSubjects = async () => {
        const subjectsQuery = query(
          collection(db, "subjects"),
          where("course", "==", studentCourse),
          where("institute", "==", studentInstitute)
        );
        const subjectsSnapshot = await getDocs(subjectsQuery);
        setSubjects(subjectsSnapshot.docs.map((doc) => doc.data()));
      };

      // Real-time updates for announcements
      const fetchAnnouncements = () => {
        const announcementsQuery = query(
          collection(db, "announcement"),
          where("course", "==", studentCourse),
          where("institute", "==", studentInstitute),
          orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
          const announcementsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAnnouncements(announcementsData);

          // Fetch comments for each announcement
          announcementsData.forEach((announcement) => {
            const commentsQuery = collection(
              db,
              "announcement",
              announcement.id,
              "comments"
            );
            onSnapshot(commentsQuery, (commentsSnapshot) => {
              setComments((prevComments) => ({
                ...prevComments,
                [announcement.id]: commentsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })),
              }));
            });
          });
        });

        return unsubscribe;
      };

      fetchSubjects();
      const unsubscribe = fetchAnnouncements();

      return () => unsubscribe();
    }
  }, [studentCourse, studentInstitute]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async (announcementId) => {
    if (comment.trim() === "") return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const commentRef = collection(
          db,
          "announcement",
          announcementId,
          "comments"
        );
        await addDoc(commentRef, {
          comment,
          uploader: studentName,
          timestamp: new Date(),
          course: studentCourse,
          institute: studentInstitute,
        });

        setComment("");
        setShowCommentBox((prev) => ({ ...prev, [announcementId]: false }));
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleShowCommentBox = (announcementId) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [announcementId]: !prev[announcementId],
    }));
  };

  return (
    <main
      className="flex-1 p-4 sm:p-6 lg:p-10"
      style={{ backgroundColor: "#f7f9f6" }}
    >
      <header className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
          Subject Available for {studentCourse} at {studentInstitute}
        </h1>
      </header>

      {/* Subjects Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md flex items-center"
          >
            <VscFileSubmodule className="h-6 w-6 text-gray-500 mr-4" />
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
                {subject.name}
              </h2>
              <p className="text-gray-500">{subject.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Announcements Section */}
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
                {comments[announcement.id] &&
                comments[announcement.id].length > 0 ? (
                  <ul className="list-disc list-inside">
                    {comments[announcement.id].map((comment, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {comment.comment} - By {comment.uploader} on{" "}
                        {new Date(
                          comment.timestamp.seconds * 1000
                        ).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No comments yet.</p>
                )}
                <button
                  onClick={() => handleShowCommentBox(announcement.id)}
                  className="mt-2 text-sm text-gray-600 hover:text-black"
                >
                  Comment
                </button>
                {showCommentBox[announcement.id] && (
                  <div className="mt-2">
                    <textarea
                      value={comment}
                      onChange={handleCommentChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="2"
                      placeholder="Add a comment"
                    ></textarea>
                    <button
                      onClick={() => handleCommentSubmit(announcement.id)}
                      className="mt-2 bg-lime-800 text-white px-4 py-2 rounded hover:bg-lime-900"
                    >
                      Submit Comment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default StudentDashboard;
