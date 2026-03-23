import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import { FaArrowLeft } from "react-icons/fa";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const SundaySclExamAddParticipants = () => {

    const { examId } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");




    const rawTeacherId = JSON.parse(atob(token.split(".")[1])).member_id;
    const teacherId = encodeURIComponent(rawTeacherId);

    const [exam, setExam] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedClassExam, setSelectedClassExam] = useState(null);

    const [Response, setResponse] = useState({ status: null, message: "" });

    const [saving, setSaving] = useState(false);

    // Fetch Exam
    const fetchExam = async () => {
        try {

            const res = await axios.get(
                `${URL}/sundayschool-exams/${examId}`,
                { headers: { Authorization: token } }
            );

            setExam(res.data.exam);

        } catch (err) {
            console.error(err);
        }
    };



    // Fetch Teacher
    const fetchTeacher = async () => {
        try {

            const res = await axios.get(
                `${URL}/sunday-classes/teachers/details`,
                { headers: { Authorization: token } }
            );

            const teacherData = res.data.teachers.find(
                t => t.teacher_id === rawTeacherId
            );
            setTeacher(teacherData);

        } catch (err) {
            console.error(err);
        }
    };



    // Fetch Students
    const fetchStudents = async () => {
        try {

            const res = await axios.get(
                `${URL}/sunday-classes/teacher/students?teacherId=${teacherId}`,
                { headers: { Authorization: token } }
            );

            setStudents(res.data.students || []);

        } catch (err) {
            console.error(err);
        }
    };



    useEffect(() => {
        fetchExam();
        fetchTeacher();
        fetchStudents();
    }, [examId]);



    // Find teacher class inside exam
    useEffect(() => {

        if (!exam || !teacher) return;

        const classLabel =
            teacher.class_name +
            (teacher.section_name ? ` - ${teacher.section_name}` : "");

        const cls = (exam.classExams || []).find(
            c => c.className === classLabel
        );

        setSelectedClassExam(cls);

        if (cls?.participants?.length) {
            const ids = cls.participants.map(p => p.member_id);
            setSelectedStudents(ids);
        }

    }, [exam, teacher]);



    const toggleStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
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


    const saveParticipants = async () => {
        if (saving) return;

        try {

            if (!selectedClassExam) {
                setResponse({ status: "Failed", message: "Class not found in exam" });
                return;
            }

            setSaving(true);

            const selected = students
                .filter(s => selectedStudents.includes(s.member_id))
                .map(s => ({
                    member_id: s.member_id,
                    member_name: s.member_name,
                    class_name: s.class_name,
                    section_name: s.section_name
                }));

            const payload = {
                examId,
                className: selectedClassExam.className,
                participants: selected
            };

            await axios.post(
                `${URL}/sundayschool-exams/add-participants`,
                payload,
                { headers: { Authorization: token } }
            );

            setResponse({
                status: "Success",
                message: "Participants saved successfully"
            });

            setTimeout(() => {
                navigate(-1);
            }, 1200);

        } catch (err) {

            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save"
            });

        }
        finally {
            setSaving(false);
        }


    };



    if (!exam || !teacher) {
        return <div className="p-10 text-center">Loading...</div>;
    }



    const teacherClassLabel =
        teacher.class_name +
        (teacher.section_name ? ` - ${teacher.section_name}` : "");




    const filteredStudents = students.filter(s => {

        const label =
            s.class_name +
            (s.section_name ? ` - ${s.section_name}` : "");

        return label === teacherClassLabel;

    });



    return (
        <div className="p-4">
            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

                <FaArrowLeft
                    className="cursor-pointer mb-4"
                    onClick={() => navigate(-1)}
                />

                <div className="bg-white shadow rounded p-5">

                    <h2 className="text-lg font-semibold mb-4">
                        Add Students for Exam
                    </h2>


                    {/* Exam Info */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Exam</label>
                            <p className="mt-1 text-sm text-gray-900">{exam.examName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {moment(exam.examDate).format("DD-MM-YYYY")}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Center</label>
                            <p className="mt-1 text-sm text-gray-900">{exam.examcenter}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <p className="mt-1 text-sm text-gray-900">{teacherClassLabel}</p>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Portion</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {selectedClassExam?.portion || "-"}
                            </p>
                        </div>

                    </div>


                    {/* Students */}
                    {/* 
                    <div className="border rounded p-3 bg-gray-50">

                        <h4 className="font-semibold mb-3">Select Students</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">

                            {filteredStudents.map(student => (

                                <label
                                    key={student.member_id}
                                    className="flex items-center space-x-2"
                                >

                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.member_id)}
                                        onChange={() => toggleStudent(student.member_id)}
                                    />

                                    <span>
                                        {student.member_name} ({student.member_id})
                                    </span>

                                </label>

                            ))}

                        </div>

                    </div> */}

                    <div className="border rounded p-3 bg-gray-50">

                        <h4 className="font-semibold mb-3">Select Students for {exam.examName}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-90 overflow-y-auto">

                            {filteredStudents.map((student) => {

                                const isSelected = selectedStudents.includes(student.member_id);

                                return (

                                    <div
                                        key={student.member_id}
                                        className={`rounded flex items-center text-sm transition
                        ${isSelected
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-white"}
                    `}
                                    >

                                        {/* Student ID */}
                                        <div
                                            className={`w-1/3 px-3 py-2 border-r transition
${isSelected ? "font-semibold text-green-600" : "text-gray-800"}
`}
                                        >
                                            {student.member_id}
                                        </div>

                                        {/* Name */}
                                        <div
                                            className={`w-1/3 px-3 py-2 border-r transition
${isSelected ? "font-semibold text-green-600" : "text-gray-800"}
`}
                                        >
                                            {student.member_name}
                                        </div>

                                        {/* Add / Added */}
                                        <div className="w-1/3 px-3 py-2 flex justify-center">

                                            <button
                                                onClick={() => toggleStudent(student.member_id)}
                                                className={`px-4 py-1 text-xs rounded-full font-medium transition-all duration-200
        ${isSelected
                                                        ? "bg-lavender--600 text-white shadow-sm"
                                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                                    }
    `}
                                            >
                                                {isSelected ? "Added" : "Add"}
                                            </button>

                                        </div>
                                    </div>

                                );
                            })}

                        </div>

                    </div>



                    <div className="flex justify-end mt-4">

                        <button
                            onClick={saveParticipants}
                            disabled={saving}
                            className={`px-5 py-2 rounded text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
                        >

                            {saving && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}

                            {saving ? "Saving..." : "Save Participants"}

                        </button>

                    </div>

                </div>



                {Response.status && (
                    Response.status === "Success"
                        ? <SuccessMessage Message={Response.message} />
                        : <FailedMessage Message={Response.message} />
                )}

            </div>

        </div>
    );
};