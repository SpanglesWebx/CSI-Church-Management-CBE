import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AddEndeavourEvent = () => {
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState("");
    const [classEvents, setClassEvents] = useState([]);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [teacherTags, setTeacherTags] = useState([]);
    const [teacherInput, setTeacherInput] = useState("");
    const [errors, setErrors] = useState({});
    const [classes, setClasses] = useState([]);
    const token = window.sessionStorage.getItem("token");
    const [eventBys, setEventBys] = useState([]);
    const [eventByInput, setEventByInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventBy, setNewEventBy] = useState([]);
    const [selectedEventBy, setSelectedEventBy] = useState("");
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [registerBefore, setRegisterBefore] = useState("");
    const [venue, setVenue] = useState("");
    const [description, setDescription] = useState("");
    const [teacherCompEvents, setTeacherCompEvents] = useState([]);





    // Add competition tag
    const handleKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
            e.preventDefault();
            const newTag = input.trim();
            if (!tags.includes(newTag)) setTags([...tags, newTag]);
            setInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleTeacherKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
            e.preventDefault();
            const newTag = teacherInput.trim();
            if (!teacherTags.includes(newTag)) setTeacherTags([...teacherTags, newTag]);
            setTeacherInput("");
        }
    };

    const removeTeacherTag = (tagToRemove) => {
        setTeacherTags(teacherTags.filter((tag) => tag !== tagToRemove));
    };



    // Add class block
    const addClassEvent = () => {
        setClassEvents((prev) => [
            ...prev,
            { className: "", competitions: [{ competition: "", title: "" }] },
        ]);
    };

    // Add competition row (only if last one is filled)
    const addCompetitionRow = (classIndex) => {
        setClassEvents((prev) => {
            const updated = prev.map((c) => ({
                ...c,
                competitions: [...c.competitions],
            }));
            const last = updated[classIndex].competitions.at(-1);
            if (!last || !last.competition.trim() || !last.title.trim()) {
                // don't create if current(last) row is empty/incomplete
                return prev;
            }
            updated[classIndex].competitions.push({ competition: "", title: "" });
            return updated;
        });
    };

    // Delete a competition row
    const deleteCompetitionRow = (classIndex, compIndex) => {
        setClassEvents((prev) => {
            const updated = prev.map((c) => ({
                ...c,
                competitions: [...c.competitions],
            }));
            updated[classIndex].competitions.splice(compIndex, 1);

            // Ensure at least one row remains
            if (updated[classIndex].competitions.length === 0) {
                updated[classIndex].competitions = [{ competition: "", title: "" }];
            }
            return updated;
        });
    };


    const handleChange = (classIndex, compIndex, field, value) => {
        setClassEvents((prev) => {
            const updated = prev.map((c) => ({ ...c, competitions: [...c.competitions] }));
            let newErrors = { ...errors };

            // 🔴 Duplicate Class Check
            if (field === "className") {
                const duplicateIndex = updated.findIndex(
                    (c, idx) => idx !== classIndex && c.className === value
                );

                if (duplicateIndex !== -1 && value.trim() !== "") {
                    newErrors[`class-${classIndex}`] = `${value} is already selected above.`;
                    setErrors(newErrors);
                    updated[classIndex].className = "";
                    return updated;
                } else {
                    delete newErrors[`class-${classIndex}`];
                    setErrors(newErrors);
                    updated[classIndex].className = value;
                }
            }

            // 🔴 Duplicate Competition Check
            if (field === "competition") {
                const competitions = updated[classIndex].competitions.map((comp) => comp.competition);
                const isDuplicate = competitions.includes(value);

                if (isDuplicate && value.trim() !== "") {
                    newErrors[`comp-${classIndex}-${compIndex}`] = `${value} competition is already added for this class.`;
                    setErrors(newErrors);
                    return prev;
                } else {
                    delete newErrors[`comp-${classIndex}-${compIndex}`];
                    setErrors(newErrors);
                    updated[classIndex].competitions[compIndex][field] = value;
                }
            }

            // 🟢 Regular field update (title)
            if (field === "title") {
                updated[classIndex].competitions[compIndex][field] = value;
            }

            return updated;
        });
    };



    const addTeacherCompBlock = () => {
        setTeacherCompEvents((prev) => [
            ...prev,
            { competitions: [{ competition: "", title: "" }] },
        ]);
    };

    const deleteTeacherCompBlock = (blockIndex) => {
        setTeacherCompEvents((prev) => {
            const updated = [...prev];
            updated.splice(blockIndex, 1);
            return updated;
        });
    };

    const addTeacherCompetitionRow = (blockIndex) => {
        setTeacherCompEvents((prev) => {
            const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
            const last = updated[blockIndex].competitions.at(-1);
            if (!last || !last.competition.trim() || !last.title.trim()) {
                return prev; // don't add if last row incomplete
            }
            updated[blockIndex].competitions.push({ competition: "", title: "" });
            return updated;
        });
    };

    const deleteTeacherCompetitionRow = (blockIndex, compIndex) => {
        setTeacherCompEvents((prev) => {
            const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
            updated[blockIndex].competitions.splice(compIndex, 1);
            if (updated[blockIndex].competitions.length === 0) {
                updated[blockIndex].competitions = [{ competition: "", title: "" }];
            }
            return updated;
        });
    };

    const handleTeacherCompChange = (blockIndex, compIndex, field, value) => {
        setTeacherCompEvents((prev) => {
            const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
            const newErrors = { ...errors };

            if (field === "competition") {
                const exists = updated[blockIndex].competitions.some(
                    (c, idx) => idx !== compIndex && c.competition === value
                );
                if (exists && value.trim() !== "") {
                    newErrors[`teacher-comp-${blockIndex}-${compIndex}`] = `${value} is already added for this section.`;
                    setErrors(newErrors);
                    return prev;
                } else {
                    delete newErrors[`teacher-comp-${blockIndex}-${compIndex}`];
                    setErrors(newErrors);
                    updated[blockIndex].competitions[compIndex][field] = value;
                }
            } else if (field === "title") {
                updated[blockIndex].competitions[compIndex][field] = value;
            }

            return updated;
        });
    };


    

    useEffect(() => {
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${URL}/endeavour-classes/event/groups`, {
        headers: { Authorization: token },
      });
      setClasses(res.data || []); // this will now be ["Primary", "Junior", "Senior"]
    } catch (err) {
      console.error("Error fetching event class groups:", err);
    }
  };
  fetchClasses();
}, [token]);


    useEffect(() => {
        const fetchEventBys = async () => {
            try {
                // const res = await axios.get(`${URL}/endeavour-eventby`, {
                //     headers: { Authorization: token },
                // });
                const res = await axios.get(`${URL}/endeavour-events/eventby/all`, { headers: { Authorization: token } });
                setEventBys(res.data.eventBys || res.data || []);
            } catch (err) {
                console.error("Error fetching Event By:", err);
            }
        };
        fetchEventBys();
    }, [token]);

    useEffect(() => {
        if (isModalOpen) {
            setNewEventBy(eventBys.map(e => e.name));
        }
    }, [isModalOpen]);





    const handleSubmit = async () => {
        try {
            const payload = {
                eventBy: selectedEventBy,
                eventName,
                eventDate,
                registerBefore,
                venue,
                description,
                studentCompetitions: tags,
                teacherCompetitions: teacherTags,
                classEvents,
                teacherCompEvents: teacherCompEvents.flatMap((t) =>
                    (t.competitions || []).map((c) => ({
                        competition: c.competition,
                        title: c.title,
                        participants: [], // optional now
                    }))
                ),
            };

            console.log("Submitting event:", payload);

            const res = await axios.post(`${URL}/endeavour-events/add`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message });
            setTimeout(() => navigate("/admin/eventend"), 2000);
            setTags([]);
            setTeacherTags([]);
            setClassEvents([]);
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save event",
            });
        }
    };

    const navigate = useNavigate();
    const handlegoback = () => {
        navigate("/admin/eventend");
    };



    return (
        <>
            <div className="flex justify-start mt-6">
                <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
            </div>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Add Endeavour Event</h1>
                </div>

                {/* Event fields (unchanged) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block mb-1 font-semibold text-gray-800">Event By</label>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="block mb-1 font-semibold text-sm text-lavender--600"
                            >
                                Add Event By
                            </button>
                        </div>
                        <select
                            value={selectedEventBy} onChange={(e) => setSelectedEventBy(e.target.value)}
                            className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                        >
                            <option value="">-- Select Event By --</option>
                            {eventBys.map((eb) => (
                                <option key={eb._id} value={eb._id}>
                                    {eb.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <label className="block mb-1 font-semibold text-gray-800">Event Name</label>
                        <input type="text" placeholder="Enter Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold text-gray-800">Event Date</label>
                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold text-gray-800">Register Before</label>
                        <input type="date" value={registerBefore} onChange={(e) => setRegisterBefore(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold text-gray-800">Event Venue</label>
                        <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Enter the venue" className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold text-gray-800">Event Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter the event description" className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                    </div>
                </div>

                {/* Competitions tags */}
                <div className="mt-5">
                    <label className="block mb-1 font-semibold text-gray-800">Student Competitions</label>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                                {tag}
                                <button type="button" className="ml-2 text-gray-600 hover:text-red-500" onClick={() => removeTag(tag)}>✕</button>
                            </span>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="+ Add the competitions"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                    />
                </div>

                {/* 🟣 TEACHER COMPETITIONS SECTION */}
                <div className="mt-3">
                    <label className="block mb-1 font-semibold text-gray-800">Teacher Competitions</label>

                    {/* Show added tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {teacherTags.map((tag, i) => (
                            <span
                                key={i}
                                className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    className="ml-2 text-gray-600 hover:text-red-500"
                                    onClick={() => removeTeacherTag(tag)}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Input for new tags */}
                    <input
                        type="text"
                        placeholder="+ Add the competitions"
                        value={teacherInput}
                        onChange={(e) => setTeacherInput(e.target.value)}
                        onKeyDown={handleTeacherKeyDown}
                        className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                    />
                </div>


                <div className="flex justify-end mt-6 gap-3">


                </div>

                {/* Class Blocks */}
                <div className="mt-4 space-y-6">
                    {classEvents.map((classEvent, classIndex) => (
                        <div key={classIndex} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-800">Select Class</label>
                                    <select
                                        value={classEvent.className}
                                        onChange={(e) => handleChange(classIndex, 0, "className", e.target.value)}
                                        className={`border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5
                                                ${errors[`class-${classIndex}`]
                                                ? "border-red-500"
                                                : "focus:ring-lavender--600 focus:border-lavender--600"}`}
                                    >
                                        <option value="">-- Select Class --</option>

                                        {classes.map((cls) => (
                                            <option key={cls} value={cls}>
                                                {cls}
                                            </option>
                                        ))}
                                    </select>


                                    {errors[`class-${classIndex}`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors[`class-${classIndex}`]}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Competition Rows */}
                            <div className="mt-3 space-y-3">
                                {classEvent.competitions.map((comp, compIndex) => {
                                    const isLast = compIndex === classEvent.competitions.length - 1;
                                    const filled = comp.competition.trim() && comp.title.trim();

                                    return (
                                        <div key={compIndex} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                            <div></div>

                                            <div>
                                                <label className="block mb-1 text-gray-800 font-semibold">Select Competition</label>
                                                <select
                                                    value={comp.competition}
                                                    onChange={(e) => handleChange(classIndex, compIndex, "competition", e.target.value)}
                                                    // className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                                                    className={`border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5
                                                    ${errors[`comp-${classIndex}-${compIndex}`] ? "border-red-500" : "focus:ring-lavender--600 focus:border-lavender--600"}`}
                                                >
                                                    <option value="">-- Select Competition --</option>
                                                    {tags.map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                {errors[`comp-${classIndex}-${compIndex}`] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors[`comp-${classIndex}-${compIndex}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block mb-1 text-gray-800 font-semibold">Enter Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter title"
                                                    value={comp.title}
                                                    onChange={(e) => handleChange(classIndex, compIndex, "title", e.target.value)}
                                                    className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                {isLast ? (
                                                    <button
                                                        onClick={() => addCompetitionRow(classIndex)}
                                                        disabled={!filled}
                                                        className={`px-4 py-2 rounded-lg text-white ${filled ? "bg-lavender--600" : "bg-lavender--600 opacity-50 cursor-not-allowed"}`}
                                                    >
                                                        <FaPlus title="Add"/>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => deleteCompetitionRow(classIndex, compIndex)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        <FaTrash title="Delete"/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6 gap-3">
                    <button onClick={addClassEvent} className="px-5 py-2 bg-lavender--600 text-white rounded-lg">Add Event for Class</button>
                </div>
                {/* Teacher Competition Blocks */}
                <div className="mt-4 space-y-6">
                    {teacherCompEvents.map((block, blockIndex) => (
                        <div key={blockIndex} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-md font-semibold text-gray-800">Teacher Competitions</h3>
                                <button
                                    title="Remove"
                                    type="button"
                                    onClick={() => deleteTeacherCompBlock(blockIndex)}
                                    className="text-sm text-red-500"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="space-y-3">
                                {block.competitions.map((comp, compIndex) => {
                                    const isLast = compIndex === block.competitions.length - 1;
                                    const filled = comp.competition.trim() && comp.title.trim();

                                    return (
                                        <div key={compIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                            <div>
                                                <label className="block mb-1 text-gray-800 font-semibold">Select Competition</label>
                                                <select
                                                    value={comp.competition}
                                                    onChange={(e) => handleTeacherCompChange(blockIndex, compIndex, "competition", e.target.value)}
                                                    className={`border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5
                                                    ${errors[`teacher-comp-${blockIndex}-${compIndex}`] ? "border-red-500" : "focus:ring-lavender--600 focus:border-lavender--600"}`}
                                                >
                                                    <option value="">-- Select Competition --</option>
                                                    {teacherTags.map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                {errors[`teacher-comp-${blockIndex}-${compIndex}`] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors[`teacher-comp-${blockIndex}-${compIndex}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block mb-1 text-gray-800 font-semibold">Enter Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter title"
                                                    value={comp.title}
                                                    onChange={(e) => handleTeacherCompChange(blockIndex, compIndex, "title", e.target.value)}
                                                    className="border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5"
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                {isLast ? (
                                                    <button
                                                        onClick={() => addTeacherCompetitionRow(blockIndex)}
                                                        disabled={!filled}
                                                        className={`px-4 py-2 rounded-lg text-white ${filled ? "bg-lavender--600" : "bg-lavender--600 opacity-50 cursor-not-allowed"}`}
                                                    >
                                                        <FaPlus title="Add"/>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => deleteTeacherCompetitionRow(blockIndex, compIndex)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        <FaTrash title="Delete"/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={addTeacherCompBlock}
                        className="px-5 py-2 bg-lavender--600 text-white rounded-lg"
                    >
                        Add Teacher Competitions
                    </button>
                </div>


                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                                <h2 className="text-lg font-semibold mb-3 text-gray-800">Add Event By</h2>

                                {/* 🌟 Event By Tag Input Section */}
                                <div className="mt-2">

                                    {/* Tag Display */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {newEventBy.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    className="ml-2 text-gray-600 hover:text-red-500"
                                                    onClick={() =>
                                                        setNewEventBy((prev) => prev.filter((_, index) => index !== i))
                                                    }
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Input Field */}
                                    <input
                                        type="text"
                                        placeholder="+ Add the Event By"
                                        value={eventByInput}
                                        onChange={(e) => setEventByInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.key === "Enter" || e.key === "Tab") && eventByInput.trim()) {
                                                e.preventDefault();
                                                const newTag = eventByInput.trim();
                                                if (!newEventBy.includes(newTag)) {
                                                    setNewEventBy([...newEventBy, newTag]);
                                                }
                                                setEventByInput("");
                                            }
                                        }}
                                        className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-2 mt-5">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    {/* <button
            onClick={async () => {
              if (newEventBy.length === 0) return;
              try {
                // Send all tags as an array to backend
                const res = await axios.post(
                  `${URL}/endeavour-events/eventby`,
                  { name: newEventBy },
                  { headers: { Authorization: token } }
                );

                // Merge newly added Event Bys with existing state
                const addedEventBys = res.data.eventBys;
                const allEventBys = [
                  ...eventBys.filter(e => !addedEventBys.find(a => a.name === e.name)),
                  ...addedEventBys
                ];

                setEventBys(allEventBys);

                // Reset modal state
                setNewEventBy([]);
                setEventByInput("");
                setIsModalOpen(false);

                setResponse({
                  status: "Success",
                  message: "Event By updated successfully!",
                });
              } catch (err) {
                setResponse({
                  status: "Failed",
                  message: err.response?.data?.message || "Failed to update Event By",
                });
              }
            }}
            className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
          >
            Save
          </button> */}
                                    {/* <button
                                        onClick={async () => {
                                            if (newEventBy.length === 0) return;

                                            try {
                                                // 🟢 Only send new Event Bys that are not already in the DB
                                                const existingNames = eventBys.map((e) => e.name); // current saved Event Bys
                                                const namesToAdd = newEventBy.filter((n) => !existingNames.includes(n));

                                                if (namesToAdd.length === 0) {
                                                    setResponse({
                                                        status: "Failed",
                                                        message: "No new Event By to add",
                                                    });
                                                    setIsModalOpen(false);
                                                    return;
                                                }

                                                const res = await axios.post(
                                                    `${URL}/endeavour-events/eventby`,
                                                    { name: namesToAdd },
                                                    { headers: { Authorization: token } }
                                                );

                                                // Merge newly added Event Bys with existing state
                                                const addedEventBys = res.data.eventBys;
                                                const updatedEventBys = [
                                                    ...eventBys.filter((e) => newEventBy.includes(e.name)), // keep only remaining tags
                                                    ...addedEventBys, // add newly created ones
                                                ];

                                                setEventBys(updatedEventBys);

                                                setNewEventBy([]);
                                                setEventByInput("");
                                                setIsModalOpen(false);

                                                setResponse({
                                                    status: "Success",
                                                    message: "Event By updated successfully!",
                                                });
                                            } catch (err) {
                                                setResponse({
                                                    status: "Failed",
                                                    message: err.response?.data?.message || "Failed to update Event By",
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                                    >
                                        Save
                                    </button> */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                // Send all current tags as the new state
                                                const res = await axios.put(
                                                    `${URL}/endeavour-events/eventby/update`,
                                                    { names: newEventBy },
                                                    { headers: { Authorization: token } }
                                                );

                                                setEventBys(res.data.eventBys); // update state with latest DB
                                                setNewEventBy([]);
                                                setEventByInput("");
                                                setIsModalOpen(false);

                                                setResponse({
                                                    status: "Success",
                                                    message: "Event By updated successfully!",
                                                });
                                            } catch (err) {
                                                setResponse({
                                                    status: "Failed",
                                                    message: err.response?.data?.message || "Failed to update Event By",
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                                    >
                                        Save
                                    </button>


                                </div>
                            </div>
                        </div>
                    </div>
                )}



                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                    >
                        Save Event
                    </button>
                </div>

            </div>


            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}

        </>

    );
};
