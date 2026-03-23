import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from 'axios';
import Modal from '../../Components/Expense/ExpenseFormModal';
import { CiEdit } from 'react-icons/ci';

export const EndeavourSclExam = () => {
    const [exams, setExams] = useState([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const token = window.sessionStorage.getItem("token");
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    // Edit participants modal state
    const [isEditParticipantsOpen, setIsEditParticipantsOpen] = useState(false);
    const [editTargetClass, setEditTargetClass] = useState(null);
    const [editClassStudents, setEditClassStudents] = useState([]);
    const [editSelectedStudentIds, setEditSelectedStudentIds] = useState([]);

    // marks editing
    const [editingMarksClass, setEditingMarksClass] = useState(null);
    const [marksDraftByClass, setMarksDraftByClass] = useState({});

    const handleAddEvent = () => navigate("/admin/endeavourexam/addendeavourexam");

    const fetchExams = async () => {
        try {
            const res = await axios.get(`${URL}/endeavour-exams/all`, {
                headers: { Authorization: token },
                params: {
                    page: currentPage,
                    limit: 10,
                    search,
                    startDate,
                    endDate,
                },
            });
            setExams(res.data.exams || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [search, startDate, endDate, currentPage]);

    const handleViewClick = (exam) => {
        setSelectedExam(exam);
        setIsViewModalOpen(true);
    };

    const getParticipantsForClass = (exam, className) => {
        const cls = (exam?.classExams || []).find(c => c.className === className);
        return cls?.participants || [];
    };

    const handleEditParticipants = (cls) => {
        if (!selectedExam) {
            setResponse({ status: "Failed", message: "Please open an exam first (view) before editing participants." });
            return;
        }

        try {
            setEditTargetClass(cls);

            const currentParticipants = (cls.participants || []).map(p => ({
                _id: p._id,
                member_id: p.member_id,
                member_name: p.member_name,
                class_name: p.class_name,
                section_name: p.section_name,
                marks: p.marks,
            }));

            setEditClassStudents(currentParticipants);
            setEditSelectedStudentIds(currentParticipants.map(p => p.member_id));

            setIsEditParticipantsOpen(true);
        } catch (err) {
            console.error("Open edit participants error:", err);
            setResponse({ status: "Failed", message: "Failed to open participants editor" });
        }
    };

    const toggleEditStudentCheckbox = (member_id) => {
        setEditSelectedStudentIds(prev =>
            prev.includes(member_id) ? prev.filter(id => id !== member_id) : [...prev, member_id]
        );
    };

    const saveEditedParticipants = async () => {
        try {
            if (!selectedExam || !editTargetClass) {
                setResponse({ status: "Failed", message: "No exam/class selected." });
                return;
            }

            const selectedObjects = (editClassStudents || [])
                .filter(s => editSelectedStudentIds.includes(s.member_id))
                .map(s => ({
                    member_id: s.member_id,
                    member_name: s.member_name,
                    class_name: s.class_name,
                    section_name: s.section_name,
                    marks: s.marks ?? null,
                }));

            const payload = {
                examId: selectedExam._id,
                className: editTargetClass.className,
                participants: selectedObjects,
            };

            await axios.post(`${URL}/endeavour-exams/add-participants`, payload, {
                headers: { Authorization: token },
            });

            setExams(prevExams => prevExams.map(ex => {
                if (String(ex._id) !== String(selectedExam._id)) return ex;
                return {
                    ...ex,
                    classExams: (ex.classExams || []).map(c => {
                        if (c.className !== editTargetClass.className) return c;
                        return { ...c, participants: selectedObjects };
                    })
                };
            }));

            setSelectedExam(prev => {
                if (!prev || String(prev._id) !== String(selectedExam._id)) return prev;
                return {
                    ...prev,
                    classExams: (prev.classExams || []).map(c => {
                        if (c.className !== editTargetClass.className) return c;
                        return { ...c, participants: selectedObjects };
                    })
                };
            });

            setIsEditParticipantsOpen(false);
            setEditTargetClass(null);
            setEditClassStudents([]);
            setEditSelectedStudentIds([]);
            setResponse({ status: "Success", message: "Participants updated." });
        } catch (err) {
            console.error("Save edited participants error:", err);
            setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update participants" });
        }
    };

    // --- Marks editing helpers ---
    const handleEditMarksToggle = (cls) => {
        const draft = (cls.participants || []).map(s => ({
            member_id: s.member_id,
            member_name: s.member_name,
            class_name: s.class_name,
            section_name: s.section_name,
            marks: s.marks ?? "",
        }));
        setMarksDraftByClass(prev => ({ ...prev, [cls.className]: draft }));
        setEditingMarksClass(cls.className);
    };

    const handleDraftMarkChange = (className, idx, value) => {
        setMarksDraftByClass(prev => {
            const copy = { ...prev };
            const arr = [...(copy[className] || [])];
            arr[idx] = { ...arr[idx], marks: value };
            copy[className] = arr;
            return copy;
        });
    };

    const saveEditedMarks = async (className) => {
        try {
            if (!selectedExam) {
                setResponse({ status: "Failed", message: "Select exam first." });
                return;
            }

            const marksData = (marksDraftByClass[className] || []).map(m => ({
                member_id: m.member_id,
                marks: m.marks === "" ? null : Number(m.marks),
            }));

            const payload = {
                examId: selectedExam._id,
                className,
                marksData,
            };

            const classExam = selectedExam.classExams.find(c => c.className === className);
            const hasMarks = classExam?.participants?.some(p => p.marks !== null && p.marks !== undefined);
            const endpoint = hasMarks ? "update-marks" : "add-marks";

            const res = await axios({
                method: hasMarks ? "put" : "post",
                url: `${URL}/endeavour-exams/${endpoint}`,
                data: payload,
                headers: { Authorization: token },
            });

            const updatedRes = await axios.get(`${URL}/endeavour-exams/all`, {
                headers: { Authorization: token },
                params: {
                    page: currentPage,
                    limit: 10,
                    search,
                    startDate,
                    endDate,
                },
            });

            const updatedExams = updatedRes.data.exams || [];
            setExams(updatedExams);
            setTotalPages(updatedRes.data.totalPages || 1);

            const updatedExam = updatedExams.find(e => e._id === selectedExam._id);
            if (updatedExam) setSelectedExam(updatedExam);

            setEditingMarksClass(null);
            setResponse({ status: "Success", message: res.data.message || "Marks saved." });
        } catch (err) {
            console.error("Save edited marks error:", err);
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save marks",
            });
        }
    };

    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <h3 className=" font-semibold">Endeavour Exam</h3>
                <div className="flex items-center justify-between p-4">
                    <div className="">
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search Members</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input type="search" id="default-search" className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
                        <label className="text-l font-medium text-gray-600 mb-1">From</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600" />
                        <label className="text-l font-medium text-gray-600 mb-1">To</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600" />
                    </div>
                    <button onClick={handleAddEvent} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
                        <FaPlus /> New Exam
                    </button>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Exam Name</th>
                                <th className="p-2 text-center">Exam Date</th>
                                <th className="p-2 text-center">Exam Center</th>
                                <th className="p-2 text-center">Register Before</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length > 0 ? (
                                exams.map((exam, idx) => (
                                    <tr key={exam._id} className="p-2 text-center">
                                        <td>{(currentPage - 1) * 10 + idx + 1}</td>
                                        <td>{exam.examName}</td>
                                        <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                                        <td>{exam.examcenter}</td>
                                        <td>{new Date(exam.registerBefore).toLocaleDateString()}</td>
                                        <td className='p-2 text-center'>
                                            <div className="flex items-center justify-center gap-3">
                                                <FaEye title='View exams' size={18} className="text-lavender--600 cursor-pointer" onClick={() => handleViewClick(exam)} />
                                                <CiEdit title='Edit exams' size={20} className="text-lavender--600 cursor-pointer" onClick={() => navigate(`/admin/endeavourexam/editendeavourexam/${exam._id}`)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-4 text-gray-500">No exams found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">Previous</button>
                    <span className="px-4 py-2 bg-lavender--600 text-white rounded">{currentPage}</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">Next</button>
                    <div className="absolute flex px-5 space-x-2 rounded right-1">
                        <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">Total Pages: {totalPages}</span>
                        <span onClick={() => setCurrentPage(totalPages)} className={`${totalPages === currentPage ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed" : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"}`}>Last Page</span>
                    </div>
                </div>
            </div>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Exam Details">
                {selectedExam ? (
                    <div className="text-sm text-gray-700 space-y-4 max-h-[600px] overflow-y-auto">
                        {[
                            { label: "Exam By", value: selectedExam.examBy?.[0]?.name || "-" },
                            { label: "Exam Name", value: selectedExam.examName },
                            { label: "Exam Date", value: selectedExam.examDate ? new Date(selectedExam.examDate).toLocaleDateString() : "-" },
                            { label: "Register Before", value: selectedExam.registerBefore ? new Date(selectedExam.registerBefore).toLocaleDateString() : "-" },
                            { label: "Center", value: selectedExam.examcenter || "-" },
                            { label: "Description", value: selectedExam.description || "-" },
                            { label: "Teacher Portion", value: selectedExam.teacherExam || "-" },
                        ].map((item, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 py-1">
                                <div className="col-span-12 sm:col-span-4 font-semibold">{item.label}</div>
                                <div className="col-span-12 sm:col-span-8">{item.value}</div>
                            </div>
                        ))}

                        <h5 className="font-semibold">Teacher Details</h5>
                        <div className="mt-3 border p-3 rounded">
                            {selectedExam?.teacherDetails?.length > 0 ? (
                                <table className="w-full text-sm border border-gray-300 mt-2 table-fixed">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 border text-center w-20">Sl No.</th>
                                            <th className="p-2 border text-center w-1/2">Teacher Name</th>
                                            <th className="p-2 border text-center w-1/4">Teacher ID</th>
                                            <th className="p-2 border text-center w-1/4">Class</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedExam.teacherDetails.map((td, i) => (
                                            <tr key={td._id || i}>
                                                <td className="p-2 border text-center">{i + 1}</td>
                                                <td className="p-2 border">{td.teacherName}</td>
                                                <td className="p-2 border text-center">{td.teacherId}</td>
                                                <td className="p-2 border">{td.className}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 italic mt-2">No teacher details available.</p>
                            )}
                        </div>

                        <div>
                            <h5 className="font-semibold mt-4">Class Exams & Participants</h5>

                            {(selectedExam?.classExams || []).map((cls, idx) => {
                                const participants = getParticipantsForClass(selectedExam, cls.className);
                                return (
                                    <div key={cls._id || idx} className="mt-3 border p-3 rounded">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium">
                                                {cls.className} <span className="text-sm text-gray-500"> — {cls.portion}</span>
                                            </p>

                                            {/* <div className="flex items-center gap-2">
                        <button className="px-2 py-1 border rounded text-sm text-white bg-lavender--600" onClick={() => handleEditParticipants(cls)} title="Edit Participants">Edit Participants</button>

                        <button className={`px-2 py-1 border rounded text-sm ${participants.length === 0 ? "opacity-50 cursor-not-allowed" : "text-white bg-lavender--600"}`} onClick={() => participants.length > 0 && handleEditMarksToggle(cls)} title="Edit Marks" disabled={participants.length === 0}>Edit Marks</button>
                      </div> */}
                                            {participants.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    {participants.every(p => p.marks === null) && (
                                                    <button
                                                        className="px-2 py-1 border rounded text-sm text-white bg-lavender--600"
                                                        onClick={() => handleEditParticipants(cls)}
                                                        title="Edit Participants"
                                                    >
                                                        Edit Participants
                                                    </button>
                                                    )}
                                                    {cls.participants?.some(p => p.marks != null) && (

                                                    <button
                                                        className="px-2 py-1 border rounded text-sm text-white bg-lavender--600"
                                                        onClick={() => handleEditMarksToggle(cls)}
                                                        title="Edit Marks"
                                                    >
                                                        Edit Marks
                                                    </button>
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                        {participants.length > 0 ? (
                                            <table className="w-full text-sm border border-gray-300 table-fixed">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-2 border text-center w-20">Sl No.</th>
                                                        <th className="p-2 border text-left w-1/2">Student Name</th>
                                                        <th className="p-2 border text-center w-1/4">Student ID</th>
                                                        <th className="p-2 border text-center w-1/4">Marks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {participants.map((p, i) => {
                                                        const isEditingThisClass = editingMarksClass === cls.className;
                                                        const draft = (marksDraftByClass[cls.className] || [])[i];

                                                        return (
                                                            <tr key={p._id || p.member_id || i}>
                                                                <td className="p-2 border text-center">{i + 1}</td>
                                                                <td className="p-2 border">{p.member_name}</td>
                                                                <td className="p-2 border text-center">{p.member_id}</td>
                                                                <td className="p-2 border text-center">
                                                                    {isEditingThisClass ? (
                                                                        <input type="number" min={0} className="border rounded px-2 py-1 w-20 text-center" value={draft?.marks ?? ""} onChange={(e) => handleDraftMarkChange(cls.className, i, e.target.value)} />
                                                                    ) : (
                                                                        p.marks !== null && p.marks !== undefined ? p.marks : "-"
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="text-gray-500 italic">No participants added yet for this class.</p>
                                        )}

                                        {editingMarksClass === cls.className && (
                                            <div className="flex justify-end gap-2 mt-3">
                                                <button className="px-3 py-1 border rounded text-sm bg-white" onClick={() => setEditingMarksClass(null)}>Cancel</button>
                                                <button className="px-3 py-1 bg-lavender--600 text-white rounded text-sm" onClick={() => saveEditedMarks(cls.className)}>Save Marks</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Loading...</p>
                )}
            </Modal> 

            {/* Edit Participants Modal */}
            <Modal
                isOpen={isEditParticipantsOpen}
                onClose={() => {
                    setIsEditParticipantsOpen(false);
                    setEditClassStudents([]);
                    setEditSelectedStudentIds([]);
                    setEditTargetClass(null);
                }}
                title={`Edit Participants — ${editTargetClass?.className || ""}`}
            >
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(editClassStudents || []).map((stu) => (
                            <label key={stu._id || stu.member_id} className="flex items-center space-x-2">
                                <input type="checkbox" checked={editSelectedStudentIds.includes(stu.member_id)} onChange={() => toggleEditStudentCheckbox(stu.member_id)} />
                                <span>{stu.member_name} ({stu.member_id})</span>
                            </label>
                        ))}

                        {(!editClassStudents || editClassStudents.length === 0) && (
                            <p className="text-gray-500">No participants found for this class (you can add participants from the Add Participants flow in teacher view if needed).</p>
                        )}
                    </div>

                    <div className="flex justify-end mt-3 space-x-2">
                        <button className="px-3 py-1 border rounded text-sm bg-white" onClick={() => { setIsEditParticipantsOpen(false); setEditTargetClass(null); }}>Cancel</button>
                        <button className="px-5 py-2 bg-lavender--600 text-white rounded text-sm" onClick={saveEditedParticipants}>Save Participants</button>
                    </div>
                </div>
            </Modal>
            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}
        </>
    )
}
