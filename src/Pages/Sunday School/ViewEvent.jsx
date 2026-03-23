import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa";

export const ViewEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedCompetition, setSelectedCompetition] = useState(null);
    const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
    const [isEditParticipantsModalOpen, setIsEditParticipantsModalOpen] = useState(false);
    const [availablePrizes, setAvailablePrizes] = useState([]);
    const [response, setResponse] = useState({ status: null, message: "" });
    const [isSaving, setIsSaving] = useState(false);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`${URL}/sundayschool-events/${id}`, {
                headers: { Authorization: token },
            });

            if (res.data?.event) {
                setSelectedEvent(res.data.event);
            }
        } catch (err) {
            console.error(err);
        }
    };


    const fetchPrizes = async () => {
        try {
            const res = await axios.get(`${URL}/sundayschool/prizes/list`, {
                headers: { Authorization: token },
            });

            if (res.data.status === "Success") {
                setAvailablePrizes(res.data.prizes);
            }
        } catch (err) {
            console.error("Error fetching prizes", err);
        }
    };


    useEffect(() => {
        fetchEvent();
        fetchPrizes();
    }, [id]);


    const savePrizes = async () => {
        if (!selectedCompetition) return;

        setIsSaving(true);

        try {
            const eventId = selectedCompetition.eventId;
            const competitionId = selectedCompetition.competition._id;

            const prizes = selectedCompetition.competition.participants.map((p) => ({
                member_id: p.member_id,
                prize: p.prize,
            }));

            if (selectedCompetition.isTeacher) {
                await axios.put(
                    `${URL}/sundayschool-events/add-prizes-teacher`,
                    { eventId, competitionId, prizes },
                    { headers: { Authorization: token } }
                );
            } else {
                await axios.put(
                    `${URL}/sundayschool-events/add-prizes`,
                    {
                        eventId,
                        className: selectedCompetition.className,
                        competitionId,
                        prizes,
                    },
                    { headers: { Authorization: token } }
                );
            }

            await fetchEvent();

            setIsPrizeModalOpen(false);
            setSelectedCompetition(null);
        } catch (err) {
            console.error("Error saving prizes", err);
        } finally {
            setIsSaving(false);
        }
    };



    if (!selectedEvent)
        return <div className="p-6 text-center text-gray-500">Loading...</div>;

    return (

        <>
            <FaArrowLeft
                size={18}
                title="Back"
                onClick={() => navigate("/admin/event")}
                className="cursor-pointer mb-4"
            />
            <div className="p-4 mx-2 mt-3 bg-white rounded-lg shadow-md">

                <h2 className="text-xl font-semibold mb-4">View Event Details</h2>

                <div className="text-sm text-gray-700 space-y-3 ">

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
                            <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                                {item.label}
                            </div>
                            <div
                                className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800" : "text-yellow-500 font-semibold"
                                    }`}
                            >
                                {item.value}
                            </div>
                        </div>
                    ))}

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
                                                {hasParticipants && !hasAnyPrize && (
                                                    <button
                                                        className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                                                        onClick={() => {
                                                            setSelectedCompetition({
                                                                className: cls.className,
                                                                competition: comp,
                                                                eventId: selectedEvent._id,
                                                            });
                                                            setIsPrizeModalOpen(true);
                                                        }}
                                                    >
                                                        Add Prizes
                                                    </button>
                                                )}

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
                                                        {p.member_name} ({p.class_name}-{p.section_name}){" "}
                                                        {p.prize && p.prize !== "None"
                                                            ? `-- ${p.prize} Prize`
                                                            : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="ml-5 text-gray-400 italic">
                                                No participants added yet.
                                            </p>
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
                            const hasAnyPrize =
                                comp.participants?.some((p) => p.prize && p.prize !== "None") ||
                                false;

                            return (
                                <div key={comp._id} className="mt-2 border rounded p-2 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">
                                            {comp.competition} — <em>{comp.title}</em>
                                        </p>

                                        <div className="flex gap-2">
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

                                            {hasParticipants && !hasAnyPrize && (
                                                <button
                                                    className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                                                    onClick={() => {
                                                        setSelectedCompetition({
                                                            isTeacher: true,
                                                            competition: {
                                                                ...comp,
                                                                participants: comp.participants.map((p) => ({
                                                                    ...p,
                                                                    selected: true,
                                                                })),
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
                                                    {p.member_name}{" "}
                                                    {p.prize ? `-- ${p.prize} Prize` : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="ml-5 text-gray-400 italic">
                                            No participants added yet.
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="ml-5 text-gray-400 italic">
                            No teacher competitions added yet.
                        </p>
                    )}
                </div>
            </div>



            {isPrizeModalOpen && selectedCompetition && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                                        <option key={i} value={prize}>
                                            {prize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        <div className="flex justify-end gap-2 mt-4">
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
                                onClick={savePrizes}
                                disabled={isSaving}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}





            {isEditParticipantsModalOpen && selectedCompetition && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="bg-white p-5 rounded shadow-lg w-96">

      <h3 className="text-lg font-semibold mb-3">
        Edit Participants
      </h3>

      {selectedCompetition.competition.participants.map((p) => (
        <div key={p.member_id} className="flex items-center gap-2 mb-2">

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
            {p.member_name}
          </span>

        </div>
      ))}

      <div className="flex justify-end gap-2 mt-4">

        <button
          className="px-3 py-1 bg-gray-300 rounded"
          onClick={() => {
            setIsEditParticipantsModalOpen(false);
            setSelectedCompetition(null);
          }}
        >
          Cancel
        </button>

        <button
          className="px-3 py-1 bg-lavender--600 text-white rounded"
          onClick={async () => {
            const updatedParticipants =
              selectedCompetition.competition.participants.filter(
                (p) => p.selected !== false
              );

            try {

              if (selectedCompetition.isTeacher) {

                await axios.put(
                  `${URL}/sundayschool-events/update-teacher-participants`,
                  {
                    eventId: selectedCompetition.eventId,
                    competitionId: selectedCompetition.competition._id,
                    participants: updatedParticipants,
                  },
                  { headers: { Authorization: token } }
                );

              } else {

                await axios.put(
                  `${URL}/sundayschool-events/update-participants`,
                  {
                    eventId: selectedCompetition.eventId,
                    className: selectedCompetition.className,
                    competitionId: selectedCompetition.competition._id,
                    participants: updatedParticipants,
                  },
                  { headers: { Authorization: token } }
                );

              }

              await fetchEvent();

              setIsEditParticipantsModalOpen(false);
              setSelectedCompetition(null);

            } catch (err) {
              console.error(err);
            }
          }}
        >
          Save
        </button>

      </div>
    </div>
  </div>
)}
        </>
    );
};