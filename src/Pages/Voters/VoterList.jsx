import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";

export const VoterList = () => {
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberList, setMemberList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25); // voter list already uses 15
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




  const fetchVoters = async () => {
    try {
      const res = await axios.get(
        `${URL}/voters/list?page=${CurrentPage}&limit=${rowsPerPage}&search=${searchTerm}`,
        { headers: { Authorization: token } }
      );

      if (res.data.status === "Success") {
        setMemberList(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  fetchVoters();
}, [CurrentPage, rowsPerPage, searchTerm]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Voters</h1>
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Member Tamil Name</th>
                <th className="p-2 text-center">Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {memberList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-2 text-grey-800">
                    No Records Found
                  </td>
                </tr>
              ) : (
                memberList.map((m, index) => (
                  <tr key={m.member_id} className="border-b">
                    <td className="p-2 text-center font-semibold">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center">{m.member_id}</td>
                    <td className="p-2 text-center">{m.member_name}</td>
                    <td className="p-2 text-center">{m.member_tamil_name}</td>
                    <td className="p-2 text-center">{m.contact_numbers}</td>
                  </tr>
                ))
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

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
