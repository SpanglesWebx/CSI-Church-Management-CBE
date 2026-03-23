import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPeopleRoof } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export const PastorList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userRole, setUserRole] = useState("");
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  // const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [statusFilter, setStatusFilter] = useState("All");
  const [pastors, setPastors] = useState([]);
  // ===== Pagination states (carbon copy from FamilyList) =====
// const [rowsPerPage, setRowsPerPage] = useState(15);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");

const pageFromUrl = Number(searchParams.get("page")) || 1;
const searchFromUrl = searchParams.get("search") || "";
const statusFromUrl = searchParams.get("status") || "All";
const limitFromUrl = Number(searchParams.get("limit")) || 15;

const [CurrentPage, setCurrentPage] = useState(pageFromUrl);
const [searchTerm, setSearchTerm] = useState(searchFromUrl);
const [statusFilter, setStatusFilter] = useState(statusFromUrl);
const [rowsPerPage, setRowsPerPage] = useState(limitFromUrl);

    useEffect(() => {
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);
  
      // If multiple roles exist, pick the active/stored one
      const storedRole = sessionStorage.getItem("role");
  
      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]); 


  const fetchPastors = async () => {
    try {
      const res = await axios.get(`${URL}/pastors/list`, {
        params: {
    page: CurrentPage,
    limit: rowsPerPage,
    search: searchTerm,
    status: statusFilter
  },
        headers: {
          Authorization: token
        }
      });

      setPastors(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

useEffect(() => {
  fetchPastors();
}, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);

const getPaginationPages = () => {
  const pages = [];
  const range = 2;

  if (TotalPages <= 7) {
    for (let i = 1; i <= TotalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (CurrentPage > range + 2) pages.push("ellipsis-left");

  const start = Math.max(2, CurrentPage - range);
  const end = Math.min(TotalPages - 1, CurrentPage + range);

  for (let i = start; i <= end; i++) pages.push(i);

  if (CurrentPage < TotalPages - (range + 1)) pages.push("ellipsis-right");

  pages.push(TotalPages);

  return pages;
};


useEffect(() => {
  setSearchParams({
    page: CurrentPage,
    search: searchTerm,
    status: statusFilter,
    limit: rowsPerPage
  });
}, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Presbyters</h1>
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

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Presbyter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
{["admin", "churchofficeworker", 'officestaff'].includes(userRole) && (
          <button onClick={() => navigate('/admin/pastorlist/addpastor')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Presbyter
          </button>
)}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Presbyter ID</th>
                <th className="p-2 text-center">Presbyter Name</th>
                <th className="p-2 text-center">Presbyter Tamil Name</th>
                <th className="p-2 text-center">Work Period</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pastors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No presbyters found
                  </td>
                </tr>
              ) : (
                pastors.map((p, index) => (
                  <tr key={p._id} className="border-b ">
                    <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center">{p.pastor_id}</td>
                    <td className="p-2 text-center">{p.pastor_name}</td>
                    <td className="p-2 text-center">{p.pastor_tamil_name}</td>

                    {/* Work period (Joining date → Today) */}
                    <td className="p-2 text-center">
                      {p.joining_date ? (
                        p.status === "Inactive" && p.left_date ? (
                          `${new Date(p.joining_date).toLocaleDateString()} → ${new Date(
                            p.left_date
                          ).toLocaleDateString()}`
                        ) : (
                          `${new Date(p.joining_date).toLocaleDateString()} → Present`
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs 
                        ${p.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-2 text-center flex ">
                      <FaEye size={18} className="text-lavender--600 m-auto cursor-pointer"
                        onClick={() => navigate(`/admin/pastorlist/viewpastor/${p._id}`)} />
                      <FaPeopleRoof size={18} className="text-lavender--600 m-auto cursor-pointer"
                        onClick={() => navigate(`/admin/pastorlist/pastorfampreview/${p._id}`)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>


          </table>
        </div>
        {/* Pagination */}
<div className="relative flex items-center justify-center mt-4 space-x-2 select-none">

  {/* LEFT – Rows Per Page */}
  <div className="absolute left-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        No. of Rows
      </span>

      <div className="relative w-24">
        <div
          className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
          onClick={() => {
            setRowsPerPage(rowsInput || 15);
            setCurrentPage(1);
          }}
        >
          <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>

        <input
          type="text"
          inputMode="numeric"
          placeholder="15"
          value={rowsInput}
          onChange={(e) =>
            setRowsInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          className="block w-full py-1 pr-8 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

  {/* CENTER – Pagination */}
  <div className="flex items-center space-x-2">

    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={CurrentPage === 1}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronLeft />
    </button>

    {getPaginationPages().map((page, index) => {
      if (typeof page === "string") {
        return <span key={index} className="px-3 py-2 text-gray-500">…</span>;
      }

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium
            ${page === CurrentPage
              ? "bg-lavender--600 text-white"
              : "hover:border-2 border-gray-300"
            }`}
        >
          {page}
        </button>
      );
    })}

    <button
      onClick={() => setCurrentPage(p => Math.min(TotalPages, p + 1))}
      disabled={CurrentPage === TotalPages}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronRight />
    </button>

  </div>

  {/* RIGHT – Jump to Page */}
  <div className="absolute right-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        Jump to Page
      </span>

      <div className="relative w-20">
        <input
          type="text"
          inputMode="numeric"
          placeholder={`1-${TotalPages}`}
          value={jumpInput}
          onChange={(e) =>
            setJumpInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = Number(jumpInput);
              if (page >= 1 && page <= TotalPages) {
                setCurrentPage(page);
                setJumpInput("");
              }
            }
          }}
          className="block w-full py-1 pr-2 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

</div>


        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

      </div>
    </>
  )
}
