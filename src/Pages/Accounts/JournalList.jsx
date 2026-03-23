import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus, FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { createPortal } from "react-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";
import JournalModal from "../../Components/Expense/JournalModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { BiSolidEditAlt } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const JournalList = () => {
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);

  // list + pagination state
  const [journals, setJournals] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  // filters / search
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });

  // header & entries
  const [AccType, setAccType] = useState("Credit");
  const [journalDate, setJournalDate] = useState(""); // bound to Date input
  const [headerAccount, setHeaderAccount] = useState(""); // visible label
  const [headerLedger, setHeaderLedger] = useState(null); // store full ledger object when selected
  const [headerAmount, setHeaderAmount] = useState("");

  // creditor unified search returns name-only that goes into creditorName in schema
  const [creditorSearch, setCreditorSearch] = useState("");
  const [activeCreditorRow, setActiveCreditorRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
const [editId, setEditId] = useState(null);

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

  // entries - store both display fields and ledger objects for payload
const [entries, setEntries] = useState([
  {
    accType: AccType,
    debitAccount: "",
    debitAccountCode: "",
    debitLedger: null,
    creditAccount: "",
    creditAccountCode: "",
    creditLedger: null,

    creditorSearch: "",
    creditor: null,

    amount: "",
    description: ""
  }
]);

  // dropdown / keyboard refs
  const activeInputRef = useRef(null);
  const creditorItemRefs = useRef([]);
  const [activeTarget, setActiveTarget] = useState({ scope: null, index: null });
  const [dropdownPos, setDropdownPos] = useState(null);
  const [accountDropdown, setAccountDropdown] = useState([]);
  const [creditorDropdown, setCreditorDropdown] = useState([]);
  const [creditorDropdownPos, setCreditorDropdownPos] = useState(null);
  const [activeCreditorIndex, setActiveCreditorIndex] = useState(-1);
  const [selectedCreditor, setSelectedCreditor] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);


  // debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ---------------- Ledger search (calls server route you shared) ----------------
  const debouncedAccountSearch = useRef(
    debounce(async (val) => {
      if (!val) return setAccountDropdown([]);
      try {
        // server mounts ledger search at /api/ledger-search
        const res = await axios.get(`${URL}/ledger-search?q=${encodeURIComponent(val)}`, {
          headers: { Authorization: token }
        });

        // map to the shape we expect in dropdown
        const mapped = (res.data || []).map((item) => {
          if (item.key === "none") return item;
          return {
            key: item.key,
            label: item.ledgerName,
            ledgerCode: item.ledgerCode,
            category: item.categoryName,
            raw: item // keep raw for full ledger object if available
          };
        });

        setAccountDropdown(mapped);
      } catch (err) {
        setAccountDropdown([{ key: "none", label: "No Records Found" }]);
      }
    }, 300)
  ).current;

  // ---------------- Creditor unified search ----------------
  const debouncedCreditorSearch = useRef(
    debounce(async (val) => {
      if (!val) return setCreditorDropdown([]);
      try {
        const res = await axios.get(`${URL}/creditor-search/unified`, {
          headers: { Authorization: token },
          params: { query: val }
        });
        setCreditorDropdown(res.data.data || []);
        setActiveCreditorIndex(-1);
      } catch (err) {
        setCreditorDropdown([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (activeCreditorIndex >= 0 && creditorItemRefs.current[activeCreditorIndex]) {
      creditorItemRefs.current[activeCreditorIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeCreditorIndex]);

  // helpers to compute dropdown position
  const setPosFromEl = (el) => {
    if (!el) return setDropdownPos(null);
    const rect = el.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
  };

  const setCreditorPosFromEl = (el) => {
    if (!el) return setCreditorDropdownPos(null);
    const rect = el.getBoundingClientRect();
    setCreditorDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
  };

  // when modal closes clear dropdowns
  useEffect(() => {
    if (!isModalOpen) {
      setAccountDropdown([]);
      setDropdownPos(null);
      setActiveTarget({ scope: null, index: null });
      setCreditorDropdown([]);
      setCreditorDropdownPos(null);
      setActiveCreditorIndex(-1);
    }
  }, [isModalOpen]);

  // ---------------- Fetch journal list (GET /api/journal/list) ----------------
  const fetchJournals = async () => {
    try {
      const params = {
        page: CurrentPage,
        limit: rowsPerPage
      };
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${URL}/journals/list`, {
        headers: { Authorization: token },
        params
      });

      setJournals(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch journals", err);
    }
  };

  useEffect(() => {
    fetchJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);

  // ---------------- Entry helpers ----------------
  const totalRowAmount = entries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const isAmountMatched = Number(headerAmount) > 0 && Number(headerAmount) === totalRowAmount;

const addRow = () => {
  setEntries([
    ...entries,
    {
      accType: AccType,
      debitAccount: "",
      debitAccountCode: "",
      debitLedger: null,
      creditAccount: "",
      creditAccountCode: "",
      creditLedger: null,

      creditorSearch: "",
      creditor: null,

      amount: "",
      description: ""
    }
  ]);
};

  const removeRow = (i) => {
    setEntries(entries.filter((_, idx) => idx !== i));
  };

  // set typed account value (clears any selected ledger object)
  const setAccountValue = (i, val) => {
    const copy = [...entries];
    if (AccType === "Debit") {
      copy[i].creditAccount = val;
      copy[i].creditLedger = null;
      copy[i].creditAccountCode = "";
    } else {
      copy[i].debitAccount = val;
      copy[i].debitLedger = null;
      copy[i].debitAccountCode = "";
    }
    setEntries(copy);
  };

  // when selecting a ledger from dropdown
  const handleAccountSelect = (item) => {
    if (!item || item.key === "none") return;

    if (activeTarget.scope === "header") {
      setHeaderAccount(item.label);
      // store headerLedger as full object expected by backend (try `raw` then map)
      const raw = item.raw || item;
      setHeaderLedger({
        key: raw.key || raw.ledgerCode || "",
        ledgerName: raw.ledgerName || raw.label || item.label,
        ledgerCode: raw.ledgerCode || "",
        categoryName: raw.categoryName || raw.category || "",
        accountType: raw.accountType || ""
      });
    } else if (activeTarget.scope === "row" && activeTarget.index != null) {
      const copy = [...entries];
      const idx = activeTarget.index;
      const raw = item.raw || item;
      const ledgerObject = {
        key: raw.key || raw.ledgerCode || "",
        ledgerName: raw.ledgerName || raw.label || item.label,
        ledgerCode: raw.ledgerCode || "",
        categoryName: raw.categoryName || raw.category || "",
        accountType: raw.accountType || ""
      };

      if (AccType === "Debit") {
        copy[idx].creditAccount = item.label;
        copy[idx].creditAccountCode = item.ledgerCode || "";
        copy[idx].creditLedger = ledgerObject;
      } else {
        copy[idx].debitAccount = item.label;
        copy[idx].debitAccountCode = item.ledgerCode || "";
        copy[idx].debitLedger = ledgerObject;
      }
      setEntries(copy);
    }

    // close dropdown
    setAccountDropdown([]);
    setDropdownPos(null);
    setActiveTarget({ scope: null, index: null });
  };

  // creditor select (only name required by schema)
const handleCreditorSelect = (item) => {
  if (!item) return;

  // HEADER creditor
  if (activeCreditorRow === null) {
    setSelectedCreditor(item);
    setCreditorSearch(item.name);
  }

  // ROW creditor
  else {
    const copy = [...entries];
    copy[activeCreditorRow].creditorSearch = item.name;
    copy[activeCreditorRow].creditor = item;

    setEntries(copy);
  }

  setCreditorDropdown([]);
  setActiveCreditorIndex(-1);
  setActiveCreditorRow(null);
};

  const handleEdit = async (id) => {
  try {
    const res = await axios.get(`${URL}/journals/${id}`, {
      headers: { Authorization: token }
    });

    const data = res.data.data;

    setIsModalOpen(true);
    setIsEditMode(true);
    setEditId(data._id);

    setJournalDate(data.date?.slice(0, 10));
    setAccType(data.accType);
    setHeaderAccount(data.headerLedger?.ledgerName || "");
    setHeaderLedger(data.headerLedger || null);
    setHeaderAmount(data.totalAmount);

    setCreditorSearch(data.creditorName || "");

    setSelectedCreditor({
      id: data.creditorId,
      name: data.creditorName,
      phone: data.creditorPhone
    });

    // convert backend entries → frontend rows
    const mappedEntries = data.entries.map((e) => ({
      accType: data.accType,
      debitAccount: data.accType === "Credit" ? e.ledger?.ledgerName : "",
      creditAccount: data.accType === "Debit" ? e.ledger?.ledgerName : "",
      debitAccountCode: e.ledger?.ledgerCode || "",
      creditAccountCode: e.ledger?.ledgerCode || "",
      debitLedger: e.type === "Debit" ? e.ledger : null,
      creditLedger: e.type === "Credit" ? e.ledger : null,
      amount: e.amount,
      description: e.description
    }));

    setEntries(mappedEntries);

  } catch (err) {
    console.error("Failed to load journal", err);
  }
};

const showToast = (status, message) => {
  setResponse({ status: null, message: "" });
  setTimeout(() => setResponse({ status, message }), 10);
  setTimeout(() => setResponse({ status: null, message: "" }), 3000);
};
  // ---------------- Save journal (POST /api/journal/add) ----------------
  const handleSave = async () => {
    // client-side validation
    if (!journalDate) {
      showToast("Failed", "Please select date");
      return;
    }
    if (!headerAmount || Number(headerAmount) <= 0) {
      showToast("Failed", "Please enter header amount");
      return;
    }
    if (!isAmountMatched) {
      showToast("Failed", "Header amount must equal sum of row amounts");
      return;
    }
    if (!entries.length) {
      showToast("Failed", "Add at least one entry");
      return;
    }

    setSaving(true);

    // build entries array for schema
    const payloadEntries = entries.map((r) => {
  const isDebitHeader = AccType === "Debit";
  const type = isDebitHeader ? "Credit" : "Debit";

  const ledgerSource = isDebitHeader
    ? r.creditLedger || {}
    : r.debitLedger || {};

  const ledgerNameFallback = isDebitHeader
    ? r.creditAccount
    : r.debitAccount;

  return {
    type,

    ledger: {
      key: ledgerSource.key || "",
      ledgerName:
        ledgerSource.ledgerName || ledgerNameFallback || "",
      ledgerCode: ledgerSource.ledgerCode || "",
      categoryName: ledgerSource.categoryName || "",
      accountType: ledgerSource.accountType || "",
      incomeType: ledgerSource.incomeType || ""
    },

    creditorId: r.creditor?.id || "",
    creditorName: r.creditor?.name || "",
    creditorPhone: r.creditor?.phone || "",

    amount: Number(r.amount || 0),
    description: r.description || ""
  };
});

    const payload = {
      date: new Date(journalDate).toISOString(),
      accType: AccType,
      creditorId: selectedCreditor?.id || "",       // CRD00003 / MBR01032/1
      creditorName: selectedCreditor?.name || "",
      creditorPhone: selectedCreditor?.phone || "",
      headerLedger: headerLedger
        ? {
          key: headerLedger.key || headerLedger.ledgerCode || "",
          ledgerName: headerLedger.ledgerName || headerAccount,
          ledgerCode: headerLedger.ledgerCode || ""
        }
        : { ledgerName: headerAccount || "" },
      entries: payloadEntries,
      totalAmount: Number(headerAmount)
    };

    try {
      // const res = await axios.post(`${URL}/journals/add`, payload, {
      //   headers: { Authorization: token }
      // });
      let res;

      if (isEditMode) {
        res = await axios.put(
          `${URL}/journals/update/${editId}`,
          payload,
          { headers: { Authorization: token } }
        );
      } else {
        res = await axios.post(
          `${URL}/journals/add`,
          payload,
          { headers: { Authorization: token } }
        );
      }

      showToast("Success", res.data.message || "Saved");
      setIsModalOpen(false);

      // lightly reset form
      setJournalDate("");
      setHeaderAccount("");
      setHeaderLedger(null);
      setHeaderAmount("");
      setCreditorSearch("");
      setEntries([
        {
          accType: AccType,
          debitAccount: "",
          debitAccountCode: "",
          debitLedger: null,
          creditAccount: "",
          creditAccountCode: "",
          creditLedger: null,
          amount: "",
          description: ""
        }
      ]);

      // refresh list and reset to first page
      setCurrentPage(1);
      fetchJournals();
    } catch (err) {
      console.error("Save journal error:", err);
      showToast("Failed", err.response?.data?.message || "Server error");
    }finally {
    setSaving(false); // 🔓 unlock button
  }
  };
const downloadJournals = async () => {

  if (!startDate || !endDate) {
    showToast("Failed", "Please select start and end date");
    return;
  }

  try {

    const res = await axios.get(
      `${URL}/journals/download-datewise`,
      {
        headers: { Authorization: token },
        params: { startDate, endDate }
      }
    );

    const data = res.data.data || [];

    if (data.length === 0) {
      showToast("Failed", "No journals found");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(10);

    doc.text(
      `JOURNAL REPORT (${startDate} to ${endDate})`,
      105,
      10,
      { align: "center" }
    );

    const tableRows = [];

    data.forEach((journal, index) => {

      const entries = journal.entries || [];

      const headerLedger =
        `(${journal.headerLedger?.ledgerCode}) ${journal.headerLedger?.ledgerName}`;

      const creditor =
        journal.creditorName
          ? `${journal.creditorName} (${journal.creditorId})`
          : "";

      // HEADER ROW
      tableRows.push([
        index + 1,
        new Date(journal.date).toLocaleDateString("en-GB"),
        journal.transNo,
        journal.autoJournalId,
        journal.accType === "Debit" ? headerLedger : "",
        journal.accType === "Credit" ? headerLedger : "",
        creditor,
        journal.totalAmount
      ]);

      // ENTRY ROWS
      entries.forEach((entry) => {

        const debit =
          entry.type === "Debit"
            ? `(${entry.ledger?.ledgerCode}) ${entry.ledger?.ledgerName}`
            : "";

        const credit =
          entry.type === "Credit"
            ? `(${entry.ledger?.ledgerCode}) ${entry.ledger?.ledgerName}`
            : "";

        tableRows.push([
          "",
          "",
          "",
          "",
          debit,
          credit,
          entry.creditorName || "",
          entry.amount
        ]);
      });

      // TOTAL ROW
      tableRows.push([
        "",
        "",
        "",
        "",
        "",
        "Total",
        "",
        journal.totalAmount
      ]);

    });

    autoTable(doc, {
      startY: 15,
      head: [[
        "Sl No",
        "Date",
        "Trans No",
        "Journal ID",
        "Debit",
        "Credit",
        "Creditor",
        "Amount"
      ]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 6,
        cellPadding: 1.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0]
      },
      headStyles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        7: { halign: "right" }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();

    doc.setFontSize(8);

    for (let i = 1; i <= pageCount; i++) {

      doc.setPage(i);

      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }

    doc.save(`Journal_${startDate}_to_${endDate}.pdf`);

    showToast("Success", "Journal report downloaded");

  } catch (err) {

    console.error("Download error", err);

    showToast("Failed", "Download failed");
  }
};
  // ---------------- render ----------------
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Journal</h1>
          {["admin", "treasurer"].includes(userRole) && (
            <div className="flex items-center justify-between gap-3">
              <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={downloadJournals}/>
              <FaPrint size={20} className="text-lavender--600 cursor-not-allowed" title="Print" />
            </div>
          )}
        </div>


        <div className="flex items-center justify-between p-2">
          <div>
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Add Journal
          </button>
        </div>

        {/* table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Trans No</th>
                <th className="p-2 text-center">Journal ID</th>
                <th className="p-2 text-center">Debit</th>
                <th className="p-2 text-center">Creditor</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {journals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">No journal entries found</td>
                </tr>
              ) : (
                journals.map((j, index) => (
                  <tr key={j._id} className="border-b">
                    <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center">{new Date(j.date).toLocaleDateString("en-GB")}</td>
                    <td className="p-2 text-center font-medium">{j.transNo}</td>
                    <td className="p-2 text-center font-medium">{j.autoJournalId}</td>
                    <td className="p-2 text-left">{j.headerLedger?.ledgerName ?? "-"}</td>
                    <td className="p-2 text-left">{j.creditorName || "-"}</td>
                    <td className="p-2 text-center">₹{j.totalAmount ?? 0}</td>
                    <td className="p-2 text-center flex items-center gap-3 justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={async () => {
                          try {
                            const res = await axios.get(
                              `${URL}/journals/${j._id}`,
                              { headers: { Authorization: token } }
                            );

                            setSelectedJournal(res.data.data);
                            setIsViewOpen(true);
                          } catch (err) {
                            console.error("Failed to fetch journal", err);
                          }
                        }}

                      />
                      {["admin", "treasurer"].includes(userRole) && (
                        <BiSolidEditAlt size={20} className="cursor-pointer text-lavender--600" onClick={() => handleEdit(j._id)}/>)}</td>
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

      {/* ---------------- Journal Modal ---------------- */}
      <JournalModal isOpen={isModalOpen} onClose={saving ? () => { } : () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditId(null);
      }} title={isEditMode ? "Edit Journal" : "Add Journal"}>
        <div className="max-h-[600px] overflow-y-auto overflow-visible relative">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={journalDate} onChange={(e) => setJournalDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            {/* Debit or Credit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Debit or Credit</label>
              <select value={AccType} onChange={(e) => setAccType(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            {/* Header account input */}
            {AccType === "Credit" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Account</label>
                <input
                  type="text"
                  placeholder="Search Credit Account"
                  value={headerAccount}
                  autoComplete="off"
                  onFocus={(e) => { activeInputRef.current = e.target; setActiveTarget({ scope: "header", index: null }); setPosFromEl(e.target); }}
                  onChange={(e) => { const val = e.target.value; setHeaderAccount(val); debouncedAccountSearch(val); }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Debit Account</label>
                <input
                  type="text"
                  placeholder="Search Debit Account"
                  value={headerAccount}
                  autoComplete="off"
                  onFocus={(e) => { activeInputRef.current = e.target; setActiveTarget({ scope: "header", index: null }); setPosFromEl(e.target); }}
                  onChange={(e) => { const val = e.target.value; setHeaderAccount(val); debouncedAccountSearch(val); }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="text" value={headerAmount} onChange={(e) => setHeaderAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            {/* Creditors */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Creditors</label>
              <input
                type="text"
                value={creditorSearch}
                placeholder="Search Creditors"
                autoComplete="off"
                onFocus={(e) => setCreditorPosFromEl(e.target)}
                onChange={(e) => { const val = e.target.value; setCreditorSearch(val); debouncedCreditorSearch(val); }}
                onKeyDown={(e) => {
                  if (!creditorDropdown.length) return;
                  if (e.key === "ArrowDown") { e.preventDefault(); setActiveCreditorIndex((p) => (p < creditorDropdown.length - 1 ? p + 1 : 0)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActiveCreditorIndex((p) => (p > 0 ? p - 1 : creditorDropdown.length - 1)); }
                  if (e.key === "Enter" && activeCreditorIndex >= 0) { e.preventDefault(); handleCreditorSelect(creditorDropdown[activeCreditorIndex]); }
                  if (e.key === "Escape") setCreditorDropdown([]);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          {/* entries */}
          <div className="p-4 border rounded-lg bg-blue-50 mt-4">
            {entries.map((row, index) => {
              const isDebit = AccType === "Debit";
              const accountValue = isDebit ? row.creditAccount : row.debitAccount;

              return (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{isDebit ? "Credit Account" : "Debit Account"}</label>
                    <input
                      type="text"
                      value={accountValue}
                      placeholder={`Search ${isDebit ? "Credit" : "Debit"} Account`}
                      autoComplete="off"
                      onFocus={(e) => { activeInputRef.current = e.target; setActiveTarget({ scope: "row", index }); setPosFromEl(e.target); }}
                      onChange={(e) => { setAccountValue(index, e.target.value); debouncedAccountSearch(e.target.value); }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="text"
                      value={row.amount}
                      placeholder="Enter Amount"
                      onChange={(e) => { const copy = [...entries]; copy[index].amount = e.target.value.replace(/[^0-9]/g, ""); setEntries(copy); }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  {/* Creditor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Creditor
                    </label>

                    <input
                      type="text"
                      value={row.creditorSearch}
                      placeholder="Search Creditor"
                      autoComplete="off"
                      onFocus={(e) => {
  setActiveCreditorRow(index);
  setCreditorPosFromEl(e.target);
}}
                      onChange={(e) => {
                        const val = e.target.value;

                        setCreditorPosFromEl(e.target); // ⭐ IMPORTANT

                        const copy = [...entries];
                        copy[index].creditorSearch = val;
                        copy[index].creditor = null;
                        setEntries(copy);

                        debouncedCreditorSearch(val);
                      }}
                      onKeyDown={(e) => {
                        if (!creditorDropdown.length) return;

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveCreditorIndex((p) =>
                            p < creditorDropdown.length - 1 ? p + 1 : 0
                          );
                        }

                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveCreditorIndex((p) =>
                            p > 0 ? p - 1 : creditorDropdown.length - 1
                          );
                        }

                        if (e.key === "Enter" && activeCreditorIndex >= 0) {
                          e.preventDefault();

                          const selected = creditorDropdown[activeCreditorIndex];

                          const copy = [...entries];
                          copy[index].creditorSearch = selected.name;
                          copy[index].creditor = selected;

                          setEntries(copy);
                          setCreditorDropdown([]);
                        }
                      }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={row.description}
                        placeholder="Enter Description"
                        onChange={(e) => { const copy = [...entries]; copy[index].description = e.target.value; setEntries(copy); }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {index === entries.length - 1 ? (
                      <button
                        type="button"
                        onClick={addRow}
                        disabled={!accountValue || !row.amount}
                        className={`px-3 py-2 rounded text-white ${accountValue && row.amount ? "bg-lavender--600" : "bg-gray-300 cursor-not-allowed"}`}
                      >
                        <FaPlus size={18} />
                      </button>
                    ) : (
                      <button type="button" onClick={() => removeRow(index)} className="px-3 py-2 bg-red-500 text-white rounded">
                        <MdDelete size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* account dropdown portal */}
            {accountDropdown.length > 0 && dropdownPos && document.getElementById("dropdown-root") &&
              createPortal(
                <ul className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] max-h-56 overflow-y-auto"
                  style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}>
                  {accountDropdown.map((item) => (
                    <li key={item.key} className={`px-3 py-2 text-sm ${item.key === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                      onMouseDown={() => handleAccountSelect(item)}>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs font-bold text-lavender--600">{item.ledgerCode}</div>
                    </li>
                  ))}
                </ul>, document.getElementById("dropdown-root"))
            }

            {/* creditor dropdown portal */}
            {creditorDropdown.length > 0 && creditorDropdownPos && document.getElementById("dropdown-root") &&
              createPortal(
                <ul className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] max-h-56 overflow-y-auto"
                  style={{ top: creditorDropdownPos.top, left: creditorDropdownPos.left, width: creditorDropdownPos.width }}>
                  {creditorDropdown.map((item, idx) => (
                    <li key={item.id} ref={(el) => (creditorItemRefs.current[idx] = el)}
                      className={`px-3 py-2 text-sm cursor-pointer ${idx === activeCreditorIndex ? "bg-indigo-100" : "hover:bg-indigo-50"}`}
                      onMouseDown={() => handleCreditorSelect(item)}>
                      <div className="flex justify-between"><span className="font-medium">{item.name}</span><span className="text-xs text-gray-500">{item.id}</span></div>
                      <div className="text-xs text-gray-500">{item.phone}</div>
                    </li>
                  ))}
                </ul>, document.getElementById("dropdown-root"))
            }

          </div>

          <div className="flex justify-end mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input type="text" value={totalRowAmount} readOnly placeholder="Total Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={!isAmountMatched || saving}
            className={`px-4 py-2 rounded text-white flex items-center gap-2
    ${saving || !isAmountMatched
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-lavender--600"
              }`}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
          </button>
        </div>

      </JournalModal>

      <JournalModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Journal"
      >
        {!selectedJournal ? (
          <p className="p-4 text-center text-gray-500">
            No journal selected.
          </p>
        ) : (
          <div className="max-h-[650px] overflow-y-auto space-y-4">

            {/* BASIC DETAILS */}
            {[
              {
                label: "Journal ID",
                value: selectedJournal.autoJournalId
              },
              {
                label: "Date",
                value: new Date(selectedJournal.date)
                  .toLocaleDateString("en-GB")
              },
              {
                label: selectedJournal.accType === "Debit"
                  ? "Debit Ledger"
                  : "Credit Ledger",
                value: (
                  <>
                    <span className="text-lavender--600 font-semibold">
                      ({selectedJournal.headerLedger?.ledgerCode})
                    </span>{" "}
                    {selectedJournal.headerLedger?.ledgerName}
                  </>
                )
              },
              {
                label: "Creditor",
                value: selectedJournal.creditorName
                  ? `${selectedJournal.creditorName} (${selectedJournal.creditorId})`
                  : "-"
              },
              {
                label: "Phone",
                value: selectedJournal.creditorPhone || "-"
              },
              {
                label: "Total Amount",
                value: `₹ ${selectedJournal.totalAmount}`
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 pb-2"
              >
                <div className="col-span-4 font-semibold text-gray-700">
                  {item.label}
                </div>
                <div className="col-span-8 text-gray-800">
                  {item.value}
                </div>
              </div>
            ))}

            {/* ENTRY LINES TABLE */}
            <div className="mt-4 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Ledger</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedJournal.entries.map((entry, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        {entry.type}
                      </td>
                      <td className="p-2">
                        <span className="text-lavender--600 font-semibold">
                          ({entry.ledger?.ledgerCode})
                        </span>{" "}
                        {entry.ledger?.ledgerName}
                      </td>
                      <td className="p-2 text-right">
                        ₹ {entry.amount}
                      </td>
                      <td className="p-2">
                        {entry.description || "-"}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL ROW */}
                  <tr className="font-semibold">
                    <td />
                    <td className="p-2 text-right">
                      Total
                    </td>
                    <td className="p-2 text-right">
                      ₹ {selectedJournal.totalAmount}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}
      </JournalModal>


      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
