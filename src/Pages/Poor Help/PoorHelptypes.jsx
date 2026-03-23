import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import SmallModal from "../../Components/Expense/SmallSizedModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export const PoorHelptypes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // add income modal
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // ---- New States ----
  const [helpList, setHelpList] = useState([]);
  const [helpType, setHelpType] = useState("");
  const [helpDesc, setHelpDesc] = useState("");

  const triggerToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const fetchHelpList = async () => {
    try {
      const res = await axios.get(`${URL}/poor-help/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          search: searchTerm,
          startDate,
          endDate,
        },
      });

      setHelpList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.log("List Error:", err);
      setHelpList([]);
    }
  };

  useEffect(() => {
    fetchHelpList();
  }, [CurrentPage, searchTerm, startDate, endDate]);

  const saveHelpType = async () => {
    if (!helpType) return triggerToast("Failed", "Help type required");

    try {
      await axios.post(
        `${URL}/poor-help/add-type`,
        { help_type: helpType, description: helpDesc },
        { headers: { Authorization: token } }
      );

      triggerToast("Success", "Help Type Added");
      setHelpType("");
      setHelpDesc("");
      setIsModalOpen(false);
      fetchHelpList();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add";
      triggerToast("Failed", msg);
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Poor Help Types</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Help</button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Help Name</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {helpList.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-3 text-gray-400">
                    No Records Found
                  </td>
                </tr>
              )}

              {helpList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * 10 + index + 1}</td>
                  <td className="p-2">{item.help_type}</td>
                  <td className="p-2">
                    {item.createdAt ? moment(item.createdAt).format("DD-MM-YYYY") : "-"}
                  </td>
                  <td className="p-2 text-center flex justify-center gap-2">
                    <FaEye title="View Subtitle" size={18} className="cursor-pointer text-lavender--600" onClick={() => navigate(`/admin/poorhelptypes/addsubtitle/${item._id}`)} />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button onClick={() => setCurrentPage(CurrentPage - 1)} disabled={CurrentPage === 1} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"}`}>{CurrentPage}</button>
          <button onClick={() => setCurrentPage(CurrentPage + 1)} disabled={CurrentPage === TotalPages || TotalPages === 0} className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50">Next</button>

          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">Total Page: <span>{TotalPages}</span></span>
            <span onClick={() => setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}>Last Page</span>
          </div>
        </div>

        <SmallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Help Types">
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Help Type</label>
              <input type="text" placeholder='Enter type' className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={helpType}
                onChange={(e) => setHelpType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" placeholder='Enter description' className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={helpDesc}
                onChange={(e) => setHelpDesc(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={saveHelpType} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Add</button>
          </div>
        </SmallModal>

     

      </div>
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
