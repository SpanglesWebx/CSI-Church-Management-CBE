import React, { useEffect, useRef, useState } from "react";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

export const AddReciepts = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);

  // Payment + metadata
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [receiptFor, setReceiptFor] = useState("");
  const [ledgerDropdown, setLedgerDropdown] = useState([]);
  const [date, setDate] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [payerBankName, setPayerBankName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");

  // Rows (each has party fields)
  const [receiptRows, setReceiptRows] = useState([
    {
      receiptNumber: "",
      ledger: null,
      ledgerLabel: "",
      amount: "",
      description: "",
      auctionBalance: 0,
      // per-row party fields:
      isMember: true,
      memberId: "",
      memberName: "",
      phone: "",
      nonMemberName: "",
      nonMemberPhone: "",
      // per-row temporary search inputs
      idSearch: "",
      nameSearch: "",
      phoneSearch: "",
    },
  ]);

  // dropdowns (shared data arrays, shown per-row with activePartyRowIndex)
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [errors, setErrors] = useState({});

  // UI helpers to attach dropdowns
  const [activeRowIndex, setActiveRowIndex] = useState(null); // ledger dropdown
  const [activePartyRowIndex, setActivePartyRowIndex] = useState(null); // party dropdown

  const totalAmount = receiptRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  // Add / Remove row
  const addReceiptRow = () => {
    setReceiptRows((prev) => [
      ...prev,
      {
        receiptNumber: "",
        ledger: null,
        ledgerLabel: "",
        amount: "",
        description: "",
        auctionBalance: 0,
        isMember: true,
        memberId: "",
        memberName: "",
        phone: "",
        nonMemberName: "",
        nonMemberPhone: "",
        idSearch: "",
        nameSearch: "",
        phoneSearch: "",
      },
    ]);
  };

  const removeReceiptRow = (index) => {
    setReceiptRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch banks for cheque / upi
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
    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
      fetchBankAccounts();
    } else {
      setSelectedBankId("");
    }
  }, [paymentMethod]);

  // Basic validation
  const validateForm = () => {
    const newErrors = {};
    const cleanedRows = receiptRows.filter(
      (r) => r.ledgerLabel && Number(r.amount) > 0
    );

for (const row of cleanedRows) {
  if (
    row.ledger?.ledgerCode === "L0008" &&
    row.auctionBalance > 0 &&
    Number(row.amount) > row.auctionBalance
  ) {
    newErrors.amount =
      "You cannot give more amount than auction balance";
  }
}

    if (cleanedRows.length === 0) {
      newErrors.amount = "At least one valid receipt row is required";
    }

    if (!date) newErrors.date = "Date is required";

    if (!paymentMethod) newErrors.paymentMethod = "Payment method is required";

    if (paymentMethod === "Cheque") {
      if (!chequeNumber.trim()) newErrors.chequeNumber = "Cheque number is required";
      if (!selectedBankId) newErrors.selectedBankId = "Receiver bank is required for Cheque";
    }

    if (paymentMethod === "UPI Payment") {
      if (!upiId.trim()) newErrors.upiId = "UPI ID is required for UPI payments";
    }

    // Optional: per-row validations (e.g. if row.isMember true then memberId required)
    // Not enforced automatically, but you can enable by iterating rows and pushing errors.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // IST date fetch (keeps original behavior)
  const convertToInputDate = (ddmmyyyy) => {
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchISTDate = async () => {
      try {
        const res = await axios.get(`${URL}/time/ist`, {
          headers: { Authorization: token },
        });
        const ddmmyyyy = res.data.ist_date; // "28-11-2025"
        const formatted = convertToInputDate(ddmmyyyy);
        setDate(formatted);
        setChequeDate(formatted);
      } catch (err) {
        console.log("Failed to fetch IST date", err);
      }
    };
    fetchISTDate();
  }, []);

  // harvest check (keeps compatibility)
  const isHarvestAuction = receiptRows.some(
    (row) => row.ledger?.ledgerCode === "L0008"
  );

  // debouncer helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Ledger search (debounced)
  const debouncedLedgerSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setLedgerDropdown([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/ledger-search`, {
          headers: { Authorization: token },
          params: { q: val },
        });
        setLedgerDropdown(res.data || []);
      } catch {
        setLedgerDropdown([{ key: "none", label: "No Records Found" }]);
      }
    }, 300)
  ).current;

  // Creditor & harvest search handlers (debounced)
  const debouncedCreditorSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/creditor-search/id`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownById(res.data.data || []);
      } catch {
        setDropdownById([]);
      }
    }, 300)
  ).current;

  const debouncedCreditorSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/creditor-search/name`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([]);
      }
    }, 300)
  ).current;

  const debouncedCreditorSearchByPhone = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/creditor-search/phone`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([]);
      }
    }, 300)
  ).current;

  const debouncedHarvestSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/harvest-auctions/search/buyer-id`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownById(res.data.data || []);
      } catch {
        setDropdownById([]);
      }
    }, 300)
  ).current;

  const debouncedHarvestSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/harvest-auctions/search/buyer-name`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([]);
      }
    }, 300)
  ).current;

  const debouncedHarvestSearchByPhone = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/harvest-auctions/search/buyer-phone`, {
          headers: { Authorization: token },
          params: { query: val },
        });
        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([]);
      }
    }, 300)
  ).current;

  // Reset form (clears per-row fields too)
  const resetForm = () => {
    setPaymentMethod("Cash");
    setChequeNumber("");
    setChequeDate("");
    setPayerBankName("");
    setSelectedBankId("");
    setUpiId("");

    setReceiptRows([
      {
        receiptNumber: "",
        ledger: null,
        ledgerLabel: "",
        amount: "",
        description: "",
        auctionBalance: 0,
        isMember: true,
        memberId: "",
        memberName: "",
        phone: "",
        nonMemberName: "",
        nonMemberPhone: "",
        idSearch: "",
        nameSearch: "",
        phoneSearch: "",
      },
    ]);

    setDropdownById([]);
    setDropdownByName([]);
    setActiveRowIndex(null);
    setActivePartyRowIndex(null);
    setErrors({});
  };

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  useEffect(() => {
    if (paymentMethod !== "Cheque") {
      setChequeNumber("");
      setChequeDate("");
      setPayerBankName("");
    }
    if (paymentMethod !== "UPI Payment") setUpiId("");
    if (paymentMethod !== "Cheque" && paymentMethod !== "UPI Payment") setSelectedBankId("");
  }, [paymentMethod]);

  // When user types in a row's party search box
  const onPartySearchChange = (rowIndex, field, value) => {
    setReceiptRows((prev) => {
      const copy = [...prev];
      copy[rowIndex][field] = value;
      return copy;
    });
    setActivePartyRowIndex(rowIndex);

    // decide whether to use harvest endpoints for this row
    const isHarvest = receiptRows[rowIndex]?.ledger?.ledgerCode === "L0008";

    if (field === "idSearch") {
      if (isHarvest) debouncedHarvestSearchById(value);
      else debouncedCreditorSearchById(value);
    } else if (field === "nameSearch") {
      if (isHarvest) debouncedHarvestSearchByName(value);
      else debouncedCreditorSearchByName(value);
    } else if (field === "phoneSearch") {
      if (isHarvest) debouncedHarvestSearchByPhone(value);
      else debouncedCreditorSearchByPhone(value);
    }
  };

  // Select a party from dropdown into specific row
  const onSelectPartyFromDropdown = (rowIndex, item) => {
    const id = item.buyerId || item.id;
    const name = item.buyerName || item.name;
    const phoneVal = item.buyerPhone || item.phone || "";
    

    setReceiptRows((prev) => {
      const copy = [...prev];
      copy[rowIndex].memberId = id;
      copy[rowIndex].memberName = name;
      copy[rowIndex].phone = phoneVal;
      copy[rowIndex].auctionBalance = item.overallUnpaid || 0;
      // also reflect in search inputs for clarity
      copy[rowIndex].idSearch = id;
      copy[rowIndex].nameSearch = name;
      copy[rowIndex].phoneSearch = phoneVal;
      copy[rowIndex].isMember = true;
      return copy;
    });

    setDropdownById([]);
    setDropdownByName([]);
    setActivePartyRowIndex(null);
  };

  const setRowToNonMember = (rowIndex) => {
    setReceiptRows((prev) => {
      const copy = [...prev];
      copy[rowIndex].isMember = false;
      copy[rowIndex].memberId = "";
      copy[rowIndex].memberName = "";
      copy[rowIndex].phone = "";
      copy[rowIndex].idSearch = "";
      copy[rowIndex].nameSearch = "";
      copy[rowIndex].phoneSearch = "";
      return copy;
    });
    setActivePartyRowIndex(null);
  };

  const setRowToMember = (rowIndex) => {
    setReceiptRows((prev) => {
      const copy = [...prev];
      copy[rowIndex].isMember = true;
      copy[rowIndex].nonMemberName = "";
      copy[rowIndex].nonMemberPhone = "";
      return copy;
    });
    setActivePartyRowIndex(rowIndex);
  };

  // Save receipt
  const saveReceipt = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const bankObj = bankAccounts.find((b) => String(b._id) === String(selectedBankId));

      const cleanedRows = receiptRows.filter(
        (r) => r.ledgerLabel && Number(r.amount) > 0
      );

      const payload = {
        receiptDate: date,
        paymentMethod,
        chequeNumber: paymentMethod === "Cheque" ? chequeNumber : "",
        chequeDate: paymentMethod === "Cheque" ? chequeDate : null,
        payerBankName: paymentMethod === "Cheque" ? payerBankName : "",
        bankId:
          paymentMethod === "Cheque" || paymentMethod === "UPI Payment"
            ? selectedBankId || null
            : null,
        bankName:
          paymentMethod === "Cheque" || paymentMethod === "UPI Payment"
            ? bankObj?.bank_name || ""
            : "",
        bankAccountNumber:
          paymentMethod === "Cheque" || paymentMethod === "UPI Payment"
            ? bankObj?.account_number || ""
            : "",
        upiId: paymentMethod === "UPI Payment" ? upiId : "",
        totalAmount,
        receiptLines: cleanedRows.map((row) => ({
          receiptNumber: row.receiptNumber || "",
          ledgerName: row.ledger.ledgerName,
          ledgerCode: row.ledger.ledgerCode,
          ledgerCategoryName: row.ledger.categoryName,
          accountType: row.ledger.accountType,
          incomeType: row.ledger.incomeType,
          amount: Number(row.amount),
          description: row.description || "",
          // per-line party
          isMember: row.isMember,
          memberId: row.memberId || "",
          memberName: row.memberName || "",
          phone: row.phone || "",
          nonMemberName: row.nonMemberName || "",
          nonMemberPhone: row.nonMemberPhone || "",
        })),
      };

      const res = await axios.post(`${URL}/receipts/add`, payload, {
        headers: { Authorization: token },
      });

      showToast("Success", res.data.message || "Receipt saved");
      resetForm();
    } catch (err) {
      showToast("Failed", err.response?.data?.message || "Failed to save receipt");
    } finally {
      setLoading(false);
    }
  };

  const cleanedRows = receiptRows.filter((r) => r.ledgerLabel && Number(r.amount) > 0);

  const validRows = cleanedRows;
const hasInvalidAuctionAmount = receiptRows.some(
  (row) =>
    row.ledger?.ledgerCode === "L0008" &&
    row.auctionBalance > 0 &&
    Number(row.amount) > row.auctionBalance
);

const canSaveReceipt =
  validRows.length > 0 &&
  totalAmount > 0 &&
  !hasInvalidAuctionAmount;

  // Render
  return (
    <>
      <div
        className={`p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] relative ${
          loading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <FaArrowLeft
          size={18}
          title="Back"
          onClick={() => navigate("/admin/receiptslist")}
          className="cursor-pointer mb-4"
        />
        <div className="flex justify-between items-center px-3 mt-2">
          <h1 className="text-lg font-semibold">Add Receipts</h1>
          <span className="text-sm font-medium text-gray-700"></span>
        </div>

        {/* Top meta (Date, Payment Method, Cheque/UPI fields, Receiver bank) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setErrors((prev) => ({ ...prev, paymentMethod: "" }));
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI Payment">UPI Payment</option>
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
          </div>

          {paymentMethod === "Cheque" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Cheque Number</label>
              <input
                type="text"
                placeholder="Enter Cheque Number"
                value={chequeNumber}
                onChange={(e) => {
                  setChequeNumber(e.target.value);
                  setErrors((prev) => ({ ...prev, chequeNumber: "" }));
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {errors.chequeNumber && <p className="text-red-500 text-xs mt-1">{errors.chequeNumber}</p>}
            </div>
          )}

          {paymentMethod === "UPI Payment" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">UPI Id</label>
              <input
                type="text"
                placeholder="Enter UPI Id"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setErrors((prev) => ({ ...prev, upiId: "" }));
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
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

          {paymentMethod === "Cheque" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Payer Bank Name</label>
              <input
                type="text"
                placeholder="Enter Payer Bank Name"
                value={payerBankName}
                onChange={(e) => setPayerBankName(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}

          {(paymentMethod === "Cheque" || paymentMethod === "UPI Payment") && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Receiver's Bank Account</label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Receiver's Bank</option>
                {bankAccounts.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.bank_name} - {bank.account_number}
                  </option>
                ))}
              </select>
              {errors.selectedBankId && <p className="text-red-500 text-xs mt-1">{errors.selectedBankId}</p>}
            </div>
          )}
        </div>

        {/* Receipt rows area */}
        <div className="p-4 border rounded-lg bg-blue-50 mt-4">
          {/* Header */}
          

          {/* Rows */}
          {receiptRows.map((row, index) => {
            const isRowHarvest = row.ledger?.ledgerCode === "L0008";

            return (
              <div key={index} className="mb-4">
                {index !== 0 && (
                  <div className="border-t-2 border-lavender--600 my-6"></div>
                )}
                <div className="pl-0 sm:pl-0">
                  {/* Toggle */}
                  {!isRowHarvest && (
                  <div className="flex justify-end mt-3">
                    <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                      <div
                        className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                        style={{
                          width: "calc(50% - 0.25rem)",
                          transform: receiptRows[index].isMember ? "translateX(0)" : "translateX(100%)",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setRowToMember(index)}
                        className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${receiptRows[index].isMember ? "text-white" : "text-gray-700"}`}
                      >
                        Member
                      </button>

                      <button
                        type="button"
                        onClick={() => setRowToNonMember(index)}
                        className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${!receiptRows[index].isMember ? "text-white" : "text-gray-700"}`}
                      >
                        Non-Member
                      </button>
                    </div>
                  </div>
                  )}

                  {/* Member -> 3 grid: ID | Name | Phone */}
                  {receiptRows[index].isMember ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 relative">
                      <div className="relative">
                        <label className="text-sm font-medium text-gray-700">ID</label>
                        <input
                          type="text"
                          placeholder="Search ID"
                          value={receiptRows[index].idSearch}
                          onFocus={() => setActivePartyRowIndex(index)}
                          onChange={(e) => onPartySearchChange(index, "idSearch", e.target.value)}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className="relative">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          placeholder="Search Name"
                          value={receiptRows[index].nameSearch}
                          onFocus={() => setActivePartyRowIndex(index)}
                          onChange={(e) => onPartySearchChange(index, "nameSearch", e.target.value)}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className="relative">
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="text"
                          placeholder="Search Phone"
                          value={receiptRows[index].phoneSearch}
                          onFocus={() => setActivePartyRowIndex(index)}
                          onChange={(e) => onPartySearchChange(index, "phoneSearch", e.target.value.replace(/\D/g, ""))}
                          maxLength={10}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>

                      {/* Dropdown shown only for activePartyRowIndex */}
                      {activePartyRowIndex === index && (dropdownById.length > 0 || dropdownByName.length > 0) && (
                        <ul className="absolute left-0 right-0 mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto">
                          {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((item) => {
                            const id = item.buyerId || item.id;
                            const name = item.buyerName || item.name;
                            const phoneVal = item.buyerPhone || item.phone || "";

                            return (
                              <li
                                key={id}
                                className="flex px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  onSelectPartyFromDropdown(index, item);
                                }}
                              >
                                <span className="w-1/3 font-medium">
                                  {id}
                                  {item.overallUnpaid > 0 && <span className="ml-1 text-xs text-gray-500">(₹{item.overallUnpaid})</span>}
                                </span>
                                <span className="w-1/3">{name}</span>
                                <span className="w-1/3 text-gray-500">{phoneVal}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Non-member -> 2 grid: Name | Phone
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={receiptRows[index].nonMemberName}
                          onChange={(e) =>
                            setReceiptRows((prev) => {
                              const copy = [...prev];
                              copy[index].nonMemberName = e.target.value;
                              return copy;
                            })
                          }
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="text"
                          value={receiptRows[index].nonMemberPhone}
                          maxLength={10}
                          onChange={(e) =>
                            setReceiptRows((prev) => {
                              const copy = [...prev];
                              copy[index].nonMemberPhone = e.target.value.replace(/\D/g, "");
                              return copy;
                            })
                          }
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                          placeholder="10-digit phone number"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
            <div className="text-sm font-medium text-gray-700">Receipt Number</div>
            <div className="text-sm font-medium text-gray-700">Receipt For</div>
<div className="text-sm font-medium text-gray-700">
  Amount
  {row.ledger?.ledgerCode === "L0008" && row.auctionBalance > 0 && (
    <span className="ml-2 text-xs text-red-600 font-semibold">
      (Balance ₹{row.auctionBalance})
    </span>
  )}
</div>
            <div className="text-sm font-medium text-gray-700">Description</div>
          </div>
                {/* 4-grid main row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2 items-end">
                  {/* Receipt Number */}
                  <div>
                    <input
                      type="text"
                      value={row.receiptNumber}
                      placeholder="Receipt No"
                      onChange={(e) => {
                        const copy = [...receiptRows];
                        copy[index].receiptNumber = e.target.value;
                        setReceiptRows(copy);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Receipt For (ledger search) */}
                  <div className="relative">
                    <input
                      type="text"
                      value={row.ledgerLabel}
                      placeholder="Search Ledger"
                      onFocus={() => setActiveRowIndex(index)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReceiptRows((prev) => {
                          const copy = [...prev];
                          copy[index].ledgerLabel = val;
                          copy[index].ledger = null;
                          return copy;
                        });
                        setActiveRowIndex(index);
                        debouncedLedgerSearch(val);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    {activeRowIndex === index && ledgerDropdown.length > 0 && (
                      <ul className="absolute z-50 bg-white border rounded-lg shadow-lg w-full max-h-56 overflow-y-auto mt-1">
                        {ledgerDropdown.map((item) => (
                          <li
                            key={item.key}
                            className={`px-3 py-2 text-sm ${item.key === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
onMouseDown={(e) => {
  e.preventDefault();

  setReceiptRows((prev) => {
    const copy = [...prev];

    copy[index].ledgerLabel = `(${item.ledgerCode}) ${item.ledgerName}`;

    copy[index].ledger = {
      ledgerName: item.ledgerName,
      ledgerCode: item.ledgerCode,
      categoryName: item.categoryName,
      accountType: item.accountType,
      incomeType: item.incomeType,
    };

    // 🔥 Reset party fields when auction ledger selected
    if (item.ledgerCode === "L0008") {
      copy[index].memberId = "";
      copy[index].memberName = "";
      copy[index].phone = "";

      copy[index].idSearch = "";
      copy[index].nameSearch = "";
      copy[index].phoneSearch = "";

      copy[index].auctionBalance = 0;
      copy[index].amount = "";
    }

    setDropdownById([]);
    setDropdownByName([]);

    return copy;
  });

  setLedgerDropdown([]);
  setActiveRowIndex(null);
}}
                          >
                            <span className="text-lavender--600 font-semibold">({item.ledgerCode})</span> {item.ledgerName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <input
                      type="text"
                      value={row.amount}
                      placeholder="Enter Amount"
onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  const copy = [...receiptRows];

  const balance = copy[index].auctionBalance || 0;

  if (
    copy[index].ledger?.ledgerCode === "L0008" &&
    balance > 0 &&
    Number(value) > balance
  ) {
    showToast("Failed", "You cannot enter amount greater than balance");
    return;
  }

  copy[index].amount = value;
  setReceiptRows(copy);
}}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm text-right"
                    />
                  </div>

                  {/* Description + add/remove */}
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      value={row.description}
                      placeholder="Enter Description"
                      onChange={(e) => {
                        const copy = [...receiptRows];
                        copy[index].description = e.target.value;
                        setReceiptRows(copy);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    {index === receiptRows.length - 1 ? (
                      <button
                        type="button"
                        onClick={addReceiptRow}
                        disabled={!row.ledgerLabel || !row.amount}
                        className={`px-3 py-2 rounded text-white ${row.ledgerLabel && row.amount ? "bg-lavender--600" : "bg-gray-300 cursor-not-allowed"}`}
                        title="Add row"
                      >
                        <FaPlus size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeReceiptRow(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded"
                        title="Remove row"
                      >
                        <MdDelete size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* ---------- Per-row party area (toggle + inputs) ---------- */}
                
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="flex justify-end mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="text"
              value={totalAmount}
              readOnly
              placeholder="Total Amount"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        {/* Save */}
        {canSaveReceipt && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={saveReceipt}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"
              }`}
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
