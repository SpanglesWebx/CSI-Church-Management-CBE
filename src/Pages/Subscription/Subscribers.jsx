/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";

export const Subscribers = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  // pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [session, setSession] = useState("All");
  const [summary, setSummary] = useState({
  totalCash: 0,
  totalCheque: 0,
  grandTotal: 0,
});

  const token = window.sessionStorage.getItem("token");

  const navigate = useNavigate();


const fetchSubscriptions = async () => {
  try {
    const res = await axios.get(`${URL}/subscriptions`, {
      params: {
        search: searchQuery,
        page: CurrentPage,
        limit: rowsPerPage,
        date: startDate,
        session: session,
      },
      headers: { Authorization: token },
    });

    setSubscriptions(res.data.subscribers || []);
    setTotalPages(res.data.totalPages || 1);

    // 🔥 SET SUMMARY
    setSummary(
      res.data.summary || {
        totalCash: 0,
        totalCheque: 0,
        grandTotal: 0,
      }
    );
  } catch (err) {
    console.error("Failed to fetch subscriptions:", err);
    setSubscriptions([]);
  }
};


useEffect(() => {
  fetchSubscriptions();
}, [searchQuery, CurrentPage, rowsPerPage, startDate, session]);
  // add CurrentPage

const formatCurrency = (val) => {
  return (val || 0).toLocaleString("en-IN");
};
  const handleaddsub = () => {
    navigate("/admin/subscribers/addsubscription");
  };

  const handledetailopen = (member_id, year) => {
    navigate(`/admin/subscribers/subscribersdetails?member_id=${member_id}&year=${year}`);
  };



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col items-center justify-left lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Session</label>
            <select
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Office Payment">Office Payment</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <label>Date</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-end lg:flex-row gap-6">
          <div className="flex items-center space-x-">
            <label >
              Cash: <span className="font-bold text-green-600">₹ {formatCurrency(summary.totalCash)}</span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <label>
              Cheque: <span className="font-bold text-blue-600">₹ {formatCurrency(summary.totalCheque)}</span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <label>
              Total: <span className="font-bold text-black-600">₹ {formatCurrency(summary.grandTotal)}</span>
            </label>
          </div>
        </div>
      </div>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        {/* Header with search + add button */}
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search by Member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>


          <div className="flex w-full gap-x-4 lg:w-auto">
            <button
              onClick={handleaddsub}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Subscriber
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full">
            <thead className="">
              <tr>
                <th className="p-2 text-center ">Sl No</th>
                <th className="p-2 text-center ">Member ID</th>
                <th className="p-2 text-center ">Member Name</th>
                <th className="p-2 text-center ">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((s, index) => (
                  <tr key={index} className="border-b">
                    {/* Serial number based on backend page */}
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    {/* Member ID */}
                    <td className="p-2 text-center">{s.member_id}</td>

                    {/* Member Name */}
                    <td className="p-2 text-left">{s.member_name}</td>

                    {/* Action: View Button */}
                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600 inline-block"
                        onClick={() => handledetailopen(s.member_id, s.year)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No Subscriptions Found
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
    </>
  );
};
