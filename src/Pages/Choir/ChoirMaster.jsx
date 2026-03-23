import React, { useEffect, useRef, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from "axios";
import { URL } from "../../App";
import { useForm } from 'react-hook-form';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


export const ChoirMaster = () => {
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [isMember, setIsMember] = useState(true); // ✅ default true = member
  const [choirMasters, setChoirMasters] = useState([]);
  const [search, setSearch] = useState("");
  const [viewData, setViewData] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [inactiveReason, setInactiveReason] = useState("");
  const [response, setResponse] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  // ===== Pagination (carbon copy – default 25) =====
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");
const latestSearchRef = useRef("");



  const handleOpenViewModal = () => {
    setViewModal(true);
    reset();
  };
  const handleCloseViewModal = () => setViewModal(false);

  const token = window.sessionStorage.getItem("token");
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

const debouncedSearchById = useRef(
  debounce(async (val) => {
    if (!val) {
      setDropdownById([]);
      return;
    }

    // 🔐 store latest search value
    latestSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if this is still the latest search
      if (latestSearchRef.current === val) {
        setDropdownById(res.data || []);
      }
    } catch (err) {
      if (latestSearchRef.current !== val) return;

      if (err.response?.status === 404) {
        setDropdownById([
          {
            member_id: "none",
            member_name: "No members found",
            mobile_number: "",
          },
        ]);
      } else {
        setDropdownById([]);
      }
    }
  }, 300)
).current;


const debouncedSearchByName = useRef(
  debounce(async (val) => {
    if (!val) {
      setDropdownByName([]);
      return;
    }

    // 🔐 store latest search value
    latestSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search?name=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if this is still the latest search
      if (latestSearchRef.current === val) {
        setDropdownByName(res.data || []);
      }
    } catch (err) {
      if (latestSearchRef.current !== val) return;

      if (err.response?.status === 404) {
        setDropdownByName([
          {
            member_id: "none",
            member_name: "No members found",
            mobile_number: "",
          },
        ]);
      } else {
        setDropdownByName([]);
      }
    }
  }, 300)
).current;

  const fetchChoirMasters = async (page = 1, searchValue = "", status = "All") => {
    try {
      const res = await axios.get(
        `${URL}/choir-masters?page=${page}&limit=${rowsPerPage}&search=${searchValue}&status=${status}`,
        { headers: { Authorization: token } }
      );

      setChoirMasters(res.data.data || []);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setChoirMasters([]);
    }
  };

useEffect(() => {
  fetchChoirMasters(CurrentPage, search, statusFilter);
}, [CurrentPage, search, statusFilter, rowsPerPage]);




  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        isMember,
      };

      const res = await axios.post(`${URL}/choir-masters`, payload, {
        headers: { Authorization: token },
      });

      // success message
      setResponse({ status: "Success", message: "Choir Master saved ✅" });

      setIsModalOpen(false);
      reset();
      fetchChoirMasters(CurrentPage, search);
    } catch (err) {
      console.error(err);

      // error message
      setResponse({ status: "Failed", message: "Error saving choir master ❌" });
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
          <h1 className="text-lg font-semibold">Choir Master</h1>
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
                  setCurrentPage(1); // reset page when searching
                }}

              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Add Master
          </button>

        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Member ID / Phone</th>
                <th className="p-2 text-center">Phone</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Years of Active</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {choirMasters.length > 0 ? (
                choirMasters.map((item, index) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center">
                      {item.isMember ? item.memberName : item.nonMemberName}
                    </td>
                    <td className="p-2 text-center">
                      {item.isMember ? (
                        item.memberId ? (
                          item.memberId
                        ) : (
                          <span className="text-yellow-500 font-semibold">Non-Member</span>
                        )
                      ) : (
                        <span className="text-yellow-500 font-semibold">Non-Member</span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {item.isMember ? item.phone : item.nonMemberPhone}
                    </td>
                    <td
                      className={`p-2 text-center font-semibold ${item.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {item.status}
                    </td>

                    <td className="p-2 text-center">
                      {item.status === "Active"
                        ? `${new Date(item.createdAt).getFullYear()} to Present`
                        : `${new Date(item.createdAt).getFullYear()} to ${new Date(item.inactiveDate).getFullYear()}`}
                    </td>

                    <td className="p-2 text-center">
                      <FaEye
                        title='View'
                        size={18}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"
                        onClick={() => {
                          setViewData(item);      // 👈 store selected record
                          setViewModal(true);     // 👈 open modal
                        }}

                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No Choir Masters Found
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
          <svg
            className="w-4 h-4 text-gray-500"
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
        return (
          <span key={index} className="px-3 py-2 text-gray-500">
            …
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium
            ${
              page === CurrentPage
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

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setIsMember(true); // default back to Member mode
        reset(); // clear all form fields
        setMemberIdSearch("");
        setMemberNameSearch("");
        setDropdownById([]);
        setDropdownByName([]);
      }} title="New Choir Master">
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    reset({
                      memberId: "",
                      memberName: "",
                      phone: "",
                    });
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
                    reset({
                      nonMemberName: "",
                      nonMemberPhone: "",
                      nonMemberAadhar: "",
                    });
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

                  {/* Phone (auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      readOnly
                      {...register("phone")}
                      value={watch("phone") || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Hidden fields for extra data */}
                  <input type="hidden" {...register("present_address")} />
                  <input type="hidden" {...register("aadhar_number")} />

                  {/* Dropdown */}
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
                            setMemberIdSearch(m.member_id);
                            setMemberNameSearch(m.member_name);
                            setValue("memberId", m.member_id);
                            setValue("memberName", m.member_name);
                            setValue("phone", m.mobile_number);

                            setValue("present_address", m.present_address?.address || "");
                            setValue("aadhar_number", m.aadhar_number || "");

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
                      {...register("nonMemberName")}
                      placeholder="Enter full name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Non-Member Phone */}
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
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, ""); // only digits
                      }}
                    />
                  </div>


                  {/* Non-Member Aadhar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhar</label>
                    <input
                      type="text"
                      {...register("nonMemberAadhar")}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14} // 12 digits + 2 spaces
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      onInput={(e) => {
                        let value = e.target.value.replace(/\D/g, ""); // remove non-digits
                        value = value.substring(0, 12); // limit to 12 digits
                        // add space after every 4 digits
                        let formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                        e.target.value = formatted;
                      }}
                    />
                  </div>

                </>
              )}
            </div>






          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="submit" className="px-4 py-2 bg-lavender--600 text-white rounded-md">
              Save
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={viewModal} onClose={handleCloseViewModal} title="View">
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            {[
              {
                label: "Name",
                value: viewData?.isMember
                  ? viewData?.memberName
                  : viewData?.nonMemberName,
              },
              {
                label: "Phone",
                value: viewData?.isMember
                  ? viewData?.phone
                  : viewData?.nonMemberPhone,
              },
              {
                label: "Member ID",
                value: viewData?.isMember ? viewData?.memberId : "Non-Member",
              },
              {
                label: "Status",
                value: viewData?.status,
              },
              {
                label: "Active Since",
                value: viewData?.createdAt
                  ? new Date(viewData.createdAt).toLocaleDateString()
                  : "-",
              },
              ...(viewData?.status === "Inactive"
                ? [
                  {
                    label: "Inactive Date",
                    value: viewData?.inactiveDate
                      ? new Date(viewData.inactiveDate).toLocaleDateString()
                      : "-",
                  },
                  {
                    label: "Reason",
                    value: viewData?.inactiveReason || "-",
                  },
                ]
                : []),
            ].map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 py-2  "
              >
                <div className="col-span-12 sm:col-span-4 text-sm font-semibold text-gray-700 dark:text-white">
                  {item.label}
                </div>
                <div
                  className={`col-span-12 sm:col-span-8 text-sm ${item.value
                    ? "text-gray-800 dark:text-gray-300"
                    : "text-yellow-500 font-semibold"
                    }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>


          {/* Show toggle only if status is Active */}
          {viewData?.status === "Active" && (
            <div className="mt-4  pt-3">
              <label className="font-medium">Status</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" value="Active" checked readOnly />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    onChange={() => setNewStatus("Inactive")}
                  />
                  Inactive
                </label>
              </div>

              {newStatus === "Inactive" && (
                <textarea
                  className="w-full mt-2 border rounded p-2 text-sm"
                  placeholder="Enter reason for making inactive..."
                  value={inactiveReason}
                  onChange={(e) => setInactiveReason(e.target.value)}
                />
              )}

              <div className="flex justify-end mt-3">
                <button
                  className="px-4 py-2 bg-lavender--600 text-white rounded"
                  onClick={async () => {
                    try {
                      await axios.put(
                        `${URL}/choir-masters/${viewData._id}/status`,
                        {
                          status: "Inactive",
                          inactiveReason,
                        },
                        { headers: { Authorization: token } }
                      );

                      handleCloseViewModal();
                      fetchChoirMasters(CurrentPage, search); // refresh
                    } catch (err) {
                      console.error("Status update failed", err);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
      {response?.status &&
        (response.status === "Success" ? (
          <SuccessMessage Message={response.message} />
        ) : (
          <FailedMessage Message={response.message} />
        ))}

    </>
  )
}
