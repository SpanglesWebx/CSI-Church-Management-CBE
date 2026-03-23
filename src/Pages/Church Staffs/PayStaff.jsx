import React, { useEffect, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import moment from "moment";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";

export const PayStaff = () => {
  const [staffs, setStaffs] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Response, setResponse] = useState({ status: "", message: "" });
  const token = window.sessionStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🧾 Advance handling
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceDate, setAdvanceDate] = useState("");
  const [advPage, setAdvPage] = useState(1);
  const [advTotalPages, setAdvTotalPages] = useState(1);
  // pagination (standard)
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");



  // ✅ Fetch only active staffs
  const fetchActiveStaffs = async (page = 1) => {
    try {
      const res = await axios.get(`${URL}/staffs/active`, {
        params: { page, limit: rowsPerPage, search, fromDate, toDate },
        headers: { Authorization: token },
      });
      setStaffs(res.data.staffs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setResponse({ status: "Failed", message: "Failed to fetch staffs" });
    }
  };



useEffect(() => {
  fetchActiveStaffs(CurrentPage);
}, [search, fromDate, toDate, CurrentPage, rowsPerPage]);


  // 📜 View Advance History
  const handleViewAdvances = async (staff, page = 1) => {
    setSelectedStaff(staff);
    try {
      const res = await axios.get(`${URL}/staffs/advance/${staff.employee_id}`, {
        params: { page, limit: 5 },
        headers: { Authorization: token },
      });
      setAdvanceHistory(res.data.advances || []);
      setTotalAdvance(res.data.totalAdvance || 0);
      setAdvTotalPages(res.data.totalPages || 1);
      setAdvPage(page);
      setIsViewOpen(true);
    } catch (error) {
      console.error("Error fetching advances:", error);
      setResponse({ status: "Failed", message: "Failed to load history" });
    }
  };


  // 📥 Handle Add Advance (with fetching history)
  const handleAddAdvance = async (staff, page = 1) => {
  setSelectedStaff(staff);
  try {
    const res = await axios.get(`${URL}/staffs/advance/${staff.employee_id}`, {
      params: { page, limit: 5 }, // 🔹 Backend pagination support
      headers: { Authorization: token },
    });

    setAdvanceHistory(res.data.advances || []);
    setTotalAdvance(res.data.totalAdvance || 0);
    setAdvTotalPages(res.data.totalPages || 1);
    setAdvPage(page);
  } catch (error) {
    console.error("Error fetching advances:", error);
    setAdvanceHistory([]);
    setTotalAdvance(0);
  }
  setIsAddOpen(true);
};



  // ➕ Add Advance
  const handleSaveAdvance = async () => {
    try {
      if (!advanceDate || !advanceAmount) {
        setResponse({ status: "Failed", message: "Date and Amount required" });
        return;
      }

      const payload = {
        employee_id: selectedStaff.employee_id,
        date: advanceDate,
        amount: Number(advanceAmount),
      };

      await axios.post(`${URL}/staffs/advance`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Advance saved successfully!" });
      setIsAddOpen(false);
      setAdvanceAmount("");
      setAdvanceDate("");
      fetchActiveStaffs(CurrentPage);
    } catch (err) {
      console.error("Error saving advance:", err);
      setResponse({ status: "Failed", message: "Failed to save advance" });
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h4 className="font-semibold">Pay Staffs</h4>

        {/* 🔍 Filters */}
        <div className="flex flex-wrap items-center justify-between mt-3">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg
                className="w-3 h-3 text-gray-500"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              placeholder="Search by name or ID"
            />
          </div>

          <div className="flex items-center space-x-3 mt-3 lg:mt-0">
            <label className="text-l font-medium text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
            />
            <label className="text-l font-medium text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
            />
          </div>
        </div>

        {/* 🧾 Staff Table */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Employee ID</th>
                <th className="p-2 text-center">Employee Name</th>
                <th className="p-2 text-center">Designation</th>
                <th className="p-2 text-center">Advance Paid</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffs.length > 0 ? (
                staffs.map((staff, index) => (
                  <tr key={staff._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center">{staff.employee_id}</td>
                    <td className="p-2 text-center">
                      {staff.isMember ? staff.member_name : staff.non_member_name}
                    </td>
                    <td className="p-2 text-center">{staff.designation}</td>
                    <td className="p-2 text-center">
                      ₹{staff.advancePaid?.toLocaleString() || 0}
                    </td>
                    <td className="p-2 text-center space-x-3">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600 inline-block"
                        title="View Payments"
                        onClick={() => handleViewAdvances(staff)}
                      />
                      <FaPlus
                        size={18}
                        className="cursor-pointer text-lavender--600 inline-block"
                        title="Add Advance"
                        onClick={() => handleAddAdvance(staff)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-3 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
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


      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Advance Payment"
      >
        {selectedStaff && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="border-lavender--600 rounded-lg p-3">
              {/* Header Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-gray-800 text-md font-medium">
                <div>
                  <span className="font-semibold text-gray-700">Employee ID :</span>{" "}
                  <span className="text-lavender--600">{selectedStaff.employee_id}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Employee Name :</span>{" "}
                  <span className="text-lavender--600">
                    {selectedStaff.isMember
                      ? selectedStaff.member_name
                      : selectedStaff.non_member_name}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Designation :</span>{" "}
                  <span>{selectedStaff.designation}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Salary :</span>{" "}
                  <span>₹{selectedStaff.salary?.toLocaleString()}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-lavender--600 my-4"></div>

              {/* Payment History */}
              <h5 className="text-lavender--600 font-semibold text-base mb-2">
                Payment History
              </h5>
              <div className="border border-lavender--600 rounded-lg">
                <table className="w-full text-sm text-gray-800">
                  <thead className="border-b bg-lavender--50 text-lavender--700 font-medium">
                    <tr>
                      <th className="p-2 text-center w-[80px]">Sl. No.</th>
                      <th className="p-2 text-center">Date</th>
                      <th className="p-2 text-center">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advanceHistory.length > 0 ? (
                      advanceHistory.map((adv, idx) => (
                        <tr key={adv._id} className="border-b last:border-0">
                          <td className="p-2 text-center">
                            {(advPage - 1) * 5 + idx + 1}
                          </td>
                          <td className="p-2 text-center">
                            {moment(adv.date).format("DD-MM-YYYY")}
                          </td>
                          <td className="p-2 font-medium text-lavender--600 text-center">
                            ₹{adv.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center p-3 text-gray-500 italic"
                        >
                          No advance payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {advTotalPages > 1 && (
                <div className="flex justify-center items-center mt-3 space-x-3">
                  <button
                    onClick={() => handleViewAdvances(selectedStaff, advPage - 1)}
                    disabled={advPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {advPage} of {advTotalPages}
                  </span>
                  <button
                    onClick={() => handleViewAdvances(selectedStaff, advPage + 1)}
                    disabled={advPage === advTotalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}


              {/* Total Advance */}
              <div className="text-right font-semibold text-gray-800 mt-4">
                Total Advance Paid:{" "}
                <span className="text-lavender--600">
                  ₹{totalAdvance?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>


      {/* ➕ Add Advance Modal */}
      <Modal
  isOpen={isAddOpen}
  onClose={() => setIsAddOpen(false)}
  title="Add Advance Payment"
>
  {selectedStaff && (
    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
      {/* 🧾 Employee Details Section */}
      <div className="bg-lavender--50 border border-lavender--200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-gray-800 text-md font-medium">
          <div>
            <span className="font-semibold text-gray-700">Employee ID :</span>{" "}
            <span className="text-lavender--600">{selectedStaff.employee_id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Employee Name :</span>{" "}
            <span className="text-lavender--600">
              {selectedStaff.isMember
                ? selectedStaff.member_name
                : selectedStaff.non_member_name}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Designation :</span>{" "}
            <span>{selectedStaff.designation}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Salary :</span>{" "}
            <span>₹{selectedStaff.salary?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 🧾 Payment History Section */}
      <div>
        <h5 className="text-lavender--600 font-semibold text-base mb-2">
          Payment History
        </h5>
        <div className="border border-lavender--600 rounded-lg">
          <table className="w-full text-sm text-gray-800">
            <thead className="border-b bg-lavender--50 text-lavender--700 font-medium">
              <tr>
                <th className="p-2 text-center w-[80px]">Sl. No.</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {advanceHistory && advanceHistory.length > 0 ? (
                advanceHistory.map((adv, idx) => (
                  <tr key={adv._id} className="border-b last:border-0">
                    <td className="p-2 text-center">
                      {(advPage - 1) * 5 + idx + 1}
                    </td>
                    <td className="p-2 text-center">
                      {moment(adv.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="p-2 font-medium text-lavender--600 text-center">
                      ₹{adv.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-3 text-gray-500 italic">
                    No advance payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 🔹 Pagination Controls */}
          {advTotalPages > 1 && (
            <div className="flex justify-center items-center mt-3 space-x-3">
              <button
                onClick={() => handleAddAdvance(selectedStaff, advPage - 1)}
                disabled={advPage === 1}
                className="px-3 py-1 bg-lavender--100 text-lavender--700 rounded disabled:opacity-50 hover:bg-lavender--200 transition"
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Page {advPage} of {advTotalPages}
              </span>
              <button
                onClick={() => handleAddAdvance(selectedStaff, advPage + 1)}
                disabled={advPage === advTotalPages}
                className="px-3 py-1 bg-lavender--100 text-lavender--700 rounded disabled:opacity-50 hover:bg-lavender--200 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 💰 Advance Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={advanceDate}
            onChange={(e) => setAdvanceDate(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
            placeholder="Enter amount"
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleSaveAdvance}
          className="px-4 py-2 bg-lavender--600 text-white rounded hover:bg-lavender--700 transition"
        >
          Save
        </button>
      </div>
    </div>
  )}
</Modal>




      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  );
};
