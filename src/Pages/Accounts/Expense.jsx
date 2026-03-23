import React, { useEffect, useRef, useState } from 'react';
import { FaEye, FaPlus, FaPrint } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import Pagination from '../../Components/Helpers/Pagination';
import JournalModal from '../../Components/Expense/JournalModal';
import { MdDelete } from 'react-icons/md';
import { createPortal } from "react-dom";
import PaymentModal from '../../Components/Expense/PaymentModal';
import { BiSolidEditAlt } from 'react-icons/bi';
import { jwtDecode } from "jwt-decode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload } from 'react-icons/fi';

import VoucherPrintModal from "../Voucher/VoucherPrint";

export const Expense = () => {
  const [userRole, setUserRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
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
  const [updating, setUpdating] = useState(false);
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
  const activeCreditorInputRef = useRef(null);
  const [creditorDropdownPos, setCreditorDropdownPos] = useState(null);
  const [activeCreditorRowIndex, setActiveCreditorRowIndex] = useState(null);

const [isVoucherPrintOpen, setIsVoucherPrintOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

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
        ledger: null, ledgerLabel: "", amount: "", description: "", voucherNumber: "",
        creditorSearch: "",
        selectedCreditor: null,
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
        setChequeDate(formatted);   // ✅ auto set cheque date

      } catch (err) {
        console.log("Failed to fetch IST date", err);
      }
    };

    fetchISTDate();
  }, []);

  const resetAfterSave = () => {
    // keep dates intact

    setPaymentMethod("Cash");
    setCashAccountType("");

    setChequeNumber("");
    setUpiId("");
    setSelectedBankId("");

    setVoucherNumber("");
    setInFavourOf("");

    setSelectedCreditor(null);
    setCreditorSearch("");
    setCreditorDropdown([]);
    setCreditorDropdownPos(null);
    setActiveCreditorRowIndex(null);


    setExpenseRows([
      {
        ledger: null,
        ledgerLabel: "",
        amount: "",
        description: ""
      }
    ]);

    setErrors({});
  };



  useEffect(() => {
    if (isModalOpen) {
      resetAfterSave();

      // keep already fetched IST date
      // only set cheque date if empty
      if (!chequeDate) {
        setChequeDate(expenseDate);
      }
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (paymentMethod === "Cheque") {
      setChequeDate(expenseDate);
    }
  }, [expenseDate, paymentMethod]);


  // Open view modal with an expense object
  const openView = (expense) => {
    setSelectedExpense(expense);
    setIsViewOpen(true);
  };

  // Close view modal and clear selection
  const closeView = () => {
    setSelectedExpense(null);
    setIsViewOpen(false);
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get(`${URL}/banks/list`, {
        headers: { Authorization: token },
        params: { status: "Active" },
      });

      setBankAccounts(res.data.banks || []);
    } catch (err) {
      console.error("Failed to fetch banks", err);
    }
  };


  useEffect(() => {
    if (paymentMethod === "Cheque") {
      fetchBankAccounts();
    } else {
      setSelectedBankId("");
    }
  }, [paymentMethod]);




  const validateExpenseForm = () => {
    const newErrors = {};

    if (!expenseDate) {
      newErrors.expenseDate = "Date is required";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    if (validRows.length === 0) {
      newErrors.rows = "At least one valid payment row is required";
    }

    if (paymentMethod === "Cheque" && !chequeNumber.trim()) {
      newErrors.chequeNumber = "Cheque number is required";
    }

    if (paymentMethod === "Cash" && !cashAccountType) {
      newErrors.cashAccountType = "Cash account type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

const numberToWords = (num) => {
  if (!num) return "";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
    "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertHundreds = (n) => {
    let str = "";

    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n > 19) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  };

  let result = "";

  if (num >= 10000000) {
    result += convertHundreds(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }

  if (num >= 100000) {
    result += convertHundreds(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }

  if (num >= 1000) {
    result += convertHundreds(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  if (num > 0) {
    result += convertHundreds(num);
  }

  return result.trim() + " Only";
};


const getVoucherData = () => {
  if (!selectedExpense) return null;

  const date = new Date(selectedExpense.date);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());

  const firstLine = selectedExpense.expenseLines?.[0] || {};

  const invoiceNumber = `PUR${String(
    expenses.findIndex(e => e._id === selectedExpense._id) + 1
  ).padStart(5, "0")}`;

  // ✅ Format cheque date
  let chequeDateFormatted = "";
  if (selectedExpense.chequeDate) {
    const cDate = new Date(selectedExpense.chequeDate);
    chequeDateFormatted = cDate.toLocaleDateString("en-GB"); // dd/mm/yyyy
  }

  return {
    voucherNo: invoiceNumber,
    dd,
    mm,
    yyyy,
    coimbatore: Number(selectedExpense.totalAmount).toLocaleString("en-IN") || "",
    rupees: numberToWords(selectedExpense.totalAmount),
    towards: firstLine.ledgerName || "",

    // ✅ NEW FIELDS
    chequeNo: selectedExpense.chequeNumber || "",
    chequeDate: chequeDateFormatted,
bank: selectedExpense.bankName || "",
    inFavourOf: selectedExpense.inFavourOf || "",
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


  const closeAddExpenseModal = () => {
    setIsModalOpen(false);
  };
  const closeEditExpenseModal = () => {
    setIsEditModalOpen(false);
  };
  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${URL}/church-expense/list`, {
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

        inFavourOf,


        // 🔹 Bank
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



      const res = await axios.post(
        `${URL}/church-expense/add`,
        payload,
        { headers: { Authorization: token } }
      );

      await fetchExpenses();

      resetAfterSave();

      showToast("Success", res.data.message || "Expense saved");
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to save expense"
      );
    } finally {
      setSaving(false); // 🔓 unlock modal
    }
  };

  const openEdit = (expense) => {
    setSelectedExpense(expense);

    // 🔥 populate fields
    setExpenseDate(expense.date?.slice(0, 10));
    setPaymentMethod(expense.paymentMethod);
    setCashAccountType(expense.cashAccountType || "");
    setChequeNumber(expense.chequeNumber || "");
    setChequeDate(expense.chequeDate?.slice(0, 10) || "");
    setSelectedBankId(expense.bankId || "");
    setInFavourOf(expense.inFavourOf || "");

    // 🔥 map rows
    const mappedRows = (expense.expenseLines || []).map((l) => ({
      voucherNumber: l.voucherNumber || "",
      creditorSearch: l.creditorName || "",
      selectedCreditor: l.creditorId
        ? {
          _id: l.creditorId,
          name: l.creditorName,
          creditor_id: l.creditorCode,
          phone: l.creditorPhone,
          label: l.creditorName,
        }
        : null,
      ledger: {
        ledgerName: l.ledgerName,
        ledgerCode: l.ledgerCode,
        categoryName: l.ledgerCategoryName,
        accountType: l.accountType,
      },
      ledgerLabel: `(${l.ledgerCode}) ${l.ledgerName}`,
      amount: l.amount,
      description: l.description || "",
    }));

    setExpenseRows(mappedRows.length ? mappedRows : expenseRows);

    setIsEditModalOpen(true);
  };

  const updateExpense = async () => {
    if (!validateExpenseForm()) return;

    setUpdating(true);

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
        cashAccountType,
        inFavourOf,
        bankId: selectedBankId,
        chequeNumber,
        chequeDate,
        upiId,
      };

      await axios.put(
        `${URL}/church-expense/update/${selectedExpense._id}`,
        payload,
        { headers: { Authorization: token } }
      );

      await fetchExpenses();
      setIsEditModalOpen(false);
      showToast("Success", "Expense updated successfully");

    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to update expense"
      );
    } finally {
      setUpdating(false);
    }
  };

 const downloadPayments = async () => {
  if (!startDate || !endDate) {
    showToast("Failed", "Please select start and end date");
    return;
  }

  try {
    const res = await axios.get(
      `${URL}/church-expense/download-datewise`,
      {
        headers: { Authorization: token },
        params: { startDate, endDate },
      }
    );

    const data = res.data.data || [];

    if (data.length === 0) {
      showToast("Failed", "No data found");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(10);
    doc.text(
      `PAYMENTS REPORT (${startDate} to ${endDate})`,
      105,
      10,
      { align: "center" }
    );

    const tableRows = [];

    data.forEach((exp, index) => {
      const firstLine = exp.expenseLines?.[0] || {};

      const payFor = firstLine.ledgerCode
        ? `(${firstLine.ledgerCode}) ${firstLine.ledgerName}`
        : "";

      const creditor = firstLine.creditorName
        ? `${firstLine.creditorCode || ""} ${firstLine.creditorName}`
        : "";

      tableRows.push([
        index + 1,
        new Date(exp.date).toLocaleDateString("en-GB"),
        exp.transNo || "",
        exp.autoExpenseId || "",
        payFor,
        creditor,
        exp.totalAmount,
      ]);

      let extraInfoParts = [];

      if (firstLine.description) {
        extraInfoParts.push(`Desc: ${firstLine.description}`);
      }

      if (exp.bankName) {
        extraInfoParts.push(`Bank: ${exp.bankName}`);
      }

      if (exp.chequeNumber) {
        extraInfoParts.push(`Cheque: ${exp.chequeNumber}`);
      }

      if (exp.upiId) {
        extraInfoParts.push(`UPI: ${exp.upiId}`);
      }

      if (exp.chequeDate) {
        extraInfoParts.push(
          `Chq Date: ${new Date(exp.chequeDate).toLocaleDateString("en-GB")}`
        );
      }

      const fullDescription = extraInfoParts.join(" | ");

      if (fullDescription) {
        tableRows.push([
          {
            content: fullDescription,
            colSpan: 7,
            styles: {
              fontSize: 5.5,
              halign: "left",
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
            },
          },
        ]);
      }
    });

    autoTable(doc, {
      startY: 15,
      head: [[
        "Sl No",
        "Date",
        "Trans No",
        "Rec ID",
        "Pay For",
        "Creditor",
        "Amount"
      ]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 6,
        cellPadding: 1.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
      },
      headStyles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        6: { halign: "right" },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }

    doc.save(`Payments_${startDate}_to_${endDate}.pdf`);

    showToast("Success", "Payments report downloaded");
  } catch (err) {
    console.error("Download error", err);
    showToast("Failed", "Download failed");
  }
};
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Payment</h1>
          {["admin", "treasurer"].includes(userRole) && (
            <div className="flex items-center justify-between gap-3">
              <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={downloadPayments}/>
              <FaPrint size={20} className="text-lavender--600 cursor-not-allowed" title="Print" />
            </div>
          )}
        </div>
        
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
                    <td className="p-2 text-center text-gray-800">
                      {exp.transNo || "-"}
                    </td>

                    {/* 🔥 PAYMENT FOR = SUBCATEGORY */}
                    <td className="p-2 text-left">
                      {exp.expenseLines?.length > 0 && (
                        <>
                          <span className="text-lavender--600 font-semibold">
                            ({exp.expenseLines[0].ledgerCode})
                          </span>{" "}
                          {exp.expenseLines[0].ledgerName}

                          {exp.expenseLines.length > 1 && (
                            <span className="text-gray-600 font-medium">
                              {" "}+ {exp.expenseLines.length - 1}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="p-2 text-center">₹{exp.totalAmount}</td>

                    <td className="p-2 text-center">
                      {new Date(exp.date).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-2 text-center flex items-center gap-3 justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => openView(exp)}
                      />
                      {["admin", "treasurer"].includes(userRole) && !exp.realised && (
                        <BiSolidEditAlt size={20} className="cursor-pointer text-lavender--600" onClick={() => openEdit(exp)} />)}
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

      <PaymentModal isOpen={isModalOpen} onClose={saving ? () => { } : closeAddExpenseModal} title="Add Payment">
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
                      {bank.bank_name}
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
              <div className="text-sm font-medium text-gray-700">Voucher No</div>
              <div className="text-sm font-medium text-gray-700">Creditor</div>
              <div className="text-sm font-medium text-gray-700">Payment For</div>
              <div className="text-sm font-medium text-gray-700">Amount</div>
              <div className="text-sm font-medium text-gray-700">Description</div>
            </div>


            {expenseRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
              >
                {/* Voucher */}
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
                {/* Creditor */}
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
            {/* ⭐ FLOATING CREDITOR DROPDOWN */}
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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </PaymentModal>

      {/* ===== View Expense Modal ===== */}
<Modal
  isOpen={isViewOpen}
  onClose={closeView}
  title={"View Expense"}
>
  {/* 🔥 PRINT ICON (ABSOLUTE POSITIONED) */}
  <div className="relative">
    <FaPrint
      size={18}
      className="text-lavender--600 cursor-pointer absolute right-10 top-[-48px]"
      title="Print Voucher"
      onClick={() => setIsVoucherPrintOpen(true)}
    />
  </div>

  <div className="flex flex-col w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
    {!selectedExpense ? (
      <p className="p-4 text-center text-gray-500">No payment selected.</p>
    ) : (
      <>
        {[
          {
            label: "ID",
            value: selectedExpense.autoExpenseId,
          },
          {
            label: "Date",
            value: selectedExpense.date
              ? new Date(selectedExpense.date).toLocaleDateString("en-GB")
              : "",
          },
          {
            label: "Trans No",
            value: selectedExpense.transNo,
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
            label: "Payment Method",
            value: selectedExpense.paymentMethod,
          },
          {
            label: "Cash Acc Type",
            value: selectedExpense.cashAccountType,
          },
          {
            label: "Voucher No.",
            value: selectedExpense.voucherNumber,
          },
          {
            label: "In Favour Of",
            value: selectedExpense.inFavourOf,
          },
          {
            label: "Creditor",
            value: selectedExpense.creditorName
              ? `${selectedExpense.creditorName} (${selectedExpense.creditorCode})`
              : "",
            extra: selectedExpense.creditorPhone,
          },
          {
            label: "Bank",
            value: selectedExpense.bankName || "",
          },
          {
            label: "Cheque No.",
            value: selectedExpense.chequeNumber,
          },
          {
            label: "Cheque Date",
            value: selectedExpense.chequeDate
              ? new Date(selectedExpense.chequeDate).toLocaleDateString("en-GB")
              : "",
          },
          {
            label: "UPI ID",
            value: selectedExpense.upiId,
          },
          {
            label: "Description",
            value: selectedExpense.description,
          },
        ]
          .filter(item => item.value)
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
                {item.extra && (
                  <div className="text-sm text-gray-500">
                    {item.extra}
                  </div>
                )}
              </div>
            </div>
          ))}

        {selectedExpense.expenseLines?.length > 1 && (
          <div className="mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Ledger</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {selectedExpense.expenseLines.map((line) => (
                  <tr key={line._id}>
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
                  <td className="p-2 text-right">Total</td>
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

      <PaymentModal isOpen={isEditModalOpen} onClose={updating ? () => { } : closeEditExpenseModal} title="Edit Payment">
        <div className="max-h-[600px] overflow-y-auto overflow-visible relative">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                readOnly
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
                  readOnly
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
              <div className="text-sm font-medium text-gray-700">Voucher No</div>
              <div className="text-sm font-medium text-gray-700">Creditor</div>
              <div className="text-sm font-medium text-gray-700">Payment For</div>
              <div className="text-sm font-medium text-gray-700">Amount</div>
              <div className="text-sm font-medium text-gray-700">Description</div>
            </div>


            {expenseRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
              >
                {/* Voucher */}
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
                {/* Creditor */}
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
            {/* ⭐ FLOATING CREDITOR DROPDOWN */}
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
              onClick={updateExpense}
              disabled={updating}
              className={`px-4 py-2 rounded text-white ${updating ? "bg-gray-400" : "bg-lavender--600"
                }`}
            >
              {updating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </PaymentModal>


<VoucherPrintModal
  isOpen={isVoucherPrintOpen}
  onClose={() => setIsVoucherPrintOpen(false)}
  voucherData={getVoucherData()}
/>

      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  )
}
