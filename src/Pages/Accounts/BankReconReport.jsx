import React, { useEffect, useState } from 'react'
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import { URL } from '../../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiDownload } from 'react-icons/fi';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";


export const BankReconReport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
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
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [reportList, setReportList] = useState([]);


  const fetchBankDropdown = async () => {
    try {
      const res = await axios.get(`${URL}/banks/dropdown-all`, {
        headers: { Authorization: token },
      });

      if (res.data?.status === "Success") {
        setBankOptions(res.data.banks || []);
      }
    } catch (err) {
      console.error("Bank dropdown fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBankDropdown();
  }, []);


  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${URL}/bank-recon/report`, {
        headers: { Authorization: token },
        params: {
          bankId: selectedBank,
          method: statusFilter === "UPI" ? "UPI Payment" : statusFilter,
          search: searchTerm,
          startDate,
          endDate,
        },
      });

      setReportList(res.data.data || []);
    } catch (err) {
      console.error("BRS report fetch error:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedBank, statusFilter, searchTerm, startDate, endDate]);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB");
  };

  const getBankName = () => {
    if (!selectedBank) return "All Banks";
    const b = bankOptions.find(x => x._id === selectedBank);
    return b?.bank_name || "All Banks";
  };

  const downloadPDF = () => {
    if (!reportList.length) {
      showToast("Failed", "No data to export");
      return;
    }

    const doc = new jsPDF("landscape");

    // ================= HEADER (FIRST PAGE ONLY)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      "CSI CHRIST CHURCH 1558, TRICHY ROAD, COIMBATORE - 641018",
      doc.internal.pageSize.getWidth() / 2,
      12,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.text(
      "BRS Statement",
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: "center" }
    );

    // ================= FILTER LINE
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let filterText = `Filtered by: ${statusFilter}`;

    filterText += ` | Bank: ${getBankName()}`;

    if (startDate || endDate) {
      filterText += ` | From ${formatDate(startDate)} to ${formatDate(endDate)}`;
    }

    doc.text(filterText, 14, 28);

    // ================= TABLE DATA
    const tableRows = reportList.map((item, index) => [
      index + 1,
      formatDate(item.receiptDate),
      item.autoReceiptId,
      item.chequeNumber || item.upiId || "-",
      formatDate(item.chequeDate),
      item.drCr,
      formatDate(item.realisedDate),
      item.amount,
      item.returned ? formatDate(item.realisedDate) : "-",
      item.returned ? item.returnReason || "-" : "-",
    ]);

    // ================= TABLE
    autoTable(doc, {
      startY: 32,
      head: [[
        "Sl No",
        "Trans Date",
        "Trans ID",
        "Cheque/UPI",
        "Cheque Date",
        "Dr/Cr",
        "Realised Date",
        "Amount",
        "Return Date",
        "Return Reason",
      ]],
      body: tableRows,

      styles: {
        fontSize: 8,
        textColor: 0,          // ✅ pure black text
        lineColor: 0,          // ✅ black borders
        lineWidth: 0.1,
      },

      headStyles: {
        fillColor: [255, 255, 255], // ✅ white header background
        textColor: 0,                // ✅ black header text
        lineColor: 0,
        lineWidth: 0.2,
        fontStyle: "bold",
      },

      bodyStyles: {
        fillColor: [255, 255, 255], // ✅ no zebra color
      },

      alternateRowStyles: {
        fillColor: [255, 255, 255], // ✅ remove grey stripes
      },

      didDrawPage: function () {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;

        doc.setFontSize(9);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          pageSize.getWidth() - 40,
          pageSize.getHeight() - 8
        );
      },
    });


    doc.save("BRS_Report.pdf");
  };


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg text-lavender--600 font-semibold">B.R.S Report</h1>
          {["admin", "treasurer"].includes(userRole) && (
          <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={downloadPDF} />
          )}
        </div>
        <div className="flex items-center justify-between p-2">

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-md text-gray-600 mb-1">Payment Method</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-md text-gray-600 mb-1">Banks</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-60 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="">All Bank</option>

              {bankOptions.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bank_name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-center p-2">
          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-sm text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Trans. Date</th>
                <th className="p-2 text-center">Trans. ID</th>
                <th className="p-2 text-center">Cheque No</th>
                <th className="p-2 text-center">Cheque Date</th>
                <th className="p-2 text-center">Dr / Cr</th>
                <th className="p-2 text-center">Realised Date</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Return Date</th>
                <th className="p-2 text-center">Return Reason</th>
              </tr>
            </thead>
            <tbody>
              {reportList.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-400">
                    No records found
                  </td>
                </tr>
              )}

              {reportList.map((item, index) => (
                <tr key={item._id} className="border-b text-sm">
                  {/* Sl No */}
                  <td className="p-2 text-center">{index + 1}</td>

                  {/* Trans Date */}
                  <td className="p-2 text-center">
                    {new Date(item.receiptDate).toLocaleDateString()}
                  </td>

                  {/* Trans ID */}
                  <td className="p-2 text-center">{item.autoReceiptId}</td>

                  {/* Cheque / UPI */}
                  <td className="p-2 text-center">
                    {item.chequeNumber || item.upiId || "-"}
                  </td>

                  {/* Cheque Date */}
                  <td className="p-2 text-center">
                    {item.chequeDate
                      ? new Date(item.chequeDate).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Dr / Cr */}
                  <td className="p-2 text-center">
                    <span
                      className={
                        item.drCr === "Debit"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {item.drCr}
                    </span>
                  </td>

                  {/* Realised Date */}
                  <td className="p-2 text-center">
                    {item.realisedDate
                      ? new Date(item.realisedDate).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Amount */}
                  <td className="p-2 text-center">₹{item.amount}</td>

                  {/* Return Date */}
                  <td className="p-2 text-center">
                    {item.returned && item.realisedDate
                      ? new Date(item.realisedDate).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Return Reason */}
                  <td className="p-2 text-center">
                    {item.returned ? item.returnReason || "-" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

    </>
  )
}
