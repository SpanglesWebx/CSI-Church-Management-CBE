
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

import { FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const CoupleAddParticipants = () => {

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
        `${URL}/couple-events/participants/list`,
        { headers: { Authorization: token } }
      );

      setMembers(res.data.couples || []);

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
        `${URL}/couple-events/event/${event._id}`,
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

    const comp = eventData?.coupleCompetitions?.find(
      c => String(c._id) === String(id)
    );

    setCompetitionTitle(comp?.title || "");
    setShowMembers(false);

    if (comp?.participants?.length && members.length) {

      const selectedCoupleIds = comp.participants.map(p => {

        const match = members.find(c =>
          c.husband.member_id === p.husband_id &&
          c.wife.member_id === p.wife_id
        );

        return match?._id;

      }).filter(Boolean);

      setSelectedMembers(selectedCoupleIds);

    } else {
      setSelectedMembers([]);
    }

  };


  useEffect(() => {
    if (competitionId && eventData && members.length) {
      handleCompetitionChange(competitionId);
    }
  }, [members]);
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

    if (saving) return;
    if (!competitionId) return;

    try {

      setSaving(true);

      const participants = selectedMembers.map(id => {

        const couple = members.find(x => x._id === id);

        return {
          husband_id: couple?.husband.member_id,
          husband_name: couple?.husband.member_name,
          wife_id: couple?.wife.member_id,
          wife_name: couple?.wife.member_name,
          prize: ""
        };

      });

      await axios.post(
        `${URL}/couple-events/participants/add`,
        {
          eventId: event._id,
          competitionId,
          participants
        },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: "Couple Participants Added Successfully"
      });

      setTimeout(() => {
        navigate("/admin/couple/event");
      }, 500);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error saving"
      });

    } finally {
      setSaving(false);
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
              Add Couple Participants
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

                    {eventData?.coupleCompetitions?.map(c => (
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
                  Select Couple
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">

                  {members.map(couple => {

                    const isSelected =
                      selectedMembers.includes(couple._id);

                    return (

                      <div
                        key={couple._id}
                        className={`rounded flex items-center text-sm transition
      ${isSelected
                            ? "bg-green-50 border border-green-200"
                            : "bg-white border"}
    `}
                      >

                        <div className="w-1/2 px-3 py-2 border-r">

                          <div className="flex justify-between text-sm">
                            <span>
                              <strong>H:</strong> {couple.husband.member_name}
                            </span>
                            <span className="text-gray-500">
                              {couple.husband.member_id}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm mt-1">
                            <span>
                              <strong>W:</strong> {couple.wife.member_name}
                            </span>
                            <span className="text-gray-500">
                              {couple.wife.member_id}
                            </span>
                          </div>

                        </div>

                        <div className="w-1/2 flex justify-center">

                          <button
                            onClick={() => toggleMember(couple._id)}
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