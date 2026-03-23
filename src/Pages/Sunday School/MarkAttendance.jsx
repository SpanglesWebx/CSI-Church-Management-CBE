import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { CiEdit } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa";

export const MarkAttendance = () => {
    const { classId, date: routeDate } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const cls = location.state?.classData;

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [offering, setOffering] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [saving, setSaving] = useState(false);


    const [date, setDate] = useState(
        routeDate ? new Date(routeDate) : new Date()
    );
    const [Response, setResponse] = useState({ status: null, message: "" });

    const token = window.sessionStorage.getItem("token");

    const formatDate = (d) => new Date(d).toISOString().split("T")[0];

    useEffect(() => {
        if (!cls) return;

        const fetchAttendance = async () => {
            try {
                const res = await axios.get(
                    `${URL}/attendance?classId=${classId}&date=${date.toISOString().split("T")[0]}`,
                    { headers: { Authorization: token } }
                );

                if (res.data && res.data.length > 0) {
                    const record = res.data[0];

                    setStudents(cls.students || []);

                    const attendanceMap = record.attendance.reduce((acc, a) => {
                        acc[a.member_id] = a.present;
                        return acc;
                    }, {});

                    setAttendance(attendanceMap);

                    const allPresent = (cls.students || []).every(
                        (s) => attendanceMap[s.member_id]
                    );

                    setSelectAll(allPresent);

                    setOffering(record.offering > 0 ? record.offering : "");
                    setAttendanceMarked(true);

                } else {
                    setStudents(cls.students || []);

                    const defaultAttendance = (cls.students || []).reduce((acc, s) => {
                        acc[s.member_id] = true; // default present
                        return acc;
                    }, {});

                    setSelectAll(true);

                    setAttendance(defaultAttendance);



                    setAttendanceMarked(false);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchAttendance();
    }, [date, classId, cls, token]);


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

    const totalStudents = students.length;
    const totalAbsentees = students.filter((s) => !attendance[s.member_id]).length;


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

    const handleSave = async () => {
        if (saving) return;
        try {
            setSaving(true);
            const payload = {
                class: classId,
                date: new Date(date).toISOString(),
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
            setResponse({
                status: "Failed",
                message: "Failed to save attendance",
            });
        }
        finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (saving) return;
        try {
            setSaving(true);
            const payload = {
                class: classId,
                date: new Date(date).toISOString(),
                attendance: students.map((s) => ({
                    member_id: s.member_id,
                    present: attendance[s.member_id] || false,
                })),

            };

            await axios.put(`${URL}/attendance/${classId}`, payload, {
                headers: { Authorization: token },
            });

            setEditMode(false);

            setResponse({
                status: "Success",
                message: "Attendance updated successfully!",
            });
        } catch (err) {
            setResponse({
                status: "Failed",
                message: "Failed to update attendance.",
            });
        }
        finally {
            setSaving(false);
        }
    };

    if (!cls) {
        return <div className="p-6">Class data missing</div>;
    }


    const handleSelectAll = () => {
        const newValue = !selectAll;

        const updatedAttendance = {};

        students.forEach((student) => {
            updatedAttendance[student.member_id] = newValue;
        });

        setAttendance(updatedAttendance);
        setSelectAll(newValue);
    };

    const handlegoback = () => navigate("/admin/sunday-attendance");

    return (
        <>
            <div className="flex justify-start mt-6">
                <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" />
            </div>

            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
                <div className="p-4 bg-white shadow rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">
                        Mark Attendance - {cls.class_name} {cls.section_name}
                    </h2>

                    {/* Date */}
                    <div className="flex items-center mb-4 gap-4">
                        <label className="font-semibold">Date:</label>

                        <DatePicker
                            selected={date}
                            disabled
                            readOnly

                            className="block mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"

                            dateFormat="dd-MM-yyyy"
                        />

                        <span>{moment(date).format("dddd")}</span>
                    </div>

                    {/* Table */}

                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-500">

                            {/* Header */}
                            <thead className="text-base text-gray-700 border-b ">
                                <tr>
                                    <th className="p-2 text-center">Sl No</th>
                                    <th className="p-2 text-center">Member ID</th>
                                    <th className="p-2 text-center">Name</th>
                                    <th className="p-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            Present
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                disabled={attendanceMarked && !editMode}
                                                className="cursor-pointer"
                                            />
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
                                                className={`border-b hover:bg-gray-50 ${isAbsent ? "bg-yellow-50" : ""
                                                    }`}
                                            >
                                                <td
                                                    className={`p-2 ${isAbsent ? "text-red-600 font-semibold" : ""
                                                        }`}
                                                >
                                                    {index + 1}
                                                </td>

                                                <td
                                                    className={`p-2 ${isAbsent ? "text-red-600 font-semibold" : ""
                                                        }`}
                                                >
                                                    {s.member_id}
                                                </td>

                                                <td
                                                    className={`p-2 text-left ${isAbsent ? "text-red-600 font-semibold" : ""
                                                        }`}
                                                >
                                                    {s.member_name}
                                                </td>

                                                <td className="p-2 flex justify-center items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={attendance[s.member_id] || false}
                                                        disabled={attendanceMarked && !editMode}
                                                        onChange={() => toggleAttendance(s.member_id)}
                                                        className="cursor-pointer"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Footer */}
                            <tfoot className="border-t bg-gray-50 text-gray-700 font-semibold">
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

                    {/* Buttons */}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-red-500"
                        >
                            Back
                        </button>

                        {!attendanceMarked ? (

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
                            >
                                {saving && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        ) : (
                            <>
                                {!editMode && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="px-4 py-2 flex items-center gap-2 text-white bg-lavender--600 rounded-md"
                                    >
                                        <CiEdit /> Edit
                                    </button>
                                )}

                                {editMode && (
                                    <button
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"}`}
                                    >
                                        {saving && (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                        {saving ? "Updating..." : "Update"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {Response.status === "Success" && (
                        <SuccessMessage Message={Response.message} />
                    )}

                    {Response.status === "Failed" && (
                        <FailedMessage Message={Response.message} />
                    )}
                </div>
            </div>
        </>
    );
};