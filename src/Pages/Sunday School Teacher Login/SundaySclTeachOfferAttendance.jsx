




import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import axios from "axios";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";

export const SundaySclTeachOfferAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [offering, setOffering] = useState("");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [selectAll, setSelectAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState({
    class_name: "",
    section_name: "",
    totalStudents: 0,
    class_id: null,
  });

  const [Response, setResponse] = useState({ status: null, message: "" });

  const token = window.sessionStorage.getItem("token");

  // Fetch students
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
        console.error("Error fetching Sunday school students:", err);
      }
    };

    fetchStudents();
  }, [token]);

  // Fetch attendance
  useEffect(() => {
    if (teacherInfo.class_id && students.length > 0) {
      fetchAttendance(teacherInfo.class_id, filterDate);
    }
  }, [teacherInfo.class_id, students, filterDate]);

  const fetchAttendance = async (classId, selectedDate) => {
    try {
      const res = await axios.get(
        `${URL}/attendance?classId=${classId}&date=${selectedDate
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

        const allPresent = students.every(
          (s) => attMap[s.member_id]
        );

        setSelectAll(allPresent);

        setOffering(record.offering);
        setAttendanceMarked(true);
      } else {
        const defaultAttendance = students.reduce((acc, s) => {
          acc[s.member_id] = true;
          return acc;
        }, {});

        setAttendance(defaultAttendance);
        setSelectAll(true);
        setOffering("");
        setAttendanceMarked(false);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Toggle single student
  const toggleAttendance = (memberId) => {
    const updated = {
      ...attendance,
      [memberId]: !attendance[memberId],
    };

    setAttendance(updated);

    const allSelected = students.every(
      (s) => updated[s.member_id]
    );

    setSelectAll(allSelected);
  };

  // Select all
  const handleSelectAll = () => {
    const newValue = !selectAll;

    const updatedAttendance = {};

    students.forEach((student) => {
      updatedAttendance[student.member_id] = newValue;
    });

    setAttendance(updatedAttendance);
    setSelectAll(newValue);
  };

  const totalStudents = students.length;

  const totalAbsentees = students.filter(
    (s) => !attendance[s.member_id]
  ).length;

  // Prevent refresh while saving
  useEffect(() => {
    const blockRefresh = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);

    return () => {
      window.removeEventListener("beforeunload", blockRefresh);
    };
  }, [saving]);

  // Save
  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const payload = {
        class: teacherInfo.class_id,
        date: new Date(filterDate).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
      };

      await axios.post(`${URL}/attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);

      setResponse({
        status: "Success",
        message: "Attendance saved successfully!",
      });
    } catch (err) {
      console.error(err);

      setResponse({
        status: "Failed",
        message: "Failed to save attendance.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

          <h2 className="text-xl font-semibold mb-4">
            Sunday School Students Attendance
          </h2>

          {/* Top Info */}
          <div className="grid grid-cols-3 gap-4 mb-4 font-semibold text-gray-700">
            <div>Class: {teacherInfo.class_name}</div>
            <div>Section: {teacherInfo.section_name}</div>
            <div>Total Students: {teacherInfo.totalStudents}</div>
          </div>

          {/* Date */}
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

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">

              {/* Header */}
              <thead className="text-base text-gray-700 border-b">
                <tr>
                  <th className="p-2 text-center">Sl No</th>
                  <th className="p-2 text-center">Member ID</th>
                  <th className="p-2 text-center">Name</th>

                  <th className="p-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      Present

                      {!attendanceMarked && (
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="text-center">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-3">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  students.map((s, index) => {
                    const isAbsent = !attendance[s.member_id];

                    return (
                      <tr
                        key={s.member_id}
                        className={`border-b ${isAbsent ? "bg-yellow-50" : ""}`}
                      >
                        {/* Serial Number */}
                        <td
                          className={`p-2 ${isAbsent ? "text-red-600 font-semibold" : ""
                            }`}
                        >
                          {index + 1}
                        </td>

                        {/* Member ID */}
                        <td
                          className={`p-2 ${isAbsent ? "text-red-600 font-semibold" : ""
                            }`}
                        >
                          {s.member_id}
                        </td>

                        {/* Name */}
                        <td
                          className={`p-2 text-left ${isAbsent ? "text-red-600 font-semibold" : ""
                            }`}
                        >
                          {s.member_name}
                        </td>

                        {/* Attendance */}
                        <td className="p-2 flex justify-center items-center">
                          {attendanceMarked ? (
                            attendance[s.member_id] ? (
                              <FaRegCircleCheck className="text-green-600 text-xl" />
                            ) : (
                              <RxCrossCircled className="text-red-600 text-xl" />
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
                    );
                  })
                )}
              </tbody>

              {/* Footer */}
              <tfoot className="border-t text-gray-700 font-semibold">
                <tr>
                  <td colSpan={3} className="p-2 text-right">
                    Total Students
                  </td>
                  <td className="text-center">{totalStudents}</td>
                </tr>

                <tr>
                  <td colSpan={3} className="p-2 text-right">
                    Total Absentees
                  </td>
                  <td className="text-center text-red-600">
                    {totalAbsentees}
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

          {/* Save */}
          {!attendanceMarked && (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 text-base font-medium text-white rounded-md
                ${saving ? "bg-gray-400" : "bg-lavender--600"}`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {Response.status === "Success" && (
        <SuccessMessage Message={Response.message} />
      )}

      {Response.status === "Failed" && (
        <FailedMessage Message={Response.message} />
      )}
    </>
  );
};