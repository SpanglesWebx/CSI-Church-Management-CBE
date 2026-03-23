import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { Checkbox, FormControlLabel } from '@mui/material';
import axios from "axios";
import { useRef } from "react";
import { URL } from "../../App";
import { useForm } from 'react-hook-form';
import Pagination from "../../Components/Helpers/MenMemberPagination";


export const MenMembers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [maleIdSearch, setMaleIdSearch] = useState("");
  const [maleNameSearch, setMaleNameSearch] = useState("");
  const [maleDropdownById, setMaleDropdownById] = useState([]);
  const [maleDropdownByName, setMaleDropdownByName] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [menMembers, setMenMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  
  const token = window.sessionStorage.getItem("token");
  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset(); // clear form fields if using react-hook-form
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  const debouncedSearchMaleById = useRef(
    debounce(async (val) => {
      if (!val) return setMaleDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/male/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setMaleDropdownById(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setMaleDropdownById([
            { member_id: "none", member_name: "No male members match your search", mobile_number: "" }
          ]);
        } else {
          setMaleDropdownById([]);
        }
      }
    }, 300)
  ).current;


  const debouncedSearchMaleByName = useRef(
    debounce(async (val) => {
      if (!val) return setMaleDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search/male?name=${val}`, {
          headers: { Authorization: token },
        });
        setMaleDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setMaleDropdownByName([{ member_id: "none", member_name: "No male members match your search", mobile_number: "" }]);
        } else {
          setMaleDropdownByName([]);
        }
      }
    }, 300)
  ).current;
  // ✅ fetch Men’s Fellowship list
const fetchMenMembers = async () => {
  try {
    if (menMembers.length === 0) {
      setLoading(true);
    }

    const res = await axios.get(`${URL}/mens-fellowship`, {
      params: {
        search: searchQuery,
        page: CurrentPage,
        limit: rowsPerPage,
      },
      headers: { Authorization: token },
    });

    setMenMembers(res.data.members || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    console.error("❌ Error fetching men members:", err);
    setMenMembers([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchMenMembers();
}, [searchQuery, CurrentPage, rowsPerPage]);


// useEffect(() => {
//   fetchMenMembers();
// }, [CurrentPage, searchQuery]);


  const onSubmit = async (formData) => {
    console.log("📤 Sending to backend:", formData);

    try {
      await axios.post(`${URL}/mens-fellowship`, {
        member_id: formData.memberId,
        member_name: formData.memberName,
        member_tamil_name: formData.memberTamilName,
        mobile_number: formData.phone,
      }, {
        headers: { Authorization: token },
      }); 

      setResponse({ status: "Success", message: "Member added to Men's Fellowship" });
      handleCloseModal();
      fetchMenMembers();
    } catch (err) {
      console.error("❌ Add Men Error:", err.response?.data || err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding member" });
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to first page when searching
                }}
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
            {/* <button
              onClick={handleOpenModal}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Men
            </button> */}
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
              ) : menMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4">No Men’s Fellowship members found</td>
                </tr>
              ) : (
                menMembers.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2">{(CurrentPage - 1) * 10 + (index + 1)}</td>
                    <td className="p-2">{m.member_id}</td>
                    {showTamilOnly ? (
                      <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                    ) : (
                      <>
                        <td className="p-2 text-left">{m.member_name}</td>
                        <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                      </>
                    )}
                    
                    <td className="p-2">{m.primary_contact_number}</td>
                    {/* <td className="p-2">
                      <button className="px-3 py-1 text-sm text-white bg-red-500 rounded">
                        Delete
                      </button>
                    </td> */}
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


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Men Member">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 border rounded-lg bg-gray-50">



            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
  {/* Member ID */}
  <div>
    <label className="block text-sm font-medium text-gray-700">Member ID</label>
    <input
      type="text"
      placeholder="Search by ID"
      {...register("memberId", { required: true })}
      value={maleIdSearch}
      onChange={(e) => {
        const val = e.target.value;
        setMaleIdSearch(val);
        setValue("memberId", val); // sync with react-hook-form
        debouncedSearchMaleById(val);
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
      {...register("memberName", { required: true })}
      value={maleNameSearch}
      onChange={(e) => {
        const val = e.target.value;
        setMaleNameSearch(val);
        setValue("memberName", val); // sync with react-hook-form
        debouncedSearchMaleByName(val);
      }}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>

  {/* Phone */}
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

  {/* ✅ Unified Dropdown for ID + Name */}
  {(maleDropdownById.length > 0 || maleDropdownByName.length > 0) && (
    <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
      {(maleDropdownById.length > 0 ? maleDropdownById : maleDropdownByName).map((m) => (
        <li
          key={m.member_id}
          className={`flex px-3 py-2 text-sm text-gray-700 ${
            m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer transition"
          }`}
          onClick={() => {
            if (m.member_id === "none") return;
            setMaleIdSearch(m.member_id);
            setMaleNameSearch(m.member_name);
            setValue("memberId", m.member_id);
            setValue("memberName", m.member_name);
            setValue("memberTamilName", m.member_tamil_name);
            setValue("phone", m.mobile_number);
            setMaleDropdownById([]);
            setMaleDropdownByName([]);
          }}
        >
          <span className="w-[250px] font-medium">{m.member_id === "none" ? m.member_name : m.member_id}</span>
          {m.member_id !== "none" && <span className="flex-1">{m.member_name}</span>}
          {m.member_id !== "none" && <span className="w-[200px] text-gray-500">{m.mobile_number}</span>}
        </li>
      ))}
    </ul>
  )}
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
