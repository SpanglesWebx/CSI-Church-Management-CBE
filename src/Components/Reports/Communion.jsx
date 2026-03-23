import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct
import { notoSansTamil } from '../../../NotoSansTamil';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { jwtDecode } from "jwt-decode";

const URL = import.meta.env.VITE_BACKEND_API_URL;

import down from './icon/downloade.svg';
// import print from './icon/print.svg';

const tableHeading = [
  'Sl. no.',
  'Member ID',
  'Member Name',
  'Member Tamil Name',
  'Communion Date',
  'Family ID',
  'Status',
];

const ReportPage = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Zero-based index for pagination
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();
  const [showTamilOnly, setShowTamilOnly] = useState(false);
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


  // Reference for AbortController
  const abortControllerRef = useRef(new AbortController());

  // Fetch data function
  const fetchData = async () => {
    try {
      const response = await axios.get(`${URL}/reports/communion`, {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          fromdate: dateRange.from || undefined,
          todate: dateRange.to || undefined,
          search: searchTerm || undefined,
          page: currentPage + 1, // API expects 1-based index
          limit: itemsPerPage,
        },
        signal: abortControllerRef.current.signal, // Pass the abort signal
      });
      setData(response.data.Communion);
      setFilteredData(response.data.Communion);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
      }
    }
  };
  // Debounce effect for API calls
  const debounceFetchData = useRef(null);

  useEffect(() => {
    // Clear the debounce timeout
    clearTimeout(debounceFetchData.current);

    // Debounced fetch data logic
    debounceFetchData.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Cancel the previous request
      }
      const newController = new AbortController(); // Create a new AbortController
      abortControllerRef.current = newController; // Update the reference
      fetchData(newController.signal); // Fetch data with the new signal
    }, 500); // Debounce delay of 500ms

    return () => {
      clearTimeout(debounceFetchData.current); // Cleanup debounce timeout
    };
  }, [statusFilter, searchTerm, currentPage]);

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Cancel the previous request
      }
      const newController = new AbortController();
      abortControllerRef.current = newController;
      fetchData(newController.signal);
    } else if(!dateRange.from && !dateRange.to){
      // Clear previous debounce timeout and set a new one
clearTimeout(debounceFetchData.current);

// Debounced function to fetch data
debounceFetchData.current = setTimeout(() => {
// Cancel the previous request before making a new one
abortControllerRef.current.abort();
abortControllerRef.current = new AbortController(); // Create a new instance for next request
return fetchData();
}, 500); 
}
  }, [dateRange]);
  // Reset to page 1 (index 0) when search term or date range changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, dateRange]);


  
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };



  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  //   // Embed Tamil font
  //           doc.addFileToVFS("NotoSansTamil.ttf", notoSansTamil);
  //           doc.addFont("NotoSansTamil.ttf", "NotoSansTamil", "normal");
  
  //   // Function to add title on each page
  //   const addTitle = (doc, title) => {
  //     doc.setFontSize(18);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(title, doc.internal.pageSize.width / 2, 15, { align: "center" });
  //   };
  
  //   const headers = [
  //         tableHeading,
  //       ];
  //   const rows = filteredData.map((item, index) => [
  //     index + 1,
  //     item.member_id,
  //     item.member_name,
  //     item.member_tamil_name,
  //     moment(item.baptized_date).format("YYYY-MM-DD"),
  //     item.secondary_family_id || item.primary_family_id,
  //     item.status,
  //   ]);
  
  //   doc.autoTable({
  //     head: headers,
  //     body: rows,
  //     startY: 25, // Push table down
  //     margin: { top: 25 ,left: 10,right:10 }, // Ensure title does not overlap
  //     didDrawPage: (data) => {
  //       addTitle(doc, "Communion Reports"); // Ensure title is added before table
  //     },
  //     styles: {
  //       font: "helvetica", // Default for English
  //       fontSize: 10,
  //     },
  //     columnStyles:{
  //       0: { halign: "center" },
  //       1: { halign: "center" },
  //       3: { font: "NotoSansTamil" },
  //       4: { halign: "center" },
  //       5: { halign: "center" },
  //       6: { halign: "center" },
  //     },
  //     headStyles: {
  //       fontStyle: "bold",
  //       halign: "center",
  //     },
  //   });
  
  //   doc.save(" CommunionReports.pdf");
  // };




  const handleDownloadExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Communion Report", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.6,
          bottom: 0.6,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // Title Row
    const titleRow = worksheet.addRow(["Communion Reports"]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center" };

    const totalCols = showTamilOnly ? 6 : 7;
    const mergeEnd = String.fromCharCode(64 + totalCols);
    worksheet.mergeCells(`A${titleRow.number}:${mergeEnd}${titleRow.number}`);

    worksheet.addRow([]); // Spacer row

    // Headers
    const headers = [
      "SI.No.",
      "Member ID",
      !showTamilOnly ? "Member Name" : null,
      "Member Tamil Name",
      "Baptized Date",
      "Family ID",
      "Status",
    ].filter(Boolean);

    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Data rows
    filteredData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.member_id,
        !showTamilOnly ? item.member_name : null,
        item.member_tamil_name,
        moment(item.baptized_date).format("YYYY-MM-DD"),
        item.secondary_family_id || item.primary_family_id,
        item.status,
      ].filter((val) => val !== null);

      const row = worksheet.addRow(rowData);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          horizontal: [1, 2, 5, 6].includes(colNumber) ? "center" : "left",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    // Adjust column widths
    worksheet.columns = showTamilOnly
      ? [
          { width: 8 },   // SI.No.
          { width: 15 },  // Member ID
          { width: 28 },  // Member Tamil Name
          { width: 20 },  // Baptized Date
          { width: 20 },  // Family ID
          { width: 15 },  // Status
        ]
      : [
          { width: 8 },   // SI.No.
          { width: 15 },  // Member ID
          { width: 25 },  // Member Name
          { width: 28 },  // Member Tamil Name
          { width: 20 },  // Baptized Date
          { width: 20 },  // Family ID
          { width: 15 },  // Status
        ];

    // Save as Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "CommunionReports.xlsx");
  } catch (error) {
    console.error("Excel generation failed:", error);
    alert("Failed to generate Excel. Check console.");
  }
};




  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Calculate the offset for the current page
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredData.slice(offset, offset + itemsPerPage);

  return (
    <div className="relative h-auto ml-5 w-[100%] bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-lavender--600">Communion Reports</h2>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />
            }
            label="Tamil Names Only"
          />
          {userRole !== "churchofficeworker" && (
          <div className="flex gap-x-5">
            <button
              onClick={handleDownloadExcel}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} alt="Download" />
            </button>
            {/* Uncomment the below for Print */}
            {/* <button onClick={handlePrint} className="text-blue-600 cursor-pointer hover:text-blue-800">
              <img src={print} alt="Print" />
            </button> */}
          </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-600">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div ref={componentRef}>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {tableHeading.filter((heading) => !(showTamilOnly && heading === "Member Name")).map(heading => (
                  <th key={heading} className="px-4 py-2 text-base text-center text-gray-700 bg-white border-b dark:bg-gray-700 dark:text-gray-400">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => (
                <tr key={index} className="px-2 py-2 border-t border-gray-200">
                  <td className="px-4 py-2 text-sm text-center">{offset + index + 1}</td>
                  <td className="px-4 py-2 text-sm text-center">{item.member_id}</td>
                  {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  )}
                  <td className="px-4 py-2 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-2 text-sm text-center">{moment(item.communion_date).format('DD-MM-YYYY')}</td>
                  <td className="px-4 py-2 text-sm text-center">{item.secondary_family_id || item.primary_family_id}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`text-${item.status === 'Active' ? 'green' : 'red'}-500`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <div className="flex items-center justify-center select-none">
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={'...'}
            pageCount={Math.ceil(filteredData.length / itemsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            activeClassName={'active'}
            forcePage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
