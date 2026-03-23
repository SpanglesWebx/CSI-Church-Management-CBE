import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const SundaySclOfferings = () => {
  const navigate = useNavigate();
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [offering, setOffering] = useState("");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());




  const token = window.sessionStorage.getItem("token");

  // ✅ Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/sunday-classes`, {
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

    // ✅ Sync modal date with outside filter date
    setDate(filterDate);

    try {
      const res = await axios.get(
        `${URL}/attendance?classId=${cls._id}&date=${filterDate.toISOString().split("T")[0]}`,
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
        // setOffering(record.offering);
        setOffering(record.offering > 0 ? record.offering : "");

        setAttendanceMarked(true);
      } else {
        setStudents(cls.students || []);
        setAttendance(
          (cls.students || []).reduce((acc, s) => {
            acc[s.member_id] = false;
            return acc;
          }, {})
        );
        setOffering("");
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
    setOffering("");
    setIsModalOpen(false);
  };

  // ✅ Toggle attendance checkbox
  const toggleAttendance = (memberId) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // ✅ Count totals
  const totalStudents = students.length;
  const totalAbsentees = students.filter((s) => !attendance[s.member_id]).length;

  // Save attendance for the first time


  const handleSave = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
        offering: Number(offering) || 0,
      };

      const res = await axios.post(`${URL}/attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);
      setIsModalOpen(false);

      // ✅ Force toast re-render even for same message
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Success", message: "Attendance saved successfully!" });
      }, 10);

      // ✅ Normalize response with populated class
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

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err?.response?.data?.message || "Failed to save attendance.",
        });
      }, 10);
    } finally {
      // ⏳ Auto-hide toast after 3 seconds
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };




  // Update existing attendance
  const handleUpdate = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
        offering: Number(offering) || 0,
      };

      const res = await axios.put(
        `${URL}/attendance/${selectedClass._id}`,
        payload,
        { headers: { Authorization: token } }
      );

      setEditMode(false);
      setIsModalOpen(false);
      setResponse({ status: "Success", message: "Attendance updated successfully!" });

      // ✅ Normalize response with populated class
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
          `${URL}/attendance?date=${filterDate.toISOString().split("T")[0]}`,
          { headers: { Authorization: token } }
        );
        // backend should return an array like: [{ classId: "xxx", date: "2025-08-26", ... }]
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
        <h2 className="text-xl font-semibold mb-4">Sunday School Attendance</h2>
        <div className="flex items-center gap-3 mb-3">
          <label className="font-semibold text-gray-800">Filter by Date:</label>

          <input
            type="date"
            value={
              filterDate instanceof Date && !isNaN(filterDate)
                ? filterDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const val = e.target.value;
              setFilterDate(val ? new Date(val) : new Date());
            }}
            max={new Date().toISOString().split("T")[0]}
            className="block mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
          />

          <span className="text-sm text-gray-600">
            {filterDate.toLocaleDateString("en-US", { weekday: "long" })}
          </span>
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full ">
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
                // const isMarked = attendanceStatus.some(
                //   (s) =>
                //     s.class?._id === cls._id &&
                //     new Date(s.date).toISOString().split("T")[0] ===
                //     filterDate.toISOString().split("T")[0]
                // );
                const isMarked = attendanceStatus.some((s) => {
                  const classIdMatch = s.class?._id === cls._id;
                  const recordDate = s.date ? new Date(s.date) : null;

                  return (
                    classIdMatch &&
                    recordDate instanceof Date &&
                    !isNaN(recordDate) &&
                    filterDate instanceof Date &&
                    !isNaN(filterDate) &&
                    recordDate.toISOString().split("T")[0] ===
                    filterDate.toISOString().split("T")[0]
                  );
                });


                return (
                  <tr key={cls._id} className="border-b ">
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
                    <td className="p-2 text-center action-icon">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"

                        onClick={() => {
                          const selectedDate = filterDate.toISOString().split("T")[0];

                          navigate(`mark/${cls._id}/${selectedDate}`, {
                            state: { classData: cls },
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>



      {/* Toasts */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </>
  );
};
