import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";
import { jwtDecode } from "jwt-decode";

export const HarvestCollection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
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

  const [harvestList, setHarvestList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  // Pagination
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

  // search by id
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
      } catch {
        setDropdownById([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // search by name
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
      } catch {
        setDropdownByName([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // FETCH HARVEST COLLECTION LIST
  const fetchHarvestCollection = async () => {
    try {
      const res = await axios.get(`${URL}/harvest-collection/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      setHarvestList(res.data.harvest || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setHarvestList([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchHarvestCollection();
  }, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  // ADD HARVEST COLLECTION
  const saveHarvest = async () => {
    if (!memberNameSearch || !date) {
      setResponse({ status: null, message: "" });
      setTimeout(() => setResponse({ status: "Failed", message: "Member and Date required" }), 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
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

      await axios.post(`${URL}/harvest-collection/add`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Harvest collection saved" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setIsModalOpen(false);
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);
      setPhone("");
      setAmount("");
      setDate("");
      setDescription("");

      fetchHarvestCollection();
    } catch {
      setResponse({ status: "Failed", message: "Server error" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  // VIEW SINGLE RECORD
  const openView = async (item) => {
    try {
      const res = await axios.get(`${URL}/harvest-collection/${item._id}`, {
        headers: { Authorization: token },
      });
      setSelectedRecord(res.data.data || res.data || item);
    } catch {
      setSelectedRecord(item);
    }
    setIsViewOpen(true);
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Harvest Collection</h1>

        {/* SEARCH + FILTERS + ADD BUTTON */}
        <div className="flex items-center justify-between p-2">

          {/* Search */}
          <div>
            <input
              type="search"
              placeholder="Search"
              className="block py-1 text-sm rounded w-54 ps-8 bg-gray-50"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="py-1 text-sm rounded w-40 px-3 bg-gray-50 border" />

            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="py-1 text-sm rounded w-40 px-3 bg-gray-50 border" />
          </div>

          {/* Add Button */}
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Collection
          </button>
        </div>

        {/* TABLE */}
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
              {harvestList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-3">No records found</td>
                </tr>
              )}

              {harvestList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{item.member_name}</td>
                  <td>₹{item.amount || 0}</td>
                  <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                  <td>
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto"
                      onClick={() => openView(item)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
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


        {/* ADD MODAL */}
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
            <button onClick={saveHarvest} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
          </div>
        </Modal>

        {/* VIEW MODAL */}
        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Harvest Collection Details">
          {selectedRecord && (
            <div className="p-5 space-y-3 max-h-[650px] overflow-y-auto">
              {[
                { label: "Member Name", value: selectedRecord.member_name },
                { label: "Phone", value: selectedRecord.phone || "-" },
                { label: "Amount", value: `₹ ${selectedRecord.amount}` },
                { label: "Date", value: moment(selectedRecord.date).format("DD-MM-YYYY") },
                { label: "Description", value: selectedRecord.description || "-" },
              ].map((i, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 pb-2">
                  <div className="col-span-4 font-semibold">{i.label}</div>
                  <div className="col-span-8">{i.value}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>

      {/* TOAST */}
      {Response.status &&
        (Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />)}
    </>
  );
};
