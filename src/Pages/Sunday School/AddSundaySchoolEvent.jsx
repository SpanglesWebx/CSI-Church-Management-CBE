




import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AddSundaySchoolEvent = () => {
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
  const [newExamBy, setNewExamBy] = useState([]);

  // 🔹 Validation + UI control states

  const [activeField, setActiveField] = useState(null);
  const [saving, setSaving] = useState(false);


  const MAX_EVENTBY_LENGTH = 40;

  const [modalEventByList, setModalEventByList] = useState([]);
  const [modalSaving, setModalSaving] = useState(false);


  // Add competition tag (student)
  // const handleKeyDown = (e) => {
  //   if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
  //     e.preventDefault();
  //     const newTag = input.trim();
  //     if (!tags.includes(newTag)) setTags([...tags, newTag]);
  //     setInput("");
  //   }
  // };


  const MAX_TAG_LENGTH = 40;

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();

      const newTag = input.trim();

      // 🔴 Length validation
      if (!validateMaxLength("studentTag", newTag, MAX_TAG_LENGTH)) return;

      // 🔴 Duplicate protection
      if (tags.includes(newTag)) {
        setErrors(prev => ({
          ...prev,
          studentTag: `"${newTag}" already added`,
        }));

        setTimeout(() => {
          setErrors(prev => {
            const copy = { ...prev };
            delete copy.studentTag;
            return copy;
          });
        }, 3000);

        return;
      }

      // ✅ Add tag
      setTags(prev => [...prev, newTag]);

      // ✅ Clear input (CharCounter resets automatically)
      setInput("");

      // ✅ Clear error
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.studentTag;
        return copy;
      });
    }
  };



  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };


  const MAX_TEACHER_TAG_LENGTH = 40;
  // Add teacher competition tag
  const handleTeacherKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
      e.preventDefault();

      const newTag = teacherInput.trim();

      // 🔴 Duplicate protection
      if (teacherTags.includes(newTag)) {
        setErrors(prev => ({
          ...prev,
          teacherTag: `"${newTag}" already added`,
        }));

        setTimeout(() => {
          setErrors(prev => {
            const copy = { ...prev };
            delete copy.teacherTag;
            return copy;
          });
        }, 3000);

        return;
      }

      // ✅ Add tag
      setTeacherTags(prev => [...prev, newTag]);

      // ✅ Reset input (counter resets automatically)
      setTeacherInput("");

      // ✅ Clear error
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.teacherTag;
        return copy;
      });
    }
  };


  const removeTeacherTag = (tagToRemove) => {
    setTeacherTags(teacherTags.filter((tag) => tag !== tagToRemove));
  };

  // Add class block
  const addClassEvent = () => {
    setClassEvents((prev) => [
      ...prev,
      {
        id: Date.now(), // ✅ unique id
        className: "",
        competitions: [{ competition: "", title: "" }],
      },
    ]);
  };


  // Add competition row (only if last one is filled)
  const addCompetitionRow = (id) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const last = event.competitions.at(-1);
        if (!last || !last.competition.trim() || !last.title.trim()) {
          return event;
        }

        return {
          ...event,
          competitions: [
            ...event.competitions,
            { competition: "", title: "" },
          ],
        };
      })
    );
  };


  // Delete a competition row
  const deleteCompetitionRow = (id, compIndex) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const updatedCompetitions = event.competitions.filter(
          (_, i) => i !== compIndex
        );

        return {
          ...event,
          competitions:
            updatedCompetitions.length > 0
              ? updatedCompetitions
              : [{ competition: "", title: "" }],
        };
      })
    );
  };


  const showTemporaryError = (key, message) => {
    setErrors((prev) => ({
      ...prev,
      [key]: message,
    }));

    setTimeout(() => {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2000); // ⏳ 2 seconds
  };


  const handleChange = (id, compIndex, field, value) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        let newErrors = { ...errors };

        // 🔴 Duplicate Class Check
        if (field === "className") {
          const duplicate = prev.some(
            (e) => e.id !== id && e.className === value
          );

          if (duplicate && value.trim() !== "") {
            showTemporaryError(
              `class-${id}`,
              `${value} is already selected above.`
            );

            return { ...event, className: "" };
          }

          return { ...event, className: value };
        }

        // 🔴 Duplicate Competition Check
        if (field === "competition") {
          const exists = event.competitions.some(
            (c, i) =>
              i !== compIndex && c.competition === value
          );

          if (exists && value.trim() !== "") {
            showTemporaryError(
              `comp-${id}-${compIndex}`,
              `${value} already added for this class.`
            );

            return event;
          }
        }


        /* ===============================
           🔴 Title Length Validation (60)
        ================================*/
        if (field === "title") {
          if (value.length > 60) {
            showTemporaryError(
              `title-${id}-${compIndex}`,
              "Maximum 60 characters allowed"
            );

            return event; // stop update
          }
        }


        const updatedCompetitions =
          event.competitions.map((c, i) =>
            i === compIndex
              ? { ...c, [field]: value }
              : c
          );

        return {
          ...event,
          competitions: updatedCompetitions,
        };
      })
    );
  };


  // Teacher competition blocks
  const addTeacherCompBlock = () => {
    setTeacherCompEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        competitions: [{ competition: "", title: "" }],
      },
    ]);
  };


  const deleteTeacherCompBlock = (id) => {
    setTeacherCompEvents((prev) =>
      prev.filter((block) => block.id !== id)
    );
  };


  const addTeacherCompetitionRow = (id) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        const last = block.competitions.at(-1);
        if (!last || !last.competition.trim() || !last.title.trim()) {
          return block;
        }

        return {
          ...block,
          competitions: [
            ...block.competitions,
            { competition: "", title: "" },
          ],
        };
      })
    );
  };


  const deleteTeacherCompetitionRow = (id, compIndex) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        const updated = block.competitions.filter(
          (_, i) => i !== compIndex
        );

        return {
          ...block,
          competitions:
            updated.length > 0
              ? updated
              : [{ competition: "", title: "" }],
        };
      })
    );
  };


  const handleTeacherCompChange = (id, compIndex, field, value) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        let newErrors = { ...errors };


        // 🔴 Duplicate Competition
        if (field === "competition") {
          const exists = block.competitions.some(
            (c, i) =>
              i !== compIndex && c.competition === value
          );

          if (exists && value.trim() !== "") {
            showTemporaryError(
              `teacher-comp-${id}-${compIndex}`,
              `${value} already added.`
            );

            return block; // stop update
          }
        }


        /* ===============================
   🔴 Title Length Validation (60)
================================*/
        // 🔴 Title Length (60)
        if (field === "title") {
          if (value.length > 60) {
            showTemporaryError(
              `teacher-title-${id}-${compIndex}`,
              "Maximum 60 characters allowed"
            );

            return block; // stop update
          }
        }

        const updatedCompetitions =
          block.competitions.map((c, i) =>
            i === compIndex
              ? { ...c, [field]: value }
              : c
          );

        return {
          ...block,
          competitions: updatedCompetitions,
        };
      })
    );
  };



  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/sunday-classes/event/groups`, {
          headers: { Authorization: token },
        });
        setClasses(res.data || []); // this will now be ["Primary", "Junior", "Senior"]
      } catch (err) {
        console.error("Error fetching event class groups:", err);
      }
    };
    fetchClasses();
  }, [token]);
  const fetchEventBys = async () => {
    try {
      const res = await axios.get(
        `${URL}/sundayschool-events/eventby/all`,
        { headers: { Authorization: token } }
      );
      setEventBys(res.data.eventBys || res.data || []);
    } catch (err) {
      console.error("Error fetching Event By:", err);
    }
  };


  useEffect(() => {
    fetchEventBys();
  }, [token]);


  useEffect(() => {
    if (isModalOpen) {
      setModalEventByList(eventBys.map((e) => e.name));
    }
  }, [isModalOpen, eventBys]);



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




  const handleSubmit = async () => {

    if (saving) return;

    try {

      setSaving(true);

      /* =========================
         BASIC REQUIRED VALIDATION
      ========================= */

      if (!selectedEventBy || !eventName || !eventDate || !registerBefore || !venue || !description) {
        setResponse({
          status: "Failed",
          message: "Please fill all required fields",
        });
        return;
      }

      /* =========================
         DATE VALIDATION
      ========================= */

      const event = new Date(eventDate);
      const register = new Date(registerBefore);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (event < today) {
        setResponse({
          status: "Failed",
          message: "Event date cannot be in the past",
        });
        return;
      }

      if (register > event) {
        setResponse({
          status: "Failed",
          message: "Register before date must be earlier than event date",
        });
        return;
      }

      /* =========================
         CLEAN CLASS EVENTS
      ========================= */

      const cleanedClassEvents = classEvents
        .map(cls => ({
          ...cls,
          competitions: (cls.competitions || []).filter(
            c => c.competition && c.title
          )
        }))
        .filter(cls => cls.className && cls.competitions.length > 0);

      /* =========================
         CLEAN TEACHER EVENTS
      ========================= */

      const cleanedTeacherEvents = teacherCompEvents.flatMap((t) =>
        (t.competitions || [])
          .filter(c => c.competition && c.title)
          .map((c) => ({
            competition: c.competition,
            title: c.title,
            participants: [],
          }))
      );

      if (cleanedClassEvents.length === 0 && cleanedTeacherEvents.length === 0) {
        setResponse({
          status: "Failed",
          message: "Add at least one competition",
        });
        return;
      }

      /* =========================
         PREPARE PAYLOAD
      ========================= */

      const payload = {
        eventBy: selectedEventBy,
        eventName: eventName.trim(),
        eventDate,
        registerBefore,
        venue: venue.trim(),
        description: description.trim(),
        studentCompetitions: tags,
        teacherCompetitions: teacherTags,
        classEvents: cleanedClassEvents,
        teacherCompEvents: cleanedTeacherEvents,
      };

      /* =========================
         API CALL
      ========================= */

      const res = await axios.post(
        `${URL}/sundayschool-events/add`,
        payload,
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data?.message || "Event added successfully",
      });

      /* =========================
         RESET FORM
      ========================= */

      setTags([]);
      setTeacherTags([]);
      setClassEvents([]);
      setTeacherCompEvents([]);
      setEventName("");
      setEventDate("");
      setRegisterBefore("");
      setVenue("");
      setDescription("");
      setSelectedEventBy("");

      setTimeout(() => navigate("/admin/event"), 1500);

    } catch (err) {

      /* =========================
         SHOW BACKEND ERROR
      ========================= */

      let backendMessage = "Failed to save event";

      if (err.response) {
        backendMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data);
      } else if (err.message) {
        backendMessage = err.message;
      }

      setResponse({
        status: "Failed",
        message: backendMessage,
      });

    } finally {

      setSaving(false);

    }
  };

  const navigate = useNavigate();
  const handlegoback = () => {
    navigate("/admin/event");
  };

  const deleteClassEventBlock = (id) => {
    setClassEvents((prev) =>
      prev.filter((event) => event.id !== id)
    );
  };


  const validateMaxLength = (name, value, max = 100) => {
    if (value.length > max) {
      setErrors(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));

      setTimeout(() => {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 4000);

      return false;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return true;
  };


  const RequiredLabel = ({ children }) => (
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-600 ml-1">*</span>
    </label>
  );


  const CharCounter = ({ value = "", max = 100, show }) => {
    if (!show || !value.length) return null;

    return (
      <span
        className={`absolute bottom-1 right-2 text-[10px]
        ${value.length > max ? "text-red-500" : "text-gray-400"}`}
      >
        {value.length}/{max}
      </span>
    );
  };



  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

        <div className="flex justify-start mt-6">
          <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black">
              Add Sunday School Event
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            {/* Event By */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Event By <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-medium text-lavender--600"
                >
                  Add Event By
                </button>
              </div>

              <select
                value={selectedEventBy}
                onChange={(e) => setSelectedEventBy(e.target.value)}
                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              >
                <option value="">-- Select Event By --</option>
                {eventBys.map((eb) => (
                  <option key={eb._id} value={eb._id}>
                    {eb.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Name */}
            <div className="relative">
              <RequiredLabel>Event Name</RequiredLabel>
              <input
                type="text"
                value={eventName}
                // onChange={(e) => setEventName(e.target.value)}
                // className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                onFocus={() => setActiveField("eventName")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("eventName", val, 50)) {
                    setEventName(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
      ${errors.eventName ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={eventName}
                max={50}
                show={activeField === "eventName"}
              />

              {errors.eventName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.eventName}
                </p>
              )}
            </div>

            {/* Event Date */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Event Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={eventDate}
                max={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>
          </div>

    
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Register Before
              </label>
              <input
                type="date"
                value={registerBefore}
                max={eventDate}
                onChange={(e) => setRegisterBefore(e.target.value)}
                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            <div className="relative">
              <RequiredLabel>Event Venue</RequiredLabel>
              <input
                type="text"
                value={venue}
                // onChange={(e) => setVenue(e.target.value)}
                // className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                onFocus={() => setActiveField("venue")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("venue", val, 100)) {
                    setVenue(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
      ${errors.venue ? "border-red-500" : "border-gray-300"}`}
              />
              <CharCounter
                value={venue}
                max={100}
                show={activeField === "venue"}
              />

              {errors.venue && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.venue}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Event Description
              </label>
              <input
                type="text"
                value={description}
                // onChange={(e) => setDescription(e.target.value)}
                // className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"

                onFocus={() => setActiveField("description")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("description", val, 150)) {
                    setDescription(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
      ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              <CharCounter
                value={description}
                max={150}
                show={activeField === "description"}
              />

              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Student Competitions */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">

              <RequiredLabel>Student Competitions</RequiredLabel>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-2 hover:text-red-600"
                      onClick={() => removeTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Input Wrapper */}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  maxLength={MAX_TAG_LENGTH}
                  onFocus={() => setActiveField("studentTag")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    let val = e.target.value;

                    if (val.length > MAX_TAG_LENGTH) {
                      val = val.slice(0, MAX_TAG_LENGTH);
                    }

                    setInput(val);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type and Enter or Tab"
                  className={`block w-full mt-3 rounded-md shadow-sm sm:text-sm border px-3 py-2
      ${errors.studentTag ? "border-red-500" : "border-gray-300"}`}
                />

                <CharCounter
                  value={input}
                  max={MAX_TAG_LENGTH}
                  show={activeField === "studentTag"}
                />
              </div>

              {/* 🔴 Error BELOW wrapper */}
              {errors.studentTag && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.studentTag}
                </p>
              )}



            </div>


            {/* Teacher Competitions */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">

              <RequiredLabel>Teacher Competitions</RequiredLabel>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherTags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-2 hover:text-red-600"
                      onClick={() => removeTeacherTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Input */}
              <div className="relative">

                <input
                  type="text"
                  value={teacherInput}
                  maxLength={MAX_TEACHER_TAG_LENGTH}  // 🔥 HARD STOP
                  onFocus={() => setActiveField("teacherTag")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    let val = e.target.value;

                    // 🔴 HARD BLOCK beyond 40
                    if (val.length > MAX_TEACHER_TAG_LENGTH) {
                      val = val.slice(0, MAX_TEACHER_TAG_LENGTH);
                    }

                    setTeacherInput(val);
                  }}
                  onKeyDown={handleTeacherKeyDown}
                  placeholder="Type and Enter or Tab"
                  className={`block w-full mt-3 rounded-md shadow-sm sm:text-sm border px-3 py-2
        ${errors.teacherTag ? "border-red-500" : "border-gray-300"}`}
                />

                {/* Character Counter */}
                <CharCounter
                  value={teacherInput}
                  max={MAX_TEACHER_TAG_LENGTH}
                  show={activeField === "teacherTag"}
                />
              </div>

              {/* Error */}
              {errors.teacherTag && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.teacherTag}
                </p>
              )}

            </div>

          </div>


   
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            <button
              onClick={addClassEvent}
              className="w-full px-5 py-2 text-white bg-lavender--600 rounded-md hover:bg-lavender--700 transition"
            >
              Add Event for Class
            </button>

            <button
              onClick={addTeacherCompBlock}
              className="w-full px-5 py-2 text-white bg-lavender--600 rounded-md hover:bg-lavender--700 transition"
            >
              Add Teacher Competitions
            </button>

          </div>


          {/* ================= BLOCK GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* ================= LEFT COLUMN - CLASS EVENTS ================= */}
            <div className="space-y-6">

              {classEvents.length > 0 && classEvents.map((classEvent, classIndex) => (
                <div
                  key={classEvent.id}
                  className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                >

                  {/* Block Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Class Event {classIndex + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => deleteClassEventBlock(classEvent.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>

                  {/* Class Selection */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Select Class
                    </label>

                    <select
                      value={classEvent.className}
                      onChange={(e) =>
                        handleChange(classEvent.id, 0, "className", e.target.value)
                      }
                      // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"

                      className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`class-${classEvent.id}`]
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}

                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}


                    </select>
                    {errors[`class-${classEvent.id}`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`class-${classEvent.id}`]}
                      </p>
                    )}
                  </div>

                  {/* Competition Rows */}
                  <div className="space-y-4">
                    {classEvent.competitions.map((comp, compIndex) => {
                      const isLast =
                        compIndex === classEvent.competitions.length - 1;
                      const filled =
                        comp.competition.trim() && comp.title.trim();

                      return (
                        <div
                          key={compIndex}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="grid grid-cols-1 gap-4">

                            <div>
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Competition
                              </label>
                              <select
                                value={comp.competition}
                                onChange={(e) =>
                                  handleChange(
                                    classEvent.id,
                                    compIndex,
                                    "competition",
                                    e.target.value
                                  )
                                }
                                // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"


                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`comp-${classEvent.id}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}

                              >
                                <option value="">-- Select Competition --</option>
                                {tags.map((t, i) => (
                                  <option key={i} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>

                              {errors[`comp-${classEvent.id}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`comp-${classEvent.id}-${compIndex}`]}
                                </p>
                              )}
                            </div>

                            <div className="relative">

                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Title
                              </label>





                              <input
                                type="text"
                                value={comp.title}
                                maxLength={60}
                                onFocus={() =>
                                  setActiveField(`title-${classEvent.id}-${compIndex}`)
                                }
                                onBlur={() => setActiveField(null)}
                                onChange={(e) =>
                                  handleChange(
                                    classEvent.id,
                                    compIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm px-3 py-2
      ${errors[`title-${classEvent.id}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}
                              />




                              {/* Character Counter */}
                              <CharCounter
                                value={comp.title}
                                max={60}
                                show={
                                  activeField === `title-${classEvent.id}-${compIndex}`
                                }
                              />

                              {/* Error Message */}
                              {errors[`title-${classEvent.id}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`title-${classEvent.id}-${compIndex}`]}
                                </p>
                              )}

                            </div>


                            <div className="flex justify-end">
                              {isLast ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addCompetitionRow(classEvent.id)

                                  }
                                  disabled={!filled}
                                  className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                        ${filled
                                      ? "bg-lavender--600"
                                      : "bg-lavender--600 opacity-50 cursor-not-allowed"
                                    }`}
                                >
                                  <FaPlus size={14} />
                                  Add
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteCompetitionRow(classEvent.id, compIndex)


                                  }
                                  className="px-4 py-2 rounded-md bg-red-500 text-white flex items-center gap-2 hover:bg-red-600"
                                >
                                  <FaTrash size={14} />
                                  Delete
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}

            </div>



            {/* ================= RIGHT COLUMN - TEACHER EVENTS ================= */}
            <div className="space-y-6">

              {teacherCompEvents.length > 0 && teacherCompEvents.map((block, blockIndex) => (
                <div
                  key={block.id}

                  className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                >

                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Teacher Block {blockIndex + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => deleteTeacherCompBlock(block.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {block.competitions.map((comp, compIndex) => {
                      const isLast =
                        compIndex === block.competitions.length - 1;
                      const filled =
                        comp.competition.trim() && comp.title.trim();

                      return (
                        <div
                          key={compIndex}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="grid grid-cols-1 gap-4">

                            <div>
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Competition
                              </label>
                              <select
                                value={comp.competition}
                                onChange={(e) =>
                                  handleTeacherCompChange(
                                    block.id,
                                    compIndex,
                                    "competition",
                                    e.target.value
                                  )
                                }
                                // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"


                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`teacher-comp-${block.id}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}
                              >
                                <option value="">-- Select Competition --</option>
                                {teacherTags.map((t, i) => (
                                  <option key={i} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>

                              {errors[`teacher-comp-${block.id}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`teacher-comp-${block.id}-${compIndex}`]}
                                </p>
                              )}
                            </div>

                            <div className="relative">

                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Title
                              </label>

                              <input
                                type="text"
                                value={comp.title}
                                onFocus={() =>
                                  setActiveField(`teacher-title-${block.id}-${compIndex}`)
                                }
                                onBlur={() => setActiveField(null)}
                                onChange={(e) =>
                                  handleTeacherCompChange(
                                    block.id,
                                    compIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm px-3 py-2
      ${errors[`teacher-title-${block.id}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}
                              />

                              {/* Character Counter */}
                              <CharCounter
                                value={comp.title}
                                max={60}
                                show={
                                  activeField === `teacher-title-${block.id}-${compIndex}`
                                }
                              />

                              {/* Error */}
                              {errors[`teacher-title-${block.id}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`teacher-title-${block.id}-${compIndex}`]}
                                </p>
                              )}

                            </div>


                            <div className="flex justify-end">
                              {isLast ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addTeacherCompetitionRow(block.id)
                                  }
                                  disabled={!filled}
                                  className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                        ${filled
                                      ? "bg-lavender--600"
                                      : "bg-lavender--600 opacity-50 cursor-not-allowed"
                                    }`}
                                >
                                  <FaPlus size={14} />
                                  Add
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTeacherCompetitionRow(block.id, compIndex)
                                  }
                                  className="px-4 py-2 rounded-md bg-red-500 text-white flex items-center gap-2 hover:bg-red-600"
                                >
                                  <FaTrash size={14} />
                                  Delete
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}

            </div>

          </div>





          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">

                  <h2 className="text-lg font-semibold mb-3 text-gray-800">
                    Add Event By
                  </h2>

                  {/* ================= EXISTING + NEW TAGS ================= */}
                  <div className="flex flex-wrap gap-2 mb-3">

                    {modalEventByList.map((name, i) => {
                      const existsInDB = eventBys.some(
                        e => e.name.toLowerCase() === name.toLowerCase()
                      );

                      return (
                        <span
                          key={i}
                          className={`flex items-center px-2 py-1 rounded-full text-sm text-white
                  ${existsInDB ? "bg-green-500" : "bg-red-500"}
                `}
                        >
                          {name}
                          <button
                            type="button"
                            className="ml-2 text-white hover:text-gray-200"
                            onClick={() =>
                              setModalEventByList(prev =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}

                  </div>

                  {/* ================= INPUT ================= */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type and press Enter or Tab"
                      value={eventByInput}
                      maxLength={MAX_EVENTBY_LENGTH}
                      onFocus={() => setActiveField("eventByModal")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setEventByInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === "Tab") &&
                          eventByInput.trim()
                        ) {
                          e.preventDefault();

                          const value = eventByInput.trim();

                          if (!modalEventByList.includes(value)) {
                            setModalEventByList(prev => [...prev, value]);
                          }

                          setEventByInput("");
                        }
                      }}
                      className="border border-gray-300 rounded-lg block w-full p-2.5"
                    />

                    {/* 🔢 Live Character Counter */}
                    <CharCounter
                      value={eventByInput}
                      max={MAX_EVENTBY_LENGTH}
                      show={activeField === "eventByModal"}
                    />
                  </div>

                  {/* ================= BUTTONS ================= */}
                  <div className="flex justify-end gap-2 mt-5">

                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setModalEventByList([]);
                        setEventByInput("");
                      }}
                      className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={async () => {
                        if (modalSaving) return;

                        try {
                          setModalSaving(true);

                          const res = await axios.put(
                            `${URL}/sundayschool-events/eventby/update`,
                            { names: modalEventByList },
                            { headers: { Authorization: token } }
                          );

                          // 🔥 Instantly update dropdown
                          setEventBys(res.data.eventBys);

                          if (res.data.eventBys?.length) {
                            setSelectedEventBy(
                              res.data.eventBys[
                                res.data.eventBys.length - 1
                              ]._id
                            );
                          }

                          setResponse({
                            status: "Success",
                            message: "Event By updated successfully!",
                          });

                          setIsModalOpen(false);
                          setModalEventByList([]);
                          setEventByInput("");

                        } catch (err) {
                          setResponse({
                            status: "Failed",
                            message:
                              err.response?.data?.message ||
                              "Failed to update Event By",
                          });
                        } finally {
                          setModalSaving(false);
                        }
                      }}
                      disabled={modalSaving}
                      className={`px-4 py-2 text-white rounded-lg flex items-center gap-2
              ${modalSaving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-lavender--600 hover:bg-lavender--700"
                        }`}
                    >
                      {modalSaving && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {modalSaving ? "Saving..." : "Save"}
                    </button>

                  </div>

                </div>
              </div>
            </div>
          )}






          {/* ================= SAVE BUTTON ================= */}
          <div className="flex justify-end mt-6">


            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Saving..." : "Save Event"}
            </button>

          </div>
        </div>

        {Response.status && (
          Response.status === "Success"
            ? <SuccessMessage Message={Response.message} />
            : <FailedMessage Message={Response.message} />
        )}



      </div>
    </>
  );

};

