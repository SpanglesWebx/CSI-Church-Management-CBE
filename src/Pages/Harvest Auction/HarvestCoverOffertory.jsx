import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";

export const HarvestCoverOffertory = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // member search states
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);

  // form fields
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // data list
  const [offertoryList, setOffertoryList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  // pagination (shared)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  // debounce utility
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

  // fetch offertory list
  const fetchOffertory = async () => {
    try {
      const res = await axios.get(
        `${URL}/harvest-cover-offertory/list`,
        {
          headers: { Authorization: token },
          params: {
            page: CurrentPage,
            limit: rowsPerPage,
            search: searchTerm,
            startDate,
            endDate,
          }

        }
      );

      setOffertoryList(res.data.offertory || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching offertory:", err);
      setOffertoryList([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchOffertory();
  }, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  // save offertory
  const saveOffertory = async () => {
    if (!memberIdSearch || !memberNameSearch || !amount || !date) {
      setResponse({ status: null, message: "" });
      setTimeout(() => setResponse({ status: "Failed", message: "All fields are required" }), 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/harvest-cover-offertory/add`,
        {
          member_id: memberIdSearch,
          member_name: memberNameSearch,
          phone,
          amount: Number(amount),
          date,
          description,
        },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Harvest Cover Offertory added successfully" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setIsModalOpen(false);
      resetForm();
      fetchOffertory();
    } catch (err) {
      console.error("Error saving offertory:", err);
      setResponse({ status: "Failed", message: "Server error" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const resetForm = () => {
    setMemberIdSearch("");
    setMemberNameSearch("");
    setDropdownById([]);
    setDropdownByName([]);
    setPhone("");
    setMemberVerified(false);
    setAmount("");
    setDate("");
    setDescription("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openView = async (item) => {
    try {
      const res = await axios.get(
        `${URL}/harvest-cover-offertory/${item._id}`,
        { headers: { Authorization: token } }
      );
      setSelectedRecord(res.data.data || item);
    } catch (err) {
      setSelectedRecord(item);
    }
    setIsViewOpen(true);
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Harvest Cover Offertory</h1>

        {/* Search + Date Filter + Add */}
        <div className="flex items-center justify-between p-2">
          <div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm rounded w-40 px-3 bg-gray-50 border"
            />

            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm rounded w-40 px-3 bg-gray-50 border"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Harvest Cover Offertory
          </button>
        </div>

        {/* Table */}
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
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {offertoryList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2">{item.member_name}</td>
                  <td className="p-2">₹{item.amount}</td>
                  <td className="p-2">{moment(item.date).format("DD/MM/YYYY")}</td>
                  <td className="p-2">
                    <FaEye
                      size={18}
                      className="cursor-pointer text-lavender--600 mx-auto"
                      onClick={() => openView(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Harvest Cover Offertory"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

          {/* Member ID */}
          <div>
            <label>Member ID</label>
            <input
              type="text"
              placeholder="Search by ID"
              value={memberIdSearch}
              onChange={(e) => {
                const val = e.target.value;
                setMemberIdSearch(val);
                debouncedSearchById(val);
                setDropdownByName([]);
                setMemberVerified(false);
              }}
              className="block w-full mt-1 border rounded shadow-sm"
            />
          </div>

          {/* Member Name */}
          <div>
            <label>Member Name</label>
            <input
              type="text"
              placeholder="Search by Name"
              value={memberNameSearch}
              onChange={(e) => {
                const val = e.target.value;
                setMemberNameSearch(val);
                debouncedSearchByName(val);
                setDropdownById([]);
                setMemberVerified(false);
              }}
              className="block w-full mt-1 border rounded shadow-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              readOnly
              placeholder="Phone Number"
              className="block w-full mt-1 bg-gray-100 border rounded shadow-sm"
            />
          </div>

          {/* Unified Dropdown */}
          {(dropdownById.length > 0 || dropdownByName.length > 0) && (
            <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border rounded shadow max-h-60 overflow-y-auto z-50">
              {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                <li
                  key={m.member_id}
                  className={`flex px-3 py-2 text-sm ${m.member_id === "none" ? "text-gray-500" : "hover:bg-indigo-50 cursor-pointer"
                    }`}
                  onClick={() => {
                    if (m.member_id === "none") return;
                    setMemberIdSearch(m.member_id);
                    setMemberNameSearch(m.member_name);
                    setPhone(m.mobile_number || "");
                    setDropdownById([]);
                    setDropdownByName([]);
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
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label>Date</label>
            <input
              type="date"
              className="block w-full mt-1 border rounded shadow-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setAmount(val);
              }}
              placeholder="Enter Amount"
              className="block w-full mt-1 border rounded shadow-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-2">
          <label>Description</label>
          <input
            type="text"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full mt-1 border rounded shadow-sm"
          />
        </div>

        {/* Save */}
        <div className="flex justify-end mt-6">
          <button
            onClick={saveOffertory}
            className="px-4 py-2 bg-lavender--600 text-white rounded"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Harvest Cover Offertory Details"
      >
        {selectedRecord && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
            {[
              { label: "Member Name", value: selectedRecord.member_name },
              { label: "Phone", value: selectedRecord.phone || "-" },
              { label: "Amount", value: `₹ ${selectedRecord.amount}` },
              { label: "Date", value: moment(selectedRecord.date).format("DD-MM-YYYY") },
              { label: "Description", value: selectedRecord.description || "-" },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 pb-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                  {item.label}
                </div>
                <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </>
  )
}
