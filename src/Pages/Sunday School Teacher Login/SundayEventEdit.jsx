import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";


const SundayEventEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = sessionStorage.getItem("token");

    const [event, setEvent] = useState(null);
    const [students, setStudents] = useState([]);

    const [selectedClassEvent, setSelectedClassEvent] = useState(null);
    const [competitionOptions, setCompetitionOptions] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState(null);
    const [participantBlocks, setParticipantBlocks] = useState([]);

    const [Response, setResponse] = useState({ status: null, message: "" });
    const [saving, setSaving] = useState(false);

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
                const eventData = res.data.event;
                setEvent(eventData);

                // get teacher students



                const teacherId = encodeURIComponent(
                    JSON.parse(atob(token.split(".")[1])).member_id
                );

                const stuRes = await axios.get(
                    `${URL}/sunday-classes/teacher/students?teacherId=${teacherId}`,
                    { headers: { Authorization: token } }
                );

                const teacherStudents = stuRes.data.students || [];
                setStudents(teacherStudents);

                if (teacherStudents.length === 0) return;

                // build class label
                const teacherClass =
                    `${teacherStudents[0].class_name} - ${teacherStudents[0].section_name}`.trim();

                // find matching class
                const matchedClass = eventData.classEvents?.find(
                    (cls) => cls.className.trim() === teacherClass
                );

                if (matchedClass) {
                    setSelectedClassEvent(matchedClass);
                    setCompetitionOptions(matchedClass.competitions || []);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {


            const teacherId = encodeURIComponent(
                JSON.parse(atob(token.split(".")[1])).member_id
            );

            const res = await axios.get(
                `${URL}/sunday-classes/teacher/students?teacherId=${teacherId}`,
                { headers: { Authorization: token } }
            );

            setStudents(res.data.students || []);
        } catch (err) {
            console.error(err);
        }
    };


    const competitionAlreadyAdded =
        selectedCompetition &&
        participantBlocks.some(
            (b) => b.competitionId === selectedCompetition._id
        );

    if (!event) return <div className="p-6">Loading...</div>;

    return (
        <>
            <div className="flex justify-start mt-6">
                <FaArrowLeft size={18} onClick={() => navigate(-1)} className="cursor-pointer" />
            </div>


            <div className="p-6 bg-white  rounded-lg">

                {/* Header */}
                <div className="flex justify-between mb-6">
                    <h1 className="text-xl font-semibold">Edit Event Participants</h1>


                </div>

                {/* Event Info */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">

                    <div>
                        <b>Event Name:</b> {event.eventName}
                    </div>

                    <div>
                        <b>Event Date:</b>{" "}
                        {event.eventDate
                            ? moment(event.eventDate).format("DD-MM-YYYY")
                            : "-"}
                    </div>

                    <div>
                        <b>Register Before:</b>{" "}
                        {event.registerBefore
                            ? moment(event.registerBefore).format("DD-MM-YYYY")
                            : "-"}
                    </div>

                    <div>
                        <b>Venue:</b> {event.venue}
                    </div>

                </div>

                {/* Add Participants Section */}
                <div className="space-y-4 ">

                    {/* Competition Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Competition
                            </label>

                            <select
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                value={selectedCompetition?._id || ""}
                                onChange={(e) => {
                                    const comp = competitionOptions.find(
                                        (c) => c._id === e.target.value
                                    ) || null;

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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>

                            <input
                                type="text"
                                readOnly
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                value={selectedCompetition?.title || ""}
                            />
                        </div>

                    </div>

                    {/* Add Participants Button */}
                    <div className="flex justify-end mt-3">

                        <button
                            disabled={!selectedCompetition || competitionAlreadyAdded}
                            onClick={() => {

                                if (!selectedCompetition) return;

                                const exists = participantBlocks.find(
                                    (b) => b.competitionId === selectedCompetition._id
                                );

                                if (exists) return;

                                const preselected = students.filter((stu) =>
                                    (selectedCompetition.participants || []).some(
                                        (p) => String(p.member_id) === String(stu.member_id)
                                    )
                                );

                                setParticipantBlocks((prev) => [
                                    ...prev,
                                    {
                                        competitionId: selectedCompetition._id,
                                        title: selectedCompetition.title,
                                        students: preselected,
                                    },
                                ]);

                                setSelectedCompetition(null);
                            }}
                            // className="px-5 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                            className={`px-5 py-2 rounded-lg text-white
        ${!selectedCompetition || competitionAlreadyAdded
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-lavender--600 hover:bg-lavender--700"
                                }`}
                        >
                            Add Participants
                        </button>

                    </div>

                    {/* Participant Blocks */}
                    <div className="space-y-4">

                        {participantBlocks.map((block, blockIndex) => {

                            const classStudents = students;

                            return (
                                <div
                                    key={blockIndex}
                                    className="border p-4 rounded-lg bg-gray-50 shadow-sm"
                                >

                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">{block.title}</h3>

                                        <button
                                            onClick={() =>
                                                setParticipantBlocks((prev) =>
                                                    prev.filter((_, i) => i !== blockIndex)
                                                )
                                            }
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">

                                        {classStudents.map((student) => (

                                            <label
                                                key={student._id}
                                                className="flex items-center space-x-2"
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={block.students.some(
                                                        (s) =>
                                                            String(s.member_id) ===
                                                            String(student.member_id)
                                                    )}
                                                    onChange={(e) => {

                                                        setParticipantBlocks((prev) => {

                                                            const updated = [...prev];
                                                            const blk = updated[blockIndex];

                                                            if (e.target.checked) {

                                                                if (
                                                                    !blk.students.some(
                                                                        (x) =>
                                                                            String(x.member_id) ===
                                                                            String(student.member_id)
                                                                    )
                                                                ) {
                                                                    blk.students.push(student);
                                                                }

                                                            } else {

                                                                blk.students = blk.students.filter(
                                                                    (s) =>
                                                                        String(s.member_id) !==
                                                                        String(student.member_id)
                                                                );

                                                            }

                                                            return updated;
                                                        });
                                                    }}
                                                />

                                                <span>{student.member_name}</span>

                                            </label>

                                        ))}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                    {/* Save Button */}
                    {participantBlocks.some((b) => b.students.length > 0) && (

                        <div className="flex justify-end mt-4">

                            <button
                                disabled={saving}
                                onClick={async () => {

                                    try {
                                        setSaving(true);
                                        const payload = {
                                            eventId: event._id,
                                            className: selectedClassEvent.className,
                                            participants: participantBlocks.map((block) => ({
                                                competitionId: block.competitionId,
                                                students: block.students.map((s) => ({
                                                    member_id: s.member_id,
                                                    member_name: s.member_name,
                                                    class_name: s.class_name,
                                                    section_name: s.section_name,
                                                })),
                                            })),
                                        };

                                        await axios.post(
                                            `${URL}/sundayschool-events/add-participants`,
                                            payload,
                                            { headers: { Authorization: token } }
                                        );

                                        setParticipantBlocks([]);

                                        setResponse({
                                            status: "Success",
                                            message: "Participants saved successfully",
                                        });

                                        setTimeout(() => {
                                            navigate("/admin/sundayschoolevent");
                                        }, 1200);

                                    } catch (err) {
                                        console.error(err);

                                        setResponse({
                                            status: "Failed",
                                            message: "Failed to save participants",
                                        });
                                    } finally {
                                        setSaving(false);
                                    }

                                }}
                                // className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                                className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Participants"}
                            </button>

                        </div>

                    )}

                </div>

                {Response.status === "Success" && (
                    <SuccessMessage Message={Response.message} />
                )}

                {Response.status === "Failed" && (
                    <FailedMessage Message={Response.message} />
                )}

            </div>

        </>

    );
};

export default SundayEventEdit;