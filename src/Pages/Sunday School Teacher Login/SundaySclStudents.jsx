import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

export const SundaySclStudents = () => {

  const [students, setStudents] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState({});
  const token = window.sessionStorage.getItem("token");


  useEffect(() => {
    const fetchStudents = async () => {
      try {

        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const teacherId = encodeURIComponent(tokenData.member_id);

        const res = await axios.get(
          `${URL}/sunday-classes/teacher/students?teacherId=${teacherId}`,
          { headers: { Authorization: token } }
        );

        setStudents(res.data.students || []);
        // Grab the first class info for display
        if (res.data.students && res.data.students.length > 0) {
          const firstStudent = res.data.students[0];
          setTeacherInfo({
            class_name: firstStudent.class_name,
            section_name: firstStudent.section_name,
            totalStudents: res.data.students.length,
          });
        }
      } catch (err) {
        console.error("Error fetching teacher's students:", err);
      }
    };

    fetchStudents();
  }, [token]);
  return (
    <div className="p-4 bg-white rounded shadow-md">
      {/* Top summary */}
      {teacherInfo.class_name && (
        <div className="mb-4 font-semibold text-gray-700 flex space-x-6">
          <div>
            <span className="text-gray-500">Class: </span>
            {teacherInfo.class_name}
          </div>
          <div>
            <span className="text-gray-500">Section: </span>
            {teacherInfo.section_name}
          </div>
          <div>
            <span className="text-gray-500">Total Students: </span>
            {teacherInfo.totalStudents}
          </div>
        </div>

      )}

      {/* Students table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-gray-500">
          <thead className="text-base text-gray-700 border-b ">
            <tr>
              <th className="p-2 text-center">Class</th>
              <th className="p-2 text-center">Student ID</th>
              <th className="p-2 text-center">Name</th>
              <th className="p-2 text-center">DOB</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {students.map((s) => (
              <tr key={s._id} className="border-b ">
                <td className="p-2">{s.class_name}</td>

                <td className="p-2  ">
                  {s.member_id}
                </td>

                <td className="p-2 text-left">
                  {s.member_name}
                </td>

                <td className="p-2">
                  {s.date_of_birth
                    ? moment(s.date_of_birth).format("DD-MM-YYYY")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
