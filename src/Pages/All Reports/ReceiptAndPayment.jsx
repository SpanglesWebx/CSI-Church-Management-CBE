import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const ReceiptAndPayment = () => {
  const token = window.sessionStorage.getItem("token");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [receiptPaymentData, setReceiptPaymentData] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const fetchReceiptPayment = async () => {
    if (!fromDate || !toDate) return;

    try {
      const res = await axios.get(
        `${URL}/receipt-payment?from=${fromDate}&to=${toDate}`,
        { headers: { Authorization: token } }
      );

      if (res.data.status === "Success") {
        setReceiptPaymentData(res.data.data);
      }
    } catch (error) {
      console.log(error);
      setResponse({ status: "Failed", message: "Failed to fetch data" });
    }
  };

  const downloadReceiptPayment = async () => {
    try {
      const res = await axios.get(
        `${URL}/receipt-payment/pdf?from=${fromDate}&to=${toDate}`,
        {
          headers: { Authorization: token },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `Receipt-Payment-${fromDate}-to-${toDate}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);

      setResponse({ status: "Success", message: "PDF Downloaded" });

    } catch (err) {
      console.error(err);
      setResponse({ status: "Failed", message: "Download failed" });
    }
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReceiptPayment();
    }
  }, [fromDate, toDate]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h4 className="font-semibold">Receipt & Payment</h4>

        <div className="flex flex-wrap items-center p-4 gap-3">
          <label className="text-l font-medium text-gray-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />

          <label className="text-l font-medium text-gray-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />

          {fromDate && toDate && (
            <button
              onClick={downloadReceiptPayment}
              className="ml-auto px-3 py-2 bg-lavender--600 text-white rounded text-sm flex items-center gap-2"
            >
              <Download size={16} /> Download
            </button>
          )}
        </div>

        {/* PREVIEW TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">SI No</th>
                <th className="p-2 text-center">Receipts</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Payments</th>
                <th className="p-2 text-center">Amount</th>
              </tr>
            </thead>

            <tbody>
              {receiptPaymentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-2">
                    No Records Found
                  </td>
                </tr>
              ) : (
                receiptPaymentData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 text-center font-semibold">
                      {index + 1}
                    </td>
                    <td className="p-2 text-center">{row.receipt}</td>
                    <td className="p-2 text-center">{row.receiptAmount}</td>
                    <td className="p-2 text-center">{row.payment}</td>
                    <td className="p-2 text-center">{row.paymentAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};
