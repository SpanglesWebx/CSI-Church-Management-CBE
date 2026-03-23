import React, { useEffect, useRef, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import Pagination from '../../Components/Helpers/Pagination';
import JournalModal from '../../Components/Expense/JournalModal';
import { MdDelete } from 'react-icons/md';
import { createPortal } from "react-dom";
import { jwtDecode } from "jwt-decode";
import { BiSolidEditAlt } from 'react-icons/bi';

export const CemPayments = () => {
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
  const [expenses, setExpenses] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentFor, setPaymentFor] = useState("");
  const [paymentForType, setPaymentForType] = useState("");
  const [paymentDropdown, setPaymentDropdown] = useState([]);
  const [chequeNumber, setChequeNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [creditorSearch, setCreditorSearch] = useState("");
  const [creditorDropdown, setCreditorDropdown] = useState([]);
  const [selectedCreditor, setSelectedCreditor] = useState(null);
  const [voucherNumber, setVoucherNumber] = useState("");
  const [inFavourOf, setInFavourOf] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [cashAccountType, setCashAccountType] = useState("");
  const [paymentLedgerSearch, setPaymentLedgerSearch] = useState("");
  const [paymentLedgerDropdown, setPaymentLedgerDropdown] = useState([]);
  const [selectedPaymentLedger, setSelectedPaymentLedger] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
const [editId, setEditId] = useState(null);
  const [expenseRows, setExpenseRows] = useState([
    {
      voucherNumber: "",
      creditorSearch: "",
      selectedCreditor: null,
      ledger: null,
      ledgerLabel: "",
      amount: "",
      description: ""
    }
  ]);
  const activeLedgerInputRef = useRef(null);
  const [ledgerDropdownPos, setLedgerDropdownPos] = useState(null);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const activeCreditorInputRef = useRef(null);
  const [creditorDropdownPos, setCreditorDropdownPos] = useState(null);
  const [activeCreditorRowIndex, setActiveCreditorRowIndex] = useState(null);

  const totalAmount = expenseRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const validRows = expenseRows.filter(
    (r) => r.ledger && Number(r.amount) > 0
  );

  const addExpenseRow = () => {
    setExpenseRows([
      ...expenseRows,
      {
        voucherNumber: "",
        creditorSearch: "",
        selectedCreditor: null,
        ledger: null,
        ledgerLabel: "",
        amount: "",
        description: ""
      }
    ]);
  };

  const removeExpenseRow = (index) => {
    setExpenseRows(expenseRows.filter((_, i) => i !== index));
  };

  const setLedgerPosFromEl = (el) => {
    if (!el) return setLedgerDropdownPos(null);
    const rect = el.getBoundingClientRect();
    setLedgerDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  const setCreditorPosFromEl = (el) => {
    if (!el) return setCreditorDropdownPos(null);

    const rect = el.getBoundingClientRect();

    setCreditorDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  const convertToInputDate = (ddmmyyyy) => {
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchISTDate = async () => {
      try {
        const res = await axios.get(`${URL}/time/ist`, {
          headers: { Authorization: token }
        });
        const formatted = convertToInputDate(res.data.ist_date);
        setExpenseDate(formatted);
        setChequeDate(formatted);
      } catch (err) {
        console.log("Failed to fetch IST date", err);
      }
    };
    fetchISTDate();
  }, []);

  const resetAfterSave = () => {
  setIsEditMode(false);
  setEditId(null);

  setPaymentMethod("Cash");
  setCashAccountType("");
  setChequeNumber("");
  setUpiId("");
  setSelectedBankId("");
  setVoucherNumber("");
  setInFavourOf("");

  setSelectedCreditor(null);
  setCreditorSearch("");

  setExpenseRows([
    {
      voucherNumber: "",
      creditorSearch: "",
      selectedCreditor: null,
      ledger: null,
      ledgerLabel: "",
      amount: "",
      description: ""
    }
  ]);
};

  useEffect(() => {
    if (isModalOpen) {
      resetAfterSave();
      if (!chequeDate) setChequeDate(expenseDate);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (paymentMethod === "Cheque") {
      setChequeDate(expenseDate);
    }
  }, [expenseDate, paymentMethod]);

  
const handleEdit = async (expense) => {

  try {

    const res = await axios.get(
      `${URL}/cem-payments/view/${expense._id}`,
      { headers: { Authorization: token } }
    );

    const data = res.data.data;

    setIsEditMode(true);
    setEditId(data._id);

    setIsModalOpen(true);

    setExpenseDate(data.date?.slice(0,10));

    setPaymentMethod(data.paymentMethod);

    setCashAccountType(data.cashAccountType || "");

    setSelectedBankId(data.bankId || "");

    setChequeNumber(data.chequeNumber || "");
    setChequeDate(data.chequeDate?.slice(0,10) || "");

    setInFavourOf(data.inFavourOf || "");

    const mappedRows = data.expenseLines.map((line) => ({
      voucherNumber: line.voucherNumber || "",
      creditorSearch: line.creditorName || "",
      selectedCreditor: line.creditorName
        ? {
            _id: line.creditorId,
            name: line.creditorName,
            creditor_id: line.creditorCode,
            phone: line.creditorPhone
          }
        : null,
      ledger: {
        ledgerName: line.ledgerName,
        ledgerCode: line.ledgerCode,
        categoryName: line.ledgerCategoryName,
        accountType: line.accountType
      },
      ledgerLabel: `(${line.ledgerCode}) ${line.ledgerName}`,
      amount: line.amount,
      description: line.description || ""
    }));

    setExpenseRows(mappedRows);

  } catch (err) {
    console.error("Failed to load payment for edit", err);
  }

};
  const openView = async (expense) => {

    try {

      const res = await axios.get(
        `${URL}/cem-payments/view/${expense._id}`,
        { headers: { Authorization: token } }
      );

      setSelectedExpense(res.data.data);
      setIsViewOpen(true);

    } catch (err) {
      console.error("Failed to fetch payment");
    }

  };

  const closeView = () => {
    setSelectedExpense(null);
    setIsViewOpen(false);
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get(`${URL}/cem-banks/list`, {
        headers: { Authorization: token },
        params: { status: "Active" },
      });
      setBankAccounts(res.data.banks || []);
    } catch (err) {
      console.error("Failed to fetch banks", err);
    }
  };

  useEffect(() => {
    if (paymentMethod === "Cheque") fetchBankAccounts();
    else setSelectedBankId("");
  }, [paymentMethod]);

  const validateExpenseForm = () => {
    const newErrors = {};
    if (!expenseDate) newErrors.expenseDate = "Date is required";
    if (!paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (validRows.length === 0) newErrors.rows = "At least one valid payment row is required";
    if (paymentMethod === "Cheque" && !chequeNumber.trim())
      newErrors.chequeNumber = "Cheque number is required";
    if (paymentMethod === "Cash" && !cashAccountType)
      newErrors.cashAccountType = "Cash account type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const debouncedPaymentLedgerSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setPaymentLedgerDropdown([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/ledger-search`, {
          headers: { Authorization: token },
          params: { q: val, type: "Payment" },
        });
        setPaymentLedgerDropdown(res.data || []);
      } catch {
        setPaymentLedgerDropdown([]);
      }
    }, 300)
  ).current;

  const debouncedCreditorSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setCreditorDropdown([]);
        return;
      }
      try {
        const res = await axios.get(
          `${URL}/creditors/search-for-payment?q=${val}`,
          { headers: { Authorization: token } }
        );
        setCreditorDropdown(res.data || []);
      } catch (err) {
        setCreditorDropdown([{ key: "none", label: "No Records Found" }]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (paymentMethod !== "Cheque") setChequeNumber("");
    if (paymentMethod !== "UPI") setUpiId("");
  }, [paymentMethod]);

  const closeAddExpenseModal = () => setIsModalOpen(false);

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${URL}/cem-payments/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm,
          startDate,
          endDate,
        },
      });
      setExpenses(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch expense error", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);

  const saveExpense = async () => {
    if (!validateExpenseForm()) return;
    setSaving(true);
    try {
      const payload = {
        totalAmount,
        expenseLines: validRows.map(row => ({
          voucherNumber: row.voucherNumber || "",

          creditorId: row.selectedCreditor?._id || null,
          creditorName: row.selectedCreditor?.name || "",
          creditorCode: row.selectedCreditor?.creditor_id || "",
          creditorPhone: row.selectedCreditor?.phone || "",

          ledgerName: row.ledger.ledgerName,
          ledgerCode: row.ledger.ledgerCode,
          ledgerCategoryName: row.ledger.categoryName,
          accountType: row.ledger.accountType,

          amount: Number(row.amount),
          description: row.description || ""
        })),
        date: expenseDate,
        paymentMethod,
        cashAccountType: paymentMethod === "Cash" ? cashAccountType : null,
        voucherNumber,
        inFavourOf,
        creditorId: selectedCreditor?._id || null,
        creditorName: selectedCreditor?.name || "",
        creditorCode: selectedCreditor?.creditor_id || "",
        creditorPhone: selectedCreditor?.phone || "",
        bankId: paymentMethod === "Cheque" ? selectedBankId : null,
        bankName:
          paymentMethod === "Cheque"
            ? bankAccounts.find(b => b._id === selectedBankId)?.bank_name || ""
            : "",
        bankAccountNumber:
          paymentMethod === "Cheque"
            ? bankAccounts.find(b => b._id === selectedBankId)?.account_number || ""
            : "",
        chequeNumber: paymentMethod === "Cheque" ? chequeNumber : "",
        chequeDate: paymentMethod === "Cheque" ? chequeDate : null,
        upiId: paymentMethod === "UPI" ? upiId : "",
      };

      let res;

if (isEditMode) {

  res = await axios.put(
    `${URL}/cem-payments/update/${editId}`,
    payload,
    { headers: { Authorization: token } }
  );

} else {

  res = await axios.post(
    `${URL}/cem-payments/add`,
    payload,
    { headers: { Authorization: token } }
  );

}

      await fetchExpenses();
      resetAfterSave();
      showToast("Success", res.data.message || "Expense saved");
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to save expense"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Payment</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
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
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset to page 1 on new search
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
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />


          </div>
          {["admin", "churchofficeworker"].includes(userRole) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Add Payment
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Payment ID</th>
                <th className="p-2 text-center">Trans No</th>
                <th className="p-2 text-center">Payment For</th>
                <th className="p-2 text-center">Creditors</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                expenses.map((exp, index) => (
                  <tr key={exp._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center font-medium text-gray-800">
                      {exp.autoExpenseId || "-"}
                    </td>
                    <td className="p-2 text-center font-medium">
                      {exp.transNo}
                    </td>

                    {/* 🔥 PAYMENT FOR = SUBCATEGORY */}
                    <td className="p-2 text-left">

                      {exp.paymentFor && (
                        <>
                          <span className="text-lavender--600 font-semibold">
                            ({exp.paymentFor.ledgerCode})
                          </span>{" "}
                          {exp.paymentFor.ledgerName}

                          {exp.paymentFor.totalLines > 1 && (
                            <span className="text-gray-600 font-medium">
                              {" "}+ {exp.paymentFor.totalLines - 1}
                            </span>
                          )}
                        </>
                      )}

                    </td>
                    <td className="p-2 text-center">

                      {exp.creditors.length > 0 ? (
                        <>
                          {exp.creditors[0].name}

                          {exp.creditors.length > 1 && (
                            <span className="text-gray-600">
                              {" "}+ {exp.creditors.length - 1}
                            </span>
                          )}
                        </>
                      ) : "-"}

                    </td>

                    <td className="p-2 text-center">
                      ₹{exp.amount}
                    </td>

                    <td className="p-2 text-center">
                      {new Date(exp.date).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-2 text-center flex items-center gap-2 justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => openView(exp)}
                      />
                      {["admin", "treasurer"].includes(userRole) &&
                        !exp.realised &&
                        !exp.expenseReturned && (

                          <BiSolidEditAlt
                            size={20}
                            className="cursor-pointer text-lavender--600"
                            onClick={() => handleEdit(exp)}
                          />

                        )}
                    </td>
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

      <JournalModal isOpen={isModalOpen} onClose={saving ? () => { } : closeAddExpenseModal} title={isEditMode ? "Edit Payment" : "Add Payment"}>
        <div className="max-h-[600px] overflow-y-auto overflow-visible relative">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={expenseDate}
                onChange={(e) => {
                  setExpenseDate(e.target.value);

                  // ✅ hide date error immediately when selected
                  setErrors((prev) => ({ ...prev, expenseDate: "" }));
                }}
              />
              {errors.expenseDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.expenseDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                {/* <option value="UPI">UPI</option> */}
              </select>
            </div>
            {paymentMethod === "Cash" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type of Cash A/c
                </label>
                <select
                  value={cashAccountType}
                  onChange={(e) => setCashAccountType(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Cash Account</option>
                  <option value="Cash on Hand A/c">Cash on Hand A/c</option>
                  <option value="Petty Cash A/c">Petty Cash A/c</option>
                </select>
              </div>
            )}
            {paymentMethod === "Cheque" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Bank</option>

                  {bankAccounts.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.bank_name} - {bank.account_number}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {paymentMethod === "Cheque" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cheque Number</label>
                <input
                  type="text"
                  placeholder="Enter cheque number"
                  value={chequeNumber}
                  onChange={(e) => {
                    setChequeNumber(e.target.value);
                    setErrors((p) => ({ ...p, chequeNumber: "" }));
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {errors.chequeNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.chequeNumber}</p>
                )}
              </div>
            )}
            {paymentMethod === "Cheque" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cheque Date</label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            {paymentMethod === "UPI" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                <input
                  type="text"
                  placeholder="Enter UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">In Favour Of</label>
              <input
                type="text"
                placeholder='Enter in favour of'
                value={inFavourOf}
                onChange={(e) => setInFavourOf(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50 mt-4">

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-2">
              <div className="block text-sm font-medium text-gray-700">Voucher No</div>
              <div className="block text-sm font-medium text-gray-700">Creditor</div>
              <div className="block text-sm font-medium text-gray-700">Payment For</div>
              <div className="block text-sm font-medium text-gray-700">Amount</div>
              <div className="block text-sm font-medium text-gray-700">Description</div>
            </div>

            {expenseRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
              >
                <input
                  type="text"
                  value={row.voucherNumber}
                  placeholder="Voucher No"
                  onChange={(e) => {
                    const copy = [...expenseRows];
                    copy[index].voucherNumber = e.target.value;
                    setExpenseRows(copy);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />

                <div>
                  <input
                    type="text"
                    ref={(el) => {
                      if (activeCreditorRowIndex === index) {
                        activeCreditorInputRef.current = el;
                      }
                    }}
                    placeholder="Search Creditor"
                    value={row.creditorSearch}
                    autoComplete="off"
                    onFocus={(e) => {
                      setActiveCreditorRowIndex(index);
                      setCreditorPosFromEl(e.target);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;

                      const copy = [...expenseRows];
                      copy[index].creditorSearch = val;
                      setExpenseRows(copy);

                      setActiveCreditorRowIndex(index);
                      setCreditorPosFromEl(e.target);

                      debouncedCreditorSearch(val);
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                {/* Ledger Search */}
                <div>
                  <input
                    type="text"
                    ref={(el) => {
                      if (activeRowIndex === index) {
                        activeLedgerInputRef.current = el;
                      }
                    }}
                    value={row.ledgerLabel}
                    placeholder="Search Ledger"
                    autoComplete="off"
                    onFocus={(e) => {
                      setActiveRowIndex(index);
                      setLedgerPosFromEl(e.target);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const copy = [...expenseRows];
                      copy[index].ledgerLabel = val;
                      copy[index].ledger = null;
                      setExpenseRows(copy);

                      setActiveRowIndex(index);
                      setLedgerPosFromEl(e.target);

                      debouncedPaymentLedgerSearch(val);
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>


                {/* Amount */}
                <input
                  type="text"
                  value={row.amount}
                  placeholder="Enter Amount"
                  onChange={(e) => {
                    const copy = [...expenseRows];
                    copy[index].amount = e.target.value.replace(/\D/g, "");
                    setExpenseRows(copy);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm text-right"
                />

                {/* Description + Buttons */}
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={row.description}
                    placeholder="Enter Description"
                    onChange={(e) => {
                      const copy = [...expenseRows];
                      copy[index].description = e.target.value;
                      setExpenseRows(copy);
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />

                  {index === expenseRows.length - 1 ? (
                    <button
                      type="button"
                      onClick={addExpenseRow}
                      disabled={!row.ledgerLabel || !row.amount}
                      className={`px-3 py-2 rounded text-white ${row.ledgerLabel && row.amount
                        ? "bg-lavender--600"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                    >
                      <FaPlus size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeExpenseRow(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {paymentLedgerDropdown.length > 0 &&
              ledgerDropdownPos &&
              document.getElementById("dropdown-root") &&
              createPortal(
                <ul
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] max-h-56 overflow-y-auto"
                  style={{
                    top: ledgerDropdownPos.top,
                    left: ledgerDropdownPos.left,
                    width: ledgerDropdownPos.width,
                  }}
                >
                  {paymentLedgerDropdown.map((item) => (
                    <li
                      key={item.key}
                      className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                      onMouseDown={() => {
                        const copy = [...expenseRows];

                        copy[activeRowIndex].ledgerLabel = `(${item.ledgerCode}) ${item.ledgerName}`;
                        copy[activeRowIndex].ledger = {
                          ledgerName: item.ledgerName,
                          ledgerCode: item.ledgerCode,
                          categoryName: item.categoryName,
                          accountType: item.accountType,
                          type: item.type,
                          bankId: item.bankId || null,
                          bankAccountNumber: item.bankAccountNumber || null,
                        };

                        setExpenseRows(copy);
                        setPaymentLedgerDropdown([]);
                        setLedgerDropdownPos(null);
                        setActiveRowIndex(null);
                      }}
                    >
                      <span className="text-lavender--600 font-semibold">
                        ({item.ledgerCode})
                      </span>{" "}
                      {item.ledgerName}
                      {item.type === "Bank" && ` - ${item.bankAccountNumber}`}
                    </li>
                  ))}
                </ul>,
                document.getElementById("dropdown-root")
              )}
            {creditorDropdown.length > 0 &&
              creditorDropdownPos &&
              document.getElementById("dropdown-root") &&
              createPortal(
                <ul
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] max-h-56 overflow-y-auto"
                  style={{
                    top: creditorDropdownPos.top,
                    left: creditorDropdownPos.left,
                    width: creditorDropdownPos.width,
                  }}
                >
                  {creditorDropdown.map((item) => (
                    <li
                      key={item.key}
                      className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                      onMouseDown={() => {
                        const copy = [...expenseRows];

                        copy[activeCreditorRowIndex].selectedCreditor = item;
                        copy[activeCreditorRowIndex].creditorSearch = item.label;

                        setExpenseRows(copy);
                        setCreditorDropdown([]);
                        setCreditorDropdownPos(null);
                        setActiveCreditorRowIndex(null);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>,
                document.getElementById("dropdown-root")
              )}

          </div>

          <div className="flex justify-end mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <input
                type="text"
                value={totalAmount}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={saveExpense}
              disabled={saving}
              className={`px-4 py-2 rounded text-white flex items-center gap-2
      ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
    `}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
            </button>
          </div>
        </div>
      </JournalModal>

      {/* ===== View Expense Modal ===== */}
      <Modal isOpen={isViewOpen} onClose={closeView} title="View Payment">
        <div className="flex flex-col w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
          {!selectedExpense ? (
            <p className="p-4 text-center text-gray-500">No payment selected.</p>
          ) : (
            <>
              {[
                {
                  label: "Payment ID",
                  value: selectedExpense.autoExpenseId
                },
                {
                  label: "Transaction No",
                  value: selectedExpense.transNo
                },
                {
                  label: "Payment For",
                  value:
                    selectedExpense.expenseLines?.length === 1 ? (
                      <>
                        <span className="text-lavender--600 font-semibold">
                          ({selectedExpense.expenseLines[0].ledgerCode})
                        </span>{" "}
                        {selectedExpense.expenseLines[0].ledgerName}
                      </>
                    ) : (
                      <span className="italic text-gray-500">
                        ({selectedExpense.expenseLines?.length}) Payments
                      </span>
                    ),
                },
                {
                  label: "Amount",
                  value: `₹ ${selectedExpense.totalAmount}`
                },
                {
                  label: "Date",
                  value: selectedExpense.date
                    ? new Date(selectedExpense.date).toLocaleDateString("en-GB")
                    : ""
                },
                {
                  label: "Payment Method",
                  value: selectedExpense.paymentMethod
                },
                {
                  label: "Cash Account",
                  value: selectedExpense.cashAccountType
                },
                {
                  label: "Cheque Number",
                  value: selectedExpense.chequeNumber
                },
                {
                  label: "Cheque Date",
                  value: selectedExpense.chequeDate
                    ? new Date(selectedExpense.chequeDate).toLocaleDateString("en-GB")
                    : ""
                },
                {
                  label: "UPI ID",
                  value: selectedExpense.upiId
                },
                {
                  label: "Bank",
                  value: selectedExpense.bankName
                    ? `${selectedExpense.bankName} – ${selectedExpense.bankAccountNumber}`
                    : ""
                },
                {
                  label: "In Favour Of",
                  value: selectedExpense.inFavourOf
                },
              ]
                .filter(item => item.value && item.value !== "")
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 pb-2"
                  >
                    <div className="col-span-12 sm:col-span-4 text-base font-semibold text-gray-700">
                      {item.label}
                    </div>

                    <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                      {item.value}
                    </div>
                  </div>
                ))}
              {/* ============================
           EXPENSE LINES TABLE
        ============================ */}
              {selectedExpense.expenseLines?.length > 0 && (
                <div className="mt-4 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Voucher</th>
                        <th className="p-2 text-left">Creditor</th>
                        <th className="p-2 text-left">Ledger</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExpense.expenseLines.map((line) => (
                        <tr key={line._id} className="border-b">
                          <td className="p-2">
                            {line.voucherNumber || "-"}
                          </td>
                          <td className="p-2">

                            {line.creditorName ? (
                              <>
                                {line.creditorName}
                                {line.creditorCode && (
                                  <span className="text-gray-500">
                                    {" "}({line.creditorCode})
                                  </span>
                                )}

                                {line.creditorPhone && (
                                  <div className="text-xs text-gray-500">
                                    {line.creditorPhone}
                                  </div>
                                )}
                              </>
                            ) : "-"}

                          </td>
                          <td className="p-2">
                            <span className="text-lavender--600 font-semibold">
                              ({line.ledgerCode})
                            </span>{" "}
                            {line.ledgerName}
                          </td>
                          <td className="p-2 text-right">
                            ₹ {line.amount}
                          </td>
                          <td className="p-2">
                            {line.description || "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td colSpan={3} className="p-2 text-right">
                          Total
                        </td>
                        <td className="p-2 text-right">
                          ₹ {selectedExpense.totalAmount}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </>

          )}

        </div>
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
