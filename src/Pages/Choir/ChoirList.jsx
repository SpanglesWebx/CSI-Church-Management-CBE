import React, { useEffect, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useForm } from "react-hook-form";
import axios from "axios";
import { URL } from "../../App";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


export const ChoirList = () => {
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const latestMemberIdSearchRef = useRef("");
    const latestMemberNameSearchRef = useRef("");


    const [memberIdSearch, setmemberIdSearch] = useState("");
    const [memberNameSearch, setmemberNameSearch] = useState("");
    const [memberDropdownById, setmemberDropdownById] = useState([]);
    const [memberDropdownByName, setmemberDropdownByName] = useState([]);
    const [search, setSearch] = useState("");


    const [choirMembers, setChoirMembers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    

    const token = window.sessionStorage.getItem("token");

    const { register, handleSubmit, setValue, reset } = useForm({
        defaultValues: {
            memberId: "",
            memberName: "",
            memberPhone: ""
        }
    });
    // ===== Pagination (carbon copy from FamilyList) =====
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


    const fetchChoirMembers = async (page = 1, search = "") => {
        try {
            const res = await axios.get(`${URL}/choir-members`, {
                params: { 
      page, 
      limit: rowsPerPage, 
      search 
    },
                headers: { Authorization: token }
            });
            setChoirMembers(res.data.members);
            setTotalMembers(res.data.total);
            setTotalPages(Math.ceil(res.data.total / rowsPerPage));
        } catch (err) {
            FailedMessage("Failed to fetch choir members");
        }
    };

// Fetch members on component mount & page change
useEffect(() => {
  fetchChoirMembers(CurrentPage, search);
}, [CurrentPage, rowsPerPage]);


    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    // member search by ID
   const debouncedSearchmemberById = useRef(
  debounce(async (val) => {
    if (!val) {
      setmemberDropdownById([]);
      return;
    }

    // 🔐 store latest value
    latestMemberIdSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if latest
      if (latestMemberIdSearchRef.current === val) {
        setmemberDropdownById(res.data || []);
      }
    } catch (err) {
      if (latestMemberIdSearchRef.current === val) {
        setmemberDropdownById([
          { member_id: "none", member_name: "No member found" },
        ]);
      }
    }
  }, 300)
).current;


    // member search by Name
   const debouncedSearchmemberByName = useRef(
  debounce(async (val) => {
    if (!val) {
      setmemberDropdownByName([]);
      return;
    }

    // 🔐 store latest value
    latestMemberNameSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search?name=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if latest
      if (latestMemberNameSearchRef.current === val) {
        setmemberDropdownByName(res.data || []);
      }
    } catch (err) {
      if (latestMemberNameSearchRef.current === val) {
        setmemberDropdownByName([
          { member_id: "none", member_name: "No member found" },
        ]);
      }
    }
  }, 300)
).current;


 const onSubmit = async (data) => {
  try {
    const res = await axios.post(`${URL}/choir-members/add`, {
      member_id: data.memberId,
      member_name: data.memberName,
      member_tamil_name: data.memberTamilName,
      mobile_number: data.memberPhone,
    }, { headers: { Authorization: token } });

    SuccessMessage(res.data.message);

    reset();
    setmemberIdSearch("");
    setmemberNameSearch("");
    setmemberDropdownById([]);
    setmemberDropdownByName([]);
    setIsModalOpen(false);

    // Optionally refresh the table here by calling getChoirMembers API
  } catch (err) {
    FailedMessage(err.response?.data?.message || "Failed to add member");
  }
};

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

    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Choir Members</h1>
                    <div className="">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search Members
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
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                                placeholder="Search Members..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    fetchChoirMembers(1, e.target.value); // reset to page 1 whenever searching
                                }}
                          
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Members
                    </button>

                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Name</th>
                                <th className="p-2 text-center">Member ID</th>
                                <th className="p-2 text-center">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {choirMembers.length > 0 ? (
                                choirMembers.map((member, index) => (
                                    <tr key={member._id} className="text-center border-b">
                                        <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                                        <td className="p-2">{member.member_name}</td>
                                        <td className="p-2">{member.member_id}</td>
                                        <td className="p-2">{member.mobile_number}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">
                                        No data found
                                    </td>
                                </tr>
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
            setRowsPerPage(rowsInput || 25);
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
          placeholder="25"
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

            </div> 

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Choir Member">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                        {/* member ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Member ID</label>
                            <input
                                type="text"
                                placeholder="Search by ID"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                value={memberIdSearch}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setmemberIdSearch(val);
                                    debouncedSearchmemberById(val);
                                }}
                            />
                        </div>

                        {/* member Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Member Name</label>
                            <input
                                type="text"
                                placeholder="Search by Name"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                value={memberNameSearch}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setmemberNameSearch(val);
                                    debouncedSearchmemberByName(val);
                                }}
                            />
                        </div>

                        {/* member Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                readOnly
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                {...register("memberPhone")}
                            />
                        </div>

                        {/* Dropdown */}
                        {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                            <ul className="absolute left-0 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                                    <li
                                        key={m.member_id}
                                        className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                                        onClick={() => {
                                            setmemberIdSearch(m.member_id);
                                            setmemberNameSearch(m.member_name);
                                            setValue("memberId", m.member_id);
                                            setValue("memberName", m.member_name);
                                            setValue("memberPhone", m.mobile_number);
                                            setmemberDropdownById([]);
                                            setmemberDropdownByName([]);
                                        }}
                                    >
                                        <span className="w-[265px] font-medium">{m.member_id}</span>
                                        <span className="flex-1">{m.member_name}</span>
                                        <span className="w-[150px] text-gray-500">{m.mobile_number}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">

                        <button
                            type="submit"
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
