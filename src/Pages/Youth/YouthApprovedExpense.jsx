import React, { useEffect, useState } from 'react'
import { FaEye } from 'react-icons/fa';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';

export const YouthApprovedExpense = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [status, setStatus] = useState("All");
  const [billStatus, setBillStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [billPreviewFile, setBillPreviewFile] = useState(null);
  const [billPreviewName, setBillPreviewName] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${URL}/youthfellow-expenses`, { // Youth Fellowship endpoint
        headers: { Authorization: token },
        params: {
          search,
          limit: 10,
          status,
          approval_status: "Approved",
          billStatus,
        },
      });
      setExpenses(res.data.expenses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, status, billStatus, CurrentPage]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Youth Fellowship Expense</h1>

          {/* Search */}
          <div>
            <label htmlFor="default-search" className="sr-only">Search Members</label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>
          </div>

          {/* Bill Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Bill Status:</label>
            <select
              value={billStatus}
              onChange={(e) => { setBillStatus(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option>All</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Payment Status:</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Expense Name</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Expense From</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Bill Status</th>
                <th className="p-2 text-center">Approval Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? expenses.map((exp, index) => (
                <tr key={exp._id} className="border-t">
                  <td className="p-2 text-center">{(CurrentPage - 1) * 10 + (index + 1)}</td>
                  <td className="p-2 text-center">{exp.name}</td>
                  <td className="p-2 text-center">₹{exp.amount}</td>
                  <td className="p-2 text-center">{exp.addedBy ? `${exp.addedBy} (${exp.addedByRole || "N/A"})` : "N/A"}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-s font-medium ${exp.status === "Paid" ? "text-green-700" : "text-red-600"}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-s font-medium ${exp.billStatus === "Closed" ? "text-green-700" : "text-red-600"}`}>
                      {exp.billStatus}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-s font-medium ${exp.approval_status === "Approved" ? "text-green-700" : "text-yellow-400"}`}>
                      {exp.approval_status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <FaEye size={18} className="text-blue-600 cursor-pointer" onClick={() => { setSelectedExpense(exp); setIsModalOpen(true); }} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500 italic">No expenses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 space-x-3">
          <button onClick={() => setCurrentPage(CurrentPage - 1)} disabled={CurrentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-lavender--600 text-white rounded">{CurrentPage}</button>
          <button onClick={() => setCurrentPage(CurrentPage + 1)} disabled={CurrentPage === TotalPages || TotalPages === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>
          <span>Total Page: {TotalPages}</span>
          <span onClick={() => setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? "disabled opacity-50 cursor-not-allowed" : "text-blue-400 cursor-pointer"}`}>Last Page</span>
        </div>
      </div>

      {/* Toast Messages */}
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

      {/* View Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="View Expense">
        {selectedExpense && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4 max-h-[600px] overflow-y-auto">
            {[
              { label: "Expense Name", value: selectedExpense.name },
              { label: "Expense Amount", value: `₹${selectedExpense.amount}` },
              { label: "Description", value: selectedExpense.description || "N/A" },
              { label: "Status", value: selectedExpense.status },
              { label: "Approval Status", value: selectedExpense.approval_status },
              { label: "Added By", value: `${selectedExpense.addedBy} (${selectedExpense.addedByRole})` },
              { label: "Paid Amount", value: selectedExpense.paidAmount ? `₹${selectedExpense.paidAmount}` : "N/A" },
              { label: "Paid At", value: selectedExpense.paidAt ? moment(selectedExpense.paidAt).format("DD-MM-YYYY") : "N/A" },
              selectedExpense.billStatus && { label: "Bill Status", value: selectedExpense.billStatus },
              selectedExpense.billName && { label: "Bill Name", value: selectedExpense.billName },
              selectedExpense.billNo && { label: "Bill No", value: selectedExpense.billNo },
              selectedExpense.billFile && {
                label: "Bill File",
                value: (
                  <button className="text-blue-600 underline" onClick={() => {
                    const normalized = selectedExpense.billFile.replace(/\\/g, "/");
                    setBillPreviewFile(`${URL}/${normalized}`);
                    setBillPreviewName(selectedExpense.name || "Bill Preview");
                    setIsBillPreviewOpen(true);
                  }}>View Bill</button>
                )
              }
            ].filter(Boolean).map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-4 text-lg font-semibold">{item.label}</div>
                <div className="col-span-8 text-base">{item.value || "N/A"}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Bill Preview Modal */}
      <Modal isOpen={isBillPreviewOpen} onClose={() => setIsBillPreviewOpen(false)} title={billPreviewName || "Bill Preview"}>
        <div className="w-full h-[500px] flex items-center justify-center">
          {billPreviewFile ? (billPreviewFile.endsWith(".pdf") ? <iframe src={billPreviewFile} title="PDF Preview" className="w-full h-full border rounded-md" /> : <img src={billPreviewFile} alt="Bill Preview" className="w-full h-full object-contain border rounded-md" />) : <p className="text-gray-500">No file selected</p>}
        </div>
      </Modal>
    </>
  )
}
