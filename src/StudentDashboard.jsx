import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config/firebase";
import { VscFileSubmodule } from "react-icons/vsc";

const StudentDashboard = () => {
  const [studentCourse, setStudentCourse] = useState("");
  const [studentInstitute, setStudentInstitute] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    // Fetch student details
    const fetchStudentDetails = async () => {
      const studentDoc = await getDocs(collection(db, "student"));
      const studentData = studentDoc.docs[0].data(); // Assuming the logged-in student is the first document
      setStudentCourse(studentData.course);
      setStudentInstitute(studentData.institute);
    };

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

    fetchStudentDetails().then(() => {
      fetchSubjects();
    });
  }, [studentCourse, studentInstitute]);

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
    </main>
  );
};

export default StudentDashboard;
