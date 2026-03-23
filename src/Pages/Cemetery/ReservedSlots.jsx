import React, { useEffect, useState } from 'react'
import { CiEdit } from 'react-icons/ci';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import { URL } from '../../App';
import Modal from '../../Components/Expense/ExpenseFormModal';
import moment from 'moment';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from '../../Components/Helpers/Pagination';


export const ReservedSlots = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [Response, setResponse] = useState({ status: "", message: "" });
  const [burialName, setBurialName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




  const fetchReservedSlots = async () => {
    try {
      const res = await axios.get(`${URL}/cemetery-bookings/reserved`, {
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search,
        },
        headers: {
          Authorization: token,
        },
      });

      setSlots(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching reserved slots:", err);
      setSlots([]);
    }
  };

useEffect(() => {
  fetchReservedSlots();
}, [CurrentPage, rowsPerPage, search]);


  const openModal = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSlot) return;
    try {
      await axios.put(
        `${URL}/cemetery-bookings/update-status/${selectedSlot._id}`,
        { status: newStatus, buried_person_name: burialName },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: `Slot marked as ${newStatus}`,
      });
      setIsEditModalOpen(false);
      fetchReservedSlots(); // refresh table
    } catch (err) {
      console.error("Error updating slot status:", err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to update slot status",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Buried":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Reserved":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Cemetery</h1>

          {/* Search */}
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
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
                value={search}
                onChange={(e) => {
  setSearch(e.target.value);
  setCurrentPage(1);
}}

                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500 ">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Cemetery Name</th>
                <th className="p-2 text-center">The allottee</th>
                <th className="p-2 text-center">Buried Person</th>
                <th className="p-2 text-center">Slot ID</th>
                <th className="p-2 text-center">Slot Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.length > 0 ? (
                slots.map((slot, idx) => (
                  <tr key={slot._id} className="text-center border-t">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td className="p-2">{slot.cemetery_name}</td>
                    <td className="p-2">
                      {slot.isMember
                        ? slot.member.member_name
                        : slot.non_member?.name || "N/A"}
                    </td>
                    <td className="p-2">{slot.buried_person_name || "-"}</td>
                    <td className="p-2">{slot.slot_id}</td>
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block min-w-[90px] text-center ${getStatusBadge(slot.status)}`}
                      >
                        {slot.status}
                      </span>
                    </td>

                    <td className="p-2">
                      <div className="flex items-center justify-center gap-3">
                        <FaEye
                          size={18}
                          onClick={() => openModal(slot)}
                          className="text-lavender--600 cursor-pointer"
                        />
                        {!["Buried", "Cancelled"].includes(slot.status) && (
                          <CiEdit
                            size={20}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setNewStatus(slot.status);
                              setIsEditModalOpen(true);
                              setBurialName(slot.buried_person_name || "");
                            }}
                            className="text-lavender--600 cursor-pointer"
                          />
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-gray-400">
                    No reserved slots found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
  currentPage={CurrentPage}
  totalPages={TotalPages}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserved Slot Details"
      >
        {selectedSlot && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4 max-h-[600px] overflow-y-auto">
            {[
              { label: "Cemetery", value: selectedSlot.cemetery_name },
              { label: "Slot ID", value: selectedSlot.slot_id },
              { label: "Status", value: selectedSlot.status },
              { label: "Booked At", value: moment(selectedSlot.booked_at).format("DD/MM/YYYY") },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                  {item.label}
                </div>
                <div className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800" : "text-yellow-500 font-semibold"}`}>
                  {item.value || "N/A"}
                </div>
              </div>
            ))}

            {/* Member or Non-Member Details */}
            {selectedSlot.isMember ? (
              [
                { label: "Member Name", value: selectedSlot.member.member_name },
                { label: "Tamil Name", value: selectedSlot.member.member_tamil_name },
                { label: "Gender", value: selectedSlot.member.gender },
                { label: "Mobile", value: selectedSlot.member.mobile_number },
                { label: "Aadhar", value: selectedSlot.member.aadhar_number },
                { label: "Permanent Address", value: selectedSlot.member.permanent_address },
                { label: "Present Address", value: selectedSlot.member.present_address },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 py-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800" : "text-yellow-500 font-semibold"}`}>
                    {item.value || "N/A"}
                  </div>
                </div>
              ))
            ) : (
              [
                { label: "Name", value: selectedSlot.non_member.name },
                { label: "Tamil Name", value: selectedSlot.non_member.tamil_name },
                { label: "Gender", value: selectedSlot.non_member.gender },
                { label: "Phone", value: selectedSlot.non_member.phone },
                { label: "Aadhar", value: selectedSlot.non_member.aadhar },
                { label: "Permanent Address", value: selectedSlot.non_member.permanent_address },
                { label: "Present Address", value: selectedSlot.non_member.present_address },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 py-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800" : "text-yellow-500 font-semibold"}`}>
                    {item.value || "N/A"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Slot Status"
      >
        {selectedSlot && (
          <div className="p-2 space-y-4">
            <div className="flex flex-col w-full max-w-4xl space-y-4">
              {[
                { label: "Cemetery", value: selectedSlot.cemetery_name },
                { label: "Slot ID", value: selectedSlot.slot_id },
                { label: "Current Status", value: selectedSlot.status },
                {
                  label: "Allottee Name", value: selectedSlot.isMember
                    ? selectedSlot.member.member_name
                    : selectedSlot.non_member?.name || "N/A"
                },
                ...(selectedSlot?.buried_person_name
                  ? [{ label: "Buried Person", value: selectedSlot.buried_person_name }]
                  : []),
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 py-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div
                    className={`col-span-12 sm:col-span-8 text-base ${item.value
                      ? "text-gray-800"
                      : "text-yellow-500 font-semibold"
                      }`}
                  >
                    {item.value || "N/A"}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Status To:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select</option>
                  <option value="Buried">Buried</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              {newStatus === "Buried" && !selectedSlot?.buried_person_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buried Person</label>
                  <input
                    type='text'
                    value={burialName}
                    onChange={(e) => setBurialName(e.target.value)}
                    placeholder="Enter buried person name"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus}
                className="px-4 py-2 bg-lavender--600 text-white rounded disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}


    </>
  )
}
