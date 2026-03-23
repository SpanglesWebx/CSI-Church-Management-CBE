import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { FaArrowLeft } from "react-icons/fa";

export const SundayExamAddMarks = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [marksData, setMarksData] = useState([]);
    const [response, setResponse] = useState({ status: null, message: "" });

    const token = sessionStorage.getItem("token");
    const [saving, setSaving] = useState(false);

    const fetchExam = async () => {
        try {
            const res = await axios.get(`${URL}/sundayschool-exams/${examId}`, {
                headers: { Authorization: token }
            });

            const examData = res.data.exam;

            setExam(examData);

            const cls = examData.classExams.find(
                c => c.participants && c.participants.length > 0
            );

            if (cls) {
                setSelectedClass(cls);

                setMarksData(
                    cls.participants.map(p => ({
                        ...p,
                        marks: p.marks || ""
                    }))
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExam();
    }, []);

    const handleMarkChange = (index, value) => {
        const updated = [...marksData];
        updated[index].marks = value;
        setMarksData(updated);
    };

    useEffect(() => {
        const blockRefresh = (e) => {
            if (saving) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", blockRefresh);

        return () => window.removeEventListener("beforeunload", blockRefresh);
    }, [saving]);

    const saveMarks = async () => {
        if (saving) return;
        try {
            setSaving(true);
            const payload = {
                examId,
                className: selectedClass.className,
                marksData
            };

            const res = await axios.post(
                `${URL}/sundayschool-exams/add-marks`,
                payload,
                { headers: { Authorization: token } }
            );

            setResponse({ status: "Success", message: res.data.message });

            fetchExam();
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save marks"
            });
        }
        finally {

            setSaving(false);

        }
    };

    if (!exam) return <div className="p-5">Loading...</div>;

    return (
<>

          <div className="flex justify-start mt-6">
                        <FaArrowLeft size={18} onClick={() => navigate(-1)} className="cursor-pointer" />
                    </div>
        <div className={`p-4 bg-white rounded shadow ${saving ? "pointer-events-none opacity-60" : ""}`}>

            <div className="flex justify-between mb-4">
                <h1 className="text-lg font-semibold">Add Marks</h1>

            </div>

            {selectedClass && (
                <>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <p><b>Exam:</b> {exam.examName}</p>
                        <p><b>Date:</b> {moment(exam.examDate).format("DD-MM-YYYY")}</p>
                        <p><b>Center:</b> {exam.examcenter}</p>
                        <p><b>Class:</b> {selectedClass.className}</p>
                        <p><b>Total Students:</b> {marksData.length}</p>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-500">
                            <thead className="text-base text-gray-700 border-b">
                                <tr>
                                    <th className="p-2 text-center">Sl No</th>
                                    <th className="p-2 text-center">Student</th>
                                    <th className="p-2 text-center">Student ID</th>
                                    <th className="p-2 text-center">Marks</th>
                                </tr>
                            </thead>

                            <tbody className="text-center">
                                {marksData.map((s, i) => (
                                    <tr key={s.member_id} className="border-b">
                                        <td className="p-2">{i + 1}</td>
                                        <td className="p-2 text-left">{s.member_name}</td>
                                        <td className="p-2">{s.member_id}</td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={s.marks}
                                                onChange={(e) =>
                                                    handleMarkChange(i, e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-24 text-center"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={saveMarks}
                            disabled={saving}
                            className={`px-5 py-2 rounded text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
`}
                        >

                            {saving && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}

                            {saving ? "Saving..." : "Save Marks"}

                        </button>
                    </div>
                </>
            )}

            {response.status === "Success" && (
                <SuccessMessage Message={response.message} />
            )}

            {response.status === "Failed" && (
                <FailedMessage Message={response.message} />
            )}
        </div>
        </>
    );
};