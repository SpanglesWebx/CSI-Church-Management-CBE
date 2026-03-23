import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const CemReceiptsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState({ status: null, message: "" });

  /* ===============================
     LOAD RECEIPT (CEM)
  =============================== */
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`${URL}/cem-receipts/${id}`, {
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

  /* ===============================
     EARLY RETURNS
  =============================== */
  if (loading) return <div className="p-4">Loading receipt...</div>;
  if (!receipt) return <div className="p-4 text-red-500">Receipt not found</div>;

  const isMultipleLines = receipt.receiptLines.length > 1;
  const singleLine = receipt.receiptLines[0];

  /* ===============================
     UI
  =============================== */
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

        {/* RECEIPT LINES TABLE */}
        <div className="mt-6">
          <div className="p-4 border rounded-lg bg-blue-50">

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
              <div className="text-sm font-medium text-gray-700">
                Receipt Number
              </div>
              <div className="text-sm font-medium text-gray-700">
                Receipt For
              </div>
              <div className="text-sm font-medium text-gray-700">
                Amount
              </div>
              <div className="text-sm font-medium text-gray-700">
                Description
              </div>
            </div>

            {/* ROWS */}
            {receipt.receiptLines.map((line) => (
              <div
                key={line._id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3"
              >
                <input
                  type="text"
                  readOnly
                  value={line.receiptNumber || "-"}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-left"
                />

                <input
                  type="text"
                  readOnly
                  value={`(${line.ledgerCode}) ${line.ledgerName}`}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />

                <input
                  type="text"
                  readOnly
                  value={`₹ ${line.amount}`}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed text-right"
                />

                <input
                  type="text"
                  readOnly
                  value={line.description || "-"}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />
              </div>
            ))}

            {/* TOTAL */}
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

        {/* toast messages */}
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
