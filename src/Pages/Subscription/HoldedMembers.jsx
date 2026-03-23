import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaEye } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const HoldedMembers = () => {
  const navigate = useNavigate();
  
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [holdedMembers, setHoldedMembers] = useState([]);

  // FETCH HOLDED MEMBERS
  useEffect(() => {
    const fetchHolded = async () => {
      try {
        const res = await axios.get(`${URL}/subscriptions/holded-members`, {
          params: {
            page: CurrentPage,
            limit: 50,
            search: searchTerm
          },
          headers: { Authorization: token }
        });

        setHoldedMembers(res.data.holdedMembers);
        setTotalPages(res.data.totalPages);

      } catch (err) {
        console.error(err);
      }
    };

    fetchHolded();
  }, [CurrentPage, searchTerm]);

  return (
    <>
      <FaArrowLeft
        size={18}
        title='Back'
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Holded Members</h1>

        {/* SEARCH */}
        <div className="flex items-center justify-between p-2">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {holdedMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-3 text-gray-400">
                    No Holded Members Found
                  </td>
                </tr>
              ) : (
                holdedMembers.map((m, index) => (
                  <tr key={index} className='border-b text-center'>
                    <td className="p-2">
                      {(CurrentPage - 1) * 50 + (index + 1)}
                    </td>
                    <td>{m.member_id}</td>
                    <td className='text-left'>{m.member_name}</td>
                    <td className='text-red-600 font-semibold'>{m.membership_status}</td>
                    <td className='text-center'>
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer mx-auto"
                        title="View Member"
                        onClick={() => navigate(`/admin/memberlist/viewmember/${m._id}`)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="relative flex items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={CurrentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button className="px-4 py-2 bg-lavender--600 text-white rounded">
            {CurrentPage}
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(TotalPages, p + 1))}
            disabled={CurrentPage === TotalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>

          <div className="absolute right-2 flex space-x-2 px-4">
            <span className="px-4 py-2 bg-gray-100 rounded">
              Total Pages: {TotalPages}
            </span>

            <span
              onClick={() => TotalPages > 0 && CurrentPage !== TotalPages && setCurrentPage(TotalPages)}
              className={
                TotalPages === CurrentPage
                  ? "opacity-50 cursor-not-allowed bg-gray-100 px-4 py-2"
                  : "px-4 py-2 text-blue-600 bg-gray-100 rounded cursor-pointer"
              }
            >
              Last Page
            </span>
          </div>
        </div>
      </div>

      {Response.status &&
        (Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />)}
    </>
  );
};
