import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye, FaPrint, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import { FiDownload } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import AgeFilterModal from "../../Components/Expense/AgeFilterModal";

import MemberDetailedPrintModal from "./MemberDetailedPrintModal";
import MemberListPrintModal from "./MemberListPrintModal";




export const MemberList = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [CurrentPage, setCurrentPage] = useState(pageFromUrl);
  const [TotalPages, setTotalPages] = useState(1);
const searchFromUrl = searchParams.get("search") || "";
const statusFromUrl = searchParams.get("status") || "All";

const [searchTerm, setSearchTerm] = useState(searchFromUrl);
const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [memberList, setMemberList] = useState([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [rowsInput, setRowsInput] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [userRole, setUserRole] = useState("");

  const [isSearchOptionOpen, setIsSearchOptionOpen] = useState(false);
  const [searchBy, setSearchBy] = useState(""); // "phone" | "address"
  const [phoneSearch, setPhoneSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");

  const [showAgeFilter, setShowAgeFilter] = useState(false);
  const [ageTo, setAgeTo] = useState("");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageMode, setAgeMode] = useState("");
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [ageFilteredMembers, setAgeFilteredMembers] = useState([]);

  const [activeDownloadBtn, setActiveDownloadBtn] = useState("");

const [fromSI, setFromSI] = useState("");
const [toSI, setToSI] = useState("");
const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);


const [isPrintRangeModalOpen, setIsPrintRangeModalOpen] = useState(false);
const [isPrintMemberModalOpen, setIsPrintMemberModalOpen] = useState(false);


const [fromPage,setFromPage] = useState("");
const [toPage,setToPage] = useState("");
const [isListPrintModalOpen,setIsListPrintModalOpen] = useState(false);
const [isPrintListModalOpen,setIsPrintListModalOpen] = useState(false);

const [allMembersForPrint, setAllMembersForPrint] = useState([]);


const [loadingDetailedPrint, setLoadingDetailedPrint] = useState(false);
const [loadingListPrint, setLoadingListPrint] = useState(false);


const [isListConfirmOpen, setIsListConfirmOpen] = useState(false);

  const searchRef = useRef(null);


const changePage = (page) => {
  setCurrentPage(page);

  setSearchParams({
    page,
    search: searchTerm,
    status: statusFilter,
  });
};


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







  const fetchMemberList = async () => {
    try {
      const res = await axios.get(
        `${URL}/new-members?page=${CurrentPage}&search=${searchTerm}&status=${statusFilter}&limit=${rowsPerPage || 50}&phone=${phoneSearch}&address=${addressSearch}`,

        { headers: { Authorization: token } }
      );

      setMemberList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Members Error:", err);
      setMemberList([]);
    }
  };


const fetchAllMembersForPrint = async () => {
  try {

    const res = await axios.get(
      `${URL}/new-members`,
      {
        params: {
          page: 1,
          limit: 100000,
          status: statusFilter,
          search: searchTerm
        },
        headers: { Authorization: token }
      }
    );

    setAllMembersForPrint(res.data.data || []);

  } catch (err) {
    console.error("Print members fetch error", err);
  }
};


  const handleAgeSubmit = async () => {
    const from = ageFrom === "" ? null : Number(ageFrom);
    const to = ageTo === "" ? null : Number(ageTo);
    const mode = ageMode;

    // ❌ Case 1 — both empty
    if (from === null && to === null) {
      alert("Please enter at least From age");
      return;
    }

    // ❌ Case 2 — To given but From empty → NOT ALLOWED
    if (from === null && to !== null) {
      alert("If you enter 'To', you must also enter 'From'");
      return;
    }

    // ❌ Case 3 — From = 0 but To empty → NOT ALLOWED
    if (from === 0 && to === null) {
      alert("From 0 must have a To value");
      return;
    }

    // ✅ Case 4 — From given, To empty → search ONLY that age
    let queryFrom = from;
    let queryTo = to;

    if (from !== null && to === null) {
      if (ageMode === "below") {
        queryFrom = 0;
        queryTo = from;        // 👉 BELOW logic
      }
      else if (ageMode === "above") {
        queryFrom = from;
        queryTo = 200;         // 👉 ABOVE logic (safe big number)
      }
      else {
        queryTo = from;        // 👉 your existing single-age case
      }
    }


    // ❌ Case 5 — invalid range
    if (queryTo !== null && queryFrom > queryTo) {
      alert("From age cannot be greater than To age");
      return;
    }

    try {
      setIsDownloading(true);

      const res = await axios.get(`${URL}/new-members/age-range`, {
        params: { from: queryFrom, to: queryTo },
        headers: { Authorization: token }
      });

      setAgeFilteredMembers(res.data.members || []);
      setIsAgeModalOpen(true);

    } catch (err) {
      console.error("Age view error:", err);
      setResponse({
        status: "Failed",
        message: "Failed to load age category members"
      });
    } finally {
      setIsDownloading(false);
    }
  };


  useEffect(() => {
    fetchMemberList();
  }, [CurrentPage, searchTerm, statusFilter, rowsPerPage, phoneSearch, addressSearch]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOptionOpen(false);
        setSearchBy(""); // closes phone/address input
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // const downloadMembersPDF = async (type) => {
  //   try {
  //     const res = await axios.get(
  //       `${URL}/new-members/download-pdf`,
  //       {
  //         params: {
  //           type,
  //           status: statusFilter,
  //           search: searchTerm,
  //         },
  //         headers: {
  //           Authorization: token,
  //         },
  //         responseType: "arraybuffer",
  //       }
  //     );

  //     const blob = new Blob([res.data], { type: "application/pdf" });
  //     const blobURL = window.URL.createObjectURL(blob);

  //     // 🔽 Force download
  //     const link = document.createElement("a");
  //     link.href = blobURL;
  //     link.download = `members-${type}.pdf`; // filename
  //     document.body.appendChild(link);
  //     link.click();

  //     // cleanup
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobURL);

  //   } catch (err) {
  //     console.error("PDF Download Error:", err);
  //     setResponse({
  //       status: "Failed",
  //       message: "Failed to download PDF",
  //     });
  //   }
  // };

  const downloadMembersPDF = async (type) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
const res = await axios.get(
`${URL}/new-members/download-pdf`,
{
params: {
type,
status: statusFilter,
search: searchTerm,
fromSI,
toSI
},
headers: { Authorization: token },
responseType: "arraybuffer",
          onDownloadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded * 100) / e.total);
              setDownloadProgress(percent);
            }
          },
}


);
      // const res = await axios.get(
      //   `${URL}/new-members/download-pdf`,
      //   {
      //     params: {
      //       type,
      //       status: statusFilter,
      //       search: searchTerm,
      //     },
      //     headers: {
      //       Authorization: token,
      //     },
      //     responseType: "arraybuffer",
      //     onDownloadProgress: (e) => {
      //       if (e.total) {
      //         const percent = Math.round((e.loaded * 100) / e.total);
      //         setDownloadProgress(percent);
      //       }
      //     },
      //   }
      // );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `Members-${type}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);

      // ✅ close modal only AFTER download finishes
      setIsDownloadModalOpen(false);

    } catch (err) {
      console.error("PDF Download Error:", err);
      setResponse({
        status: "Failed",
        message: "Failed to download PDF",
      });
    } finally {
  setIsDownloading(false);
  setDownloadProgress(0);
  setActiveDownloadBtn("");

  setIsRangeModalOpen(false);   // ✅ close AFTER download
  setFromSI("");                // ✅ reset
  setToSI("");   
    }
  };


  const getPaginationPages = () => {
    const pages = [];
    const range = 2; // show 2 pages before & after current

    if (TotalPages <= 7) {
      for (let i = 1; i <= TotalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Left ellipsis
    if (CurrentPage > range + 2) {
      pages.push("ellipsis-left");
    }

    // Middle pages (CurrentPage - 2 to CurrentPage + 2)
    const start = Math.max(2, CurrentPage - range);
    const end = Math.min(TotalPages - 1, CurrentPage + range);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (CurrentPage < TotalPages - (range + 1)) {
      pages.push("ellipsis-right");
    }

    // Always show last page
    pages.push(TotalPages);

    return pages;
  };

  const downloadAgeCategoryPDF = async () => {
    try {
      setIsDownloading(true);

      const res = await axios.get(
        `${URL}/new-members/download-age-pdf`,
        {
          params: {
            // ----- VALUES FOR FILTERING -----
            from:
              ageMode === "below"
                ? 0
                : ageFrom,

            to:
              ageMode === "below"
                ? ageFrom
                : ageMode === "above"
                  ? 200
                  : ageTo || ageFrom,

            // ----- VALUES FOR DISPLAY (NEW — CRITICAL FIX) -----
            displayFrom: ageFrom,      // what user actually typed
            displayMode: ageMode || "normal",
          },

          headers: { Authorization: token },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `Members-Age-${ageFrom}-to-${ageTo}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);

      // ✅ NEW — close the Age modal AFTER download
      // ✅ FULL RESET (THIS IS THE REAL FIX)
      setIsAgeModalOpen(false);
      setShowAgeFilter(false);
      setAgeFrom("");
      setAgeTo("");
      setAgeMode("");

    } catch (err) {
      console.error("Age PDF Download Error:", err);
      setResponse({
        status: "Failed",
        message: "Failed to download Age Category PDF",
      });
    } finally {
      setIsDownloading(false);
    }
  };




  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Members</h1>
          {["admin", "treasurer"].includes(userRole) && (
            <div className="flex items-center justify-between gap-3">
              <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={() => setIsDownloadModalOpen(true)} />
              <FaPrint size={20} className="text-lavender--600 cursor-pointer" title="Print" onClick={() => setIsPrintModalOpen(true)} />
            </div>
          )}


        </div>

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
onChange={(e) => {
  const value = e.target.value;
  setSearchTerm(value);

  setSearchParams({
    page: 1,
    search: value,
    status: statusFilter,
  });

  setCurrentPage(1);
}}
              />
            </div>
          </div>

          <div className="relative flex flex-wrap items-center p-4 gap-3">

            {/* Member Status */}
            <label className="text-l font-medium text-gray-600 mb-1">
              Member Status
            </label>

            <select
              value={statusFilter}
onChange={(e) => {
  const value = e.target.value;
  setStatusFilter(value);

  setSearchParams({
    page: 1,
    search: searchTerm,
    status: value,
  });

  setCurrentPage(1);
}}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* 🔍 Search Icon Button */}
            <div className="relative flex items-center gap-3">

              {/* 🔼 Dynamic Input / Textarea */}
              {searchBy === "phone" && (
                <div ref={searchRef} className="absolute bottom-full mb-2 left-full ml-2">
                  <input
                    type="search"
                    placeholder="Search by Phone Number"
                    value={phoneSearch}
                    onChange={(e) => {
                      setPhoneSearch(e.target.value.replace(/\D/g, "").slice(0, 10));
                      changePage(1);
                    }}
                    className="block py-1 text-sm text-gray-900 rounded bg-gray-50 px-3 w-55"
                  />
                </div>
              )}

              {searchBy === "address" && (
                <div ref={searchRef} className="absolute bottom-full mb-2 ml-2">
                  <textarea
                    rows={2}
                    placeholder="Search by Address"
                    value={addressSearch}
                    onChange={(e) => {
                      setAddressSearch(e.target.value);
                      changePage(1);
                    }}
                    className="block py-1 text-sm text-gray-900 rounded bg-gray-50 px-3 w-56 resize-none"
                  />
                </div>
              )}

              {/* 🔍 Search Icon Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOptionOpen(prev => !prev);
                  setSearchBy("");
                }}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Search Options"
              >
                <FaSearch className="text-gray-700" />
              </button>

              {/* 🔽 Dropdown */}
              {isSearchOptionOpen && (
                <div ref={searchRef}
                  className="
        absolute bottom-full mb-1 left-full ml-2 w-40
        bg-gray-50 border border-gray-300 rounded
        shadow-sm z-50
      "
                >
                  <div
                    onClick={() => {
                      setSearchBy("phone");
                      setIsSearchOptionOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-900 cursor-pointer hover:bg-blue-600 hover:text-white"
                  >
                    Phone Number
                  </div>

                  <div
                    onClick={() => {
                      setSearchBy("address");
                      setIsSearchOptionOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-900 cursor-pointer hover:bg-blue-600 hover:text-white"
                  >
                    Address
                  </div>
                </div>
              )}

            </div>

          </div>

{["admin", "churchofficeworker", 'officestaff'].includes(userRole) && (
          <button onClick={() => navigate('/admin/memberlist/addnewmember')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Member
          </button>
)}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Member Tamil Name</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {memberList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3">No Records Found</td>
                </tr>
              ) : (
                memberList.map((item, index) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2">{(CurrentPage - 1) * (rowsPerPage || 50) + index + 1}</td>
                    <td className="p-2">{item.member_id}</td>
                    <td className="p-2 text-left">{item.member_name}</td>
                    <td className="p-2 text-left">{item.member_tamil_name || "-"}</td>
                    <td
                      className={`p-2 font-semibold ${item.status === "Active" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {item.status}
                    </td>
                    <td className="p-2 text-center flex justify-center gap-3 items-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer "
                        title="View Member"
                        onClick={() => navigate(`/admin/memberlist/viewmember/${item._id}`)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>


        <div className="relative flex items-center justify-center mt-4 space-x-2 select-none">
          <div className="absolute left-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">

              {/* Label */}
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                No. of Rows
              </span>



              <div className="relative w-24">

                {/* Search Icon INSIDE input */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
                  onClick={() => {
                    setRowsPerPage(rowsInput || "50");
                    changePage(1);
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
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

                {/* Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="50"
                  value={rowsInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setRowsInput(value);
                  }}
                  className=" block w-full py-1 pr-8 pl-2 text-sm text-gray-900 bg-gray-100 rounded outline-none " />
              </div>

            </div>
          </div>




          {/* CENTER – Pagination */}
          <div className="flex items-center justify-center space-x-2">

            {/* Previous */}
            <button
              onClick={() => changePage(Math.max(1, CurrentPage - 1))}
              disabled={CurrentPage === 1}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>

            {/* Page Numbers */}
            {getPaginationPages().map((page, index) => {
              if (typeof page === "string") {
                return (
                  <span key={page + index} className="px-3 py-2 text-gray-500">
                    …
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={` w-10 h-10 flex items-center justify-center rounded-full font-medium  ${page === CurrentPage
                    ? "bg-lavender--600 text-white"
                    : " hover:border-2 border-gray-300"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => changePage(Math.min(TotalPages, CurrentPage + 1))}
              disabled={CurrentPage === TotalPages}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>

          </div>

          {/* RIGHT – Last Page */}
          <div className="absolute right-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">

              {/* Label */}
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Jump to Page
              </span>

              <div className="relative w-20">

                {/* Search Icon INSIDE input */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
                  onClick={() => {
                    const page = Number(jumpInput);

                    if (!page) return;                // empty / invalid
                    if (page < 1) return;             // below 1
                    if (page > TotalPages) return;    // above last page

                    changePage(page);
                    setJumpInput("");                 // optional clear
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
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

                {/* Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`1-${TotalPages}`}
                  value={jumpInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setJumpInput(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(jumpInput);

                      if (!page) return;
                      if (page < 1) return;
                      if (page > TotalPages) return;

                      changePage(page);
                      setJumpInput("");
                    }
                  }}
                  className="block w-full py-1 pr-8 pl-2 text-sm text-gray-900 bg-gray-100 rounded outline-none"
                />
              </div>

            </div>
          </div>


        </div>



        <SmallSizedModal
          isOpen={isDownloadModalOpen}
          onClose={() => {
            if (!isDownloading) {
              setIsDownloadModalOpen(false);
              setShowAgeFilter(false);
              setAgeFrom("");
              setAgeTo("");
              setAgeMode("");
            }
          }}
          title="Download Members"
        >


          <div className="p-1 text-center">
            <p className="text-sm font-medium text-gray-700 mb-6">
              Do you want to download as
            </p>

            <div className="flex justify-center gap-4 mb-6">

<button
disabled={isDownloading}
onClick={() => {
  setIsRangeModalOpen(true);
}}
className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
>
Detailed
</button>

<button
disabled={isDownloading}
onClick={() => {
  setIsListConfirmOpen(true);
}}
className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
>
List Only
</button>

              {/* ✅ NEW BUTTON */}
              <button
                disabled={isDownloading}
                onClick={() => {
                  setShowAgeFilter(true);
                  setAgeFrom("");
                  setAgeTo("");
                  setAgeMode("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Age Category
              </button>

            </div>

            {showAgeFilter && (
              <div className="flex flex-col items-center gap-4 mt-4">

                {/* FIRST ROW: From + To + Below + Above */}
                <div className="flex justify-center items-center gap-4">

                  {/* FROM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      From [age]
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ageFrom}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setAgeFrom(value);
                        setAgeMode(""); // reset mode when typing
                      }}
                      className="block py-1 text-sm text-gray-900 rounded w-24 px-3 bg-gray-50"
                    />
                  </div>

                  {/* TO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      To [age]
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ageTo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setAgeTo(value);
                        setAgeMode(""); // disable below/above if To typed
                      }}
                      className="block py-1 text-sm text-gray-900 rounded w-24 px-3 bg-gray-50"
                    />
                  </div>

                  {/* BELOW BUTTON */}
                  <button
                    disabled={!ageFrom || ageTo}
                    onClick={() => setAgeMode("below")}
                    className={`px-3 py-1 mt-4 rounded ${ageMode === "below"
                        ? "bg-lavender--600 text-white"
                        : "bg-gray-200 text-gray-800"
                      }`}
                  >
                    Below
                  </button>

                  {/* ABOVE BUTTON */}
                  <button
                    disabled={!ageFrom || ageTo}
                    onClick={() => setAgeMode("above")}
                    className={`px-3 py-1 mt-4 rounded ${ageMode === "above"
                        ? "bg-lavender--600 text-white"
                        : "bg-gray-200 text-gray-800"
                      }`}
                  >
                    Above
                  </button>
                </div>

                {/* SECOND ROW: CENTER SUBMIT */}
                <button
                  onClick={handleAgeSubmit}
                  className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                >
                  Submit
                </button>

              </div>
            )}


            {/* 🔽 Download progress section */}
            {isDownloading && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin" />

                <p className="text-sm font-medium text-gray-700">
                  Preparing Your List... Please wait
                </p>
              </div>
            )}

          </div>

        </SmallSizedModal>

        <SmallSizedModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Print Members"
        >
          <div className="p-1 text-center">
            <p className="text-sm font-medium text-gray-700 mb-6">
              Do you want to Print as
            </p>

            <div className="flex justify-center gap-4">
<button
onClick={async () => {

  if(loadingDetailedPrint) return;

  setLoadingDetailedPrint(true);

  await fetchAllMembersForPrint();

  setLoadingDetailedPrint(false);

  setIsPrintModalOpen(false);
  setIsPrintRangeModalOpen(true);

}}
disabled={loadingDetailedPrint}
className="px-4 py-2 bg-lavender--600 text-white rounded-md flex items-center justify-center gap-2"
>

{loadingDetailedPrint ? (
<>
<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
Loading...
</>
) : (
"Detailed"
)}

</button>

<button
onClick={async () => {

  if(loadingListPrint) return;

  setLoadingListPrint(true);

  await fetchAllMembersForPrint();

  setLoadingListPrint(false);

  setIsPrintModalOpen(false);
  setIsListPrintModalOpen(true);

}}
disabled={loadingListPrint}
className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center gap-2"
>

{loadingListPrint ? (
<>
<span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"/>
Loading...
</>
) : (
"List Only"
)}

</button>
            </div>
          </div>
        </SmallSizedModal>

<SmallSizedModal
isOpen={isRangeModalOpen}
onClose={() => {
  if (!isDownloading) {
    setIsRangeModalOpen(false);
    setFromSI("");
    setToSI("");
  }
}}
title="Select Member Range"
>

<div className="flex flex-col gap-4 p-4">

<div className="flex gap-6 justify-center">

<div>
<label className="block text-sm mb-1">From (SI No)</label>
<input
type="text"
value={fromSI}
onChange={(e)=>setFromSI(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

<div>
<label className="block text-sm mb-1">To (SI No)</label>
<input
type="text"
value={toSI}
onChange={(e)=>setToSI(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

</div>

<p className="text-xs text-gray-500 text-center">
Maximum 500 members per download
</p>

<button
onClick={()=>{
  if(!fromSI || !toSI) return;

if(Number(toSI) - Number(fromSI) > 500){
  setResponse({
    status: "Failed",
    message: "Maximum 500 members per download"
  });
  return;
}

setIsRangeModalOpen(false);     // close range modal
downloadMembersPDF("detailed");
  // setIsRangeModalOpen(false);
}}
className="px-4 py-2 bg-lavender--600 text-white rounded self-center"
>
Download
</button>

</div>
</SmallSizedModal>


<SmallSizedModal
  isOpen={isListConfirmOpen}
  onClose={() => {
    if (!isDownloading) {
      setIsListConfirmOpen(false);
      setActiveDownloadBtn("");
    }
  }}
  title="Download Member List"
>
  <div className="flex flex-col items-center gap-4 p-4 text-center">

    <p className="text-sm text-gray-700">
      Are you sure you want to download the member list?
    </p>

    <div className="flex gap-4">

      <button
        onClick={() => {
          setIsListConfirmOpen(false);
          downloadMembersPDF("list");
        }}
        className="px-4 py-2 bg-lavender--600 text-white rounded"
      >
        Download
      </button>

    </div>

  </div>
</SmallSizedModal>



<SmallSizedModal
isOpen={isPrintRangeModalOpen}
onClose={() => setIsPrintRangeModalOpen(false)}
title="Select Member Range"
>

<div className="flex flex-col gap-4 p-4">

<div className="flex gap-6 justify-center">

<div>
<label className="block text-sm mb-1">From (SI No)</label>
<input
type="text"
value={fromSI}
onChange={(e)=>setFromSI(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

<div>
<label className="block text-sm mb-1">To (SI No)</label>
<input
type="text"
value={toSI}
onChange={(e)=>setToSI(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

</div>

<p className="text-xs text-gray-500 text-center">
Maximum 500 members per download
</p>

<button
onClick={()=>{

if(!fromSI || !toSI) return;

if(Number(toSI) - Number(fromSI) > 500){
  setResponse({
    status:"Failed",
    message:"Maximum 500 members per print"
  });

  setTimeout(()=>{
    setResponse({status:null,message:""});
  },2000);

  return;
}

setIsPrintRangeModalOpen(false);
setIsPrintMemberModalOpen(true);

}}
className="px-4 py-2 bg-lavender--600 text-white rounded self-center"
>
Print
</button>

</div>
</SmallSizedModal>

<SmallSizedModal
isOpen={isListPrintModalOpen}
onClose={()=>setIsListPrintModalOpen(false)}
title="List Print"
>

<div className="flex flex-col gap-4 p-4">

<p className="text-center text-sm">
Total Pages : {Math.ceil(allMembersForPrint.length / 35)}
</p>

<div className="flex gap-6 justify-center">

<div>
<label className="text-sm">From Page</label>
<input
type="text"
value={fromPage}
onChange={(e)=>setFromPage(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

<div>
<label className="text-sm">To Page</label>
<input
type="text"
value={toPage}
onChange={(e)=>setToPage(e.target.value.replace(/\D/g,""))}
className="border p-1 rounded w-24 text-center"
/>
</div>

</div>

<button
onClick={()=>{
if(!fromPage || !toPage) return;

setIsListPrintModalOpen(false);
setIsPrintListModalOpen(true);
}}
className="px-4 py-2 bg-lavender--600 text-white rounded self-center"
>
Print
</button>

</div>

</SmallSizedModal>

        <AgeFilterModal
          isOpen={isAgeModalOpen}
          onClose={() => {
            setIsAgeModalOpen(false);
            setAgeFrom("");
            setAgeTo("");
            setAgeMode("");
            setShowAgeFilter(false);
          }}
          title="Age Category Members"
          ageFrom={ageFrom}
          ageTo={ageTo}
          ageMode={ageMode}        // ✅ ADD THIS
          members={ageFilteredMembers}
          onDownload={downloadAgeCategoryPDF}
          isDownloading={isDownloading}
        />



<MemberDetailedPrintModal
  isOpen={isPrintMemberModalOpen}
  onClose={()=>setIsPrintMemberModalOpen(false)}
  members={allMembersForPrint}
  fromSI={fromSI}
  toSI={toSI}
/>

<MemberListPrintModal
isOpen={isPrintListModalOpen}
onClose={()=>setIsPrintListModalOpen(false)}
members={allMembersForPrint}
fromPage={fromPage}
toPage={toPage}
/>

      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
