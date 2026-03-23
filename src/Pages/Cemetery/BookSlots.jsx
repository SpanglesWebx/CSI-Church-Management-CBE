import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import { URL } from "../../App";
import Modal from '../../Components/Expense/ExpenseFormModal';
import { useForm } from 'react-hook-form';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from '../../Components/Helpers/Pagination';


export const BookSlots = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [slots, setSlots] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showSlotsRow, setShowSlotsRow] = useState(null);
  const [selectedCemetery, setSelectedCemetery] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownByName, setDropdownByName] = useState([]);
  const [isMember, setIsMember] = useState(true);
const [isBuriedMember, setIsBuriedMember] = useState(true);
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [Response, setResponse] = useState({ status: "", message: "" });
  const [burialNames, setBurialNames] = useState({});
  const [burialDates, setBurialDates] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");

// buried person member search
const [buriedPersonIdSearch, setBuriedPersonIdSearch] = useState({});
const [buriedPersonNameSearch, setBuriedPersonNameSearch] = useState({});
const [buriedDropdownById, setBuriedDropdownById] = useState([]);
const [buriedDropdownByName, setBuriedDropdownByName] = useState([]);


const [activePopover, setActivePopover] = useState(null);
const [viewMode, setViewMode] = useState("book"); 

const popoverRef = useRef(null);



  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

const slotPersons = bookedSlots.filter(
  (b) =>
    b.slot_id === selectedSlots[0] &&
    b.cemetery_id === selectedCemetery?._id
);



  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownById(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownById([
            { member_id: "none", member_name: "No members found", mobile_number: "" }
          ]);
        } else {
          setDropdownById([]);
        }
      }
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownByName([
            { member_id: "none", member_name: "No members found", mobile_number: "" }
          ]);
        } else {
          setDropdownByName([]);
        }
      }
    }, 300)
  ).current;


  const fetchCemeteries = async () => {
    try {
      const res = await axios.get(
       `${URL}/cemeteries?page=${CurrentPage}&limit=${rowsPerPage}&search=${search || ""}`,
        { headers: { Authorization: token } }
      );
      setCemeteries(res.data.cemeteries || []);

const pages = res.data.totalPages || 1;
setTotalPages(pages);

if (CurrentPage > pages) {
  setCurrentPage(1);
}

    } catch (err) {
      console.error("Error fetching cemeteries", err);
    }
  };
useEffect(() => {
  fetchCemeteries();
}, [CurrentPage, rowsPerPage, search]);


// buried person search by ID
const debouncedBuriedSearchById = useRef(
  debounce(async (val) => {
    if (!val) return setBuriedDropdownById([]);
    try {
      const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
        headers: { Authorization: token },
      });
      setBuriedDropdownById(res.data || []);
    } catch {
      setBuriedDropdownById([]);
    }
  }, 300)
).current;


// buried person search by name
const debouncedBuriedSearchByName = useRef(
  debounce(async (val) => {
    if (!val) return setBuriedDropdownByName([]);
    try {
      const res = await axios.get(`${URL}/member-search?name=${val}`, {
        headers: { Authorization: token },
      });
      setBuriedDropdownByName(res.data || []);
    } catch {
      setBuriedDropdownByName([]);
    }
  }, 300)
).current;



  const handleBooking = async (data) => {
    if (!selectedCemetery || selectedSlots.length === 0) return;

    try {
      for (const slot of selectedSlots) {
        const payload = {
          cemetery_id: selectedCemetery._id,
          cemetery_name: selectedCemetery.cemetery_name,
          slot_id: slot,
          isMember,
          member: isMember
            ? {
              member_id: data.memberId,
              member_name: data.memberName,
              member_tamil_name: data.memberTamilName,
              gender: data.gender,
              mobile_number: data.phone,
              aadhar_number: data.aadhar_number,
              permanent_address: data.permanent_address,
              present_address: data.present_address,
            }
            : null,
          non_member: !isMember
            ? {
              name: data.nonMemberName,
              tamil_name: data.nonMemberTamilName,
              gender: data.nonMemberGender,
              phone: data.nonMemberPhone,
              aadhar: data.nonMemberAadhar,
              permanent_address: data.nonMemberPermanentAddress,
              present_address: data.nonMemberPresentAddress,
            }
            : null,
          buried_person_name: burialNames[slot] || "",
          buried_date: burialDates[slot] || null,

        };

        await axios.post(`${URL}/cemetery-bookings/book`, payload, {
          headers: { Authorization: token },
        });
      }

      setResponse({
        status: "Success",
        message: "Booking successful!",
      });
      reset();
      setIsModalOpen(false);
setBurialNames({});
setBurialDates({});
setBuriedPersonIdSearch({});
setBuriedPersonNameSearch({});
setBuriedDropdownById([]);
setBuriedDropdownByName([]);
      fetchCemeteries(); // refresh slot counts

      setSelectedSlots([]);

      // ✅ Refresh both cemeteries and booked slots immediately
      await fetchCemeteries();
      await fetchBookedSlots(selectedCemetery._id);
    } catch (err) {
      console.error("Booking failed", err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Booking failed",
      });
    }
  };
  const fetchBookedSlots = async (cemeteryId) => {
    try {
      const res = await axios.get(`${URL}/cemetery-bookings/allreserved`, {
        headers: { Authorization: token },
      });
      const allBooked = res.data.bookings || [];
      const cemeteryBooked = allBooked.filter(
        (b) => b.cemetery_id === cemeteryId
      );
      setBookedSlots(cemeteryBooked);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setBookedSlots([]);
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      reset();
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);
      setIsMember(true);
      setIsBuriedMember(true);
    }
  }, [isModalOpen]);

// close popover when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setActivePopover(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);




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
        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500 ">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Cemetery Name</th>
                <th className="p-2 text-center">Location</th>
                <th className="p-2 text-center">Available Slots</th>
              </tr>
            </thead>
            <tbody>
              {cemeteries.length > 0 ? (
                cemeteries.map((cem, idx) => (
                  <React.Fragment key={cem._id}>
                    {/* Normal row */}
                    <tr
                      className="border-t text-center hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === cem._id ? null : cem._id)
                      }
                    >
                      <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                      <td className="p-2">{cem.cemetery_name}</td>
                      <td className="p-2">{cem.location}</td>
                      <td className="p-2">{cem.number_of_available_slots || 0}</td>
                    </tr>

                    {/* Expanded row for View Slots button */}
                    {expandedRow === cem._id && (
                      <tr className="">
                        <td colSpan={5} className="p-3 text-center">
                          <button
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   setShowSlotsRow(
                            //     showSlotsRow === cem._id ? null : cem._id
                            //   );
                            //   setSelectedCemetery(cem);
                            //   setSelectedSlots([]);
                            // }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const togglingToOpen = showSlotsRow !== cem._id;
                              setShowSlotsRow(togglingToOpen ? cem._id : null);
                              setSelectedCemetery(cem);
                              setSelectedSlots([]);
                              if (togglingToOpen) await fetchBookedSlots(cem._id);
                            }}

                            className="px-4 py-2 text-white bg-lavender--600 rounded"
                          >
                            {showSlotsRow === cem._id ? "Hide Slots" : "View Slots"}
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* Row with slots */}
                    {showSlotsRow === cem._id && (
                      <tr>
                        <td colSpan={5} className="p-4 bg-white relative">

                          <div className="space-y-3">
                            {cem.slots.map((row, rowIdx) => (
                              <div key={rowIdx} className="flex justify-center gap-2">
{row.map((slot, i) => {

  // count persons in slot
  const slotPersons = bookedSlots
    .filter(b => b.slot_id === slot && b.cemetery_id === cem._id);

  const slotCount = slotPersons.length;
  const isSelected = selectedSlots.includes(slot);

  // check slot closed manually
  const isClosed = bookedSlots.some(
    (b) => b.slot_id === slot && b.slot_closed
  );

  // ✅ declare first
  let colorClass = "";

  // ✅ then assign
  if (isClosed || slotCount >= 4)
    colorClass = "bg-red-500 text-white";
  else if (slotCount > 0)
    colorClass = "bg-yellow-300 text-black";
  else if (isSelected)
    colorClass = "bg-blue-600 text-white";
  else
    colorClass = "bg-green-200 hover:bg-green-300";

  return (
    <div key={i} className="relative">

      <button
onClick={() => {

  setSelectedSlots([slot]);
setBurialNames({});
setBurialDates({});
setBuriedPersonIdSearch({});
setBuriedPersonNameSearch({});
setBuriedDropdownById([]);
setBuriedDropdownByName([]);

  // closed or full → view mode + show popup
  if (isClosed || slotCount >= 4) {
    setViewMode("view");

    if (slotPersons.length > 0) {
      setActivePopover(activePopover === slot ? null : slot);
    }

    return;
  }

  // available → book mode
  setViewMode("book");

  if (slotPersons.length > 0) {
    setActivePopover(activePopover === slot ? null : slot);
  }
}}

        className={`px-3 py-2 rounded text-sm ${colorClass}`}
      >
        {slot}
      </button>

      {/* POPUP */}
{/* POPUP */}
{activePopover === slot && slotPersons.length > 0 && (
  <div
    ref={popoverRef}
    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white border rounded-lg shadow-lg"
  >
    {/* Header */}
    <div className="px-3 py-2 border-b font-semibold bg-gray-50 rounded-t-lg">
      Buried Persons
    </div>

    {/* Content */}
    <div className="px-3 py-2 text-sm max-h-40 overflow-y-auto">
      {[...slotPersons].reverse().map((p, index) => (
        <div key={index} className="py-1">
          {slotPersons.length - index}. {p.buried_person_name || "-"}
        </div>
      ))}
    </div>

    {/* 🔥 TRIANGLE ARROW */}
    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-l border-b rotate-45"></div>
  </div>
)}


    </div>
  );
})}

                              </div>
                            ))}
                          </div>

                          <div className="mt-4 text-center">
<button
  onClick={() => setIsModalOpen(true)}
  disabled={selectedSlots.length === 0}
  className="px-5 py-2 bg-lavender--600 text-white rounded disabled:opacity-50"
>
  {viewMode === "view" ? "View Slot" : "Book Slot"}
</button>
                          </div>
                          {/* ✅ Legend Box (bottom right corner, grid aligned) */}
                          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 border rounded-lg p-3 shadow-sm w-fit ml-auto">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-200 border rounded-sm"></span>
                              <span>Available</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 bg-blue-600 rounded-sm"></span>
                              <span className="text-gray-700">Selected</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 bg-yellow-300 rounded-sm border"></span>
                              <span className="text-gray-700">Open</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 bg-red-500 rounded-sm"></span>
                              <span className="text-gray-700">Close</span>
                            </div>
                          </div>

                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">
                    No cemeteries found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
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
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Slot"
      > */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();             // ✅ reset fields when closing
          setIsMember(true);   // optional — default to “Member” tab
          setIsBuriedMember(true);
          setMemberIdSearch("");
          setMemberNameSearch("");
          setDropdownById([]);
          setDropdownByName([]);
setBurialNames({});
setBurialDates({});
setBuriedPersonIdSearch({});
setBuriedPersonNameSearch({});
setBuriedDropdownById([]);
setBuriedDropdownByName([]);
        }}
        title="Book Slot"
      >
        {viewMode === "book" ? (
        <form onSubmit={handleSubmit(handleBooking)}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="p-4 border rounded-lg bg-gray-50">

              {/* Toggle */}
              <div className="mb-4 flex justify-end">
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                  {/* Highlight background */}
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isMember ? "translateX(0)" : "translateX(100%)",
                    }}
                  />
                  {/* Member button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMember(true);
                      reset();
                      setIsBuriedMember(true);
                      setMemberIdSearch("");
                      setMemberNameSearch("");
                      setDropdownById([]);
                      setDropdownByName([]);
                    }}

                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
                ${isMember ? "text-white" : "text-gray-700"}`}
                  >
                    Member
                  </button>
                  {/* Non-Member button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMember(false);
                      reset();
                      setMemberIdSearch("");
                      setMemberNameSearch("");
                      setDropdownById([]);
                      setDropdownByName([]);
                    }}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
            ${!isMember ? "text-white" : "text-gray-700"}`}
                  >
                    Non-Member
                  </button>
                </div>
              </div>

              {/* Conditional form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                {isMember ? (
                  <>
                    {/* Member ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member ID</label>
                      <input
                        type="text"
                        placeholder="Search by ID"
                        value={memberIdSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberIdSearch(val);
                          debouncedSearchById(val);
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Member Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Name</label>
                      <input
                        type="text"
                        placeholder="Search by Name"
                        value={memberNameSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberNameSearch(val);
                          debouncedSearchByName(val);
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Tamil Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tamil Name</label>
                      <input
                        type="text"
                        {...register("memberTamilName")}
                        readOnly
                        value={watch("memberTamilName") || ""}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <input
                        type="text"
                        {...register("gender")}
                        readOnly
                        value={watch("gender") || ""}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        readOnly
                        {...register("phone")}
                        value={watch("phone") || ""}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Aadhar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aadhar</label>
                      <input
                        type="text"
                        {...register("aadhar_number")}
                        readOnly
                        value={watch("aadhar_number") || ""}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Permanent Address */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                      <input
                        type="text"
                        {...register("permanent_address")}
                        readOnly
                        value={
                          watch("permanent_address") ||
                          ""
                        }
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Present Address */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Present Address</label>
                      <input
                        type="text"
                        {...register("present_address")}
                        readOnly
                        value={
                          watch("present_address") ||
                          ""
                        }
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <input
                        type="text"
                        {...register("status")}
                        readOnly
                        value={watch("status") || ""}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Sources */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sources</label>
                      <input
                        type="text"
                        {...register("sources")}
                        readOnly
                        value={(watch("sources") || []).join(", ")}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    {/* Dropdown results */}
                    {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                      <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                        {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                          <li
                            key={m.member_id}
                            className={`flex px-3 py-2 text-sm text-gray-700 ${m.member_id === "none"
                              ? "text-gray-500 cursor-default"
                              : "hover:bg-indigo-50 cursor-pointer transition"
                              }`}
                            onClick={() => {
                              if (m.member_id === "none") return;

                              // ✅ Auto fill
                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);

                              setValue("memberId", m.member_id);
                              setValue("memberName", m.member_name);
                              setValue("memberTamilName", m.member_tamil_name || "");
                              setValue("gender", m.gender || "");
                              setValue("phone", m.mobile_number || "");
                              setValue("aadhar_number", m.aadhar_number || "");
                              setValue("status", m.status || "");
                              setValue("sources", m.sources || []);

                              // Flatten addresses into single line
                              const formatAddress = (a) =>
                                a
                                  ? `${a.address}, ${a.city}, ${a.district}, ${a.state}, ${a.zip_code}, ${a.country}`
                                  : "";

                              setValue("permanent_address", m.permanent_address);
                              setValue("present_address", m.present_address);

                              setDropdownById([]);
                              setDropdownByName([]);
                            }}
                          >
                            <span className="w-[250px] font-medium">
                              {m.member_id === "none" ? m.member_name : m.member_id}
                            </span>
                            {m.member_id !== "none" && (
                              <>
                                <span className="flex-1">{m.member_name}</span>
                                <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    {/* Non-Member Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        {...register("nonMemberName", { required: "Name is required" })}
                        placeholder="Enter full name"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Tamil Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tamil Name</label>
                      <input
                        type="text"
                        {...register("nonMemberTamilName")}
                        placeholder="தமிழ் பெயர்"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        {...register("nonMemberGender")}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        {...register("nonMemberPhone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be exactly 10 digits",
                          },
                        })}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Aadhar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aadhar</label>
                      <input
                        type="text"
                        {...register("nonMemberAadhar")}
                        placeholder="XXXX XXXX XXXX"
                        maxLength={14}
                        onInput={(e) => {
                          let value = e.target.value.replace(/\D/g, "").substring(0, 12);
                          e.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Permanent Address */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                      <textarea
                        {...register("nonMemberPermanentAddress")}
                        placeholder="Enter permanent address"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Present Address */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Present Address</label>
                      <textarea
                        {...register("nonMemberPresentAddress")}
                        placeholder="Enter present address"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        rows={2}
                      />
                    </div>
                  </>

                )}
              </div>
            </div>

{selectedSlots.length > 0 && (
  <div className="mt-4 p-4 border rounded-lg bg-gray-50">

    {selectedSlots.map((slot) => (
      <div key={slot} className="mb-6 last:mb-0">

<div className="flex justify-between items-center mb-3">
  <h3 className="text-sm font-semibold text-gray-700">
    Burial Details — {slot} Slot
  </h3>

  {/* ⭐ NEW BURIAL TOGGLE */}
  <div className="relative flex bg-gray-200 rounded-full p-1 text-xs font-medium w-44">
    <div
      className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
      style={{
        width: "calc(50% - 0.25rem)",
        transform: isBuriedMember ? "translateX(0)" : "translateX(100%)",
      }}
    />

    <button
      type="button"
      onClick={() => {
        setIsBuriedMember(true);
        setBurialNames({});
        setBuriedPersonIdSearch({});
        setBuriedPersonNameSearch({});
      }}
      className={`relative flex-1 py-1 text-center rounded-full ${
        isBuriedMember ? "text-white" : "text-gray-700"
      }`}
    >
      Member
    </button>

    <button
      type="button"
      onClick={() => {
        setIsBuriedMember(false);
        setBurialNames({});
        setBuriedPersonIdSearch({});
        setBuriedPersonNameSearch({});
      }}
      className={`relative flex-1 py-1 text-center rounded-full ${
        !isBuriedMember ? "text-white" : "text-gray-700"
      }`}
    >
      Non-Member
    </button>
  </div>
</div>


        {/* 1 row 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Buried Name */}
{/* MEMBER vs NON-MEMBER */}
{isBuriedMember ? (
<>
  {/* Buried Person ID */}
{/* Buried Person ID */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700">
    Buried Person ID
  </label>

  <input
    type="text"
    placeholder="Search by ID"
    value={buriedPersonIdSearch[slot] || ""}
    onChange={(e) => {
      const val = e.target.value;
      setBuriedPersonIdSearch(prev => ({ ...prev, [slot]: val }));
      debouncedBuriedSearchById(val);
    }}
    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
  />

  {/* DROPDOWN */}
  {buriedDropdownById.length > 0 && (
    <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
      {buriedDropdownById.map((m) => (
        <li
          key={m.member_id}
          className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
          onClick={() => {
            setBuriedPersonIdSearch(prev => ({ ...prev, [slot]: m.member_id }));
            setBuriedPersonNameSearch(prev => ({ ...prev, [slot]: m.member_name }));

            setBurialNames(prev => ({
              ...prev,
              [slot]: m.member_name
            }));

            setBuriedDropdownById([]);
          }}
        >
          {m.member_id} — {m.member_name}
        </li>
      ))}
    </ul>
  )}
</div>


  {/* Buried Person Name */}
{/* Buried Person Name */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700">
    Buried Person Name
  </label>

  <input
    type="text"
    placeholder="Search by Name"
    value={buriedPersonNameSearch[slot] || ""}
    onChange={(e) => {
      const val = e.target.value;
      setBuriedPersonNameSearch(prev => ({ ...prev, [slot]: val }));
      debouncedBuriedSearchByName(val);
    }}
    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
  />

  {/* DROPDOWN */}
  {buriedDropdownByName.length > 0 && (
    <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
      {buriedDropdownByName.map((m) => (
        <li
          key={m.member_id}
          className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
          onClick={() => {
            setBuriedPersonIdSearch(prev => ({ ...prev, [slot]: m.member_id }));
            setBuriedPersonNameSearch(prev => ({ ...prev, [slot]: m.member_name }));

            setBurialNames(prev => ({
              ...prev,
              [slot]: m.member_name
            }));

            setBuriedDropdownByName([]);
          }}
        >
          {m.member_id} — {m.member_name}
        </li>
      ))}
    </ul>
  )}
</div>



</>
) : (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Buried Person Name
    </label>

    <input
      type="text"
      placeholder="Enter buried person name"
      value={burialNames[slot] || ""}
      onChange={(e) =>
        setBurialNames(prev => ({ ...prev, [slot]: e.target.value }))
      }
      className="block w-full mt-1 border-gray-300 rounded-md"
    />
  </div>
)}


          {/* Buried Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buried Date
            </label>
            <input
              type="date"
              value={burialDates[slot] || ""}
              onChange={(e) =>
                setBurialDates((prev) => ({
                  ...prev,
                  [slot]: e.target.value,
                }))
              }
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

        </div>
      </div>
    ))}

  </div>
)}


{slotPersons.length > 0 && (
  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm text-gray-500 border rounded">
      
      {/* Header */}
      <thead className="text-base text-gray-700 border-b bg-gray-50">
        <tr>
          <th className="p-2 text-center">SI No</th>
          <th className="p-2 text-center">Buried Person ID</th>
          <th className="p-2 text-center">Buried Person</th>
          <th className="p-2 text-center">Buried Date</th> 
          <th className="p-2 text-center">Member Name</th>
          <th className="p-2 text-center">Status</th>
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {[...slotPersons].reverse().map((p, i) => (
          <tr key={i} className="border-b text-center hover:bg-gray-50">
            <td className="p-2">{i + 1}</td>

<td className="p-2">
  {p.member?.member_id || "Non-Member"}
</td>

            <td className="p-2">
              {p.buried_person_name || "-"}
            </td>

<td className="p-2">
  {p.buried_date
    ? new Date(p.buried_date).toLocaleDateString()
    : "-"}
</td>

            <td className="p-2">
              {p.isMember
                ? p.member?.member_name
                : p.non_member?.name || "-"}
            </td>

            <td className="p-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === "Buried"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status || "Reserved"}
              </span>
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  </div>
)}



            <div className="flex justify-end gap-3 mt-6">
<button
  type="button"
  onClick={async () => {
    if (!selectedSlots[0]) return;

    await axios.put(`${URL}/cemetery-bookings/close-slot`, {
      cemetery_id: selectedCemetery._id,
      slot_id: selectedSlots[0],
    }, { headers: { Authorization: token } });

    await fetchBookedSlots(selectedCemetery._id);
    setSelectedSlots([]);
    setIsModalOpen(false);
  }}
  className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
>
  Close Slot
</button>

              <button type="submit" className="mt-4 px-4 py-2 bg-lavender--600 text-white  rounded">
                Confirm Booking
              </button>
            </div>

          </div>
        </form>
) : (

<div className="space-y-3">

  <h2 className="text-lg font-semibold text-center">
    Slot Details
  </h2>

  {slotPersons.length > 0 && (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm text-gray-500 border rounded">
        
        <thead className="text-base text-gray-700 border-b bg-gray-50">
          <tr>
            <th className="p-2 text-center">SI No</th>
            <th className="p-2 text-center">Buried Person ID</th>
            <th className="p-2 text-center">Buried Person</th>
            <th className="p-2 text-center">Buried Date</th> 
            <th className="p-2 text-center">Member Name</th>
            <th className="p-2 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {[...slotPersons].reverse().map((p, i) => (
            <tr key={i} className="border-b text-center">
              <td className="p-2">{i + 1}</td>
              <td>{p.member?.member_id || "Non-Member"}</td>
              <td className="p-2">{p.buried_person_name || "-"}</td>
<td className="p-2">
  {p.buried_date
    ? new Date(p.buried_date).toLocaleDateString()
    : "-"}
</td>
              <td className="p-2">
                {p.isMember ? p.member?.member_name : p.non_member?.name || "-"}
              </td>
              <td className="p-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                  {p.status || "Buried"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )}

  <div className="flex justify-end">
    <button
      type="button"
      onClick={() => setIsModalOpen(false)}
      className="px-4 py-2 bg-gray-500 text-white rounded"
    >
      Close
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
