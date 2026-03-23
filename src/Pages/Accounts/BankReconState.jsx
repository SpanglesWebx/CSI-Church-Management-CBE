import React, { useEffect, useState } from 'react'
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import Modal from '../../Components/Expense/ExpenseFormModal';
import { TfiMoreAlt } from "react-icons/tfi";
import { useRef, useLayoutEffect } from "react";
import axios from 'axios';
import { URL } from '../../App';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export const BankReconState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("Cheque");
  const [actionStatus, setActionStatus] = useState("Realise");
  const [activeTab, setActiveTab] = useState("Add");
  const addRef = useRef(null);
  const lessRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [reconList, setReconList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [realisedDate, setRealisedDate] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnDate, setReturnDate] = useState("");

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


  useLayoutEffect(() => {
    const activeRef = activeTab === "Add" ? addRef.current : lessRef.current;

    if (activeRef) {
      const { offsetLeft, offsetWidth } = activeRef;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  const fetchBankDropdown = async () => {
    try {
      const res = await axios.get(`${URL}/banks/dropdown-all`, {
        headers: { Authorization: token },
      });

      if (res.data?.status === "Success") {
        setBankOptions(res.data.banks || []);
      }
    } catch (err) {
      console.error("Bank dropdown fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBankDropdown();
  }, []);

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };


  const fetchReconList = async () => {
    try {
      const res = await axios.get(`${URL}/bank-recon/list`, {
        headers: { Authorization: token },
        params: {
          bankId: selectedBank,
          method: statusFilter === "UPI" ? "UPI Payment" : statusFilter,
          search: searchTerm,
          startDate,
          endDate,
          tab: activeTab,
        },
      });

      setReconList(res.data.data || []);
    } catch (err) {
      console.error("BRS fetch error:", err);
    }
  };

  useEffect(() => {
    fetchReconList();
  }, [selectedBank, statusFilter, searchTerm, startDate, endDate, activeTab]);

  const handleSaveAction = async () => {
    if (!selectedRow) return;

    try {
      setLoading(true);

      await axios.put(
        `${URL}/bank-recon/realise/${selectedRow._id}`,
        {
          action: actionStatus,
          realisedDate,
          returnDate,
          returnReason,
        },
        { headers: { Authorization: token } }
      );

      setIsModalOpen(false);
      showToast("Success", "Updated successfully");
      fetchReconList();
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to update"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">B.R.S</h1>
        <div className="flex items-center justify-between p-2">

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-md text-gray-600 mb-1">Payment Method</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-md text-gray-600 mb-1">Banks</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-60 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="">Select Bank</option>

              {bankOptions.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bank_name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-center p-2">
          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex justify-center gap-10 relative">

            <button
              ref={addRef}
              onClick={() => setActiveTab("Add")}
              className={`pb-3 px-4 flex items-center justify-center text-base font-semibold transition-colors duration-200 ${activeTab === "Add"
                ? "text-lavender--600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Add
            </button>

            <button
              ref={lessRef}
              onClick={() => setActiveTab("Less")}
              className={`pb-3 px-4 flex items-center justify-center text-base font-semibold transition-colors duration-200 ${activeTab === "Less"
                ? "text-lavender--600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Less
            </button>

            {/* 🔥 Dynamic sliding underline */}
            <span
              className="absolute bottom-0 h-[3px] bg-lavender--600 rounded-full transition-all duration-300"
              style={indicatorStyle}
            />
          </div>
        </div>

        {activeTab === "Add" && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-base text-gray-700 border-b">
                <tr>
                  <th className="p-2 text-center">Trans Date</th>
                  <th className="p-2 text-center">Trans ID</th>
                  <th className="p-2 text-center">Trans No</th>
                  {(statusFilter === "Cheque" || statusFilter === "All") && (
                    <>
                      <th className="p-2 text-center">Cheque No</th>
                      <th className="p-2 text-center">Cheque Date</th>
                    </>
                  )}
                  {(statusFilter === "UPI" || statusFilter === "All") && (
                    <th className="p-2 text-center">UPI ID</th>
                  )}
                  <th className="p-2 text-center">Party Name</th>
                  <th className="p-2 text-center">Amount</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {reconList.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-400">
                      No records found
                    </td>
                  </tr>
                )}

                {reconList.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2 text-center">
                      {new Date(item.receiptDate).toLocaleDateString()}
                    </td>

                    <td className="p-2 text-center">{item.autoReceiptId}</td>
                    <td className="p-2 text-center">{item.transNo}</td>

                    {(statusFilter === "Cheque" || statusFilter === "All") && (
                      <>
                        <td className="p-2 text-center">{item.chequeNumber || "-"}</td>
                        <td className="p-2 text-center">
                          {item.chequeDate
                            ? new Date(item.chequeDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </>
                    )}

                    {(statusFilter === "UPI" || statusFilter === "All") && (
                      <td className="p-2 text-center">{item.upiId || "-"}</td>
                    )}

                    <td className="p-2 text-center">{item.partyName}</td>
                    <td className="p-2 text-center">₹{item.amount}</td>

                    <td className="p-2 text-center">
                      {!item.realised && !item.returned && ["admin", "churchofficeworker"].includes(userRole) ? (
                        <TfiMoreAlt
                          className="cursor-pointer text-lavender--600 mx-auto"
                          size={18}
                          onClick={() => {
                            setSelectedRow(item);
                            setActionStatus("Realise");
                            setRealisedDate("");
                            setReturnReason("");
                            setReturnDate("");
                            setIsModalOpen(true);
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {activeTab === "Less" && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-base text-gray-700 border-b">
                <tr>
                  <th className="p-2 text-center">Trans Date</th>
                  <th className="p-2 text-center">Trans ID</th>
                  <th className="p-2 text-center">Trans No</th>
                  {(statusFilter === "Cheque" || statusFilter === "All") && (
                    <>
                      <th className="p-2 text-center">Cheque No</th>
                      <th className="p-2 text-center">Cheque Date</th>
                    </>
                  )}
                  {(statusFilter === "UPI" || statusFilter === "All") && (
                    <th className="p-2 text-center">UPI ID</th>
                  )}
                  <th className="p-2 text-center">Party Name</th>
                  <th className="p-2 text-center">Amount</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {reconList.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-400">
                      No records found
                    </td>
                  </tr>
                )}

                {reconList.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2 text-center">
                      {new Date(item.receiptDate).toLocaleDateString()}
                    </td>

                    <td className="p-2 text-center">{item.autoReceiptId}</td>
                    <td className="p-2 text-center">{item.transNo}</td>

                    {(statusFilter === "Cheque" || statusFilter === "All") && (
                      <>
                        <td className="p-2 text-center">{item.chequeNumber || "-"}</td>
                        <td className="p-2 text-center">
                          {item.chequeDate
                            ? new Date(item.chequeDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </>
                    )}

                    {(statusFilter === "UPI" || statusFilter === "All") && (
                      <td className="p-2 text-center">{item.upiId || "-"}</td>
                    )}

                    <td className="p-2 text-center">{item.partyName}</td>
                    <td className="p-2 text-center">₹{item.amount}</td>

                    <td className="p-2 text-center">
                      {!item.realised &&
                        !item.returned &&
                        ["admin", "churchofficeworker"].includes(userRole) ? (
                        <TfiMoreAlt
                          className="cursor-pointer text-lavender--600 mx-auto"
                          size={18}
                          onClick={() => {
                            setSelectedRow(item);
                            setActionStatus("Realise");
                            setRealisedDate("");
                            setReturnReason("");
                            setReturnDate("");
                            setIsModalOpen(true);
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); }} title="Realise Amount">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="Realise">Realise</option>
                <option value="Return">Return</option>
              </select>
            </div>
            {actionStatus === "Realise" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Realised Date</label>
                <input
                  type="date"
                  value={realisedDate}
                  onChange={(e) => setRealisedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            {actionStatus === "Return" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
          </div>
          {actionStatus === "Return" && (
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Return Reason</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder='Give the return reason'
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleSaveAction}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${loading ? "bg-gray-400" : "bg-lavender--600"
                }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>
        </Modal>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

    </>
  )
}
