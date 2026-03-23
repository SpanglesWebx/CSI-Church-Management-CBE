import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import Pagination from '../../Components/Helpers/Pagination';
import Modal from '../../Components/Expense/ExpenseFormModal';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import axios from 'axios';
import { URL } from '../../App';
import moment from 'moment';
import { jwtDecode } from "jwt-decode";

export const CemCashAcc = () => {
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [openingAmount, setOpeningAmount] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [openingBalances, setOpeningBalances] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

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

  const resetOpeningBalanceForm = () => {
    setAccountName("");
    setSelectedBankId("");
    setOpeningAmount("");
    setOpeningDate("");
  };

  useEffect(() => {
    if (isModalOpen) {
      resetOpeningBalanceForm();
    }
  }, [isModalOpen]);

  // ✅ FETCH CEM BANK ACCOUNTS
  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get(`${URL}/cem-banks/list`, {
        headers: { Authorization: token },
        params: { status: "Active" },
      });

      setBankAccounts(res.data.banks || []);
    } catch (err) {
      console.error("Failed to fetch cem banks", err);
    }
  };

  useEffect(() => {
    if (accountName === "Cash at Bank A/c") {
      fetchBankAccounts();
    } else {
      setSelectedBankId("");
    }
  }, [accountName]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!saving) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saving]);

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // ✅ SAVE CEM OPENING BALANCE
  const saveOpeningBalance = async () => {
    if (saving) return;

    if (!accountName || !openingAmount || !openingDate) {
      showToast("Failed", "Fill all required fields");
      return;
    }

    if (accountName === "Cash at Bank A/c" && !selectedBankId) {
      showToast("Failed", "Please select bank account");
      return;
    }

    try {
      setSaving(true);

      resetOpeningBalanceForm();

      await axios.post(
        `${URL}/cem-opening-balance/add`,
        {
          account_type: accountName,
          bank_id: accountName === "Cash at Bank A/c" ? selectedBankId : null,
          amount: Number(openingAmount),
          as_on_date: openingDate,
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Opening balance added");

      setIsModalOpen(false);
      setAccountName("");
      setSelectedBankId("");
      setOpeningAmount("");
      setOpeningDate("");

      fetchOpeningBalances();
    } catch (err) {
      showToast("Failed", err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ FETCH CEM OPENING BALANCES
  const fetchOpeningBalances = async () => {
    const res = await axios.get(`${URL}/cem-opening-balance/list`, {
      headers: { Authorization: token },
      params: {
        page: CurrentPage,
        limit: rowsPerPage,
        search: searchTerm,
        from: startDate,
        to: endDate,
      },
    });

    setOpeningBalances(res.data.data || []);
    setTotalPages(res.data.totalPages || 1);
  };

  useEffect(() => {
    fetchOpeningBalances();
  }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Cemetery Opening Balance</h1>

        <div className="flex items-center justify-between p-2">
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
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
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
          </div>
{["admin", "churchofficeworker"].includes(userRole) && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Opening Balance
          </button>
)}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Account Name</th>
                <th className="p-2 text-center">Current Balance</th>
                <th className="p-2 text-center">Balance Created</th>
              </tr>
            </thead>
            <tbody>
              {openingBalances.map((item, index) => (
                <tr key={item._id} className="border-b text-center p-2">
                  <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>
                    {item.account_type === "Cash at Bank A/c"
                      ? `${item.bank_id?.bank_name} - ${item.bank_id?.account_number}`
                      : item.account_type}
                  </td>
                  <td className="font-semibold text-green-700">
                    ₹ {item.current_balance.toLocaleString()}
                  </td>
                  <td>{moment(item.as_on_date).format("DD-MM-YYYY")}</td>
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
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => { if (saving) return; setIsModalOpen(false); }} title="Create Balance">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Name</label>
            <select value={accountName} onChange={(e) => setAccountName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
              <option value="">Select Account</option>
              <option value="Cash on Hand A/c">Cash on Hand A/c</option>
              <option value="Petty Cash A/c">Petty Cash A/c</option>
            </select>
          </div>

          {accountName === "Cash at Bank A/c" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account Name</label>
              <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                <option value="">Select Bank Account</option>
                {bankAccounts.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.bank_name} - {bank.account_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Opening Balance</label>
            <input
              type="text"
              placeholder="Enter opening balance"
              value={openingAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) setOpeningAmount(value);
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Opening Balance As On</label>
            <input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={saveOpeningBalance}
            disabled={saving}
            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </Modal>

      {Response.status &&
        (Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />)}
    </>
  );
};
