import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const ViewReceipts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Split UI state
  const [splitRows, setSplitRows] = useState([
    { ledger: null, ledgerLabel: "", amount: "", description: "" },
  ]);
  const [ledgerDropdown, setLedgerDropdown] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [response, setResponse] = useState({ status: null, message: "" });
  const [savingSplit, setSavingSplit] = useState(false);
  const [searchingLedger, setSearchingLedger] = useState(false);

  // Load receipt
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`${URL}/receipts/${id}`, {
          headers: { Authorization: token },
        });
        setReceipt(res.data.data || null);
      } catch (err) {
        console.error("Failed to fetch receipt", err);
        setReceipt(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);
const getReceiptNumbers = (rec) => {
  return (rec?.receiptLines || [])
    .map(l => l.receiptNumber)
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b))
    .join(", ");
};

  // identify sunday amount (sum of all Sunday Receipts lines if multiple)
  const sundayLines = receipt
    ? receipt.receiptLines.filter((l) => l.ledgerCode === "I0033")
    : [];
  const sundayAmount = sundayLines.reduce((s, l) => s + Number(l.amount || 0), 0);

  // ledger search debounce
  const debounce = (fn, wait = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const performLedgerSearch = async (q) => {
    if (!q) {
      setLedgerDropdown([]);
      return;
    }
    setSearchingLedger(true);
    try {
      const res = await axios.get(`${URL}/ledger-search`, {
        headers: { Authorization: token },
        params: { q },
      });
      setLedgerDropdown(res.data || []);
    } catch (err) {
      setLedgerDropdown([{ key: "none", ledgerName: "No Records Found" }]);
    } finally {
      setSearchingLedger(false);
    }
  };

  const debouncedLedgerSearch = useRef(debounce(performLedgerSearch, 300)).current;

  // Helpers to manage split rows
  const addSplitRow = () => {
    setSplitRows([
      ...splitRows,
      { ledger: null, ledgerLabel: "", amount: "", description: "" },
    ]);
  };

  const removeSplitRow = (index) => {
    setSplitRows(splitRows.filter((_, i) => i !== index));
  };

  const updateSplitRow = (index, patch) => {
    const copy = [...splitRows];
    copy[index] = { ...copy[index], ...patch };
    setSplitRows(copy);
  };

  // derived totals
  const splitTotal = splitRows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const canSaveSplit = sundayAmount > 0 && splitTotal === sundayAmount && splitRows.every(r => r.ledger && Number(r.amount) > 0);

  // Save split handler
  const saveSplit = async () => {
    if (!receipt) return;
    if (sundayAmount <= 0) {
      setResponse({ status: "Failed", message: "No Sunday receipt found to split." });
      return;
    }
    if (splitTotal !== sundayAmount) {
      setResponse({ status: "Failed", message: `Split total must equal ₹ ${sundayAmount}` });
      return;
    }
    if (!canSaveSplit) {
      setResponse({ status: "Failed", message: "Please fill valid ledgers and amounts for all split rows." });
      return;
    }

    setSavingSplit(true);
    try {
      const payload = {
        splitLines: splitRows.map((row) => ({
          ledgerName: row.ledger.ledgerName,
          ledgerCode: row.ledger.ledgerCode,
          ledgerCategoryName: row.ledger.categoryName,
          accountType: row.ledger.accountType,
          incomeType: row.ledger.incomeType || null,
          amount: Number(row.amount),
          description: row.description || "",
        })),
      };

      const res = await axios.put(
        `${URL}/receipts/${receipt._id}/split-sunday`,
        payload,
        { headers: { Authorization: token } }
      );

      setReceipt(res.data.data || res.data); // update view with latest receipt returned from API
      setResponse({ status: "Success", message: "Sunday receipt split successfully" });

      // reset split UI
      setSplitRows([{ ledger: null, ledgerLabel: "", amount: "", description: "" }]);
    } catch (err) {
      console.error("Split save failed:", err);
      const msg = err.response?.data?.message || "Failed to save split";
      setResponse({ status: "Failed", message: msg });
    } finally {
      setSavingSplit(false);
      // clear toast after 3s
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  // UI early returns
  if (loading) return <div className="p-4">Loading receipt...</div>;
  if (!receipt) return <div className="p-4 text-red-500">Receipt not found</div>;

  const isMultipleLines = receipt.receiptLines.length > 1;
  const singleLine = receipt.receiptLines[0];

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <FaArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />

      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-lg font-semibold text-lavender--600">Receipt Details</h2>
        {/* BASIC DETAILS */}
        {[
          { label: "Receipt ID", value: receipt.autoReceiptId },
          { label: "Trans No", value: receipt.transNo },
          { label: "Receipt Numbers", value: getReceiptNumbers(receipt) || "-" },
          {
            label: "Receipt For",
            value: !isMultipleLines ? (
              <>
                <span className="text-lavender--600 font-semibold">({singleLine.ledgerCode})</span>{" "}
                {singleLine.ledgerName}
              </>
            ) : (
              <span className="italic text-gray-500">({receipt.receiptLines.length}) Receipts</span>
            ),
          },
          { label: "Name", value: receipt.isMember ? receipt.memberName : receipt.nonMemberName },
          {
            label: "Amount",
            value: !isMultipleLines ? `₹ ${singleLine.amount}` : `₹ ${receipt.totalAmount}`,
          },
          { label: "Date", value: moment(receipt.receiptDate).format("DD-MM-YYYY") },
          { label: "Payment Method", value: receipt.paymentMethod },
          { label: "Cheque Number", value: receipt.chequeNumber || "-" },
          ...(receipt.bankId
            ? [
              { label: "Bank Name", value: receipt.bankName || "-" },
              { label: "Bank Account No", value: receipt.bankAccountNumber || "-" },
            ]
            : []),
        ].map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 pb-2">
            <div className="col-span-4 font-semibold text-gray-700 mb-2">{item.label}</div>
            <div className="col-span-8 text-gray-800">{item.value}</div>
          </div>
        ))}

        <div className="mt-6">
          <div className="p-4 border rounded-lg bg-blue-50">

            {/* 🔥 LABELS — SHOW ONCE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
              <div className="text-sm font-medium text-gray-700">Receipt Number</div>
              <div className="text-sm font-medium text-gray-700">Receipt For</div>
              <div className="text-sm font-medium text-gray-700">Amount</div>
              <div className="text-sm font-medium text-gray-700">Description</div>
            </div>

            {/* 🔁 ROWS */}
            {receipt.receiptLines.map((line) => (
              <div
                key={line._id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3"
              >
                {/* Receipt Number */}
                <input
                  type="text"
                  readOnly
                  value={line.receiptNumber || "-"}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-left"
                />

                { }
                <input
                  type="text"
                  readOnly
                  value={`(${line.ledgerCode}) ${line.ledgerName}`}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />

                {/* Amount */}
                <input
                  type="text"
                  readOnly
                  value={`₹ ${line.amount}`}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-right"
                />

                {/* Description */}
                <input
                  type="text"
                  readOnly
                  value={line.description || "-"}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />
              </div>
            ))}

            {/* 🔢 TOTAL */}
            <div className="flex justify-end mt-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={`₹ ${receipt.totalAmount}`}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm text-right font-semibold cursor-not-allowed"
                />
              </div>
            </div>

          </div>
        </div>



        {/* SPLIT UI - show only if sundayAmount > 0 */}
        {sundayAmount > 0 && (
          <>
            <div className="mt-6">
              <div className="p-4 border rounded-lg bg-blue-50 mt-4">

                {/* 🔥 HEADER — SHOW ONCE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                  <div className="text-sm font-medium text-gray-700">Receipt For</div>
                  <div className="text-sm font-medium text-gray-700 ">Amount</div>
                  <div className="text-sm font-medium text-gray-700">Description</div>
                </div>

                {/* 🔁 SPLIT ROWS */}
                {splitRows.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end"
                  >

                    {/* Receipt For */}
                    <div className="relative">
                      <input
                        type="text"
                        value={row.ledgerLabel}
                        placeholder="Search Ledger"
                        onFocus={() => setActiveRowIndex(index)}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateSplitRow(index, { ledgerLabel: val, ledger: null });
                          setActiveRowIndex(index);
                          debouncedLedgerSearch(val);
                        }}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />

                      {activeRowIndex === index && ledgerDropdown.length > 0 && (
                        <ul className="absolute z-50 bg-white border rounded-lg shadow-lg w-full max-h-56 overflow-y-auto mt-1">
                          {ledgerDropdown.map((item) => (
                            <li
                              key={item.key || `${item.ledgerCode}-${item.ledgerName}`}
                              className={`px-3 py-2 text-sm ${item.key === "none"
                                ? "text-gray-500 cursor-default"
                                : "hover:bg-indigo-50 cursor-pointer"
                                }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateSplitRow(index, {
                                  ledgerLabel: `(${item.ledgerCode}) ${item.ledgerName}`,
                                  ledger: {
                                    ledgerName: item.ledgerName,
                                    ledgerCode: item.ledgerCode,
                                    categoryName: item.categoryName,
                                    accountType: item.accountType,
                                    incomeType: item.incomeType,
                                  },
                                });
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
                        const v = e.target.value.replace(/\D/g, "");
                        updateSplitRow(index, { amount: v });
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm text-right"
                    />

                    {/* Description + Actions */}
                    <div className="flex gap-2 items-end">
                      <input
                        type="text"
                        value={row.description}
                        placeholder="Enter Description"
                        onChange={(e) =>
                          updateSplitRow(index, { description: e.target.value })
                        }
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />

                      {index === splitRows.length - 1 ? (
                        <button
                          type="button"
                          onClick={addSplitRow}
                          disabled={!row.ledgerLabel || !row.amount}
                          className={`px-3 py-2 rounded text-white ${row.ledgerLabel && row.amount
                            ? "bg-lavender--600"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                          title="Add row"
                        >
                          <FaPlus />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeSplitRow(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded"
                          title="Remove row"
                        >
                          <MdDelete />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🔢 SPLIT TOTAL / VALIDATION */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    {splitTotal !== sundayAmount ? (
                      <div className="text-red-600 text-sm">
                        Split total ₹ {splitTotal} must equal Sunday Receipts ₹ {sundayAmount}
                      </div>
                    ) : (
                      <div className="text-green-700 text-sm">
                        Split total matches Sunday Receipts
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      Split Total: ₹ {splitTotal}
                    </div>
                    <button
                      onClick={saveSplit}
                      disabled={!canSaveSplit || savingSplit}
                      className={`px-4 py-2 rounded-md text-white ${!canSaveSplit
                        ? "bg-gray-300 cursor-not-allowed"
                        : savingSplit
                          ? "bg-gray-400"
                          : "bg-lavender--600"
                        }`}
                    >
                      {savingSplit ? "Saving..." : "Save Split"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </>
        )}

        {/* toast messages */}
        {response.status && (response.status === "Success" ? (
          <SuccessMessage Message={response.message} />
        ) : (
          <FailedMessage Message={response.message} />
        ))}
      </div>
    </>
  );
};
