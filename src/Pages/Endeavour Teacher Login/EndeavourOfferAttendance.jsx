import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import axios from "axios";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";

export const EndeavourOfferAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [offering, setOffering] = useState("");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [teacherInfo, setTeacherInfo] = useState({
    class_name: "",
    section_name: "",
    totalStudents: 0,
    class_id: null,
  });
  const [Response, setResponse] = useState({ status: null, message: "" });

  const token = window.sessionStorage.getItem("token");

  // ✅ Fetch students for teacher
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const teacherId = tokenData.member_id;

        const res = await axios.get(
          `${URL}/endeavour-classes/teacher/${teacherId}/students`,
          { headers: { Authorization: token } }
        );

        setStudents(res.data.students || []);
        if (res.data.students?.length > 0) {
          const firstStudent = res.data.students[0];
          setTeacherInfo({
            class_name: firstStudent.class_name,
            section_name: firstStudent.section_name,
            totalStudents: res.data.students.length,
            class_id: firstStudent.class_id,
          });
        }
      } catch (err) {
        console.error("Error fetching teacher's students:", err);
      }
    };

    fetchStudents();
  }, [token]);

  // ✅ Fetch attendance when students/class/date ready
  useEffect(() => {
    if (teacherInfo.class_id && students.length > 0) {
      fetchAttendance(teacherInfo.class_id, filterDate);
    }
  }, [teacherInfo.class_id, students, filterDate]);

  const fetchAttendance = async (classId, selectedDate) => {
    try {
      const res = await axios.get(
        `${URL}/endeavour-attendance?classId=${classId}&date=${selectedDate
          .toISOString()
          .split("T")[0]}`,
        { headers: { Authorization: token } }
      );

      if (res.data && res.data.length > 0) {
        const record = res.data[0];
        const attMap = {};
        record.attendance.forEach((a) => {
          attMap[a.member_id] = a.present;
        });
        setAttendance(attMap);
        setOffering(record.offering);
        setAttendanceMarked(true);
      } else {
        setAttendance(
          students.reduce((acc, s) => {
            acc[s.member_id] = false;
            return acc;
          }, {})
        );
        setOffering();
        setAttendanceMarked(false);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const toggleAttendance = (memberId) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const totalStudents = students.length;
  const totalAbsentees = students.filter((s) => !attendance[s.member_id]).length;

  // ✅ Save attendance
  const handleSave = async () => {
    try {
      const payload = {
        class: teacherInfo.class_id,
        date: new Date(filterDate).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
        offering: Number(offering) || 0,
      };

      await axios.post(`${URL}/endeavour-attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);
      setResponse({
        status: "Success",
        message: "Attendance saved successfully!",
      });
    } catch (err) {
      console.error("Error saving attendance:", err.response?.data || err);
      setResponse({ status: "Failed", message: "Failed to save attendance." });
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-xl font-semibold mb-4">
          Teacher&apos;s Students Attendance
        </h2>

        {/* Top Info */}
        <div className="grid grid-cols-3 gap-4 mb-4 font-semibold text-gray-700">
          <div>Class: {teacherInfo.class_name}</div>
          <div>Section: {teacherInfo.section_name}</div>
          <div>Total Students: {teacherInfo.totalStudents}</div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3 mb-3">
          <label className="font-semibold text-gray-800">Select Date:</label>
          <input
            type="date"
            value={filterDate.toISOString().split("T")[0]}
            onChange={(e) => setFilterDate(new Date(e.target.value))}
            max={new Date().toISOString().split("T")[0]}
            className="border rounded p-1"
          />
          <span className="text-sm text-gray-600">
            {filterDate.toLocaleDateString("en-US", { weekday: "long" })}
          </span>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-center">Sl No</th>
                <th className="p-2 border text-center">Member ID</th>
                <th className="p-2 border text-center">Name</th>
                <th className="p-2 border text-center">Present</th>
              </tr>
            </thead>
            
            <tbody>
              {students.map((s, index) => (
                <tr key={s.member_id} className="border-b">
                  <td className="p-2 border text-center">{index + 1}</td>
                  <td className="p-2 border text-center">{s.member_id}</td>
                  <td className="p-2 border text-center">{s.member_name}</td>
                  <td className="p-2 border text-center">
                    {attendanceMarked ? (
                      attendance[s.member_id] ? (
                        <FaRegCircleCheck title="Present" className="text-green-500 mx-auto text-xl" />
                      ) : (
                        <RxCrossCircled title="Absent" className="text-red-500 mx-auto text-xl" />
                      )
                    ) : (
                      <input
                        type="checkbox"
                        checked={attendance[s.member_id] || false}
                        onChange={() => toggleAttendance(s.member_id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={3} className="p-2 text-right font-bold">
                  Total Students
                </td>
                <td className="p-2 text-center">{totalStudents}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-2 text-right font-bold">
                  Total Absentees
                </td>
                <td className="p-2 text-center">{totalAbsentees}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Offerings Input */}
        <div className="mt-4">
          <label className="block font-semibold text-gray-800 mb-2">
            Enter offerings amount
          </label>
          <input
            type="number"
            value={offering}
            disabled={attendanceMarked} // 👈 lock once saved
            onChange={(e) => setOffering(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5"
            placeholder="Enter Amount"
            min={0}
          />
        </div>

        {/* Save Button (only if not marked yet) */}
        {!attendanceMarked && (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-base font-medium text-white bg-lavender--600 rounded-md"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Toasts */}
      {Response.status === "Success" && (
        <SuccessMessage Message={Response.message} />
      )}
      {Response.status === "Failed" && (
        <FailedMessage Message={Response.message} />
      )}
    </>
  );
};
