import React, { useEffect, useState } from "react";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const TrialBalance = () => {
  const token = window.sessionStorage.getItem("token");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [trialData, setTrialData] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const fetchTrialBalance = async () => {
    try {
      const res = await axios.get(
        `${URL}/trial-balance?startDate=${fromDate}&endDate=${toDate}`,
        { headers: { Authorization: token } }
      );

      setTrialData(res.data.data || {});
    } catch (err) {
      console.error(err);
      FailedMessage("Failed to fetch trial balance");
    }
  };

  const handleDownloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  let y = 10;

  // 🔹 Title
  doc.setFontSize(14);
  doc.text("GENERAL FUND A/C - TRIAL BALANCE", 105, y, { align: "center" });

  y += 6;

  // 🔹 Date Range
  doc.setFontSize(10);
  doc.text(
    `From: ${fromDate || "-"}   To: ${toDate || "-"}`,
    105,
    y,
    { align: "center" }
  );

  y += 6;

  let allRows = [];

  Object.keys(trialData).forEach((category) => {
    // CATEGORY HEADER
    allRows.push([
      {
        content: category,
        colSpan: 6,
        styles: { halign: "left", fontStyle: "bold", fillColor: [220, 220, 220] }
      }
    ]);

    trialData[category].forEach((row, index) => {
      allRows.push([
        index + 1,
        row.description,
        row.openingBalance,
        row.drAmount,
        row.crAmount,
        `${row.closingBalance} ${row.balanceType}`
      ]);
    });
  });

  // 🔹 Table
  autoTable(doc, {
    startY: y,
    head: [[
      "SI No",
      "Description",
      "Opening",
      "Dr",
      "Cr",
      "Closing"
    ]],
    body: allRows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [100, 100, 255],
      textColor: 255,
    },
    theme: "grid",
  });

  doc.save("TrialBalance.pdf");
};

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-wrap items-center justify-between p-4 gap-3">
          <h4 className="font-semibold">General Fund Trial Balance</h4>
          <div className="flex items-center justify-between gap-3">
            <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={handleDownloadPDF}/>
          </div>
        </div>


        <div className="flex flex-wrap items-center p-4 gap-3">
          <label className="text-l font-medium text-gray-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />

          <label className="text-l font-medium text-gray-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />


          <button
            onClick={fetchTrialBalance}
            className="ml-auto px-3 py-2 bg-lavender--600 text-white rounded text-md flex items-center gap-2"
          >
            Search
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">SI No</th>
                <th className="p-2 text-center">Description</th>
                <th className="p-2 text-center">Opening Balance</th>
                <th className="p-2 text-center">Dr Amount</th>
                <th className="p-2 text-center">Cr Amount</th>
                <th className="p-2 text-center">Closing Balance</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(trialData).length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-2">
                    No Records Found
                  </td>
                </tr>
              ) : (
                Object.keys(trialData).map((category, catIndex) => (
                  <React.Fragment key={catIndex}>

                    {/* CATEGORY HEADER */}
                    <tr className="bg-gray-200 font-bold">
                      <td colSpan="6" className="p-2 text-left">
                        {category}
                      </td>
                    </tr>

                    {/* LEDGERS */}
                    {trialData[category].map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-center">
                          {index + 1}
                        </td>
                        <td className="p-2 text-left">{row.description}</td>
                        <td className="p-2 text-right">{row.openingBalance}</td>
                        <td className="p-2 text-right text-red-600">
                          {row.drAmount}
                        </td>
                        <td className="p-2 text-right text-green-600">
                          {row.crAmount}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {row.closingBalance} {row.balanceType}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
