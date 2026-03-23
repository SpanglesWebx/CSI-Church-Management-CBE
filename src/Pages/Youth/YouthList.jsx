import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { Checkbox, FormControlLabel } from '@mui/material';
import axios from "axios";
import { useRef } from "react";
import { URL } from "../../App";
import { useForm } from 'react-hook-form';
import debounce from "lodash.debounce";
import { MdVerified } from "react-icons/md";

export const YouthList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [YouthMembers, setYouthMembers] = useState([])
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberError, setMemberError] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const latestSearchRef = useRef("");


  const [loading, setLoading] = useState(false);


  const token = window.sessionStorage.getItem("token");
const handleOpenModal = () => {
  // Reset react-hook-form fields
  reset({
    member_id: "",
    member_name: "",
    phone: "",
  });

  // Clear all search and dropdown states
  setMemberIdSearch("");
  setMemberNameSearch("");
  setMemberDropdownById([]);
  setMemberDropdownByName([]);
  setMemberVerified(false);
  setMemberError("");

  // Finally, open modal
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  // Close modal
  setIsModalOpen(false);

  // Reset everything (so next open is clean)
  reset({
    member_id: "",
    member_name: "",
    phone: "",
  });

  setMemberIdSearch("");
  setMemberNameSearch("");
  setMemberDropdownById([]);
  setMemberDropdownByName([]);
  setMemberVerified(false);
  setMemberError("");
};



  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      memberId: "",
      memberName: "",
      phone: "",
    },
  });
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

const debouncedSearchMemberById = useRef(
  debounce(async (val) => {
    if (!val) {
      setMemberDropdownById([]);
      setMemberError("");
      return;
    }

    // 🔐 store latest value
    latestSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if this is the latest search
      if (latestSearchRef.current !== val) return;

      if (res.data?.length > 0) {
        setMemberDropdownById(res.data);
        setMemberError("");
      } else {
        setMemberDropdownById([]);
        setMemberError("Member not found");
      }
    } catch (err) {
      if (latestSearchRef.current !== val) return;

      console.error(err);
      setMemberDropdownById([]);
      setMemberError("Error searching member");
    }
  }, 400)
).current;


const debouncedSearchMemberByName = useRef(
  debounce(async (val) => {
    if (!val) {
      setMemberDropdownByName([]);
      setMemberError("");
      return;
    }

    // 🔐 store latest value
    latestSearchRef.current = val;

    try {
      const res = await axios.get(
        `${URL}/member-search?name=${encodeURIComponent(val)}`,
        {
          headers: { Authorization: token },
        }
      );

      // ✅ update only if this is the latest search
      if (latestSearchRef.current !== val) return;

      if (res.data?.length > 0) {
        setMemberDropdownByName(res.data);
        setMemberError("");
      } else {
        setMemberDropdownByName([]);
        setMemberError("Member not found");
      }
    } catch (err) {
      if (latestSearchRef.current !== val) return;

      console.error(err);
      setMemberDropdownByName([]);
      setMemberError("Error searching member");
    }
  }, 400)
).current;

  // ✅ fetch Men’s Fellowship list
  const fetchYouthMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${URL}/youth-fellowship?page=${CurrentPage}&limit=10`, {
        headers: { Authorization: token },
      });
      setYouthMembers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Error fetching youth members:", err);
      setYouthMembers([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchYouthMembers();
  }, [CurrentPage]);


  // const onSubmit = async (formData) => {
  //   console.log("📤 Sending to backend:", formData);

  //   try {
  //     await axios.post(`${URL}/youth-fellowship`, {
  //       member_id: formData.member_id,   // ✅ correct
  //       member_name: formData.member_name, // ✅ correct
  //       member_tamil_name: formData.member_tamil_name,
  //       mobile_number: formData.phone,
  //     }, {
  //       headers: { Authorization: token },
  //     });

  //     setResponse({ status: "Success", message: "Member added to Men's Fellowship" });
  //     handleCloseModal();
  //     fetchYouthMembers();
  //   } catch (err) {
  //     console.error("❌ Add Men Error:", err.response?.data || err);
  //     setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding member" });
  //   }
  // };

const onSubmit = async (formData) => {
  console.log("📤 Sending to backend:", formData);

  try {
    await axios.post(
      `${URL}/youth-fellowship`,
      {
        member_id: formData.member_id,
        member_name: formData.member_name,
        member_tamil_name: formData.member_tamil_name,
        mobile_number: formData.phone,
      },
      {
        headers: { Authorization: token },
      }
    );

    handleCloseModal();
    fetchYouthMembers();

    // ✅ Force toast re-render even for same message
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Member added to Youth's Fellowship",
      });
    }, 10);
  } catch (err) {
    console.error("❌ Add Youth Error:", err.response?.data || err);

    // ✅ Re-trigger toast for failures too
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error adding member",
      });
    }, 10);
  } finally {
    // ⏳ Auto-clear toast after 3 seconds
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};



  return (
    <>
      <div className=" p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search..."
              // value={searchQuery}
              // onChange={handleSearch}
              />
            </div>

          </div>
          <div className="flex w-full gap-x-4 lg:w-auto">
            <FormControlLabel control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />}
              label="Tamil Names Only" />
            <button
              onClick={handleOpenModal}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Member
            </button>
          </div>
        </div>


        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className='text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center'>
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                {showTamilOnly ? (
                  <th className="p-2 text-center">Member Tamil Name</th>
                ) : (
                  <>
                    <th className="p-2 text-center">Member Name</th>
                    <th className="p-2 text-center">Member Tamil Name</th>
                  </>
                )}

                <th className="p-2 text-center">Phone</th>
                {/* <th className="p-2 text-center">Action</th> */}
              </tr>
            </thead>
            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4">Loading...</td>
                </tr>
              ) : YouthMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4">No Youth members found</td>
                </tr>
              ) : (
                YouthMembers.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{m.member_id}</td>
                    {showTamilOnly ? (
                      <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                    ) : (
                      <>
                        <td className="p-2 text-left">{m.member_name}</td>
                        <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                      </>
                    )}

                    <td className="p-2">{m.mobile_number}</td>
                    
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>



        <div className="flex items-center justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${CurrentPage
              ? "bg-lavender--600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            {CurrentPage}
          </button>
          <button
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-3 space-x-2 rounded right-10 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Youth Member">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 border rounded-lg bg-gray-50">



            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              {/* Male ID search */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Member ID</label>
                <input
                  type="text"
                  placeholder="Search by ID"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  {...register("member_id", { required: "Member ID is required" })}
                  value={memberIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberIdSearch(val);
                    debouncedSearchMemberById(val);
                  }}
                />
                {/* ✅ Verification Message */}
                {memberVerified && (
                  <p className="flex items-center gap-2 text-sm text-green-600 mt-1">
                    Member verified successfully <MdVerified />
                  </p>
                )}

                {!memberVerified && memberIdSearch.trim() !== "" && memberDropdownById.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Member not found</p>
                )}

                {!memberVerified && memberNameSearch.trim() !== "" && memberDropdownByName.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Member not found</p>
                )}
              </div>

              {/* Member Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Member Name</label>
                <input
                  type="text"
                  placeholder="Search by Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  {...register("member_name", { required: "Member Name is required" })}
                  value={memberNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberNameSearch(val);
                    debouncedSearchMemberByName(val);
                  }}
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  readOnly
                  {...register("phone")}
                  value={watch("phone") || ""}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {/* ✅ Unified Dropdown */}
              {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                      onClick={() => {
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("member_id", m.member_id);
                        setValue("member_name", m.member_name);
                        setValue("phone", m.mobile_number);
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);
                      }}
                    >
                      <span className="w-[250px] font-medium">{m.member_id}</span>
                      <span className="flex-1">{m.member_name}</span>
                      <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Phone (auto-filled, stays readOnly but registered) */}


            </div>


          </div>
          <div className="flex justify-end gap-3 mt-4">

            <button type="submit" className="px-4 py-2 bg-lavender--600 text-white rounded-md">
              Add
            </button>
          </div>
        </form>

      </Modal>

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </>
  )
}
