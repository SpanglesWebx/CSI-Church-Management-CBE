import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const EndSclOfferings = () => {
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());

  const token = window.sessionStorage.getItem("token");

  // ✅ Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes`, {
          headers: { Authorization: token },
        });
        setClassList(res.data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [token]);

  // ✅ Open modal for marking attendance
  const handleOpenModal = async (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
    setEditMode(false);
    setDate(filterDate);

    try {
      const res = await axios.get(
        `${URL}/endeavour-attendance?classId=${cls._id}&date=${filterDate.toISOString().split("T")[0]}`,
        { headers: { Authorization: token } }
      );

      if (res.data && res.data.length > 0) {
        const record = res.data[0];
        setStudents(cls.students || []);
        setAttendance(
          record.attendance.reduce((acc, a) => {
            acc[a.member_id] = a.present;
            return acc;
          }, {})
        );
        setAttendanceMarked(true);
      } else {
        setStudents(cls.students || []);
        setAttendance(
          (cls.students || []).reduce((acc, s) => {
            acc[s.member_id] = false;
            return acc;
          }, {})
        );
        setAttendanceMarked(false);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setStudents(cls.students || []);
      setAttendanceMarked(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
    setStudents([]);
    setAttendance({});
    setIsModalOpen(false);
  };

  const toggleAttendance = (memberId) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const totalStudents = students.length;
  const totalAbsentees = students.filter((s) => !attendance[s.member_id]).length;

  // ✅ Save new attendance
  const handleSave = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
      };

      const res = await axios.post(`${URL}/endeavour-attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);
      setIsModalOpen(false);
      setResponse({ status: "Success", message: "Attendance saved successfully!" });

      const dateKey = new Date(date).toISOString().split("T")[0];
      const newRecord = { ...res.data, class: selectedClass };

      setAttendanceStatus((prev) => {
        const exists = prev.some(
          (rec) =>
            rec.class?._id === selectedClass._id &&
            new Date(rec.date).toISOString().split("T")[0] === dateKey
        );

        return exists
          ? prev.map((rec) =>
              rec.class?._id === selectedClass._id &&
              new Date(rec.date).toISOString().split("T")[0] === dateKey
                ? newRecord
                : rec
            )
          : [...prev, newRecord];
      });
    } catch (err) {
      console.error("Error saving attendance:", err.response?.data || err);
      setResponse({ status: "Failed", message: "Failed to save attendance." });
    }
  };

  // ✅ Update attendance
  const handleUpdate = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
      };

      const res = await axios.put(
        `${URL}/endeavour-attendance/${selectedClass._id}`,
        payload,
        { headers: { Authorization: token } }
      );

      setEditMode(false);
      setIsModalOpen(false);
      setResponse({ status: "Success", message: "Attendance updated successfully!" });

      const dateKey = new Date(date).toISOString().split("T")[0];
      const updatedRecord = { ...res.data, class: selectedClass };

      setAttendanceStatus((prev) =>
        prev.map((rec) =>
          rec.class?._id === selectedClass._id &&
          new Date(rec.date).toISOString().split("T")[0] === dateKey
            ? updatedRecord
            : rec
        )
      );
    } catch (err) {
      console.error("Error updating attendance:", err.response?.data || err);
      setResponse({ status: "Failed", message: "Failed to update attendance." });
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${URL}/endeavour-attendance?date=${filterDate.toISOString().split("T")[0]}`,
          { headers: { Authorization: token } }
        );
        setAttendanceStatus(res.data || []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceStatus([]);
      }
    };

    if (filterDate) {
      fetchAttendance();
    }
  }, [filterDate, token]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-xl font-semibold mb-4">Endeavour Attendance</h2>

        {/* Date Filter */}
        <div className="flex items-center gap-3 mb-3">
          <label className="font-semibold text-gray-800">Filter by Date:</label>
          <input
            type="date"
            value={filterDate instanceof Date && !isNaN(filterDate)
              ? filterDate.toISOString().split("T")[0]
              : ""}
            onChange={(e) =>
              setFilterDate(e.target.value ? new Date(e.target.value) : new Date())
            }
            max={new Date().toISOString().split("T")[0]}
            className="border rounded p-1"
          />
          <span className="text-sm text-gray-600">
            {filterDate.toLocaleDateString("en-US", { weekday: "long" })}
          </span>
        </div>

        {/* Classes Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="">
                <th className="p-2 text-center">Sl No</th>
                <th className="p-2 text-center">Class</th>
                <th className="p-2 text-center">Teacher</th>
                <th className="p-2 text-center">Attendance Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {classList.map((cls, index) => {
                const isMarked = attendanceStatus.some(
                  (s) =>
                    s.class?._id === cls._id &&
                    filterDate instanceof Date &&
                    !isNaN(filterDate) &&
                    new Date(s.date).toLocaleDateString("en-CA") === filterDate.toLocaleDateString("en-CA")

                );

                return (
                  <tr key={cls._id} className="border-b">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">
                      {cls.class_name} {cls.section_name}
                    </td>
                    <td className="p-2 text-center">{cls.teacher?.name || "-"}</td>
                    <td className="p-2 text-center">
                      {isMarked ? (
                        <span className="text-green-600 font-semibold">Marked</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Unmarked</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => handleOpenModal(cls)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Mark Attendance">
        {selectedClass && (
          <div className="max-h-[600px] overflow-y-auto">
            {/* Date */}
            <div className="flex items-center mb-4 gap-4">
              <div className="w-full">
                <label className="block mb-2 font-semibold text-gray-800">Date:</label>
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  maxDate={new Date()}
                  className="border rounded-md p-1"
                  dayClassName={(d) =>
                    d.getDay() === 0 ? "bg-red-200 text-red-600 font-bold" : undefined
                  }
                  dateFormat="dd-MM-yyyy"
                />
                <span className="text-gray-600 ml-3">
                  {moment(date).format("dddd")}
                </span>
              </div>
            </div>

            {/* Students Table */}
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
                      <input
                        type="checkbox"
                        checked={attendance[s.member_id]}
                        disabled={attendanceMarked && !editMode}
                        onChange={() => toggleAttendance(s.member_id)}
                      />
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              {!attendanceMarked ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-base font-medium text-white bg-lavender--600 rounded-md"
                >
                  Save
                </button>
              ) : (
                <>
                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 flex items-center gap-2 text-white bg-blue-600 rounded-md"
                    >
                      <CiEdit /> Edit
                    </button>
                  )}
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="px-4 py-2 text-base font-medium text-white bg-green-600 rounded-md"
                    >
                      Update
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Toasts */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </>
  );
};
