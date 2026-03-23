import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaTrash } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

const SundayEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [event, setEvent] = useState(null);
    const [students, setStudents] = useState([]);

    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [participantBlocks, setParticipantBlocks] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState(null);
    const [competitionOptions, setCompetitionOptions] = useState([]);
    const [selectedClassEvent, setSelectedClassEvent] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        fetchEvent();
        fetchStudents();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`${URL}/sundayschool-events/${id}`, {
                headers: { Authorization: token },
            });

            if (res.data.success) {
                const ev = res.data.event;

                setEvent(ev);

                // set first class as selected class
                if (ev.classEvents && ev.classEvents.length > 0) {
                    const firstClass = ev.classEvents[0];

                    setSelectedClassEvent(firstClass);
                    setCompetitionOptions(firstClass.competitions || []);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

            const res = await axios.get(
                `${URL}/sunday-classes/teacher/students?teacherId=${encodeURIComponent(teacherId)}`,
                { headers: { Authorization: token } }
            );

            setStudents(res.data.students || []);
        } catch (err) {
            console.error(err);
        }
    };

    const enrollTeacher = async () => {
        try {
            const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

            const teacherRes = await axios.get(
                `${URL}/sunday-classes/teachers/details`,
                { headers: { Authorization: token } }
            );

            const teacher = teacherRes.data.teachers.find(
                (t) => t.teacher_id === teacherId
            );

            const payload = {
                eventId: event._id,
                teachers: selectedTeachers.map((comp) => ({
                    competition: comp,
                    teacherId: teacher.teacher_id,
                    teacherName: teacher.teacher_name,
                    className: teacher.class_name,
                })),
            };

            await axios.post(`${URL}/sundayschool-events/add-teachers`, payload, {
                headers: { Authorization: token },
            });

            setIsConfirmModalOpen(false);
            fetchEvent();
        } catch (err) {
            console.error(err);
        }
    };

    if (!event) return <div className="p-6">Loading...</div>;

    const handlegoback = () => navigate("/admin/sundayschoolevent");

    return (


        <>
            <div className="flex justify-start mt-6">
                <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" />
            </div>
            <div className="p-6 bg-white shadow rounded-lg">

                {/* HEADER */}
                <div className="flex justify-between mb-5">
                    <h1 className="text-xl font-semibold">Event Details</h1>
                </div>

                {/* EVENT INFO */}
                <div className="space-y-3 text-sm">

                    {[
                        { label: "Event By", value: event.eventBy?.name },
                        { label: "Event Name", value: event.eventName },
                        {
                            label: "Event Date",
                            value: event.eventDate
                                ? moment(event.eventDate).format("DD-MM-YYYY")
                                : "-",
                        },
                        {
                            label: "Register Before",
                            value: event.registerBefore
                                ? moment(event.registerBefore).format("DD-MM-YYYY")
                                : "-",
                        },
                        { label: "Venue", value: event.venue },
                        { label: "Description", value: event.description },
                        {
                            label: "Teacher Competitions",
                            value: event.teacherCompetitions?.join(", "),
                            hasButton: true,
                        },
                    ].map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2">

                            <div className="col-span-4 font-semibold">{item.label}</div>
                            <div className="col-span-6">{item.value || "-"}</div>

                            {item.hasButton && (
                                <div className="col-span-2 flex justify-end">

                                    {event?.teacherCompEvents?.some((tce) =>
                                        tce.participants?.some(
                                            (p) =>
                                                String(p.member_id) ===
                                                String(JSON.parse(atob(token.split(".")[1])).member_id)
                                        )
                                    ) ? (
                                        <button className="px-3 py-1 bg-green-600 text-white rounded">
                                            Enrolled
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsTeacherModalOpen(true)}
                                            className="px-3 py-1 bg-lavender--600 text-white rounded"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CLASS EVENTS */}
                <h3 className="font-semibold text-lg mt-6">Class Events</h3>

                {selectedClassEvent && (
                    <div className="border p-3 rounded mt-3">

                        <div className="flex justify-between">
                            <p className="font-medium">{selectedClassEvent.className}</p>
                        </div>

                        {(selectedClassEvent.competitions || []).map((comp) => (
                            <div key={comp._id} className="mt-2 border p-2 rounded bg-gray-50">

                                <p className="font-semibold">
                                    {comp.competition} — <em>{comp.title}</em>
                                </p>

                                {comp.participants?.length ? (
                                    <ul className="ml-4">
                                        {comp.participants.map((p, i) => (
                                            <li key={i}>
                                                {p.member_name}
                                                {p.prize && p.prize !== "None" && <> — {p.prize}</>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">
                                        No participants added yet.
                                    </p>
                                )}

                            </div>
                        ))}

                    </div>
                )}

                {/* ADD PARTICIPANTS MODAL */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setSelectedClassEvent(null);
                        setCompetitionOptions([]);
                        setSelectedCompetition(null);
                        setParticipantBlocks([]);
                    }}
                    title="Add Competition Participants"
                >

                    {/* Competition Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <select
                            className="border p-2 rounded"
                            value={selectedCompetition?._id || ""}
                            onChange={(e) => {
                                const comp = competitionOptions.find(
                                    (c) => c._id === e.target.value
                                );
                                setSelectedCompetition(comp);
                            }}
                        >
                            <option value="">Select Competition</option>
                            {competitionOptions.map((comp) => (
                                <option key={comp._id} value={comp._id}>
                                    {comp.competition}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            readOnly
                            value={selectedCompetition?.title || ""}
                            className="border p-2 rounded"
                        />
                    </div>

                    {/* Add Block */}
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={() => {
                                if (!selectedCompetition) return;

                                setParticipantBlocks((prev) => [
                                    ...prev,
                                    {
                                        competitionId: selectedCompetition._id,
                                        title: selectedCompetition.title,
                                        students: [],
                                    },
                                ]);
                            }}
                            className="px-4 py-2 bg-lavender--600 text-white rounded"
                        >
                            Add Participants
                        </button>
                    </div>

                    {/* Blocks */}
                    {participantBlocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="border p-3 mt-3 rounded">

                            <div className="flex justify-between">
                                <h3>{block.title}</h3>
                                <FaTrash
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setParticipantBlocks((prev) =>
                                            prev.filter((_, i) => i !== blockIndex)
                                        )
                                    }
                                />
                            </div>

                            {students.map((student) => (
                                <label key={student._id} className="block">

                                    <input
                                        type="checkbox"
                                        checked={block.students.some(
                                            (s) => s.member_id === student.member_id
                                        )}
                                        onChange={(e) => {
                                            setParticipantBlocks((prev) => {
                                                const updated = [...prev];
                                                const blk = updated[blockIndex];

                                                if (e.target.checked) {
                                                    blk.students.push(student);
                                                } else {
                                                    blk.students = blk.students.filter(
                                                        (s) => s.member_id !== student.member_id
                                                    );
                                                }

                                                return updated;
                                            });
                                        }}
                                    />

                                    {student.member_name}

                                </label>
                            ))}
                        </div>
                    ))}
                </Modal>

                {/* TEACHER COMPETITION MODAL */}
                <Modal
                    isOpen={isTeacherModalOpen}
                    onClose={() => setIsTeacherModalOpen(false)}
                    title="Select Teacher Competitions"
                >
                    <div className="space-y-2">

                        {event.teacherCompetitions?.map((comp, idx) => (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer">

                                <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={selectedTeachers.includes(comp)}
                                    onChange={(e) =>
                                        setSelectedTeachers((prev) =>
                                            e.target.checked
                                                ? [...prev, comp]
                                                : prev.filter((c) => c !== comp)
                                        )
                                    }
                                />

                                <span>{comp}</span>

                            </label>
                        ))}

                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => {
                                setIsTeacherModalOpen(false);
                                setIsConfirmModalOpen(true);
                            }}
                            className="px-4 py-2 bg-lavender--600 text-white rounded"
                        >
                            Save
                        </button>
                    </div>
                </Modal>

                {/* CONFIRM MODAL */}
                <Modal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    title="Confirm Enrollment"
                >
                    <p>Do you want to enroll yourself?</p>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={enrollTeacher}
                            className="px-4 py-2 bg-lavender--600 text-white rounded"
                        >
                            Yes
                        </button>
                    </div>
                </Modal>

            </div>
        </>
    );
};

export default SundayEventDetails;