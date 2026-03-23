import React, { useEffect, useState } from 'react'
import { FaEye } from 'react-icons/fa';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';

export const SundaySclExpense = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState(""); // "accepted" or "rejected"
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [approvalStatus, setApprovalStatus] = useState("All");
  const [billStatus, setBillStatus] = useState("All");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${URL}/sundayschool-expenses`, {
        headers: { Authorization: token },
        params: {
          search,
          limit: 10,
          status,
          approval_status: approvalStatus,
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
  }, [search, status, approvalStatus, billStatus, CurrentPage]); 

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Expense</h1>
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
                placeholder="Search"
                value={search}
                onChange={(e) => {
              setCurrentPage(1); // reset to first page on search
              setSearch(e.target.value);
            }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Approval Status:</label>
            <select
              value={approvalStatus}
              onChange={(e) => {
              setCurrentPage(1);
              setApprovalStatus(e.target.value);
            }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option>All</option>
            <option>Waiting</option>
            <option>Approved</option>
            <option>Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Payment Status:</label>
            <select
            value={status}
            onChange={(e) => {
              setCurrentPage(1);
              setStatus(e.target.value);
            }}
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
                <th className="p-2 text-center">Approval Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp, index) => (
                  <tr key={exp._id} className="border-t">
                    <td className="p-2 text-center">{(CurrentPage - 1) * 10 + (index + 1)}</td>
                    <td className="p-2 text-center">{exp.name}</td>
                    <td className="p-2 text-center">₹{exp.amount}</td>
                    <td className="p-2 text-center">
                      {exp.addedBy ? `${exp.addedBy} (${exp.addedByRole || "N/A"})` : "N/A"}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-s font-medium ${exp.status === "Paid"
                          ? "text-green-700"
                          : "text-red-600"
                          }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-s font-medium ${exp.approval_status === "Waiting"
                          ? " text-yellow-400"
                          : exp.approval_status === "Approved"
                            ? " text-green-700"
                            : " text-red-600"
                          }`}
                      >
                        {exp.approval_status}
                      </span>
                    </td>
                    <td className="p-2 text-center mx-auto">
                      <FaEye
                        size={18}
                        className="text-blue-600 cursor-pointer mx-auto"
                        onClick={() => {
                          setSelectedExpense(exp);
                          setIsModalOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-4 text-center text-gray-500 italic"
                  >
                    No expenses found
                  </td>
                </tr>
              )}
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
            className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"
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
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">
              Total Page: <span>{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage
                ? "disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer"
                }`}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>

      {/* Toast messages */}
      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}

      {/* View Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="View Expense">
        {selectedExpense && (
          <>
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
              {[
                { label: "Date", value: moment(selectedExpense.createdAt).format("DD-MM-YYYY") },
                { label: "Name", value: selectedExpense.name },
                { label: "Amount", value: `₹${selectedExpense.amount}` },
                { label: "Status", value: selectedExpense.status },
                { label: "Approval Status", value: selectedExpense.approval_status },
                { label: "Description", value: selectedExpense.description || "N/A" },
                { label: "Added By", value: selectedExpense.addedBy },
                { label: "Role", value: selectedExpense.addedByRole },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 py-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                    {item.label}
                  </div>
                  <div
                    className={`col-span-12 sm:col-span-8 text-base ${item.value
                      ? "text-gray-800 dark:text-gray-300"
                      : "text-yellow-500 font-semibold"
                      }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="flex justify-end mt-4 gap-3">
              {selectedExpense.approval_status === "Waiting" ? (
                <>
                  <button
      onClick={async () => {
        try {
          await axios.put(
            `${URL}/sundayschool-expenses/${selectedExpense._id}`,
            { approval_status: "Approved" }, // ✅ match schema case
            { headers: { Authorization: token } }
          );
          setIsModalOpen(false);
          fetchExpenses();
        } catch (err) {
          console.error("Error approving:", err);
        }
      }}
      className="px-4 py-2 bg-green-600 text-white rounded-md"
    >
      Accept
    </button>

    <button
      onClick={async () => {
        try {
          await axios.put(
            `${URL}/sundayschool-expenses/${selectedExpense._id}`,
            { approval_status: "Rejected" }, // ✅ match schema case
            { headers: { Authorization: token } }
          );
          setIsModalOpen(false);
          fetchExpenses();
        } catch (err) {
          console.error("Error rejecting:", err);
        }
      }}
      className="px-4 py-2 bg-red-600 text-white rounded-md"
    >
      Reject
    </button> 
                  <button
                    onClick={() => {
                      setStatusAction("Approved");
                      setIsStatusModalOpen(true);
                      fetchExpenses();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => {
                      setStatusAction("Rejected");
                      setIsStatusModalOpen(true);
                      fetchExpenses();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >
                    Reject
                  </button>

                </>
              ) : (
                <span
                  className={`px-4 py-2 rounded-md font-semibold ${selectedExpense.approval_status === "Approved"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    }`}
                >
                  {selectedExpense.approval_status}
                </span>
              )}

            </div> */}
            {selectedExpense && (
              <div className="flex justify-end mt-4 gap-3">
                {selectedExpense.approval_status === "Waiting" ? (
                  <>
                    <button
                      onClick={() => {
                        setStatusAction("Approved");
                        setIsStatusModalOpen(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => {
                        setStatusAction("Rejected");
                        setIsStatusModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-4 py-2 rounded-md font-semibold ${selectedExpense.approval_status === "Approved"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                      }`}
                  >
                    {selectedExpense.approval_status}
                  </span>
                )}
              </div>
            )}
            {isStatusModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>

          <div className="relative w-full max-w-md max-h-full p-4 z-50">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                ✕
              </button>

              <div className="p-4 text-center md:p-5">
                <svg
                  className={`w-12 h-12 mx-auto mb-4 ${statusAction === "Rejected" ? "text-red-500" : "text-green-600"}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Do you want to{" "}
                  <span className={`font-semibold ${statusAction === "Rejected" ? "text-red-500" : "text-green-600"}`}>
                    {statusAction}
                  </span>{" "}
                  this expense: <span className="font-semibold">{selectedExpense.name}</span>?
                </h3>

                {/* Cancel */}
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                >
                  No
                </button>

                {/* Confirm */}
                <button
                  onClick={async () => {
                    try {
                      await axios.put(
                        `${URL}/sundayschool-expenses/${selectedExpense._id}`,
                        { approval_status: statusAction },
                        { headers: { Authorization: token } }
                      );
                            setSelectedExpense(prev => ({ ...prev, approval_status: statusAction }));

                            setIsStatusModalOpen(false);
                            fetchExpenses();
                          } catch (err) {
                            console.error("Error updating status:", err);
                            setIsStatusModalOpen(false);
                          }
                        }}
                        className={`text-white ms-3 ${statusAction === "Rejected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                          } font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5`}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
          </div>
        </div>
      )}

          </>


        )}
      </Modal>
      

    </>
  );
};
