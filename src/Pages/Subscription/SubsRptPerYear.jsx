import React, { useEffect, useState } from 'react'
import { FiDownload } from 'react-icons/fi';
import { jwtDecode } from "jwt-decode";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Pagination from '../../Components/Helpers/Pagination';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from 'axios';
import { URL } from "../../App";

export const SubsRptPerYear = () => {
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [userRole, setUserRole] = useState("");
  const [data, setData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const getFY = (yearOffset = 0) => {
    const today = new Date();
    const currentYear =
      today.getMonth() + 1 >= 4
        ? today.getFullYear()
        : today.getFullYear() - 1;

    // ❌ prevent future
    if (yearOffset > 0) yearOffset = 0;

    const startYear = currentYear + yearOffset;

    return {
      from: `${startYear}-04-01`,
      to: `${startYear + 1}-03-31`,
      label: `${String(startYear).slice(2)}-${String(startYear + 1).slice(2)}`
    };
  };

  const [fyOffset, setFyOffset] = useState(0);
  const [fy, setFy] = useState(getFY(0));

  const handlePrevFY = () => {
    const newOffset = fyOffset - 1;
    setFyOffset(newOffset);
    setFy(getFY(newOffset));
    setData([]); // clear data
    setCurrentPage(1);
    setHasSearched(false);
    setTotalPages(0);
  };

  const handleNextFY = () => {
    if (fyOffset >= 0) return;
    const newOffset = fyOffset + 1;
    setFyOffset(newOffset);
    setFy(getFY(newOffset));
    setData([]); // clear data
    setCurrentPage(1);
    setHasSearched(false);
    setTotalPages(0);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${URL}/subscriptions/report/year`,
        {
          params: {
            from: fy.from,
            to: fy.to,
            page: CurrentPage,
            limit: rowsPerPage,
            search: searchTerm // ✅ ADD
          },
          headers: { Authorization: token }
        }
      );

      const receivedData = res.data.data || [];
      const totalCount = res.data.totalCount || 0;

      setData(receivedData);

      // ✅ FIX: if no data → no pagination
      if (totalCount === 0) {
        setTotalPages(0);
      } else {
        setTotalPages(res.data.totalPages || 1);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ✅ STOP LOADING
    }
  };
  const handleSearch = () => {
    setCurrentPage(1);      // reset pagination
    setHasSearched(true);   // allow fetching
  };

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, CurrentPage, rowsPerPage]);

  const downloadPDF = async () => {
    try {
      // 🔥 Fetch ALL data (no pagination)
      const res = await axios.get(
        `${URL}/subscriptions/report/year`,
        {
          params: {
            from: fy.from,
            to: fy.to,
            search: searchTerm,
            download: true
          },
          headers: { Authorization: token }
        }
      );

      const fullData = res.data.data || [];

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // =========================
      // HEADER (FIRST PAGE ONLY)
      // =========================
      doc.setFontSize(14);
      doc.text("CSI CHRIST CHURCH CBE", pageWidth / 2, 10, { align: "center" });

      doc.setFontSize(12);
      doc.text("REPORT BY YEAR", pageWidth / 2, 16, { align: "center" });

      doc.text(`FINANCIAL YEAR ${fy.label}`, pageWidth / 2, 22, { align: "center" });

      // =========================
      // TABLE
      // =========================
      autoTable(doc, {
        startY: 28,
        head: [["Sl No", "Member ID", "Member Name", "Amount"]],
        body: fullData.map((d, i) => [
          i + 1,
          d.member_id,
          d.member_name,
          d.total
        ]),
        styles: {
          fontSize: 9
        },
        headStyles: {
          fillColor: [41, 128, 185]
        }
      });

      // =========================
      // FOOTER (AFTER TABLE RENDER)
      // =========================
      const totalPages = doc.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setFontSize(10);

        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,           // ✅ center horizontally
          pageHeight - 10,         // bottom
          { align: "center" }
        );
      }

      // =========================
      // SAVE
      // =========================
      doc.save(`Subscription_Report_${fy.label}.pdf`);

    } catch (err) {
      console.error("PDF error:", err);
    }
  };
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold text-lavender--600">Subscribed Members</h1>
          {["admin", "treasurer"].includes(userRole) && (
            <div className="flex items-center justify-between gap-3">
              <FiDownload onClick={downloadPDF} size={20} className="text-lavender--600 cursor-pointer" title="Download" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-2">

          {/* Search */}
          <div className="relative">
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setHasSearched(false);
              }}
            />
          </div>
          <div className="flex items-center space-x-3">
            <FaChevronLeft onClick={handlePrevFY} size={20} className='text-lavender--600 cursor-pointer' title='Previous' />
            <label>From</label>
            <input type="date" value={fy.from} readOnly onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={fy.to} readOnly onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <FaChevronRight
              onClick={fyOffset >= 0 ? undefined : handleNextFY}
              size={20}
              className={`${fyOffset >= 0
                  ? "opacity-40 cursor-not-allowed"
                  : "text-lavender--600 cursor-pointer"
                }`}
              title="Next"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Monthly Subs. (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-lavender--600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center">{item.member_id}</td>
                    <td className="p-2 text-left">{item.member_name}</td>
                    <td className="p-2 text-center">{item.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
        {TotalPages > 0 && data.length > 0 && (
          <Pagination
            currentPage={CurrentPage}
            totalPages={TotalPages}
            rowsPerPage={rowsPerPage}
            rowsInput={rowsInput}
            jumpInput={jumpInput}
            setCurrentPage={setCurrentPage}
            setRowsPerPage={setRowsPerPage}
            setRowsInput={setRowsInput}
            setJumpInput={setJumpInput}
            defaultRows={25}
          />)}
      </div>
    </>
  )
}
