import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";

export const HouseVisitList = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [offertoryList, setOffertoryList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // member search by id (debounced)
  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) {
        setDropdownById([]);
        return;
      }

      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownById(res.data || []);
      } catch (err) {
        // show friendly no-results item
        setDropdownById([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // member search by name (debounced)
  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setDropdownByName([]);
        return;
      }

      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        setDropdownByName([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // inside HouseVisitList component (add near top where other state/hooks are)
  const fetchHouseVisits = async () => {
    try {
      const res = await axios.get(`${URL}/house-visit/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,                 // keep in sync with UI
          search: searchTerm || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });

      // Response shape: { status, total, totalPages, page, limit, houseVisits }
      setOffertoryList(res.data.houseVisits || []); // reuse offertoryList state or rename to houseVisitList
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('fetchHouseVisits error', err);
      setOffertoryList([]);
      setTotalPages(1);
    }
  };

useEffect(() => {
  fetchHouseVisits(CurrentPage);
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  const saveHouseVisit = async () => {
    // basic validation
    if (!memberNameSearch || !date) {
      setResponse({ status: null, message: '' });
      setTimeout(() => setResponse({ status: 'Failed', message: 'Member and Date required' }), 10);
      setTimeout(() => setResponse({ status: null, message: '' }), 3000);
      return;
    }

    try {
      const payload = {
        member_id: memberIdSearch,
        member_name: memberNameSearch,
        phone,
        amount: amount ? Number(amount) : 0,
        date,
        description,
      };

      await axios.post(`${URL}/house-visit/add`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: null, message: '' });
      setTimeout(() => setResponse({ status: 'Success', message: 'House visit saved' }), 10);
      setTimeout(() => setResponse({ status: null, message: '' }), 3000);

      setIsModalOpen(false);
      // reset fields (create a resetForm that clears fields)
      setMemberIdSearch('');
      setMemberNameSearch('');
      setDropdownById([]);
      setDropdownByName([]);
      setPhone('');
      setAmount('');
      setDate('');
      setDescription('');
      // refresh list
      fetchHouseVisits();
    } catch (err) {
      console.error('saveHouseVisit err', err);
      setResponse({ status: null, message: '' });
      setTimeout(() => setResponse({ status: 'Failed', message: 'Server error' }), 10);
      setTimeout(() => setResponse({ status: null, message: '' }), 3000);
    }
  };

  const openView = async (item) => {
    try {
      if (item && item._id) {
        const res = await axios.get(`${URL}/house-visit/${item._id}`, {
          headers: { Authorization: token },
        });
        setSelectedRecord(res.data.data || res.data || item);
      } else {
        setSelectedRecord(item);
      }
      setIsViewOpen(true);
    } catch (err) {
      console.error('Error fetching single record:', err);
      setSelectedRecord(item);
      setIsViewOpen(true);
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">House Visit and Prayer</h1>
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
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
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Donation
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {offertoryList.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">No records found</td>
                </tr>
              )}

              {offertoryList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2">{item.member_name}</td>
                  <td className="p-2">₹{item.amount || 0}</td>
                  <td className="p-2">{moment(item.date).format('DD/MM/YYYY')}</td>
                  <td className="p-2 text-center">
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto" onClick={() => openView(item)} />
                  </td>
                </tr>
              ))}
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


        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Donation">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {/* Member ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Member ID</label>
              <input
                type="text"
                placeholder="Search by ID"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={memberIdSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setMemberIdSearch(val);
                  debouncedSearchById(val);
                  setDropdownByName([]);
                }}
              />
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Name</label>
              <input
                type="text"
                placeholder="Search by Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={memberNameSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setMemberNameSearch(val);
                  debouncedSearchByName(val);
                  setDropdownById([]);
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" value={phone} readOnly placeholder="Phone Number" className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            {/* Unified Dropdown */}
            {(dropdownById.length > 0 || dropdownByName.length > 0) && (
              <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                  <li
                    key={m.member_id}
                    className={`flex px-3 py-2 text-sm ${m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                    onClick={() => {
                      if (m.member_id === "none") return;
                      // Auto-fill values
                      setMemberIdSearch(m.member_id);
                      setMemberNameSearch(m.member_name);
                      setPhone(m.mobile_number || "");
                      setDropdownById([]);
                      setDropdownByName([]);
                    }}
                  >
                    <span className="w-[250px] font-medium">{m.member_id}</span>
                    <span className="flex-1">{m.member_name}</span>
                    <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow ONLY numbers (0–9)
                  if (/^\d*$/.test(val)) {
                    setAmount(val);
                  }
                }}
                placeholder="Enter Amount"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" placeholder="Enter Description" value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={saveHouseVisit} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
          </div>
        </Modal>

        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Cover Offertory Details">
        {selectedRecord && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
            {[
              { label: "Member Name", value: selectedRecord.member_name },
              { label: "Phone", value: selectedRecord.phone || "-" },
              { label: "Amount", value: `₹ ${selectedRecord.amount}` },
              { label: "Date", value: moment(selectedRecord.date).format("DD-MM-YYYY") },
              { label: "Description", value: selectedRecord.description || "-" },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">{item.label}</div>
                <div className="col-span-12 sm:col-span-8 text-base text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
