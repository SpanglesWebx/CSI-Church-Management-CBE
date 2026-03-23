





import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const CoupleEdtiEvent = () => {

  const navigate = useNavigate();
  const { eventId } = useParams();
  const token = sessionStorage.getItem("token");



  const [eventBys, setEventBys] = useState([]);
  const [modalEventByList, setModalEventByList] = useState([]);

  const [eventByInput, setEventByInput] = useState("");
  const [selectedEventBy, setSelectedEventBy] = useState("");

  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");

  const [activeField, setActiveField] = useState(null);
  const [errors, setErrors] = useState({});
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [competitionTags, setCompetitionTags] = useState([]);
  const [competitionInput, setCompetitionInput] = useState("");

  const [competitions, setCompetitions] = useState([
    { competition: "", title: "", participants: [] }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  const [saving, setSaving] = useState(false);

  const MAX_EVENTBY = 50;

  /* =================================
     Prevent refresh while saving
  ================================= */

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

  /* =================================
     Fetch EventBy
  ================================= */

  useEffect(() => {
    const fetchEventBy = async () => {
      try {
        const res = await axios.get(
          `${URL}/couple-events/eventBy/all`,
          { headers: { Authorization: token } }
        );

        setEventBys(res.data.eventBys || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchEventBy();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setModalEventByList(eventBys.map(e => e.name));
    }
  }, [isModalOpen, eventBys]);

  /* =================================
     FETCH EVENT DATA
  ================================= */

  useEffect(() => {

    if (!eventBys.length) return;

    const fetchEvent = async () => {

      try {

        const res = await axios.get(
          `${URL}/couple-events/event/${eventId}`,
          { headers: { Authorization: token } }
        );

        const event = res.data.event;

        setSelectedEventBy(
          event.eventBy?._id || event.eventBy
        );

        setEventName(event.eventName);
        setVenue(event.venue);
        setDescription(event.description);
        setEventDate(event.eventDate?.slice(0, 10));
        setRegisterBefore(event.registerBefore?.slice(0, 10));

        setCompetitions(
          event.coupleCompetitions?.length
            ? event.coupleCompetitions
            : [{ competition: "", title: "", participants: [] }]
        );

        const tags = [
          ...new Set(event.coupleCompetitions.map(c => c.competition))
        ];

        setCompetitionTags(tags);

      } catch (err) {
        console.log(err);
      }

    };

    fetchEvent();

  }, [eventId, eventBys]);

  useEffect(() => {
    if (eventBys.length && selectedEventBy) {
      setSelectedEventBy(selectedEventBy);
    }
  }, [eventBys]);

  const handleCompetitionKeyDown = (e) => {

    if ((e.key === "Enter" || e.key === "Tab") && competitionInput.trim()) {

      e.preventDefault();

      const value = competitionInput.trim();

      if (value.length > 40) {

        showTemporaryError(
          "competitionTag",
          "Maximum 40 characters allowed"
        );

        return;
      }

      if (competitionTags.includes(value)) {

        showTemporaryError(
          "competitionTag",
          `"${value}" already added`
        );

        setCompetitionInput("");
        return;
      }

      setCompetitionTags(prev => [...prev, value]);
      setCompetitionInput("");
    }
  };


  const removeCompetitionTag = (tag) => {
    setCompetitionTags(prev => prev.filter(t => t !== tag));
  };

  const addCompetitionRow = () => {

    const last = competitions.at(-1);

    if (!last.competition || !last.title) return;

    setCompetitions(prev => [
      ...prev,
      { competition: "", title: "", participants: [] }
    ]);
  };


  const deleteCompetitionRow = (index) => {

    setCompetitions(prev => {

      const copy = [...prev];
      copy.splice(index, 1);

      return copy.length
        ? copy
        : [{ competition: "", title: "", participants: [] }];
    });
  };


  const handleCompetitionChange = (i, field, val) => {

    setCompetitions(prev => {

      const copy = [...prev];

      if (field === "competition") {

        const exists = copy.some(
          (c, index) =>
            index !== i && c.competition === val
        );

        if (exists && val.trim() !== "") {

          showTemporaryError(
            `comp-${i}`,
            `${val} already added above`
          );

          return prev;
        }
      }

      if (field === "title" && val.length > 60) {

        showTemporaryError(
          `title-${i}`,
          "Maximum 60 characters allowed"
        );

        return prev;
      }

      copy[i][field] = val;
      return copy;
    });
  };

  /* =================================
     Helpers
  ================================= */

  const showTemporaryError = (key, message) => {

    setErrors(prev => ({
      ...prev,
      [key]: message
    }));

    setTimeout(() => {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2500);
  };


  const validateMaxLength = (name, value, max = 100) => {

    if (value.length > max) {

      setErrors(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`
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




  /* =================================
     Validate form
  ================================= */

  const validateForm = () => {

    if (!selectedEventBy) {
      setResponse({ status: "Failed", message: "Select Event By" });
      return false;
    }

    if (!eventName.trim()) {
      setResponse({ status: "Failed", message: "Enter Event Name" });
      return false;
    }

    if (!venue.trim()) {
      setResponse({ status: "Failed", message: "Enter Venue" });
      return false;
    }

    if (!eventDate) {
      setResponse({ status: "Failed", message: "Select Event Date" });
      return false;
    }

    return true;
  };

  /* =================================
     Update Event
  ================================= */

  const handleUpdate = async () => {

    if (saving) return;
    if (!validateForm()) return;

    const cleanedCompetitions = competitions.filter(
      c => c.competition.trim() !== "" && c.title.trim() !== ""
    );

    try {

      setSaving(true);

      await axios.put(
        `${URL}/couple-events/event/update/${eventId}`,
        {
          eventBy: selectedEventBy,
          eventName,
          venue,
          description,
          eventDate,
          registerBefore,
          coupleCompetitions: cleanedCompetitions,
        },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: "Event Updated Successfully"
      });

      setTimeout(() => {
        navigate("/admin/couple/event");
      }, 900);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Update failed"
      });

    } finally {
      setSaving(false);
    }
  };

  /* =================================
     Label with *
  ================================= */

  const RequiredLabel = ({ children }) => (
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-600 ml-1">*</span>
    </label>
  );

  /* =================================
     Character Counter
  ================================= */

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
          <FaArrowLeft
            size={18}
            className="cursor-pointer"
            onClick={() => navigate("/admin/couple/event")}
          />
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

          <h1 className="text-xl font-bold text-black">
            Edit Couple Event
          </h1>
          {/* GRID ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            {/* Event By */}
            <div>

              <div className="flex items-center justify-between">
                <RequiredLabel>Event By</RequiredLabel>

                <button
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

                {eventBys.map(e => (
                  <option key={e._id} value={e._id}>
                    {e.name}
                  </option>
                ))}
              </select>

            </div>

            {/* Event Name */}
            <div className="relative ">

              <RequiredLabel>Event Name</RequiredLabel>

              <input
                value={eventName}
                onFocus={() => setActiveField("eventName")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("eventName", val, 50)) {
                    setEventName(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm px-3 py-2 focus:outline-none focus:ring-0
                ${errors.eventName ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={eventName}
                max={50}
                show={activeField === "eventName"}
              />
              {errors.eventName && (
                <p className="text-red-500 text-xs mt-1">{errors.eventName}</p>
              )}



            </div>

            {/* Venue */}
            <div className="relative">

              <RequiredLabel>Event Venue</RequiredLabel>

              <input
                value={venue}
                onFocus={() => setActiveField("venue")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("venue", val, 100)) {
                    setVenue(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm  px-3 py-2 focus:outline-none focus:ring-0
                ${errors.venue ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={venue}
                max={100}
                show={activeField === "venue"}
              />

              {errors.venue && (
                <p className="text-red-500 text-xs mt-1">{errors.venue}</p>
              )}

            </div>

          </div>

          {/* GRID ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            {/* Description */}
            <div className="relative">

              <label className="block mb-1 text-sm font-medium text-gray-700">
                Event Description
              </label>

              <input
                value={description}
                onFocus={() => setActiveField("description")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("description", val, 150)) {
                    setDescription(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm  px-3 py-2 focus:outline-none focus:ring-0
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

            {/* Event Date */}
            <div>

              <RequiredLabel>Event Date</RequiredLabel>

              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />

            </div>

            {/* Register Before */}
            <div>

              <label className="block mb-1 text-sm font-medium text-gray-700">
                Register Before
              </label>

              <input
                type="date"
                max={eventDate}
                value={registerBefore}
                onChange={(e) => setRegisterBefore(e.target.value)}
                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />

            </div>

          </div>

          {/* Competition Tags */}
          <div className="mt-6">

            <RequiredLabel>Competitions</RequiredLabel>

            <div className="flex flex-wrap gap-2 mt-2">
              {competitionTags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
                >
                  {tag}
                  <button
                    className="ml-2 hover:text-red-600"
                    onClick={() => removeCompetitionTag(tag)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">

              <input
                type="text"
                value={competitionInput}
                maxLength={40}
                onFocus={() => setActiveField("competitionTag")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {

                  let val = e.target.value;

                  if (val.length > 40) {
                    val = val.slice(0, 40);
                  }

                  setCompetitionInput(val);
                }}
                onKeyDown={handleCompetitionKeyDown}
                placeholder="Type and press Enter or Tab"
                className={`block w-full mt-3 rounded-md shadow-sm sm:text-sm border px-3 py-2
    focus:outline-none focus:ring-0
    ${errors.competitionTag ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={competitionInput}
                max={40}
                show={activeField === "competitionTag"}
              />

            </div>

          </div>

          {/* Competition Rows */}
          <div className="mt-6 space-y-4">

            {competitions.map((c, i) => {

              const last = i === competitions.length - 1;
              const filled = c.competition && c.title;

              return (
                <div
                  key={i}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                >

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">

                    {/* Competition Select */}
                    <div className="min-h-[70px]">
                      <select
                        value={c.competition}
                        onChange={(e) =>
                          handleCompetitionChange(i, "competition", e.target.value)
                        }
                        className={`block w-full rounded-md border shadow-sm sm:text-sm px-3 py-2
    ${errors[`comp-${i}`] ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select Competition</option>

                        {competitionTags.map((t, x) => (
                          <option key={x} value={t}>{t}</option>
                        ))}
                      </select>

                      {errors[`comp-${i}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`comp-${i}`]}
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="relative min-h-[70px]">
                      <input
                        placeholder="Enter Title"
                        value={c.title}
                        onFocus={() => setActiveField(`title-${i}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) =>
                          handleCompetitionChange(i, "title", e.target.value)
                        }
                        className={`block w-full rounded-md border shadow-sm sm:text-sm px-3 py-2 focus:outline-none focus:ring-0
    ${errors[`title-${i}`] ? "border-red-500" : "border-gray-300"}`}
                      />

                      <CharCounter
                        value={c.title}
                        max={60}
                        show={activeField === `title-${i}`}
                      />

                      {errors[`title-${i}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`title-${i}`]}
                        </p>
                      )}
                    </div>


                    {/* Buttons */}
                    <div className="flex justify-end">

                      {last ? (
                        <button
                          onClick={addCompetitionRow}
                          disabled={!filled}
                          className={`px-4 py-2 rounded-md text-white flex items-center
          ${filled
                              ? "bg-lavender--600"
                              : "bg-lavender--600 opacity-50 cursor-not-allowed"
                            }`}
                        >
                          <FaPlus />
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteCompetitionRow(i)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                          <FaTrash />
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          <div className="flex justify-end mt-6">

            <button
              onClick={handleUpdate}
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white flex items-center gap-2
              ${saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-lavender--600"
                }`}
            >

              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {saving ? "Updating..." : "Update Event"}

            </button>

          </div>

        </div>


        {/* EVENT BY MODAL */}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">

              <div className="bg-white rounded-lg p-6 w-96 shadow-lg">

                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  Add Event By
                </h2>

                <div className="flex flex-wrap gap-2 mb-3">

                  {modalEventByList.map((name, i) => {

                    const existsInDB = eventBys.some(
                      e => e.name.toLowerCase() === name.toLowerCase()
                    );

                    return (
                      <span
                        key={i}
                        className={`flex items-center px-2 py-1 rounded-full text-sm text-white
                        ${existsInDB ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {name}
                        <button
                          className="ml-2 text-white"
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

                <div className="relative">

                  <input
                    value={eventByInput}
                    maxLength={MAX_EVENTBY}
                    onFocus={() => setActiveField("eventByModal")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {

                      let val = e.target.value;

                      if (val.length > MAX_EVENTBY) {
                        val = val.slice(0, MAX_EVENTBY);
                      }

                      setEventByInput(val);
                    }}
                    onKeyDown={(e) => {

                      if ((e.key === "Enter" || e.key === "Tab") && eventByInput.trim()) {

                        e.preventDefault();

                        const val = eventByInput.trim();

                        if (modalEventByList.some(x => x.toLowerCase() === val.toLowerCase())) {

                          showTemporaryError(
                            "eventByModal",
                            `"${val}" already added`
                          );

                          setEventByInput("");
                          return;
                        }

                        setModalEventByList(prev => [...prev, val]);
                        setEventByInput("");
                      }
                    }}
                    className={`border rounded-lg block w-full p-2.5
    focus:outline-none focus:ring-0
    ${errors.eventByModal ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={eventByInput}
                    max={MAX_EVENTBY}
                    show={activeField === "eventByModal"}
                  />

                </div>

                <div className="flex justify-end gap-2 mt-5">

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {

                      if (modalSaving) return;

                      try {

                        setModalSaving(true);

                        const res = await axios.post(
                          `${URL}/couple-events/eventBy/save`,
                          { names: modalEventByList },
                          { headers: { Authorization: token } }
                        );

                        setEventBys(res.data.eventBys);

                        setIsModalOpen(false);
                        setEventByInput("");

                        setResponse({
                          status: "Success",
                          message: "Event By updated"
                        });

                      } catch (err) {

                        setResponse({
                          status: "Failed",
                          message: "Failed to update Event By"
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

      </div>

      {Response.status &&
        (Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
        )}
    </>
  );
};