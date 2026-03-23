import React, { useEffect, useState } from 'react'
import { FaPlus, FaEye, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from 'axios';
import { CiEdit } from 'react-icons/ci';
import Modal from '../../Components/Expense/ExpenseFormModal';
import moment from "moment";

export const Eventend = () => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const limit = 10;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditParticipantsModalOpen, setIsEditParticipantsModalOpen] = useState(false);
  // 🟣 Add this new state near your other modal states
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isAddPrizeModalOpen, setIsAddPrizeModalOpen] = useState(false);
  const [prizeTags, setPrizeTags] = useState([]);
  const [prizeInput, setPrizeInput] = useState("");
  const [availablePrizes, setAvailablePrizes] = useState([]);



  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${URL}/endeavour-events`, {
        params: { search, startDate, endDate, page: currentPage, limit },
        headers: { Authorization: token },
      });
      if (res.data.status === "Success") {
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
      } else {
        setResponse({ status: "Failed", message: res.data.message });
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setResponse({ status: "Failed", message: "Error fetching events" });
    }
  };

  useEffect(() => { fetchEvents(); }, [search, startDate, endDate, currentPage]);

  // Fetch single event for modal refresh
  const fetchEventById = async (id) => {
    try {
      const res = await axios.get(`${URL}/endeavour-events/${id}`, {
        headers: { Authorization: token },
      });
      if (res.data?.status === "Success" && res.data.event) {
        setSelectedEvent(res.data.event);
        setEvents(prev => prev.map(ev => ev._id === res.data.event._id ? res.data.event : ev));
      }
    } catch (err) { console.error("Error fetching event by id:", err); }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  

  const handleAddEvent = () => navigate("/admin/eventend/addendeavourevent");
  const handleEditEvent = (event) => navigate(`/admin/eventend/edit/${event._id}`, { state: { event } });

 
  const savePrizes = async () => {
    if (!selectedEvent || !selectedCompetition) return;
    setIsSaving(true);
    try {
      const eventId = selectedEvent._id;
      const competitionId = selectedCompetition.competition._id;
      const prizes = selectedCompetition.competition.participants.map((p) => ({
        member_id: p.member_id,
        prize: p.prize,
      }));

      if (selectedCompetition.isTeacher) {
        // Teacher endpoint
        const res = await axios.put(
          `${URL}/endeavour-events/add-prizes-teacher`,
          { eventId, competitionId, prizes },
          { headers: { Authorization: token } }
        );

        setResponse({ status: "Success", message: res.data?.message || "Prizes saved successfully!" });
        if (res.data?.event) setSelectedEvent(res.data.event);
        else await fetchEventById(eventId);
      } else {
        // Class endpoint (existing)
        const res = await axios.put(
          `${URL}/endeavour-events/add-prizes`,
          {
            eventId,
            className: selectedCompetition.className,
            competitionId,
            prizes,
          },
          { headers: { Authorization: token } }
        );

        setResponse({ status: "Success", message: res.data?.message || "Prizes saved successfully!" });
        if (res.data?.event) setSelectedEvent(res.data.event);
        else await fetchEventById(eventId);
      }

      // refresh overall events list
      await fetchEvents();
    } catch (error) {
      console.error("Error saving prizes:", error);
      setResponse({
        status: "Failed",
        message: error.response?.data?.message || "Failed to save prizes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const fetchPrizes = async () => {
    try {
      const res = await axios.get(`${URL}/endeavour/prizes/list`, {
        headers: { Authorization: token },
      });
      if (res.data.status === "Success") setAvailablePrizes(res.data.prizes);
    } catch (err) {
      console.error("Error fetching prizes:", err);
    }
  };

  useEffect(() => { fetchPrizes(); }, []);

  // Utility function



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h3 className=" font-semibold">Endeavour Event</h3>
        <div className="flex items-center justify-between p-4">
          {/* <h1 className="text-lg font-semibold">Endeavour Event</h1> */}
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search Members
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset page when searching
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />


          </div>


          <button
            onClick={() => setIsAddPrizeModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Prizes
          </button>
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> New Event
          </button>

        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Event Name</th>
                <th className="p-2 text-center">Event Date</th>
                <th className="p-2 text-center">Venue</th>
                <th className="p-2 text-center">Register Before</th>
                <th className="p-2 text-center">Action</th> {/* Edit and View button */}
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event._id} className="border-b ">
                    <td className="p-2 text-center">{(currentPage - 1) * limit + index + 1}</td>
                    <td className="p-2 text-center">{event.eventName}</td>
                    <td className="p-2 text-center">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center">{event.venue}</td>
                    <td className="p-2 text-center">
                      {new Date(event.registerBefore).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <FaEye title='View Participants' size={18} className="text-lavender--600 cursor-pointer" onClick={() => handleViewEvent(event)} />
                        <CiEdit title='Edit Participants' size={20} className="text-lavender--600 cursor-pointer" onClick={() => handleEditEvent(event)} />
                      </div>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan="6">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 bg-lavender--600 text-white rounded">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>

          <div className="absolute flex px-5 space-x-2 rounded right-1">
            <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">
              Total Pages: {totalPages}
            </span>
            <span
              onClick={() => setCurrentPage(totalPages)}
              className={`${totalPages === currentPage
                ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"
                }`}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>


      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Event Details"
      >
        {selectedEvent ? (
          <div className="text-sm text-gray-700 space-y-3 max-h-[600px] overflow-y-auto">

            {/* Event Info */}
            {[
              { label: "Event By", value: selectedEvent.eventBy?.name },
              { label: "Event Name", value: selectedEvent.eventName },
              { label: "Event Date", value: moment(selectedEvent.eventDate).format("DD-MM-YYYY") },
              { label: "Register Before", value: moment(selectedEvent.registerBefore).format("DD-MM-YYYY") },
              { label: "Venue", value: selectedEvent.venue },
              { label: "Description", value: selectedEvent.description },
              {
                label: "Student Competitions",
                value: selectedEvent.studentCompetitions?.length
                  ? selectedEvent.studentCompetitions.join(", ")
                  : "None",
              },
              {
                label: "Teacher Competitions",
                value: selectedEvent.teacherCompetitions?.length
                  ? selectedEvent.teacherCompetitions.join(", ")
                  : "None",
              },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                  {item.label}
                </div>
                <div
                  className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"
                    }`}
                >
                  {item.value}
                </div>
              </div>
            ))}

            {/* Class Events + Participants */}
            <h3 className="font-semibold text-base mt-3">Class Events:</h3>



            {(selectedEvent.classEvents || []).map((cls) => (
              <div key={cls._id} className="mt-2 border p-2 rounded">
                <p className="font-medium text-lavender--700">{cls.className}</p>

                {(cls.competitions || []).map((comp) => {
                  const hasParticipants = comp.participants?.length > 0;
                  const hasAnyPrize =
                    comp.participants?.some((p) => p.prize && p.prize !== "None") || false;

                  return (
                    <div key={comp._id} className="mt-2 border rounded p-2 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {comp.competition} — <em>{comp.title}</em>
                        </p>


                        <div className="flex gap-2">
                          {/* Add Prizes button */}
                          {hasParticipants && !hasAnyPrize && (
                            <button
                              className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                              onClick={() => {
                                setSelectedCompetition({
                                  className: cls.className,
                                  competition: comp,
                                  eventId: selectedEvent._id,
                                });
                                setIsPrizeModalOpen(true); // ⬅️ Only this modal opens
                              }}
                            >
                              Add Prizes
                            </button>
                          )}

                          {/* Edit Participants button */}
                          {hasParticipants && !hasAnyPrize && (
                            <button
                              className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                              onClick={() => {
                                setSelectedCompetition({
                                  className: cls.className,
                                  competition: {
                                    ...comp,
                                    participants: comp.participants.map((p) => ({
                                      ...p,
                                      selected: true,
                                    })),
                                  },
                                  eventId: selectedEvent._id,
                                });
                                setIsEditParticipantsModalOpen(true); // ⬅️ Separate modal
                              }}
                            >
                              Edit Participants
                            </button>
                          )}
                        </div>

                      </div>

                      {hasParticipants ? (
                        <ul className="mt-1 text-gray-700">
                          {comp.participants.map((p, idx) => (
                            <li key={idx}>
                              {p.member_name} ({p.class_name}-{p.section_name}) {" "}
                              {p.prize && p.prize !== "None" ? `-- ${p.prize} Prize` : ""}

                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="ml-5 text-gray-400 italic">No participants added yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}



            
            <h3 className="font-semibold text-base mt-5">Teacher Competitions:</h3>

            {(selectedEvent.teacherCompEvents || []).length > 0 ? (
              (selectedEvent.teacherCompEvents || []).map((comp) => {
                const hasParticipants = comp.participants?.length > 0;
                const hasAnyPrize = comp.participants?.some((p) => p.prize && p.prize !== "None") || false;

                return (
                  <div key={comp._id} className="mt-2 border rounded p-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">
                        {comp.competition} — <em>{comp.title}</em>
                      </p>

                      <div className="flex gap-2">
                        {/* Add Prizes button */}
                        {hasParticipants && !hasAnyPrize && (
                          <button
                            className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                            onClick={() => {
                              setSelectedCompetition({
                                isTeacher: true,
                                competition: comp,
                                eventId: selectedEvent._id,
                              });
                              setIsPrizeModalOpen(true);
                            }}
                          >
                            Add Prizes
                          </button>
                        )}

                        {/* Edit Participants button */}
                        {hasParticipants && !hasAnyPrize && (
                          <button
                            className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                            onClick={() => {
                              setSelectedCompetition({
                                isTeacher: true,
                                competition: {
                                  ...comp,
                                  participants: comp.participants.map((p) => ({ ...p, selected: true })),
                                },
                                eventId: selectedEvent._id,
                              });
                              setIsEditParticipantsModalOpen(true);
                            }}
                          >
                            Edit Participants
                          </button>
                        )}
                      </div>
                    </div>

                    {hasParticipants ? (
                      <ul className="mt-1 text-gray-700">
                        {comp.participants.map((p, idx) => (
                          <li key={idx}>
                            {p.member_name}  {p.prize ? `-- ${p.prize} Prize` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ml-5 text-gray-400 italic">No participants added yet.</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="ml-5 text-gray-400 italic">No teacher competitions added yet.</p>
            )}



          </div>
        ) : (
          <p className="text-center text-gray-500">Loading...</p>
        )}
      </Modal>

      {isPrizeModalOpen && selectedCompetition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-3">Assign Prizes</h3>

              {selectedCompetition.competition.participants.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center mb-2">
                  <span>{p.member_name}</span>
                  <select
                    className="border px-2 py-1 rounded"
                    value={p.prize || "None"}
                    onChange={(e) => {
                      const prize = e.target.value;
                      setSelectedCompetition((prev) => ({
                        ...prev,
                        competition: {
                          ...prev.competition,
                          participants: prev.competition.participants.map((x) =>
                            x.member_id === p.member_id ? { ...x, prize } : x
                          ),
                        },
                      }));
                    }}
                  >
                    <option value="None">None</option>
                    {availablePrizes.map((prize, i) => (
                      <option key={i} value={prize}>{prize}</option>
                    ))}

                  </select>
                </div>
              ))}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-3 py-1 bg-gray-300 rounded"
                  onClick={() => {
                    setIsPrizeModalOpen(false);
                    setSelectedCompetition(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-lavender--600 text-white rounded"
                  onClick={async () => {
                    await savePrizes(); // your existing function
                    setIsPrizeModalOpen(false);
                    setSelectedCompetition(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      <Modal
        isOpen={isEditParticipantsModalOpen}
        onClose={() => {
          setIsEditParticipantsModalOpen(false);
          setSelectedCompetition(null);
        }}
        title="Edit Participants Details"
      >
        {selectedCompetition && (
          <div className="space-y-4">
            <p className="font-semibold">Event: {selectedEvent.eventName}</p>
            <p className="font-semibold">
              Competition: {selectedCompetition.competition.competition} —{" "}
              {selectedCompetition.competition.title}
            </p>

            {/* Participants List */}
            <div className="mt-2 space-y-1">
              {selectedCompetition.competition.participants.map((p) => (
                <div key={p.member_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.selected !== false}
                    onChange={(e) => {
                      setSelectedCompetition((prev) => ({
                        ...prev,
                        competition: {
                          ...prev.competition,
                          participants: prev.competition.participants.map((st) =>
                            st.member_id === p.member_id
                              ? { ...st, selected: e.target.checked }
                              : st
                          ),
                        },
                      }));
                    }}
                  />
                  <span>
                    {p.member_name} ({p.class_name}-{p.section_name})
                  </span>
                </div>
              ))}
            </div>

            {/* Save / Cancel */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                onClick={() => {
                  setIsEditParticipantsModalOpen(false);
                  setSelectedCompetition(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-lavender--600 text-white rounded hover:bg-lavender--700"
                
                onClick={async () => {
                  const updatedParticipants = selectedCompetition.competition.participants.filter(
                    (p) => p.selected !== false
                  );

                  try {
                    if (selectedCompetition.isTeacher) {
                      // Teacher participants update
                      const res = await axios.put(
                        `${URL}/endeavour-events/update-teacher-participants`,
                        {
                          eventId: selectedCompetition.eventId,
                          competitionId: selectedCompetition.competition._id,
                          participants: updatedParticipants.map(p => ({
                            member_id: p.member_id,
                            member_name: p.member_name,
                            prize: p.prize || "",
                          })),
                        },
                        { headers: { Authorization: token } }
                      );

                      await fetchEventById(selectedCompetition.eventId);
                      setIsEditParticipantsModalOpen(false);
                      setSelectedCompetition(null);
                      setResponse({ status: "Success", message: res.data.message || "Participants updated successfully" });
                    } else {
                      // class participants update (existing)
                      const res = await axios.put(
                        `${URL}/endeavour-events/update-participants`,
                        {
                          eventId: selectedCompetition.eventId,
                          className: selectedCompetition.className,
                          competitionId: selectedCompetition.competition._id,
                          participants: updatedParticipants.map(p => ({
                            member_id: p.member_id,
                            member_name: p.member_name,
                            class_name: p.class_name,
                            section_name: p.section_name,
                            prize: p.prize || "",
                          })),
                        },
                        { headers: { Authorization: token } }
                      );

                      await fetchEventById(selectedCompetition.eventId);
                      setIsEditParticipantsModalOpen(false);
                      setSelectedCompetition(null);
                      setResponse({ status: "Success", message: res.data.message || "Participants updated successfully" });
                    }
                  } catch (err) {
                    console.error("Error updating participants:", err);
                    setResponse({
                      status: "Failed",
                      message: err.response?.data?.message || "Failed to update participants",
                    });
                  }
                }}

              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddPrizeModalOpen}
        onClose={() => setIsAddPrizeModalOpen(false)}
        title="Add Prizes"
      >
        <div className="mt-2">
          {/* Prize Tags Display */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {prizeTags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  className="ml-2 text-gray-600 hover:text-red-500"
                  onClick={() =>
                    setPrizeTags((prev) => prev.filter((_, index) => index !== i))
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Input for adding tags */}
          <input
            type="text"
            placeholder="+ Add prize type (e.g., First Prize, Runner-up)"
            value={prizeInput}
            onChange={(e) => setPrizeInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === "Tab") && prizeInput.trim()) {
                e.preventDefault();
                const newTag = prizeInput.trim();
                if (!prizeTags.includes(newTag)) {
                  setPrizeTags([...prizeTags, newTag]);
                }
                setPrizeInput("");
              }
            }}
            className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-5">

            <button
              onClick={async () => {
                try {
                  const res = await axios.post(
                    `${URL}/endeavour/prizes/add`,
                    { prizes: prizeTags },
                    { headers: { Authorization: token } }
                  );

                  setResponse({
                    status: "Success",
                    message: res.data?.message || "Prizes saved successfully!",
                  });

                  setIsAddPrizeModalOpen(false);
                  setPrizeTags([]);
                  setPrizeInput("");
                } catch (err) {
                  setResponse({
                    status: "Failed",
                    message:
                      err.response?.data?.message || "Failed to save prizes",
                  });
                }
              }}
              className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
            >
              Save
            </button>
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