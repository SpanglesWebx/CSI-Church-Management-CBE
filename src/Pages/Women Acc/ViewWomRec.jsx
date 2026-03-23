import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const ViewWomRec = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  const [splitRows, setSplitRows] = useState([
    { ledger: null, ledgerLabel: "", amount: "", description: "" },
  ]);

  const [ledgerDropdown, setLedgerDropdown] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [response, setResponse] = useState({ status: null, message: "" });
  const [savingSplit, setSavingSplit] = useState(false);
  const [searchingLedger, setSearchingLedger] = useState(false);

  useEffect(() => {

    const fetchReceipt = async () => {

      try {

        const res = await axios.get(`${URL}/women-receipts/${id}`, {
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
      .map((l) => l.receiptNumber)
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b))
      .join(", ");

  };

  const sundayLines = receipt
    ? receipt.receiptLines.filter((l) => l.ledgerCode === "I0033")
    : [];

  const sundayAmount = sundayLines.reduce(
    (s, l) => s + Number(l.amount || 0),
    0
  );

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

  const debouncedLedgerSearch = useRef(
    debounce(performLedgerSearch, 300)
  ).current;

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

  const splitTotal = splitRows.reduce(
    (s, r) => s + Number(r.amount || 0),
    0
  );

  const canSaveSplit =
    sundayAmount > 0 &&
    splitTotal === sundayAmount &&
    splitRows.every((r) => r.ledger && Number(r.amount) > 0);

  const saveSplit = async () => {

    if (!receipt) return;

    if (sundayAmount <= 0) {

      setResponse({
        status: "Failed",
        message: "No Sunday receipt found to split.",
      });

      return;
    }

    if (splitTotal !== sundayAmount) {

      setResponse({
        status: "Failed",
        message: `Split total must equal ₹ ${sundayAmount}`,
      });

      return;
    }

    if (!canSaveSplit) {

      setResponse({
        status: "Failed",
        message: "Please fill valid ledgers and amounts for all split rows.",
      });

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
        `${URL}/women-receipts/${receipt._id}/split-sunday`,
        payload,
        { headers: { Authorization: token } }
      );

      setReceipt(res.data.data || res.data);

      setResponse({
        status: "Success",
        message: "Sunday receipt split successfully",
      });

      setSplitRows([
        { ledger: null, ledgerLabel: "", amount: "", description: "" },
      ]);

    } catch (err) {

      console.error("Split save failed:", err);

      const msg =
        err.response?.data?.message || "Failed to save split";

      setResponse({
        status: "Failed",
        message: msg,
      });

    } finally {

      setSavingSplit(false);

      setTimeout(
        () => setResponse({ status: null, message: "" }),
        3000
      );

    }

  };

  if (loading) return <div className="p-4">Loading receipt...</div>;

  if (!receipt)
    return <div className="p-4 text-red-500">Receipt not found</div>;

  const isMultipleLines = receipt.receiptLines.length > 1;

  const singleLine = receipt.receiptLines[0];

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <FaArrowLeft
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <h2 className="text-lg font-semibold text-lavender--600">
          Receipt Details
        </h2>

        {/* BASIC DETAILS */}

        {[
          { label: "Receipt ID", value: receipt.autoReceiptId },
          { label: "Trans No", value: receipt.transNo },
          { label: "Receipt Numbers", value: getReceiptNumbers(receipt) || "-" },
          {
            label: "Receipt For",
            value: !isMultipleLines ? (
              <>
                <span className="text-lavender--600 font-semibold">
                  ({singleLine.ledgerCode})
                </span>{" "}
                {singleLine.ledgerName}
              </>
            ) : (
              <span className="italic text-gray-500">
                ({receipt.receiptLines.length}) Receipts
              </span>
            ),
          },
          {
            label: "Name",
            value: receipt.isMember
              ? receipt.memberName
              : receipt.nonMemberName,
          },
          {
            label: "Amount",
            value: !isMultipleLines
              ? `₹ ${singleLine.amount}`
              : `₹ ${receipt.totalAmount}`,
          },
          {
            label: "Date",
            value: moment(receipt.receiptDate).format("DD-MM-YYYY"),
          },
          { label: "Payment Method", value: receipt.paymentMethod },
          { label: "Cheque Number", value: receipt.chequeNumber || "-" },
          ...(receipt.bankId
            ? [
                { label: "Bank Name", value: receipt.bankName || "-" },
                {
                  label: "Bank Account No",
                  value: receipt.bankAccountNumber || "-",
                },
              ]
            : []),
        ].map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 pb-2">
            <div className="col-span-4 font-semibold text-gray-700 mb-2">
              {item.label}
            </div>
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

        {/* toast */}

        {response.status &&
          (response.status === "Success" ? (
            <SuccessMessage Message={response.message} />
          ) : (
            <FailedMessage Message={response.message} />
          ))}
      </div>
    </>
  );
};