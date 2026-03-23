// src/pages/AccountReports.jsx
import React, { useState } from "react";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import jsPDF from "jspdf";

export const AccountReports = () => {
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
      const { data } = await axios.get(`${URL}/reports/receipts-payments`, {
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

 const generateReceiptsPaymentsPdf = (report) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const midX = pageWidth / 2;

  const leftStart = margin;
  const rightStart = midX + 6;

  const columnWidth = midX - margin - 12;

  const leftAmountX = leftStart + columnWidth - 18;
  const leftTotalX = leftStart + columnWidth;

  const rightAmountX = rightStart + columnWidth - 18;
  const rightTotalX = rightStart + columnWidth;

  const wrapWidth = columnWidth - 35;

  // initial Y for content (leave space for header)
  let leftY = 44;
  let rightY = 44;

  const line = 3.6;

  const fmt = (v) =>
    Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const prettyDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // prefer component startDate/endDate if available (they're in YYYY-MM-DD)
  const headerFrom = startDate ? prettyDate(startDate) : prettyDate(report.fromDate) || "";
  const headerTo = endDate ? prettyDate(endDate) : prettyDate(report.toDate) || "";

  // draw header on current page
  const drawHeader = () => {
    doc.setDrawColor(180);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("RECEIPTS & PAYMENTS REPORT", pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(9);
    doc.text("GENERAL FUND A/C", pageWidth / 2, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const dateRangeText = headerFrom && headerTo ? `${headerFrom} to ${headerTo}` : (headerFrom || headerTo || "");
    doc.text(dateRangeText, pageWidth / 2, 23, { align: "center" });

    // divider line in middle
    doc.line(midX, 28, midX, pageHeight - 16);

    // column titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("RECEIPTS", leftStart, 36);
    doc.text("PAYMENTS", rightStart, 36);

    // reset to normal for content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
  };

  // create row arrays for left and right columns
  const makeLeftRows = () => {
    const rows = [];

    // Opening balances - left
    rows.push({ bold: true, name: "OPENING BALANCE" });
    rows.push({ bold: true, name: "CASH" });

    const openingCash = Object.entries(report.opening.cashBalances || {});
    openingCash.forEach(([name, amount], i) => {
      const total = i === openingCash.length - 1 ? report.opening.totalCash : "";
      rows.push({ name: `  ${name}`, amount, total });
    });

    rows.push({ bold: true, name: "BANK" });
    const openingBank = Object.entries(report.opening.bankBalances || {});
    openingBank.forEach(([name, amount], i) => {
      const total = i === openingBank.length - 1 ? report.opening.totalBank : "";
      rows.push({ name: `  ${name}`, amount, total });
    });

    // Receipts categories
    Object.entries(report.statement.receipts || {}).forEach(([category, ledgers]) => {
      rows.push({ bold: true, name: category.toUpperCase() });
      const entries = Object.entries(ledgers);
      const total = entries.reduce((s, [, v]) => s + Number(v || 0), 0);
      entries.forEach(([ledger, amt], idx) => {
  const catTotal = idx === entries.length - 1 ? total : "";
  rows.push({ name: `   ${ledger}`, amount: amt, total: catTotal });
});
    });

    return rows;
  };

  const makeRightRows = () => {
    const rows = [];

    // Payments categories
    Object.entries(report.statement.payments || {}).forEach(([category, ledgers]) => {
      rows.push({ bold: true, name: category.toUpperCase() });
      const entries = Object.entries(ledgers);
      const total = entries.reduce((s, [, v]) => s + Number(v || 0), 0);
     entries.forEach(([ledger, amt], idx) => {
  const catTotal = idx === entries.length - 1 ? total : "";
  rows.push({ name: `   ${ledger}`, amount: amt, total: catTotal });
});
    });

    // Closing balances on right
    rows.push({ bold: true, name: "CLOSING BALANCE" });
    rows.push({ bold: true, name: "CASH" });
    const closingCash = Object.entries(report.closing.cashBalances || {});
    closingCash.forEach(([name, amount], i) => {
      const total = i === closingCash.length - 1 ? report.closing.totalCash : "";
      rows.push({ name: `  ${name}`, amount, total });
    });
    rows.push({ bold: true, name: "BANK" });
    const closingBank = Object.entries(report.closing.bankBalances || {});
    closingBank.forEach(([name, amount], i) => {
      const total = i === closingBank.length - 1 ? report.closing.totalBank : "";
      rows.push({ name: `  ${name}`, amount, total });
    });

    return rows;
  };

  const leftRows = makeLeftRows();
  const rightRows = makeRightRows();

  // ensure header drawn on first page
  drawHeader();

  // helper: add new page and redraw header, reset Ys
  const addNewPage = () => {
    doc.addPage();
    drawHeader();
    leftY = 44;
    rightY = 44;
  };

  // measure wrapped lines for a given text (bold headings are single line)
  const measureWrapped = (text, bold) => {
    if (!text) return 0;
    if (bold) return 1;
    // give better breakability by adding space after hyphen and before '('
    const safe = text.replace(/-/g, "- ").replace(/\(/g, " (");
    const wrapped = doc.splitTextToSize(safe, wrapWidth);
    return wrapped.length;
  };

  // iterate row-by-row in parallel
  const maxRows = Math.max(leftRows.length, rightRows.length);
  for (let i = 0; i < maxRows; i++) {
    const L = leftRows[i];
    const R = rightRows[i];

    // compute heights (lines) for each side
    const leftLines = L ? (L.spacer ? 1 : measureWrapped(L.name, !!L.bold)) : 0;
    const rightLines = R ? (R.spacer ? 1 : measureWrapped(R.name, !!R.bold)) : 0;
    const leftH = leftLines * line;
    const rightH = rightLines * line;
    const reqH = Math.max(leftH || 0, rightH || 0);

    // if not enough space on current page, create new page and continue
    if (Math.max(leftY, rightY) + reqH > pageHeight - 20) {
      addNewPage();
    }

    // ----- LEFT SIDE PRINT -----
    if (L) {
      if (L.spacer) {
        leftY += reqH;
      } else {
        if (L.bold) {
          leftY += 1;
          doc.setFont("helvetica", "bold");
          doc.text(L.name, leftStart, leftY);
        } else {
          doc.setFont("helvetica", "normal");
          const safe = L.name.replace(/-/g, "- ").replace(/\(/g, " (");
          const wrapped = doc.splitTextToSize(safe, wrapWidth);
          doc.text(wrapped, leftStart, leftY);
        }

        if (L.amount !== undefined && L.amount !== "") {
          const wrappedLines = (L.bold ? 1 : doc.splitTextToSize(
            (L.name || "").replace(/-/g, "- ").replace(/\(/g, " ("),
            wrapWidth
          ).length);
          const amountY = leftY + (wrappedLines - 1) * line;
          doc.text(fmt(L.amount), leftAmountX, amountY, { align: "right" });
        }

        if (L.total !== undefined && L.total !== "") {
          const wrappedLines = (L.bold ? 1 : doc.splitTextToSize(
            (L.name || "").replace(/-/g, "- ").replace(/\(/g, " ("),
            wrapWidth
          ).length);
          const totalY = leftY + (wrappedLines - 1) * line;
          doc.text(fmt(L.total), leftTotalX, totalY, { align: "right" });
        }

        // note: don't add extra small spacing here; we'll sync both sides using reqH
      }
    }

    // ----- RIGHT SIDE PRINT -----
    if (R) {
      if (R.spacer) {
        rightY += reqH;
      } else {
        if (R.bold) {
          doc.setFont("helvetica", "bold");
          doc.text(R.name, rightStart, rightY);
        } else {
          doc.setFont("helvetica", "normal");
          const safe = R.name.replace(/-/g, "- ").replace(/\(/g, " (");
          const wrapped = doc.splitTextToSize(safe, wrapWidth);
          doc.text(wrapped, rightStart, rightY);
        }

        if (R.amount !== undefined && R.amount !== "") {
          const wrappedLines = (R.bold ? 1 : doc.splitTextToSize(
            (R.name || "").replace(/-/g, "- ").replace(/\(/g, " ("),
            wrapWidth
          ).length);
          const amountY = rightY + (wrappedLines - 1) * line;
          doc.text(fmt(R.amount), rightAmountX, amountY, { align: "right" });
        }

        if (R.total !== undefined && R.total !== "") {
          const wrappedLines = (R.bold ? 1 : doc.splitTextToSize(
            (R.name || "").replace(/-/g, "- ").replace(/\(/g, " ("),
            wrapWidth
          ).length);
          const totalY = rightY + (wrappedLines - 1) * line;
          doc.text(fmt(R.total), rightTotalX, totalY, { align: "right" });
        }
      }
    }

    // advance both cursors by the same height to keep columns in sync
    leftY += reqH;
    rightY += reqH;
  } // end rows loop

  // Draw totals at bottom of last page (ensure space)
  const bottomReq = 12;
  if (Math.max(leftY, rightY) + bottomReq > pageHeight - 20) addNewPage();

  const bottom = Math.max(leftY, rightY) + 4;
  doc.setFont("helvetica", "bold");
  doc.line(margin, bottom, pageWidth - margin, bottom);

  doc.text("TOTAL RECEIPTS", leftStart, bottom + 6);
  doc.text(fmt(report.totals.receiptsTotal), leftAmountX, bottom + 6, { align: "right" });

  doc.text("TOTAL PAYMENTS", rightStart, bottom + 6);
  doc.text(fmt(report.totals.paymentsTotal), rightAmountX, bottom + 6, { align: "right" });

  // Footer page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${p} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" });
  }

  // Save file with dd-mm-yyyy filename
  const fileFrom = headerFrom || "from";
  const fileTo = headerTo || "to";
  doc.save(`Receipts_Payments_${fileFrom}_to_${fileTo}.pdf`);
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
        `${URL}/reports/receipts-payments/download`,
        {
          params: { fromDate: startDate, toDate: endDate },
          headers: { Authorization: token },
        }
      );

      // 🔥 Here you call your jsPDF function
      generateReceiptsPaymentsPdf(data);

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

  // helpers to render grouped statement
  const renderGroupedColumn = (grouped) => {
    if (!grouped || Object.keys(grouped).length === 0) {
      return <div className="text-gray-500">No items</div>;
    }

    return (
      <div className="space-y-3">
        {Object.keys(grouped).map((category) => {
          const ledgers = grouped[category];
          const catTotal = Object.values(ledgers).reduce((s, v) => s + Number(v || 0), 0);
          return (
            <div key={category}>
              <div className="font-semibold text-sm">{category.toUpperCase()}</div>
              <div className="ml-3 mt-1 text-sm">
                {Object.keys(ledgers).map((ledger) => (
                  <div key={ledger} className="flex justify-between py-0.5">
                    <div className="truncate pr-4">{ledger}</div>
                    <div className="text-right">₹ {fmt(Number(ledgers[ledger] || 0))}</div>
                  </div>
                ))}
                <div className="flex justify-between font-semibold mt-1">
                  <div>Total</div>
                  <div>₹ {fmt(catTotal)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 🔥 Calculate Grand Totals (like PDF)

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-center p-2">
          <h1 className="text-lg font-semibold text-lavender--600">
            Receipts & Payments Report
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

        {/* Statement view (mirrors PDF) */}
        {report ? (() => {

          const openingTotal =
            (report.opening?.cash?.total || 0) +
            (report.opening?.bank?.total || 0);

          const closingTotal =
            (report.closing?.cash?.total || 0) +
            (report.closing?.bank?.total || 0);

          // Receipt side total
          let receiptsTotal = openingTotal;

          Object.values(report.statement?.receipts || {}).forEach((cat) => {
            Object.values(cat).forEach((amt) => {
              receiptsTotal += Number(amt || 0);
            });
          });

          // Payment side total
          let paymentsTotal = closingTotal;

          Object.values(report.statement?.payments || {}).forEach((cat) => {
            Object.values(cat).forEach((amt) => {
              paymentsTotal += Number(amt || 0);
            });
          });
          return (
            <div className="mt-4 p-4 border rounded bg-white">
              {/* Header */}
              <div className="text-center">
                <div className="text-lg font-bold">CSI CHRIST CHURCH</div>
                <div className="text-sm">GENERAL FUND A/C</div>
                <div className="text-sm mt-1">
                  Receipts & Payments A/c for the Period {startDate} - {endDate}
                </div>
              </div>
              {/* ================= STATEMENT (PDF STYLE) ================= */}
              <div className="mt-6 border rounded p-4">

                <div className="grid grid-cols-2 gap-8">

                  {/* LEFT SIDE - RECEIPTS */}
                  <div>
                    <div className="font-bold border-b pb-1 mb-2">
                      RECEIPTS
                    </div>

                    {/* Opening Balance */}
                    <div className="font-semibold mb-2">
                      OPENING BALANCE
                    </div>
                    <div className="font-semibold text-sm ml-3 mt-2">
                      CASH
                    </div>

                    { }
                    {(report.opening?.cash?.details || []).map((c, index) => {

                      const isLast = index === report.opening.cash.details.length - 1;

                      return (
                        <div
                          key={c.name}
                          className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                        >
                          <div>{c.name}</div>

                          <div className="text-right">
                            ₹ {fmt(c.amount)}
                          </div>

                          <div className="text-right font-semibold">
                            {isLast ? `₹ ${fmt(report.opening.cash.total)}` : ""}
                          </div>
                        </div>
                      );
                    })}
                    <div className="font-semibold text-sm ml-3 mt-3">
                      BANK
                    </div>
                    {/* BANK BALANCES */}
                    {(report.opening?.bank?.details || []).map((b, index) => {

                      const isLast = index === report.opening.bank.details.length - 1;

                      return (
                        <div
                          key={b.name}
                          className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                        >
                          <div>{b.name}</div>

                          <div className="text-right">
                            ₹ {fmt(b.amount)}
                          </div>

                          <div className="text-right font-semibold">
                            {isLast ? `₹ ${fmt(report.opening.bank.total)}` : ""}
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-4" />

                    {/* Receipt Categories */}
                    {Object.entries(report.statement?.receipts || {}).map(
                      ([category, ledgers]) => {

                        const categoryTotal = Object.values(ledgers).reduce(
                          (sum, val) => sum + Number(val || 0),
                          0
                        );

                        const entries = Object.entries(ledgers);

                        return (
                          <div key={category} className="mb-4">

                            <div className="font-semibold text-sm mb-1">
                              {category.toUpperCase()}
                            </div>

                            {entries.map(([ledger, amount], index) => {

                              const isLast = index === entries.length - 1;

                              return (
                                <div
                                  key={ledger}
                                  className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                                >
                                  <div>{ledger}</div>

                                  <div className="text-right">
                                    ₹ {fmt(amount)}
                                  </div>

                                  <div className="text-right font-semibold">
                                    {isLast ? `₹ ${fmt(categoryTotal)}` : ""}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* RIGHT SIDE - PAYMENTS */}
                  <div>
                    <div className="font-bold border-b pb-1 mb-2">
                      PAYMENTS
                    </div>

                    {Object.entries(report.statement?.payments || {}).map(
                      ([category, ledgers]) => {

                        const categoryTotal = Object.values(ledgers).reduce(
                          (sum, val) => sum + Number(val || 0),
                          0
                        );

                        const entries = Object.entries(ledgers);

                        return (
                          <div key={category} className="mb-3">

                            <div className="font-semibold text-sm mb-1">
                              {category.toUpperCase()}
                            </div>

                            {entries.map(([ledger, amount], index) => {

                              const isLast = index === entries.length - 1;

                              return (
                                <div
                                  key={ledger}
                                  className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                                >
                                  {/* Ledger Name */}
                                  <div>{ledger}</div>

                                  {/* Ledger Amount */}
                                  <div className="text-right">
                                    ₹ {fmt(amount)}
                                  </div>

                                  {/* Category Total (only last row) */}
                                  <div className="text-right font-semibold">
                                    {isLast ? `₹ ${fmt(categoryTotal)}` : ""}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                    )}

                    {/* Closing Balance */}
                    <div className="font-semibold mt-4 mb-2">
                      CLOSING BALANCE
                    </div>
                    <div className="font-semibold text-sm ml-3 mt-3">
                      CASH
                    </div>

                    {/* CASH BALANCES */}
                    {(report.closing?.cash?.details || []).map((c, index) => {

                      const isLast = index === report.closing.cash.details.length - 1;

                      return (
                        <div
                          key={c.name}
                          className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                        >
                          <div>{c.name}</div>

                          <div className="text-right">
                            ₹ {fmt(c.amount)}
                          </div>

                          <div className="text-right font-semibold">
                            {isLast ? `₹ ${fmt(report.closing.cash.total)}` : ""}
                          </div>
                        </div>
                      );
                    })}
                    <div className="font-semibold text-sm ml-3 mt-3">
                      BANK
                    </div>

                    {/* BANK BALANCES */}
                    {(report.closing?.bank?.details || []).map((b, index) => {

                      const isLast = index === report.closing.bank.details.length - 1;

                      return (
                        <div
                          key={b.name}
                          className="grid grid-cols-[1fr_120px_120px] items-end text-sm ml-3"
                        >
                          <div>{b.name}</div>

                          <div className="text-right">
                            ₹ {fmt(b.amount)}
                          </div>

                          <div className="text-right font-semibold">
                            {isLast ? `₹ ${fmt(report.closing.bank.total)}` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* ================= GRAND TOTAL ================= */}
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-2 gap-8 font-bold">
                    <div className="flex justify-between">
                      <div>TOTAL RECEIPTS</div>
                      <div>₹ {fmt(receiptsTotal)}</div>
                    </div>

                    <div className="flex justify-between">
                      <div>TOTAL PAYMENTS</div>
                      <div>₹ {fmt(paymentsTotal)}</div>
                    </div>
                  </div>
                </div>

              </div>



            </div>
          );
        })() : (
          <div className="mt-4 text-gray-500">Search for a date range to load the report</div>
        )}

        {/* toast */}
        {Response.status && (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
      </div>
    </>
  );
}