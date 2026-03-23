import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from '../../Components/Expense/ExpenseFormModal';

// AddWomenEvent.jsx
// This component is adapted from your AddSundaySchoolEvent component
// but simplified for Women Fellowship Events.
// Key differences:
// - Only one unified competitions list (no separate teacher/student or per-class structure)
// - Each competition has `competition` and `title`
// - EventBy modal and flow preserved
// - Submit endpoint: POST `${URL}/women-events/add`

export const AddWomenEvent = () => {
  const [competitionTags, setCompetitionTags] = useState([]);
  const [competitionInput, setCompetitionInput] = useState("");

  // dynamic competition rows (not per class)
//   const [competitions, setCompetitions] = useState([
//     { competition: "", title: "" },
//   ]);
const [competitions, setCompetitions] = useState([
  { competition: "", title: "", participants: [] }
]);


  const [Response, setResponse] = useState({ status: null, message: "" });
  const [errors, setErrors] = useState({});

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

  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();

  // Handle creating competition tags (these are global competition names)
  const handleCompetitionKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && competitionInput.trim()) {
      e.preventDefault();
      const newTag = competitionInput.trim();
      if (!competitionTags.includes(newTag)) setCompetitionTags([...competitionTags, newTag]);
      setCompetitionInput("");
    }
  };

  const removeCompetitionTag = (tagToRemove) => {
    setCompetitionTags(competitionTags.filter((t) => t !== tagToRemove));
  };

  // Competition row management (unified list)
  const addCompetitionRow = () => {
    const last = competitions.at(-1);
    if (!last || !last.competition.trim() || !last.title.trim()) return; // require last filled
    setCompetitions((prev) => [...prev, { competition: "", title: "" }]);
  };

  const deleteCompetitionRow = (index) => {
    setCompetitions((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) updated.push({ competition: "", title: "" });
      return updated;
    });
  };

  const handleCompetitionChange = (index, field, value) => {
    setCompetitions((prev) => {
      const updated = prev.map((c) => ({ ...c }));
      const newErrors = { ...errors };

      if (field === "competition") {
        // duplicate check across rows
        const exists = updated.some((c, idx) => idx !== index && c.competition === value);
        if (exists && value.trim() !== "") {
          newErrors[`comp-${index}`] = `${value} is already added in another row.`;
          setErrors(newErrors);
          return prev; // do not update value when duplicate
        } else {
          delete newErrors[`comp-${index}`];
          setErrors(newErrors);
          updated[index].competition = value;
        }
      } else if (field === "title") {
        updated[index].title = value;
      }

      return updated;
    });
  };

  // Fetch Event By items
  useEffect(() => {
    const fetchEventBys = async () => {
      try {
        const res = await axios.get(`${URL}/women-events/eventBy/all`, { headers: { Authorization: token } });
        setEventBys(res.data.eventBys || res.data || []);
      } catch (err) {
        console.error("Error fetching Event By:", err);
      }
    };

    fetchEventBys();
  }, [token]);

  useEffect(() => {
    if (isModalOpen) {
      setNewEventBy(eventBys.map((e) => e.name));
    }
  }, [isModalOpen, eventBys]);

  // Submit new event
  const handleSubmit = async () => {
    try {
      // Validate basic fields
      if (!selectedEventBy) {
        setResponse({ status: "Failed", message: "Please select Event By." });
        return;
      }
      if (!eventName.trim()) {
        setResponse({ status: "Failed", message: "Please provide Event Name." });
        return;
      }
      if (!eventDate) {
        setResponse({ status: "Failed", message: "Please select Event Date." });
        return;
      }

      const payload = {
        eventBy: selectedEventBy,
        eventName,
        eventDate,
        registerBefore,
        venue,
        description,
        competitions: competitions.map((c) => ({ competition: c.competition, title: c.title, participants: [] })),
        // keep an array of competition tags for convenience
        competitionTags,
      };

      const res = await axios.post(`${URL}/women-events/add`, payload, { headers: { Authorization: token } });

      setResponse({ status: "Success", message: res.data.message || "Event added successfully" });
      // reset form
      setCompetitionTags([]);
      setCompetitions([{ competition: "", title: "" }]);
      setSelectedEventBy("");
      setEventName("");
      setEventDate("");
      setRegisterBefore("");
      setVenue("");
      setDescription("");

      setTimeout(() => navigate("/admin/womenfellowevent"), 1500);
    } catch (err) {
      console.error("Error saving women event:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to save event" });
    }
  };

  const goBack = () => navigate("/admin/womenfellowevent");

  return (
    <>
      <div className="flex justify-start mt-6">
        <FaArrowLeft size={18} onClick={goBack} className="cursor-pointer" title="go back" />
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Add Women Fellowship Event</h1>
        </div>

        {/* Event fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-1 font-semibold text-gray-800">Event By</label>
              <button type="button" onClick={() => setIsModalOpen(true)} className="block mb-1 font-semibold text-sm text-lavender--600">Add Event By</button>
            </div>
            <select value={selectedEventBy} onChange={(e) => setSelectedEventBy(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5">
              <option value="">-- Select Event By --</option>
              {eventBys.map((eb) => (
                <option key={eb._id} value={eb._id}>{eb.name}</option>
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
          <label className="block mb-1 font-semibold text-gray-800">Competitions (global)</label>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {competitionTags.map((tag, i) => (
              <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                {tag}
                <button type="button" className="ml-2 text-gray-600 hover:text-red-500" onClick={() => removeCompetitionTag(tag)}>✕</button>
              </span>
            ))}
          </div>

          <input type="text" placeholder="+ Add competition name (press Enter)" value={competitionInput} onChange={(e) => setCompetitionInput(e.target.value)} onKeyDown={handleCompetitionKeyDown} className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
        </div>

        {/* Competition Rows (select competition + title) */}
        <div className="mt-6 space-y-4">
          {competitions.map((comp, idx) => {
            const isLast = idx === competitions.length - 1;
            const filled = comp.competition.trim() && comp.title.trim();

            return (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block mb-1 text-gray-800 font-semibold">Select Competition</label>
                    <select value={comp.competition} onChange={(e) => handleCompetitionChange(idx, "competition", e.target.value)} className={`border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5 ${errors[`comp-${idx}`] ? "border-red-500" : "focus:ring-lavender--600 focus:border-lavender--600"}`}>
                      <option value="">-- Select Competition --</option>
                      {competitionTags.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors[`comp-${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`comp-${idx}`]}</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-800 font-semibold">Enter Title</label>
                    <input type="text" placeholder="Enter title" value={comp.title} onChange={(e) => handleCompetitionChange(idx, "title", e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5" />
                  </div>

                  <div className="flex justify-end">
                    {isLast ? (
                      <button onClick={addCompetitionRow} disabled={!filled} className={`px-4 py-2 rounded-lg text-white ${filled ? "bg-lavender--600" : "bg-lavender--600 opacity-50 cursor-not-allowed"}`}>
                        <FaPlus />
                      </button>
                    ) : (
                      <button onClick={() => deleteCompetitionRow(idx)} className="bg-red-500 text-white px-4 py-2 rounded-lg"><FaTrash /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Save Event</button>
        </div>

        {/* Event By Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Add Event By</h2>

                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {newEventBy.map((tag, i) => (
                      <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                        {tag}
                        <button type="button" className="ml-2 text-gray-600 hover:text-red-500" onClick={() => setNewEventBy((prev) => prev.filter((_, index) => index !== i))}>✕</button>
                      </span>
                    ))}
                  </div>

                  <input type="text" placeholder="+ Add the Event By" value={eventByInput} onChange={(e) => setEventByInput(e.target.value)} onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && eventByInput.trim()) {
                      e.preventDefault();
                      const newTag = eventByInput.trim();
                      if (!newEventBy.includes(newTag)) setNewEventBy([...newEventBy, newTag]);
                      setEventByInput("");
                    }
                  }} className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={async () => {
                    try {
                      const res = await axios.put(`${URL}/women-events/eventBy/update`, { names: newEventBy }, { headers: { Authorization: token } });
                      setEventBys(res.data.eventBys || res.data || []);
                      setNewEventBy([]);
                      setEventByInput("");
                      setIsModalOpen(false);
                      setResponse({ status: "Success", message: "Event By updated successfully!" });
                    } catch (err) {
                      console.error("Error updating Event By:", err);
                      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update Event By" });
                    }
                  }} className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />
      )}
    </>
  );
};
