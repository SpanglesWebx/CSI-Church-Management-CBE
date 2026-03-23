import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { AddHallBookingFromMrg } from "./AddHallBookingFromMrg";

export const AddMarriage = () => {
  const navigate = useNavigate();
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  const [isMember, setIsMember] = useState(true);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);

  const [phone, setPhone] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [marriageDate, setMarriageDate] = useState("");

  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");

  const [bookHall, setBookHall] = useState(false);
  const [nonMemberChurch, setNonMemberChurch] = useState("");
  const [nonMemberAddress, setNonMemberAddress] = useState("");
  const [mrgType, setMrgType] = useState("Banns");
  const [amount, setAmount] = useState("");
  // booking summary received from AddHallBookingFromMrg
  const [hallBookingSummary, setHallBookingSummary] = useState(null);

  // saving/loading states
  const [saving, setSaving] = useState(false);




  // debounce function
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id`, {
          headers: { Authorization: token },
          params: { id: val }
        });
        setDropdownById(res.data || []);
      } catch (err) {
        setDropdownById([{ member_id: "none", member_name: "No members found" }]);
      }
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search`, {
          headers: { Authorization: token },
          params: { name: val }
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        setDropdownByName([{ member_id: "none", member_name: "No members found" }]);
      }
    }, 300)
  ).current;

  const fetchLatestBannsPrice = async () => {
    try {
      const res = await axios.get(`${URL}/banns-price/active`, {
        headers: { Authorization: token }
      });
      setAmount(res.data?.data?.amount || "");
    } catch (err) {
      console.log("Error loading banns price", err);
    }
  };

  const fetchLatestMarriagePrice = async () => {
    try {
      const res = await axios.get(`${URL}/marriage-price/active`, {
        headers: { Authorization: token }
      });
      setAmount(res.data?.data?.amount || "");
    } catch (err) {
      console.log("Error loading marriage price", err);
    }
  };

  useEffect(() => {
    if (mrgType === "Banns") fetchLatestBannsPrice();
    else fetchLatestMarriagePrice();
  }, [mrgType]);

const handleSaveMarriage = async () => {
  // VALIDATIONS
  if (!marriageDate) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Failed", message: "Select marriage date" });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (isMember && !memberId) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Failed", message: "Select a member" });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (!isMember && !nonMemberName) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Failed", message: "Enter non-member name" });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  setSaving(true);

  const payload = {
    type: mrgType,
    date: marriageDate,
    amount: Number(amount || 0),

    member: isMember
      ? {
          member_id: memberId,
          member_name: memberName,
          phone,
        }
      : null,

    non_member: !isMember
      ? {
          name: nonMemberName,
          phone: nonMemberPhone,
          church: nonMemberChurch,
          address: nonMemberAddress,
        }
      : null,

    hallBooking: hallBookingSummary
      ? {
          bookingId: hallBookingSummary.bookingId,
          hallId: hallBookingSummary.hallId,
          hallName: hallBookingSummary.hallName,
          categoryId: hallBookingSummary.categoryId,
          categoryName: hallBookingSummary.categoryName,
          bookingDate: hallBookingSummary.bookingDate,
          sessions: hallBookingSummary.sessions,
          hallAmount: hallBookingSummary.hallAmount,
          advanceAmount: hallBookingSummary.advanceAmount,
        }
      : null,
  };

  try {
    const res = await axios.post(
      `${URL}/marriages/add`,
      payload,
      { headers: { Authorization: token } }
    );

    // 🟢 SUCCESS TOAST — forced re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: res.data.message || "Marriage saved",
      });
    }, 10);

    // Auto-hide toast
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);

    // WAIT 2 SECONDS, CLEAR FORM AND GO BACK
    setTimeout(() => {
      // RESET ALL FIELDS
      setIsMember(true);
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);
      setPhone("");
      setMemberId("");
      setMemberName("");
      setMarriageDate("");

      setNonMemberName("");
      setNonMemberPhone("");
      setNonMemberChurch("");
      setNonMemberAddress("");

      setMrgType("Banns");
      setAmount("");
      setHallBookingSummary(null);

      setBookHall(false);

      // navigate back
      navigate(-1);
    }, 2000);

  } catch (err) {
    // 🔴 ERROR TOAST — forced re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error saving marriage",
      });
    }, 10);

    // Auto-hide toast
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);

  } finally {
    setSaving(false);
  }
};



  return (
    <>
      <FaArrowLeft size={18} onClick={() => navigate(-1)} className="cursor-pointer" />

      <div className="p-5 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold text-lavender--600">Add Marriage</h1>

        {/* MEMBER / NON-MEMBER TOGGLE */}
        <div className="p-4 border rounded-lg bg-gray-50 mb-2">
          <div className="mb-4 flex justify-end">
            <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">

              <div
                className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                style={{
                  width: "calc(50% - 0.25rem)",
                  transform: isMember ? "translateX(0)" : "translateX(100%)",
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setIsMember(true);
                  setMemberIdSearch("");
                  setMemberNameSearch("");
                  setDropdownById([]);
                  setDropdownByName([]);
                }}
                className={`relative flex-1 py-1 text-center rounded-full ${isMember ? "text-white" : "text-gray-700"}`}
              >
                Member
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMember(false);
                  setMemberIdSearch("");
                  setMemberNameSearch("");
                  setDropdownById([]);
                  setDropdownByName([]);
                }}
                className={`relative flex-1 py-1 text-center rounded-full ${!isMember ? "text-white" : "text-gray-700"}`}
              >
                Non-Member
              </button>

            </div>
          </div>

          {/* MEMBER SECTION */}
          {isMember ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 relative">
              <div>
                <label className="text-sm font-medium text-gray-700">Member ID</label>
                <input
                  type="text"
                  placeholder="Search ID"
                  value={memberIdSearch}
                  onChange={(e) => {
                    setMemberIdSearch(e.target.value);
                    debouncedSearchById(e.target.value);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Member Name</label>
                <input
                  type="text"
                  placeholder="Search Name"
                  value={memberNameSearch}
                  onChange={(e) => {
                    setMemberNameSearch(e.target.value);
                    debouncedSearchByName(e.target.value);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                />
              </div>

              {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      className={`flex px-3 py-2 text-sm ${m.member_id === "none"
                        ? "text-gray-500 cursor-default"
                        : "hover:bg-indigo-50 cursor-pointer"
                        }`}
                      onClick={() => {
                        if (m.member_id === "none") return;
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setPhone(m.mobile_number || "");
                        setMemberId(m.member_id);
                        setMemberName(m.member_name);
                        setDropdownById([]);
                        setDropdownByName([]);
                      }}
                    >
                      <span className="w-1/3 font-medium">{m.member_id}</span>
                      <span className="w-1/3">{m.member_name}</span>
                      <span className="w-1/3 text-gray-500">{m.mobile_number}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            // NON MEMBER SECTION (FULL + FIXED)
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">

              {/* LEFT SIDE */}
              <div className="flex flex-col space-y-4">

                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={nonMemberName}
                    onChange={(e) => setNonMemberName(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter Phone"
                    maxLength={10}
                    value={nonMemberPhone}
                    onChange={(e) => setNonMemberPhone(e.target.value.replace(/\D/g, ""))}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Church Name</label>
                  <input
                    type="text"
                    placeholder="Enter Church Name"
                    value={nonMemberChurch}
                    onChange={(e) => setNonMemberChurch(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  placeholder="Enter Address"
                  rows={9}
                  value={nonMemberAddress}
                  onChange={(e) => setNonMemberAddress(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm overflow-y-auto resize-none"
                  style={{ maxHeight: "12.5rem" }}
                ></textarea>
              </div>

            </div>
          )}
        </div>


        {/* MARRIAGE DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              value={mrgType}
              onChange={(e) => setMrgType(e.target.value)}>
              <option value="Banns">Banns</option>
              <option value="Marriage">Marriage</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Marriage Date</label>
            <input
              type="date"
              value={marriageDate}
              onChange={(e) => setMarriageDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="text"
              placeholder="Amount"
              value={amount}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
            />
          </div>
        </div>

        {/* BOOK HALL */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => setBookHall((prev) => !prev)}
            className={`px-4 py-2 rounded-md text-white transition 
      ${bookHall ? "bg-red-500" : "bg-lavender--600"}`}
          >
            {bookHall ? "Cancel Hall Booking" : "Book Hall"}
          </button>
        </div>


        {/* SHOW HALL BOOKING */}
        {/* {bookHall && (
          <div className="mt-4">
            <AddHallBookingFromMrg
              prefName={isMember ? memberName : nonMemberName}
              prefPhone={isMember ? phone : nonMemberPhone}
              prefDate={marriageDate}
            />
          </div>
        )} */}
        {bookHall && (
          <div className="mt-4">
            <AddHallBookingFromMrg
              prefName={isMember ? memberName : nonMemberName}
              prefPhone={isMember ? phone : nonMemberPhone}
              prefDate={marriageDate}
              onBooked={(bookingSummary) => {
                // receive booking summary and close booking UI
                setHallBookingSummary(bookingSummary);
                setBookHall(false);
                // optionally show a success message
                setResponse({ status: "Success", message: "Hall booked. Fill other details and save marriage." });
              }}
            />
          </div>
        )}

        {hallBookingSummary && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h2 className="font-medium mb-2">Hall Booking Summary</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-medium">Hall</td>
                  <td className="py-1">{hallBookingSummary.hallName}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Category</td>
                  <td className="py-1">{hallBookingSummary.categoryName}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Booked Date</td>
                  <td className="py-1">{new Date(hallBookingSummary.bookingDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Session(s)</td>
                  <td className="py-1">{(hallBookingSummary.sessions || []).join(", ")}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Total Amount</td>
                  <td className="py-1">{hallBookingSummary.hallAmount}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Advance Paid</td>
                  <td className="py-1">{hallBookingSummary.advanceAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-2">
          <button
            type="button"
            onClick={handleSaveMarriage}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Marriage"}
          </button>
        </div>

      </div>

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </>
  );
};
