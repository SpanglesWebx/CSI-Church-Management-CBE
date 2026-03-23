import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

export const EndeavourStudents = () => {
  const [students, setStudents] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState({});
  const token = window.sessionStorage.getItem("token");
 
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // decode teacher member_id from token
        const tokenData = JSON.parse(atob(token.split(".")[1])); 
        const teacherId = tokenData.member_id;

        const res = await axios.get(
          `${URL}/endeavour-classes/teacher/${teacherId}/students`,
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
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Class</th>
            <th className="p-2 border">Student ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">DOB</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id} className="border-b">
              <td className="p-2 border">{s.class_name}</td>
              <td className="p-2 border">{s.member_id}</td>
              <td className="p-2 border">{s.member_name}</td>
              <td className="p-2 border">
                {s.date_of_birth
                  ? moment(s.date_of_birth).format("DD-MM-YYYY")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
