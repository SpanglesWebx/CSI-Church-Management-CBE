import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/Pagination";

export const AddSubtitle = () => {
  // NOTE: component kept named AddSubtitle for compatibility with your routes/UI
  // but it now manages top-level "Titles" (not nested subtitles).
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // Data returned from backend (current page)
  const [subtitleList, setSubtitleList] = useState([]);

  // Form fields (Add title)
  const [subtitle, setSubtitle] = useState("");
  const [subtitleDesc, setSubtitleDesc] = useState("");

  // Pagination & server-driven controls
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // server limit used when requesting

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Confirm modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState(null);

  // Local loading / ui state
  const [loading, setLoading] = useState(false);
  // pagination (standard reusable)
const [rowsPerPage, setRowsPerPage] = useState(25); // ✅ default 25
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  // Toast helper
  const triggerToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // Build query params for backend call
  const buildParams = () => {
    const params = {
      page: CurrentPage,
      limit: rowsPerPage,
    };

    if (searchTerm && searchTerm.trim() !== "") params.search = searchTerm.trim();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (statusFilter && statusFilter !== "All") params.status = statusFilter;

    return params;
  };

  // Fetch from backend with filters & pagination
  const fetchSubtitlesFromServer = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${URL}/poor-help`, {
        headers: { Authorization: token },
        params: buildParams(),
      });

      const { data, page, totalPages } = res.data;
      setSubtitleList(Array.isArray(data) ? data : []);
      setCurrentPage(page || 1);
      setTotalPages(totalPages || 1);
    } catch (err) {
      console.error("Error fetching titles:", err?.response?.data || err.message);
      triggerToast("Failed", "Failed to load titles");
    } finally {
      setLoading(false);
    }
  };

  // load on mount and when filters/page changes
useEffect(() => {
  fetchSubtitlesFromServer();
}, [CurrentPage, searchTerm, startDate, endDate, statusFilter, rowsPerPage]);


  const saveSubtitle = async () => {
    if (!subtitle || subtitle.trim() === "") {
      return triggerToast("Failed", "Title required");
    }

    try {
      await axios.post(
        `${URL}/poor-help/add`,
        { title: subtitle.trim(), description: subtitleDesc },
        { headers: { Authorization: token } }
      );

      triggerToast("Success", "Title Added");
      setSubtitle("");
      setSubtitleDesc("");

      // refresh list: go to first page to show the newly added if sorted by date desc
      setCurrentPage(1);
      fetchSubtitlesFromServer();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add title";
      triggerToast("Failed", message);
    }
  };

  const confirmInactive = (id) => {
    setSelectedSubtitleId(id);
    setIsConfirmOpen(true);
  };

  const inactivateSubtitle = async () => {
    if (!selectedSubtitleId) return;

    try {
      await axios.put(
        `${URL}/poor-help/update-status/${selectedSubtitleId}`,
        {},
        { headers: { Authorization: token } }
      );

      triggerToast("Success", "Title Inactivated");
      setIsConfirmOpen(false);
      // reload current page
      fetchSubtitlesFromServer();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update status";
      triggerToast("Failed", message);
    }
  };

  // Pagination handlers
  const goPrev = () => {
    if (CurrentPage > 1) setCurrentPage((p) => p - 1);
  };
  const goNext = () => {
    if (CurrentPage < TotalPages) setCurrentPage((p) => p + 1);
  };
  const goLast = () => {
    if (TotalPages > 0) setCurrentPage(TotalPages);
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Poor Help Donation</h1>

        {/* ADD FORM */}
        <div className="flex items-end gap-4 mt-3">
          <div className="flex gap-4 flex-grow">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Help Title</label>
              <input
                type="text"
                placeholder="Enter Sub Title"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Enter Description"
                value={subtitleDesc}
                onChange={(e) => setSubtitleDesc(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <button
            onClick={saveSubtitle}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md whitespace-nowrap"
          >
            Add Title
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center justify-between p-2">
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
            />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Title</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading && subtitleList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-3 text-gray-400">No Subtitles Found</td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-400">Loading...</td>
                </tr>
              )}

              {!loading && subtitleList.map((sub, index) => (
                <tr key={sub._id || index} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2">{sub.title || sub.subtitle || ""}</td>
                  <td className="p-2">{moment(sub.date).format("DD-MM-YYYY")}</td>

                  <td className="p-2">
                    <span className={`px-3 py-1 font-semibold ${sub.status === "Inactive" ? "text-red-500" : "text-green-600"}`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center">
                    {sub.status === "Active" ? (
                      <FaLockOpen
                        size={18}
                        className="cursor-pointer text-green-600"
                        title="Mark Inactive"
                        onClick={() => confirmInactive(sub._id)}
                      />
                    ) : (
                      <FaLock
                        size={18}
                        className="text-red-600 cursor-not-allowed"
                        title="Inactive"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
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


        {/* CONFIRM MODAL */}
        <SmallSizedModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Action">
          <p className="text-gray-700 text-center my-4">Do you really want to mark this subtitle as <b>Inactive</b>?</p>

          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-gray-300 rounded">No</button>

            <button onClick={inactivateSubtitle} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
          </div>
        </SmallSizedModal>
      </div>

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
