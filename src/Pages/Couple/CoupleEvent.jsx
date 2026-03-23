




import React, { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";
import { URL } from "../../App";

export const CoupleEvent = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");




  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [isAddPrizeModalOpen, setIsAddPrizeModalOpen] = useState(false);
  const [prizeTags, setPrizeTags] = useState([]);
  const [prizeInput, setPrizeInput] = useState("");

  const [Response, setResponse] = useState({ status: null, message: "" });

  const [existingPrizes, setExistingPrizes] = useState([]);
  const [newPrizes, setNewPrizes] = useState([]);

  // FETCH EVENTS
  const fetchEvents = async () => {
    try {
      const res = await
        axios.get(`${URL}/couple-events/event/all`

          , {
            // params: { search, startDate, endDate, page: currentPage, limit },

            params: {
              search,
              startDate,
              endDate,
              page: currentPage,
              limit: rowsPerPage,
            },
            headers: { Authorization: token },
          });

      if (res.data.status === "Success") {
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, startDate, endDate, currentPage, rowsPerPage]);


  const fetchPrizes = async () => {
    try {
      const res = await axios.get(`${URL}/couple-events/prizes/list`, {
        headers: { Authorization: token },
      });

      setExistingPrizes(res.data.prizes || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        {/* HEADER */}

        <h1 className="text-lg font-semibold">Couple Events</h1>

        {/* TOP BAR */}
        <div className="flex items-center justify-between p-4">

          {/* SEARCH */}
          <div>
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              />
            </div>
          </div>

          {/* DATE FILTER */}
          <div className="flex items-center space-x-3">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">

            <button
              onClick={() => setIsAddPrizeModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Prizes
            </button>

            <button
              onClick={() => navigate("/admin/couple/event/add")}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> New Event
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Event Name</th>
                <th className="p-2 text-center">Event Date</th>
                <th className="p-2 text-center">Venue</th>
                <th className="p-2 text-center">Register Before</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event, index) => (
                <tr key={event._id} className="border-b">
                  <td className="p-2 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  <td className="p-2 text-center">{event.eventName}</td>

                  <td className="p-2 text-center">
                    {moment(event.eventDate).format("DD-MM-YYYY")}
                  </td>

                  <td className="p-2 text-center">{event.venue}</td>

                  <td className="p-2 text-center">
                    {moment(event.registerBefore).format("DD-MM-YYYY")}
                  </td>

                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-3">

                      {/* VIEW */}
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/couple/event/view/${event._id}`)
                        }
                      />

                      {/* EDIT */}
                      <CiEdit
                        size={20}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/couple/event/edit/${event._id}`)
                        }
                      />

                      {/* ADD PARTICIPANTS */}
                      <FaPlus
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/couple/event/addparticipants`, {
                            state: { event },
                          })
                        }
                      />

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          rowsInput={rowsInput}
          jumpInput={jumpInput}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          setRowsInput={setRowsInput}
          setJumpInput={setJumpInput}
          defaultRows={25}
        />
      </div>

      {/* ADD PRIZE MODAL */}

      <Modal
        isOpen={isAddPrizeModalOpen}
        onClose={() => setIsAddPrizeModalOpen(false)}
        title="Add Couple Prizes"
      >
        <div>

          {/* EXISTING PRIZES */}
          <div className="flex flex-wrap gap-2 mb-3">
            {existingPrizes.map((tag, i) => (
              <span
                key={i}
                className="flex items-center bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() =>
                    setExistingPrizes(prev => prev.filter((_, index) => index !== i))
                  }
                  className="ml-2 text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* NEW PRIZES */}
          <div className="flex flex-wrap gap-2 mb-3">
            {newPrizes.map((tag, i) => (
              <span
                key={i}
                className="flex items-center bg-red-200 text-red-900 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() =>
                    setNewPrizes(prev => prev.filter((_, index) => index !== i))
                  }
                  className="ml-2 text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* INPUT */}
          <input
            type="text"
            value={prizeInput}
            placeholder="Type prize and press Enter"
            onChange={(e) => setPrizeInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === "Tab") && prizeInput.trim()) {
                e.preventDefault();

                const value = prizeInput.trim();

                if (
                  !existingPrizes.includes(value) &&
                  !newPrizes.includes(value)
                ) {
                  setNewPrizes([...newPrizes, value]);
                }

                setPrizeInput("");
              }
            }}
            className="border p-2 w-full rounded"
          />

          {/* SAVE */}
          <div className="flex justify-end mt-4">
            <button
              onClick={async () => {
                const finalPrizes = [...existingPrizes, ...newPrizes];

                try {
                  const res = await axios.post(
                    `${URL}/couple-events/prizes/save`,
                    { prizes: finalPrizes },
                    { headers: { Authorization: token } }
                  );

                  setExistingPrizes(res.data.data.prizes);
                  setNewPrizes([]);
                  setPrizeInput("");
                  setIsAddPrizeModalOpen(false);

                  setResponse({
                    status: "Success",
                    message: res.data.message,
                  });

                } catch (err) {
                  setResponse({
                    status: "Failed",
                    message: "Save failed",
                  });
                }
              }}
              className="px-4 py-2 bg-lavender--600 text-white rounded"
            >
              Save
            </button>
          </div>

        </div>
      </Modal>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};