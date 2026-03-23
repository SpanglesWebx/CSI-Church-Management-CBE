import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { URL } from "../../App";
import Modal from '../../Components/Expense/ExpenseFormModal';
import moment from 'moment';

export const CouplePaidExpense = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isCloseBillModalOpen, setIsCloseBillModalOpen] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [billName, setBillName] = useState("");
  const [billNo, setBillNo] = useState("");
  const [previewURL, setPreviewURL] = useState("");
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [billPreviewFile, setBillPreviewFile] = useState(null);
  const [billPreviewName, setBillPreviewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [billFilter, setBillFilter] = useState("All");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillFile(file);
      const url = window.URL.createObjectURL(file);
      setPreviewURL(url);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${URL}/couplefellow-expenses`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: 10,
          status: "Paid",
          billStatus: billFilter,
          search: searchTerm,
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
  }, [CurrentPage, searchTerm, billFilter]);

  const handleCloseBill = async () => {
    if (!billFile || !billName || !billNo) {
      setResponse({ status: "error", message: "Please provide all details" });
      return;
    }

    const formData = new FormData();
    formData.append("billFile", billFile);
    formData.append("billName", billName);
    formData.append("billNo", billNo);

    try {
      await axios.patch(
        `${URL}/couplefellow-expenses/close-bill/${selectedExpense._id}`,
        formData,
        { headers: { Authorization: token } }
      );
      setResponse({ status: "success", message: "Bill closed successfully!" });
      setIsCloseBillModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error("Error closing bill:", err);
      setResponse({ status: "error", message: "Bill closing failed" });
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Paid Expense - Couple Fellowship</h1>
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
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
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Bill Status:</label>
            <select
              value={billFilter}
              onChange={(e) => { setBillFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
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
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Approval Status</th>
                <th className="p-2 text-center">Bill Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, idx) => (
                <tr key={exp._id}>
                  <td className="p-2 text-center">{(CurrentPage - 1) * 10 + (idx + 1)}</td>
                  <td className="p-2 text-center">{exp.name}</td>
                  <td className="p-2 text-center">{exp.amount}</td>
                  <td className="p-2 text-center">{exp.status}</td>
                  <td className="p-2 text-center">{exp.approval_status}</td>
                  <td className="p-2 text-center">{exp.billStatus}</td>
                  <td className='p-2 text-center'>
                    <div className="flex items-center justify-center gap-3">
                      <FaEye
                      title='View'
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => { setSelectedExpense(exp); setIsModalOpen(true); }}
                      />
                      {exp.billStatus === "Open" && (
                        <button
                          className="px-2 py-1 text-s bg-green-600 text-white rounded"
                          onClick={() => { setSelectedExpense(exp); setIsCloseBillModalOpen(true); }}
                        >
                          Close Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"}`}
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
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span>{TotalPages}</span></span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'}`}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Paid Expense Details">
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
              {
                label: "Paid At",
                value: selectedExpense.paidAt
                  ? moment(selectedExpense.paidAt).format("DD-MM-YYYY")
                  : selectedExpense.updatedAt
                    ? moment(selectedExpense.updatedAt).format("DD-MM-YYYY")
                    : "N/A",
              },
              selectedExpense.spendByType && { label: "Spend By Type", value: selectedExpense.spendByType },
              selectedExpense.spendById && { label: "Spend By ID", value: selectedExpense.spendById },
              selectedExpense.spendByName && { label: "Spend By Name", value: selectedExpense.spendByName },
              selectedExpense.spendByPhone && { label: "Spend By Phone", value: selectedExpense.spendByPhone },
              selectedExpense.spendByPlace && { label: "Spend By Place", value: selectedExpense.spendByPlace },
              selectedExpense.billStatus && { label: "Bill Status", value: selectedExpense.billStatus },
              selectedExpense.billName && { label: "Bill Name", value: selectedExpense.billName },
              selectedExpense.billNo && { label: "Bill No", value: selectedExpense.billNo },
              selectedExpense.billFile && {
                label: "Bill File",
                value: (
                  <button
                    className="text-blue-600 underline"
                    onClick={() => {
                      const normalized = selectedExpense.billFile.replace(/\\/g, "/");
                      setBillPreviewFile(`${URL}/${normalized}`);
                      setBillPreviewName(selectedExpense.name || "Bill Preview");
                      setIsBillPreviewOpen(true);
                    }}
                  >
                    View Bill
                  </button>
                ),
              },
            ].filter(Boolean).map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">{item.label}</div>
                <div className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"}`}>
                  {item.value || "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Close Bill Modal */}
      <Modal isOpen={isCloseBillModalOpen} onClose={() => setIsCloseBillModalOpen(false)} title="Close Bill">
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">
              <span className="text-gray-500 font-normal">Name of the Expense: </span>
              {selectedExpense?.name || "Expense Name"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill Name</label>
              <input type="text" placeholder="Enter Bill Name" value={billName} onChange={(e) => setBillName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill No</label>
              <input type="text" placeholder="Enter Bill No" value={billNo} onChange={(e) => setBillNo(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Bill</label>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preview</label>
              {previewURL ? (
                billFile?.type === "application/pdf" ? (
                  <iframe src={previewURL} title="PDF Preview" className="w-full h-32 border rounded-md mt-1"></iframe>
                ) : (
                  <img src={previewURL} alt="Bill Preview" className="w-full h-32 object-contain border rounded-md mt-1" />
                )
              ) : (
                <div className="w-full h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 mt-1">No file selected</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleCloseBill} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
          </div>
        </>
      </Modal>

      {/* Bill Preview Modal */}
      <Modal isOpen={isBillPreviewOpen} onClose={() => setIsBillPreviewOpen(false)} title={billPreviewName || "Bill Preview"}>
        <div className="w-full h-[500px] flex items-center justify-center">
          {billPreviewFile ? (
            billPreviewFile.endsWith(".pdf") ? (
              <iframe src={billPreviewFile} title="PDF Preview" className="w-full h-full border rounded-md" />
            ) : (
              <img src={billPreviewFile} alt="Bill Preview" className="w-full h-full object-contain border rounded-md" />
            )
          ) : (
            <p className="text-gray-500">No file selected</p>
          )}
        </div>
      </Modal>
    </>
  )
}
