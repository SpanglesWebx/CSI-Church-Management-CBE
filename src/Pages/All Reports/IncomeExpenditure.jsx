// src/pages/IncomeExpenditure.jsx
import React, { useState } from "react";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import jsPDF from "jspdf";

export const IncomeExpenditure = () => {
  const token = window.sessionStorage.getItem("token");

  const [Response, setResponse] = useState({ status: null, message: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fmt = (v) =>
    typeof v === "number"
      ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : v;

  const clearResponse = () => setResponse({ status: null, message: "" });

  const fetchReport = async () => {
    clearResponse();
    if (!startDate || !endDate) {
      setResponse({ status: "Failed", message: "Select date range" });
      return;
    }
    if (!token) {
      setResponse({ status: "Failed", message: "Not authenticated" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${URL}/reports/income-expenditure`, {
        params: { fromDate: startDate, toDate: endDate },
        headers: { Authorization: token },
      });
      setReport(data);
      setResponse({ status: "Success", message: "Report loaded" });
    } catch (err) {
      console.error("Fetch report error:", err);
      setResponse({
        status: "Failed",
        message: err?.response?.data?.message || "Error loading report",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  /* ================= PDF ================= */

  const generateIncomeExpenditurePdf = (report) => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const leftX = 15;
    const rightX = pageWidth / 2 + 5;
    const amountOffset = 80;

    let leftY = 20;
    let rightY = 20;

    const fmt = (v) =>
      Number(v || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    /* HEADER */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CSI CHRIST CHURCH", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(11);
    doc.text("GENERAL FUND A/C", pageWidth / 2, 21, { align: "center" });

    doc.setFontSize(10);
    doc.text("Income & Expenditure A/c", pageWidth / 2, 27, {
      align: "center",
    });

    leftY = 35;
    rightY = 35;

    /* COLUMN TITLES */

    doc.setFont("helvetica", "bold");
    doc.text("INCOME", leftX, leftY);
    doc.text("EXPENDITURE", rightX, rightY);

    leftY += 6;
    rightY += 6;

    /* INCOME SIDE */

    Object.entries(report.statement.income).forEach(
      ([category, ledgers]) => {
        if (leftY > pageHeight - 20) {
          doc.addPage();
          leftY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(category.toUpperCase(), leftX, leftY);
        leftY += 6;

        doc.setFont("helvetica", "normal");

        Object.entries(ledgers).forEach(([ledger, amount]) => {
          if (leftY > pageHeight - 20) {
            doc.addPage();
            leftY = 20;
          }

          const columnWidth = pageWidth / 2 - 30;

          const wrappedText = doc.splitTextToSize(ledger, columnWidth);

          doc.text(wrappedText, leftX + 4, leftY);

          doc.text(fmt(amount), leftX + amountOffset, leftY, {
            align: "right",
          });

          leftY += wrappedText.length * 6;
        });

        leftY += 3;
      }
    );

    /* EXPENDITURE SIDE */

    Object.entries(report.statement.expenditure).forEach(
      ([category, ledgers]) => {
        if (rightY > pageHeight - 20) {
          doc.addPage();
          rightY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(category.toUpperCase(), rightX, rightY);
        rightY += 6;

        doc.setFont("helvetica", "normal");

        Object.entries(ledgers).forEach(([ledger, amount]) => {
          if (rightY > pageHeight - 20) {
            doc.addPage();
            rightY = 20;
          }

          const columnWidth = pageWidth / 2 - 30;

          const wrappedText = doc.splitTextToSize(ledger, columnWidth);

          doc.text(wrappedText, rightX + 4, rightY);

          doc.text(fmt(amount), rightX + amountOffset, rightY, {
            align: "right",
          });

          rightY += wrappedText.length * 6;
        });

        rightY += 3;
      }
    );

    /* TOTAL LINE */

    let bottomY = Math.max(leftY, rightY) + 8;

    if (bottomY > pageHeight - 20) {
      doc.addPage();
      bottomY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.line(leftX, bottomY, pageWidth - 15, bottomY);

    bottomY += 6;

    doc.text("TOTAL INCOME", leftX, bottomY);
    doc.text(fmt(report.totals.incomeTotal), leftX + amountOffset, bottomY, {
      align: "right",
    });

    doc.text("TOTAL EXPENDITURE", rightX, bottomY);
    doc.text(fmt(report.totals.expenseTotal), rightX + amountOffset, bottomY, {
      align: "right",
    });

    doc.save("Income_Expenditure.pdf");
  };

  const downloadPdf = async () => {
    clearResponse();

    if (!startDate || !endDate) {
      setResponse({ status: "Failed", message: "Select date range" });
      return;
    }

    if (!token) {
      setResponse({ status: "Failed", message: "Not authenticated" });
      return;
    }

    setDownloadLoading(true);

    try {
      const { data } = await axios.get(
        `${URL}/reports/income-expenditure/download`,
        {
          params: { fromDate: startDate, toDate: endDate },
          headers: { Authorization: token },
        }
      );

      generateIncomeExpenditurePdf(data);

      setResponse({ status: "Success", message: "PDF Generated" });
    } catch (err) {
      console.error("Download error:", err);
      setResponse({
        status: "Failed",
        message: err?.response?.data?.message || "Failed to generate PDF",
      });
    } finally {
      setDownloadLoading(false);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-center p-2">
          <h1 className="text-lg font-semibold text-lavender--600">
            Income & Expenditure Report
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-2">
          <div className="flex flex-wrap items-center gap-3">
            <label className="font-medium text-gray-600">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-50 border rounded w-40"
            />

            <label className="font-medium text-gray-600">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-50 border rounded w-40"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={fetchReport}
              className="px-6 py-2 text-white bg-lavender--600 rounded-lg disabled:opacity-50"
            >
              {loading ? "Loading..." : "Search"}
            </button>

            <button
              disabled={downloadLoading}
              onClick={downloadPdf}
              className="px-6 py-2 text-white bg-lavender--600 rounded-lg disabled:opacity-50"
            >
              {downloadLoading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        {report ? (
          <div className="mt-4 p-4 border rounded bg-white">
            <div className="text-center">
              <div className="text-lg font-bold">CSI CHRIST CHURCH</div>
              <div className="text-sm">GENERAL FUND A/C</div>
              <div className="text-sm mt-1">
                Income & Expenditure A/c for the Period {startDate} - {endDate}
              </div>
            </div>

            <div className="mt-6 border rounded p-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="font-bold border-b pb-1 mb-2">
                    INCOME
                  </div>

                  {Object.entries(report.statement?.income || {}).map(
                    ([category, ledgers]) => (
                      <div key={category} className="mb-3">
                        <div className="font-semibold text-sm">
                          {category.toUpperCase()}
                        </div>

                        {Object.entries(ledgers).map(([ledger, amount]) => (
                          <div
                            key={ledger}
                            className="flex justify-between text-sm ml-3"
                          >
                            <div>{ledger}</div>
                            <div>₹ {fmt(amount)}</div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                <div>
                  <div className="font-bold border-b pb-1 mb-2">
                    EXPENDITURE
                  </div>

                  {Object.entries(report.statement?.expenditure || {}).map(
                    ([category, ledgers]) => (
                      <div key={category} className="mb-3">
                        <div className="font-semibold text-sm">
                          {category.toUpperCase()}
                        </div>

                        {Object.entries(ledgers).map(([ledger, amount]) => (
                          <div
                            key={ledger}
                            className="flex justify-between text-sm ml-3"
                          >
                            <div>{ledger}</div>
                            <div>₹ {fmt(amount)}</div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="grid grid-cols-2 gap-8 font-bold">
                  <div className="flex justify-between">
                    <div>TOTAL INCOME</div>
                    <div>₹ {fmt(report.totals.incomeTotal)}</div>
                  </div>

                  <div className="flex justify-between">
                    <div>TOTAL EXPENDITURE</div>
                    <div>₹ {fmt(report.totals.expenseTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-gray-500">
            Search for a date range to load the report
          </div>
        )}

        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}
      </div>
    </>
  );
};