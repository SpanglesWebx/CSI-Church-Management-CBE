import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import { FaArrowLeft } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const SundaySclExamTeachView = () => {

    const { examId } = useParams();
    const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");

    const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

    const [exam, setExam] = useState(null);
    const [teacherClass, setTeacherClass] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [Response, setResponse] = useState({ status: null, message: "" });



    // Fetch teacher
    const fetchTeacher = async () => {
        try {
            const res = await axios.get(
                `${URL}/sunday-classes/teachers/details`,
                { headers: { Authorization: token } }
            );

            const teacher = res.data.teachers?.find(
                (t) => t.teacher_id === teacherId
            );

            if (teacher) {
                setTeacherClass(teacher);
            }
        } catch (err) {
            console.error(err);
        }
    };



    // Fetch exam
    const fetchExam = async () => {
        try {

            const res = await axios.get(
                `${URL}/sundayschool-exams/${examId}`,
                { headers: { Authorization: token } }
            );

            const examData = res.data.exam || res.data;

            setExam(examData);

        } catch (err) {
            console.error(err);
        }
    };



    useEffect(() => {
        fetchTeacher();
        fetchExam();
    }, [examId]);



    const getParticipantsForClass = (exam, className) => {
        const cls = (exam?.classExams || []).find(
            (c) => c.className === className
        );
        return cls?.participants || [];
    };



    // Enroll teacher
    const enrollTeacher = async () => {
        try {

            const teacherRes = await axios.get(
                `${URL}/sunday-classes/teachers/details`,
                { headers: { Authorization: token } }
            );

            const teacher = teacherRes.data.teachers?.find(
                (t) => t.teacher_id === teacherId
            );

            if (!teacher) {
                setResponse({ status: "Failed", message: "Teacher not found" });
                return;
            }

            const payload = {
                examId: exam._id,
                teacher: {
                    teacherId: teacher.teacher_id,
                    teacherName: teacher.teacher_name,
                    className: teacher.class_name,
                },
            };

            await axios.post(
                `${URL}/sundayschool-exams/add-teachers`,
                payload,
                { headers: { Authorization: token } }
            );

            setExam((prev) => ({
                ...prev,
                teacherDetails: [
                    ...(prev.teacherDetails || []),
                    payload.teacher,
                ],
            }));

            setResponse({
                status: "Success",
                message: "Enrolled successfully",
            });

            setIsConfirmModalOpen(false);

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Enrollment failed",
            });
        }
    };



    if (!exam) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading exam details...
            </div>
        );
    }



    const teacherClassExam = (exam?.classExams || []).filter((cls) => {
        if (!teacherClass) return false;

        const label =
            teacherClass.class_name +
            (teacherClass.section_name ? ` - ${teacherClass.section_name}` : "");

        return cls.className === label;
    });


    return (
        <div className="p-4">

            <div className="flex justify-start mb-4">
                <FaArrowLeft
                    size={18}
                    onClick={() => navigate(-1)}
                    className="cursor-pointer"
                    title="Back"
                />
            </div>



            <div className="bg-white shadow-md rounded p-5">

                <h1 className="text-lg font-semibold mb-4">
                    Sunday School Exam Details
                </h1>



                <div className="text-sm text-gray-700 space-y-3">

                    {[
                        { label: "Exam By", value: exam.examBy?.[0]?.name || "-" },
                        { label: "Exam Name", value: exam.examName },
                        {
                            label: "Exam Date",
                            value: exam.examDate
                                ? moment(exam.examDate).format("DD-MM-YYYY")
                                : "-",
                        },
                        {
                            label: "Register Before",
                            value: exam.registerBefore
                                ? moment(exam.registerBefore).format("DD-MM-YYYY")
                                : "-",
                        },
                        { label: "Center", value: exam.examcenter },
                        { label: "Description", value: exam.description },
                        { label: "Teacher Portion", value: exam.teacherExam || "-" },
                    ].map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 py-2 border-b">
                            <div className="col-span-4 font-semibold">{item.label}</div>
                            <div className="col-span-8">{item.value || "-"}</div>
                        </div>
                    ))}



                    {/* Enroll button */}
                    {!exam?.teacherDetails?.some(td => td.teacherId === teacherId) && (
                        <button
                            className="px-3 py-1 bg-lavender--600 text-white rounded text-sm mt-2"
                            onClick={() => setIsConfirmModalOpen(true)}
                        >
                            Enroll
                        </button>
                    )}



                    <h3 className="font-semibold text-base mt-6">
                        Your Class Exam
                    </h3>



                    {teacherClassExam.length > 0 ? (
                        teacherClassExam.map((cls, idx) => {

                            const participants = getParticipantsForClass(
                                exam,
                                cls.className
                            );

                            return (
                                <div key={idx} className="mt-4 border p-3 rounded">

                                    <p className="font-medium mb-2">
                                        {cls.className}
                                        <span className="text-sm text-gray-500">
                                            {" "}— {cls.portion}
                                        </span>
                                    </p>

                                    {participants.length > 0 ? (
                                        <table className="w-full text-sm border border-gray-300">

                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-2 border text-center">Sl No.</th>
                                                    <th className="p-2 border text-left">Student Name</th>
                                                    <th className="p-2 border text-center">Student ID</th>
                                                    <th className="p-2 border text-center">Marks</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {participants.map((p, i) => (
                                                    <tr key={p.member_id}>
                                                        <td className="p-2 border text-center">{i + 1}</td>
                                                        <td className="p-2 border">{p.member_name}</td>
                                                        <td className="p-2 border text-center">
                                                            {p.member_id}
                                                        </td>
                                                        <td className="p-2 border text-center">
                                                            {p.marks ?? "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            No participants added yet.
                                        </p>
                                    )}

                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500">
                            No exam assigned to your class.
                        </p>
                    )}

                </div>

            </div>



            {/* Confirm Enrollment Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Enrollment"
            >
                <p>
                    Do you want to enroll yourself for this exam's teacher portion?
                </p>

                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        className="px-3 py-1 bg-gray-300 rounded"
                        onClick={() => setIsConfirmModalOpen(false)}
                    >
                        No
                    </button>

                    <button
                        className="px-3 py-1 bg-lavender--600 text-white rounded"
                        onClick={enrollTeacher}
                    >
                        Yes
                    </button>
                </div>
            </Modal>



            {/* Toast Message */}
            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}

        </div>
    );
};