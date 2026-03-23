import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

import { FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const AddChoirParticipants = () => {

  const navigate = useNavigate();
  const { state } = useLocation();
  const event = state?.event;

  const token = sessionStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [competitionId, setCompetitionId] = useState("");
  const [competitionTitle, setCompetitionTitle] = useState("");

  const [showMembers, setShowMembers] = useState(false);

  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [eventData, setEventData] = useState(null);


  const [Response, setResponse] = useState({ status: null, message: "" });

  const [saving, setSaving] = useState(false);

  /* ===============================
     Fetch Members
  =============================== */

  const fetchMembers = async () => {
    try {

      const res = await axios.get(
        `${URL}/choir-members/participants/list`,
        { headers: { Authorization: token } }
      );

      setMembers(res.data.members || []);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);


  useEffect(() => {
    if (!event?._id) return;

    fetchEvent();

  }, [event?._id]);

  const fetchEvent = async () => {

    try {

      const res = await axios.get(
        `${URL}/choir-members/event/${event._id}`,
        { headers: { Authorization: token } }
      );

      setEventData(res.data.event);

    } catch (err) {
      console.log(err);
    }

  };

  /* ===============================
     Competition Change
  =============================== */

  const handleCompetitionChange = (id) => {

    setCompetitionId(id);

    const comp = event?.choirCompetitions?.find(
      c => String(c._id) === String(id)
    );

    setCompetitionTitle(comp?.title || "");
    setShowMembers(false);

    if (comp?.participants) {
      setSelectedMembers(comp.participants.map(p => p.member_id));
    } else {
      setSelectedMembers([]);
    }

  };

  /* ===============================
     Toggle Member
  =============================== */

  const toggleMember = (id) => {

    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );

  };


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

  /* ===============================
     Save Participants
  =============================== */

  const saveParticipants = async () => {
    if (saving) return;   // prevent double click
    if (!competitionId) return;

    try {

      setSaving(true);

      const participants = selectedMembers.map(id => {

        const m = members.find(x => x.member_id === id);

        return {
          member_id: id,
          member_name: m?.member_name,
          member_tamil_name: m?.member_tamil_name || ""
        };

      });

      await axios.post(
        `${URL}/choir-members/participants/add`,
        {
          eventId: event._id,
          participants: [
            {
              competitionId,
              members: participants
            }
          ]
        },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: "Participants added successfully"
      });

      setTimeout(() => {
        navigate("/admin/choirevent", {
          state: { success: true }
        });
      }, 500);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error saving"
      });

    }
    finally {
      setSaving(false);
    }


  };

  /* ===============================
     Open Edit
  =============================== */

  const openEdit = (competition) => {

    setSelectedCompetition({
      ...competition,
      participants: competition.participants.map(p => ({
        ...p,
        selected: true
      }))
    });

    setIsEditModalOpen(true);

  };

  /* ===============================
     Save Edit
  =============================== */

  const handleSaveEdit = async () => {

    const updated = selectedCompetition.participants.filter(
      p => p.selected !== false
    );

    try {

      await axios.put(
        `${URL}/choir-members/participants/update`,
        {
          eventId: event._id,
          competitionId: selectedCompetition._id,
          participants: updated
        },
        { headers: { Authorization: token } }
      );

      setIsEditModalOpen(false);

      setResponse({
        status: "Success",
        message: "Participants updated"
      });

    } catch (err) {

      setResponse({
        status: "Failed",
        message: "Update failed"
      });

    }

  };

  return (
    <>
      <div className="p-4">

        <FaArrowLeft
          className="cursor-pointer mb-4"
          onClick={() => navigate(-1)}
        />

        <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

          <div className="bg-white rounded p-6">

            <h2 className="text-lg font-semibold mb-6">
              Add Choir Participants
            </h2>

            {/* Event Details */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

              <div>
                <label className="text-sm text-gray-500">Event By</label>
                <p className="font-medium">{eventData?.eventBy?.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Event Name</label>
                <p className="font-medium">{eventData?.eventName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Event Date</label>
                <p>{moment(event?.eventDate).format("DD-MM-YYYY")}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Register Before</label>
                <p>{moment(event?.registerBefore).format("DD-MM-YYYY")}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Venue</label>
                <p>{event?.venue}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p>{event?.description}</p>
              </div>

            </div>

            {/* Competition Section */}

            <div className="bg-lavender-50 border rounded p-4 mb-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium">
                    Competition
                  </label>

                  <select
                    value={competitionId}
                    onChange={(e) => handleCompetitionChange(e.target.value)}
                    className=" p-2 block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                  >
                    <option value="">Select Competition</option>

                    {event?.choirCompetitions?.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.competition}
                      </option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Title
                  </label>

                  <input
                    value={competitionTitle}
                    readOnly
                    className="p-2 block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 focus:outline-none"
                  />
                </div>

              </div>

              {competitionId && !showMembers && (
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setShowMembers(true)}
                    className="px-4 py-2 bg-lavender--600 text-white rounded"
                  >
                    Add Participants
                  </button>
                </div>
              )}

            </div>

            {/* Members List */}

            {showMembers && (

              <div className="border rounded p-3 bg-gray-50">

                <h4 className="font-semibold mb-3">
                  Select Members
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">

                  {members.map(member => {

                    const isSelected =
                      selectedMembers.includes(member.member_id);

                    return (

                      <div
                        key={member.member_id}
                        className={`rounded flex items-center text-sm transition
                      ${isSelected
                            ? "bg-green-50 border border-green-200"
                            : "bg-white border"}
                    `}
                      >

                        <div className="w-1/3 px-3 py-2 border-r">
                          {member.member_id}
                        </div>

                        <div className="w-1/3 px-3 py-2 border-r">
                          {member.member_name}
                        </div>

                        <div className="w-1/3 flex justify-center">

                          <button
                            onClick={() => toggleMember(member.member_id)}
                            className={`px-4 py-1 text-xs rounded-full
                        ${isSelected
                                ? "bg-lavender--600 text-white"
                                : "bg-gray-200"}
                      `}
                          >
                            {isSelected ? "Added" : "Add"}
                          </button>

                        </div>

                      </div>

                    );
                  })}

                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex justify-end mt-4">

                    <button
                      onClick={saveParticipants}
                      disabled={saving}
                      className={`px-5 py-2 rounded text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
                    >
                      {saving && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {saving ? "Saving..." : "Save Participants"}
                    </button>

                  </div>
                )}

              </div>

            )}


          </div>

        </div>

        {/* Edit Modal */}



        {Response.status && (
          Response.status === "Success"
            ? <SuccessMessage Message={Response.message} />
            : <FailedMessage Message={Response.message} />
        )}


      </div>

    </>
  );
};





