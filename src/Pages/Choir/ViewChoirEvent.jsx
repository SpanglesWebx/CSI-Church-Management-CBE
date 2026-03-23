import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import { FaArrowLeft } from "react-icons/fa";

export const ViewChoirEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const token = sessionStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [availablePrizes, setAvailablePrizes] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isEditParticipantsModalOpen, setIsEditParticipantsModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });

  /* =========================
     Fetch Event
  ========================= */
  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${URL}/choir-members/event/${eventId}`, {
        headers: { Authorization: token },
      });

      if (res.data.status === "Success") {
        setEvent(res.data.event);
      }
    } catch (err) {
      setResponse({ status: "Failed", message: "Failed to fetch event" });
    }
  };

  /* =========================
     Fetch Prize List
  ========================= */
  const fetchPrizes = async () => {
    try {
      const res = await axios.get(
        `${URL}/choir-members/prizes/list`,
        { headers: { Authorization: token } }
      );
      setAvailablePrizes(res.data.prizes || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchPrizes();
    }
  }, [eventId]);


  useEffect(() => {
    const blockRefresh = (e) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [isSaving]);

  if (!event) return <div className="p-5">Loading...</div>;

  return (
    <>




      <FaArrowLeft
        className="cursor-pointer mb-4"
        onClick={() => navigate(-1)}
      />
      <div className="p-5 bg-white rounded ">

        {/* =========================
            EVENT DETAILS
        ========================= */}
        <h2 className="text-lg font-semibold mb-3">
          {event.eventName}
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><b>Event By:</b> {event.eventBy?.name}</p>
          <p><b>Event Date:</b> {moment(event.eventDate).format("DD-MM-YYYY")}</p>
          <p><b>Register Before:</b> {moment(event.registerBefore).format("DD-MM-YYYY")}</p>
          <p><b>Venue:</b> {event.venue}</p>
          <p><b>Description:</b> {event.description}</p>
        </div>

        <hr className="my-4" />

        {/* =========================
            COMPETITIONS
        ========================= */}
        <h3 className="font-semibold text-base">Competitions:</h3>

        {(event.choirCompetitions || []).map((comp) => {
          const hasParticipants = comp.participants?.length > 0;
          const hasAnyPrize = comp.participants?.some(
            (p) => p.prize && p.prize !== ""
          );

          return (
            <div key={comp._id} className="mt-3 border p-3 rounded">

              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {comp.competition} — <em>{comp.title}</em>
                </p>

                <div className="flex gap-2">

                  {hasParticipants && (
                    <button
                      className="px-3 py-1 text-sm bg-lavender--600 text-white rounded"
                      onClick={() => {
                        setSelectedCompetition({
                          competition: comp,
                          eventId: event._id,
                        });
                        setIsPrizeModalOpen(true);
                      }}
                    >
                      {hasAnyPrize ? "Edit Prizes" : "Add Prizes"}
                    </button>
                  )}

                  {hasParticipants && !hasAnyPrize && (
                    <button
                      className="px-3 py-1 text-sm bg-lavender--600 text-white rounded"
                      onClick={() => {
                        setSelectedCompetition({
                          competition: {
                            ...comp,
                            participants: comp.participants.map((p) => ({
                              ...p,
                              selected: true,
                            })),
                          },
                          eventId: event._id,
                        });
                        setIsEditParticipantsModalOpen(true);
                      }}
                    >
                      Edit Participants
                    </button>
                  )}

                </div>
              </div>

              {/* Participants List */}
              {hasParticipants ? (
                <ul className="mt-2 text-gray-700 text-sm">
                  {comp.participants.map((p, idx) => (
                    <li key={idx}>
                      {p.member_name}
                      {p.prize && ` — ${p.prize} Prize`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic mt-1">
                  No participants added yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================
          PRIZE MODAL
      ========================= */}
      <Modal
        isOpen={isPrizeModalOpen}
        onClose={() => {
          setIsPrizeModalOpen(false);
          setSelectedCompetition(null);
        }}
        title="Assign Prizes"
      >

        {selectedCompetition &&
          selectedCompetition.competition.participants.map((p, i) => (
            <div key={i} className="flex justify-between items-center mb-2">
              <span>{p.member_name}</span>

              <select
                value={p.prize || ""}
                className="border px-2 py-1 rounded"
                onChange={(e) => {
                  const prize = e.target.value;
                  setSelectedCompetition((prev) => ({
                    ...prev,
                    competition: {
                      ...prev.competition,
                      participants: prev.competition.participants.map((x) =>
                        x.member_id === p.member_id
                          ? { ...x, prize }
                          : x
                      ),
                    },
                  }));
                }}
              >
                <option value="">None</option>
                {availablePrizes.map((pr, index) => (
                  <option key={index} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
          ))}

        <div className="flex justify-end mt-4">
          <button
            disabled={isSaving}
            onClick={async () => {
              try {
                setIsSaving(true);

                await axios.put(
                  `${URL}/choir-members/prizes/update`,
                  {
                    eventId: selectedCompetition.eventId,
                    competitionId: selectedCompetition.competition._id,
                    prizes:
                      selectedCompetition.competition.participants.map((p) => ({
                        member_id: p.member_id,
                        prize: p.prize,
                      })),
                  },
                  { headers: { Authorization: token } }
                );

                setResponse({
                  status: "Success",
                  message: "Prizes updated successfully",
                });

                setIsPrizeModalOpen(false);
                setSelectedCompetition(null);
                fetchEvent();

              } catch (err) {
                setResponse({
                  status: "Failed",
                  message: "Failed to update prizes",
                });
              } finally {
                setIsSaving(false);
              }
            }}
            className={`px-4 py-2 rounded text-white flex items-center gap-2
    ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}

          >
            {/* Save */}


            {isSaving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>


      </Modal>

      {/* =========================
          EDIT PARTICIPANTS MODAL
      ========================= */}
      <Modal
        isOpen={isEditParticipantsModalOpen}
        onClose={() => {
          setIsEditParticipantsModalOpen(false);
          setSelectedCompetition(null);
        }}
        title="Edit Participants"
      >
        {selectedCompetition &&
          selectedCompetition.competition.participants.map((p) => (
            <div key={p.member_id} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={p.selected !== false}
                onChange={(e) => {
                  setSelectedCompetition((prev) => ({
                    ...prev,
                    competition: {
                      ...prev.competition,
                      participants:
                        prev.competition.participants.map((x) =>
                          x.member_id === p.member_id
                            ? { ...x, selected: e.target.checked }
                            : x
                        ),
                    },
                  }));
                }}
              />
              <span>{p.member_name}</span>
            </div>
          ))}

        <div className="flex justify-end mt-4">
          <button
            disabled={isSaving}
            onClick={async () => {
              if (isSaving) return;
              try {
                setIsSaving(true);
                const updated =
                  selectedCompetition.competition.participants.filter(
                    (p) => p.selected !== false
                  );

                await axios.put(
                  `${URL}/choir-members/participants/update`,
                  {
                    eventId: selectedCompetition.eventId,
                    competitionId: selectedCompetition.competition._id,
                    participants: updated,
                  },
                  { headers: { Authorization: token } }
                );

                setResponse({
                  status: "Success",
                  message: "Participants updated successfully",
                });

                setIsEditParticipantsModalOpen(false);
                setSelectedCompetition(null);
                fetchEvent();

              } catch (err) {
                setResponse({
                  status: "Failed",
                  message: "Failed to update participants",
                });
              }
              finally {
                setIsSaving(false);
              }
            }}
            className={`px-4 py-2 rounded text-white flex items-center gap-2
    ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
          >
            {isSaving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      {/* Toast */}
      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};