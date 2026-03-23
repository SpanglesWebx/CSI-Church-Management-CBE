import React, { useEffect, useRef, useState } from "react";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";

export const CemAddReceipts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
const isEditMode = !!id;
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [receiptFor, setReceiptFor] = useState("");

  const [date, setDate] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [payerBankName, setPayerBankName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [upiId, setUpiId] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activePartyRowIndex, setActivePartyRowIndex] = useState(null);

  const [receiptRows, setReceiptRows] = useState([
    {
      receiptNumber: "",
      ledger: null,
      ledgerLabel: "",
      amount: "",
      description: "",

      isMember: true,
      memberId: "",
      memberName: "",
      phone: "",

      nonMemberName: "",
      nonMemberPhone: "",

      idSearch: "",
      nameSearch: "",
      phoneSearch: ""
    }
  ]);


  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [errors, setErrors] = useState({});
  const [ledgerDropdown, setLedgerDropdown] = useState([]);

  const totalAmount = receiptRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );
  useEffect(() => {

  if (!id) return;

  const fetchReceipt = async () => {

    try {

      const res = await axios.get(`${URL}/cem-receipts/${id}`, {
        headers: { Authorization: token }
      });

      const data = res.data.data;

      setDate(data.receiptDate?.split("T")[0] || "");

      setPaymentMethod(data.paymentMethod || "Cash");

      setChequeNumber(data.chequeNumber || "");
      setChequeDate(data.chequeDate?.split("T")[0] || "");

      setPayerBankName(data.payerBankName || "");

      setSelectedBankId(data.bankId || "");

      setUpiId(data.upiId || "");

      const mappedRows = data.receiptLines.map(line => ({

        receiptNumber: line.receiptNumber || "",

        ledger: {
          ledgerName: line.ledgerName,
          ledgerCode: line.ledgerCode,
          categoryName: line.ledgerCategoryName,
          accountType: line.accountType,
          incomeType: line.incomeType
        },

        ledgerLabel: `(${line.ledgerCode}) ${line.ledgerName}`,

        amount: line.amount || "",
        description: line.description || "",

        isMember: line.isMember,

        memberId: line.memberId || "",
        memberName: line.memberName || "",
        phone: line.phone || "",

        nonMemberName: line.nonMemberName || "",
        nonMemberPhone: line.nonMemberPhone || "",

        idSearch: line.memberId || "",
        nameSearch: line.memberName || "",
        phoneSearch: line.phone || ""

      }));

      setReceiptRows(mappedRows);

    } catch (err) {

      console.error("Fetch receipt error:", err);

    }

  };

  fetchReceipt();

}, [id]);

  /* ===============================
     ROW HANDLERS
  =============================== */
  const addReceiptRow = () => {
    setReceiptRows([
      ...receiptRows,
      {
        receiptNumber: "",
        ledger: null,
        ledgerLabel: "",
        amount: "",
        description: "",

        isMember: true,
        memberId: "",
        memberName: "",
        phone: "",

        nonMemberName: "",
        nonMemberPhone: "",

        idSearch: "",
        nameSearch: "",
        phoneSearch: ""
      }
    ]);
  };

  const removeReceiptRow = (index) => {
    setReceiptRows(receiptRows.filter((_, i) => i !== index));
  };

  const setRowToMember = (rowIndex) => {
    setReceiptRows(prev => {
      const copy = [...prev];
      copy[rowIndex].isMember = true;
      copy[rowIndex].nonMemberName = "";
      copy[rowIndex].nonMemberPhone = "";
      return copy;
    });
  };

  const setRowToNonMember = (rowIndex) => {
    setReceiptRows(prev => {
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
  };

  /* ===============================
     FETCH BANKS (CEM)
  =============================== */
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
    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
      fetchBankAccounts();
    } else {
      setSelectedBankId("");
    }
  }, [paymentMethod]);

  const cleanedRows = receiptRows.filter(
    (r) => r.ledgerLabel && Number(r.amount) > 0
  );

  /* ===============================
     VALIDATION
  =============================== */
  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===============================
     IST DATE
  =============================== */
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
        setDate(formatted);
        setChequeDate(formatted);
      } catch (err) {
        console.log("Failed to fetch IST date", err);
      }
    };

    fetchISTDate();
  }, []);


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Existing creditor search
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

  const onPartySearchChange = (rowIndex, field, value) => {

    setReceiptRows(prev => {
      const copy = [...prev];
      copy[rowIndex][field] = value;
      return copy;
    });

    setActivePartyRowIndex(rowIndex);

    if (field === "idSearch") {
      debouncedCreditorSearchById(value);
    }

    if (field === "nameSearch") {
      debouncedCreditorSearchByName(value);
    }

    if (field === "phoneSearch") {
      debouncedCreditorSearchByPhone(value);
    }

  };

  const onSelectPartyFromDropdown = (rowIndex, item) => {

    const id = item.buyerId || item.id;
    const name = item.buyerName || item.name;
    const phoneVal = item.buyerPhone || item.phone || "";

    setReceiptRows(prev => {
      const copy = [...prev];

      copy[rowIndex].memberId = id;
      copy[rowIndex].memberName = name;
      copy[rowIndex].phone = phoneVal;

      copy[rowIndex].idSearch = id;
      copy[rowIndex].nameSearch = name;
      copy[rowIndex].phoneSearch = phoneVal;

      return copy;
    });

    setDropdownById([]);
    setDropdownByName([]);

  };

  /* ===============================
     DEBOUNCE
  =============================== */


  /* ===============================
     LEDGER SEARCH (CEM)
  =============================== */
  const debouncedLedgerSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setLedgerDropdown([]);
        return;
      }

      try {
        const res = await axios.get(`${URL}/ledger-search`, {
          headers: { Authorization: token },
          params: { q: val }
        });

        setLedgerDropdown(res.data || []);
      } catch {
        setLedgerDropdown([{ key: "none", label: "No Records Found" }]);
      }
    }, 300)
  ).current;

  /* ===============================
     RESET
  =============================== */
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

        isMember: true,
        memberId: "",
        memberName: "",
        phone: "",

        nonMemberName: "",
        nonMemberPhone: "",

        idSearch: "",
        nameSearch: "",
        phoneSearch: ""
      }
    ]);


    setDropdownById([]);
    setDropdownByName([]);
  };

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  /* ===============================
     SAVE (CEM)
  =============================== */
  const saveReceipt = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const bankObj = bankAccounts.find(
        b => String(b._id) === String(selectedBankId)
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
            ? (bankObj?.bank_name || "")
            : "",
        bankAccountNumber:
          paymentMethod === "Cheque" || paymentMethod === "UPI Payment"
            ? (bankObj?.account_number || "")
            : "",
        upiId: paymentMethod === "UPI Payment" ? upiId : "",

        totalAmount,

        receiptLines: cleanedRows.map(row => ({
          receiptNumber: row.receiptNumber || "",

          ledgerName: row.ledger.ledgerName,
          ledgerCode: row.ledger.ledgerCode,
          ledgerCategoryName: row.ledger.categoryName,
          accountType: row.ledger.accountType,
          incomeType: row.ledger.incomeType,

          amount: Number(row.amount),
          description: row.description || "",

          isMember: row.isMember,

          memberId: row.memberId || "",
          memberName: row.memberName || "",
          phone: row.phone || "",

          nonMemberName: row.nonMemberName || "",
          nonMemberPhone: row.nonMemberPhone || ""
        })),
      };

      const res = isEditMode
  ? await axios.put(`${URL}/cem-receipts/update/${id}`, payload, {
      headers: { Authorization: token }
    })
  : await axios.post(`${URL}/cem-receipts/add`, payload, {
      headers: { Authorization: token }
    });

      showToast("Success", res.data.message || "Receipt saved");

      resetForm();

      if (isEditMode) {
        setTimeout(() => {
          navigate("/admin/cemreceipts");
        }, 2000);
      }
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to save receipt"
      );
    } finally {
      setLoading(false);
    }
  };

  const validRows = receiptRows.filter(
    (r) => r.ledgerLabel && Number(r.amount) > 0
  );

  const canSaveReceipt =
    validRows.length > 0 &&
    totalAmount > 0;

  /* ===============================
     UI
  =============================== */
  return (
    <>
      <div className={`p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] relative ${loading ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title='Back'
          onClick={() => navigate("/admin/cemreceipts")}
          className="cursor-pointer mb-4"
        />

        <div className="flex justify-between items-center px-3 mt-2">
          <h1 className="text-lg font-semibold">
            {isEditMode ? "Edit Receipt" : "Add Receipts"}
          </h1>

          <span className="text-sm font-medium text-gray-700">
          </span>
        </div>


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
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
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
            {errors.paymentMethod && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
            )}
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

                  // ✅ hide cheque error immediately
                  setErrors((prev) => ({ ...prev, chequeNumber: "" }));
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {errors.chequeNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.chequeNumber}
                </p>
              )}
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


        <>
          <div className="p-4 border rounded-lg bg-blue-50 mt-4">

            {/* 🔥 HEADER — SHOW ONLY ONCE */}


            {/* 🔁 RECEIPT ROWS */}
            {receiptRows.map((row, index) => (
              <div key={index} className="mb-4">
                {index !== 0 && (
                  <div className="border-t-2 border-lavender--600 my-6"></div>
                )}

                {/* MEMBER / NON MEMBER TOGGLE */}
                <div className="flex justify-end mt-3">
                  <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">

                    <div
                      className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                      style={{
                        width: "calc(50% - 0.25rem)",
                        transform: row.isMember ? "translateX(0)" : "translateX(100%)"
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setRowToMember(index)}
                      className={`relative flex-1 py-1 text-center rounded-full ${row.isMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Member
                    </button>

                    <button
                      type="button"
                      onClick={() => setRowToNonMember(index)}
                      className={`relative flex-1 py-1 text-center rounded-full ${!row.isMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Non-Member
                    </button>

                  </div>
                </div>

                {/* MEMBER SEARCH */}
                {row.isMember ? (

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 relative mt-4">

                    <input
                      type="text"
                      placeholder="Search ID"
                      value={row.idSearch}
                      onChange={(e) =>
                        onPartySearchChange(index, "idSearch", e.target.value)
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Search Name"
                      value={row.nameSearch}
                      onChange={(e) =>
                        onPartySearchChange(index, "nameSearch", e.target.value)
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Search Phone"
                      value={row.phoneSearch}
                      onChange={(e) =>
                        onPartySearchChange(
                          index,
                          "phoneSearch",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                    {activePartyRowIndex === index && (dropdownById.length > 0 || dropdownByName.length > 0) && (
                      <ul className="absolute left-0 right-0 mt-[45px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto">

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
                                {item.overallUnpaid > 0 && (
                                  <span className="ml-1 text-xs text-gray-500">(₹{item.overallUnpaid})</span>
                                )}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-4">

                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={row.nonMemberName}
                      onChange={(e) => {
                        const copy = [...receiptRows];
                        copy[index].nonMemberName = e.target.value;
                        setReceiptRows(copy);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      value={row.nonMemberPhone}
                      onChange={(e) => {
                        const copy = [...receiptRows];
                        copy[index].nonMemberPhone = e.target.value.replace(/\D/g, "");
                        setReceiptRows(copy);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                  </div>

                )}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                  <div className="text-sm font-medium text-gray-700">Receipt Number</div>
                  <div className="text-sm font-medium text-gray-700">Receipt For</div>
                  <div className="text-sm font-medium text-gray-700">Amount</div>
                  <div className="text-sm font-medium text-gray-700">Description</div>
                </div>

                {/* RECEIPT ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 items-end">


                  {/* Receipt Number */}
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

                  {/* Ledger */}
                  <div className="relative">
                    <input
                      type="text"
                      value={row.ledgerLabel}
                      placeholder="Search Ledger"
                      onFocus={() => setActiveRowIndex(index)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const copy = [...receiptRows];
                        copy[index].ledgerLabel = val;
                        copy[index].ledger = null;
                        setReceiptRows(copy);
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
                            className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();

                              const copy = [...receiptRows];
                              copy[index].ledgerLabel = `(${item.ledgerCode}) ${item.ledgerName}`;
                              copy[index].ledger = {
                                ledgerName: item.ledgerName,
                                ledgerCode: item.ledgerCode,
                                categoryName: item.categoryName,
                                accountType: item.accountType,
                                incomeType: item.incomeType,
                              };

                              setReceiptRows(copy);
                              setLedgerDropdown([]);
                              setActiveRowIndex(null);
                            }}
                          >
                            <span className="text-lavender--600 font-semibold">
                              ({item.ledgerCode})
                            </span>{" "}
                            {item.ledgerName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Amount */}
                  <input
                    type="text"
                    value={row.amount}
                    placeholder="Enter Amount"
                    onChange={(e) => {
                      const copy = [...receiptRows];
                      copy[index].amount = e.target.value.replace(/\D/g, "");
                      setReceiptRows(copy);
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm text-right"
                  />

                  {/* Description */}
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
                        onClick={() => removeReceiptRow(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded"
                      >
                        <MdDelete size={20} />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>


          <div className="flex justify-end mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input type="text" value={totalAmount} readOnly placeholder="Total Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
        </>

        {canSaveReceipt && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={saveReceipt}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
              `}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {Response.status &&
        (Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
        )}
    </>
  );
};
