import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { URL } from "../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../../Components/Spinners";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf"; //npm install jspdf@^2.5.1 jspdf-autotable@^3.8.2 required jspdf version: 2.5.1 required jspdf-autotable 3.8.2 "To use the download function, the above version of dependencies are required. Latest version of both jspdf and jspdf-autotable does not support file download"
import 'jspdf-autotable'; //npm install jspdf@^2.5.1 jspdf-autotable@^3.8.2 required jspdf version: 2.5.1 required jspdf-autotable 3.8.2
import moment from "moment";
import Dropdown from "../../Components/Helpers/DropDown";
import { notoSansTamil } from '../../../NotoSansTamil';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


function List() {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [showTamilOnly, setShowTamilOnly] = useState(false);


  const [Data, setData] = useState([]);
  const [categories, setCategories] = useState(["All", "Active", "Inactive"]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const [isFirstRender, setIsFirstRender] = useState(true);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Get search parameters from URL
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const pageParam = parseInt(params.get("page")) || 1;

    setSearch(searchParam);
    setCurrentPage(pageParam);

    fetchData(pageParam, searchParam);
  }, [location.search, isFirstRender]);

  const fetchData = async (page, search) => {
    // Abort the previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    setLoading(true);

    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
      const response = await axios.get(
        `${URL}/family/list?search=${search}&page=${page}&limit=15&status=${statusQuery}`,
        {
          headers: { Authorization: token },
          signal, // Pass signal for aborting
        }
      );
      setData(response.data.RegisteredData);
      setTotalPages(response.data.TotalPages);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      navigate(`?search=${newSearch}&page=1`);
    }, 300); // Wait 300ms after the user stops typing
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    navigate(`?search=${Search}&page=${newPage}`);
  };

  const tableHeading = [
    "Sl. no.",
    "Family ID",
    "Member Id",
    "Family Head Name",
    "Family Head Tamil Name",
    // "Status",
    "Action",
  ];

  const handleSelect = (item) => {
    setSelectedCategory(item);
    setCurrentPage(1);
    navigate(`?search=${Search}&page=1`);
  };
  const [isDownloading, setIsDownloading] = useState(false);

  // const handleDownloadPDF = async () => {
  //   try {
  //     const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
  //     const res = await axios.get(
  //       `${URL}/family/download-list?status=${statusQuery}`,
  //       { headers: { Authorization: token } }
  //     );

  //     const Data = res.data.RegisteredData;
  //     const doc = new jsPDF();
  //     const headers = [["Sl. No.", "Family ID", "Member ID", "Family Head Name"]];

  //     const rows = Data.map((item, index) => [
  //       index + 1,
  //       item.family_id,
  //       item.member_id,
  //       item.family_head_name,
  //     ]);

  //     doc.autoTable({
  //       head: headers,
  //       body: rows,
  //     });

  //     doc.save("Family Reports.pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };














  // const handleDownloadPDF = async () => {
  //   try {
  //     const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
  //     const res = await axios.get(
  //       `${URL}/family/download-list?status=${statusQuery}`,
  //       { headers: { Authorization: token } }
  //     );

  //     const Data = res.data.RegisteredData; 
  //     const doc = new jsPDF();

  //     const title = "Family List"; // Title to appear on each page

  //     // Function to add title before the table
  //     const addTitle = (doc, title) => {
  //       doc.setFontSize(16);
  //       doc.setFont("helvetica", "bold");
  //       doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
  //     };

  //     const headers = [["Sl. No.", "Family ID", "Member ID", "Family Head Name","Family Head Tamil Name"]];

  //     const rows = Data.map((item, index) => [
  //       index + 1,
  //       item.family_id,
  //       item.member_id,
  //       item.family_head_name,
  //       item.member_tamil_name,
  //     ]);

  //     doc.autoTable({
  //       head: headers,
  //       body: rows,
  //       margin: { top: 35 }, // Push table down to avoid overlap
  //       didDrawPage: function (data) {
  //         addTitle(doc, title); // Add title on every page
  //       },
  //     });

  //     doc.save("Family Reports.pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };














  //the main download function of all time
  // const handleDownloadPDF = async () => {
  //   try {
  //     const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
  //     const res = await axios.get(
  //       `${URL}/family/download-list?status=${statusQuery}`,
  //       { headers: { Authorization: token } }
  //     );

  //     const Data = res.data.RegisteredData;
  //     const doc = new jsPDF();

  //     // Embed Tamil font
  //     doc.addFileToVFS("NotoSansTamil.ttf", notoSansTamil);
  //     doc.addFont("NotoSansTamil.ttf", "NotoSansTamil", "normal");

  //     const title = "Family List";

  //     const addTitle = (doc, title) => {
  //       doc.setFontSize(16);
  //       doc.setFont("helvetica", "bold");
  //       doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
  //     };

  //     const headers = [
  //       ["Sl. No.", "Family ID", "Member ID", "Family Head Name", "Family Head Tamil Name"]
  //     ];

  //     const rows = Data.map((item, index) => [
  //       index + 1,
  //       item.family_id,
  //       item.member_id,
  //       item.family_head_name,
  //       item.member_tamil_name
  //     ]);

  //     doc.autoTable({
  //       head: headers,
  //       body: rows,
  //       margin: { top: 35 },
  //       didDrawPage: () => addTitle(doc, title),
  //       styles: {
  //         font: "helvetica", // Default for English
  //         fontSize: 10,
  //       },
  //       columnStyles: {
  //         0: { halign: "center" },
  //         1: { halign: "center" },
  //         2: { halign: "center" },
  //         4: { font: "NotoSansTamil" } // Apply Tamil font only to "Family Head Tamil Name"
  //       },
  //       headStyles: {
  //         fontStyle: "bold",
  //         halign: "center",
  //       },
  //     });

  //     doc.save("Family Reports.pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };












  const handleDownloadExcel = async () => {
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;

      const res = await axios.get(
        `${URL}/family/download-list?status=${statusQuery}`,
        { headers: { Authorization: token } }
      );

      const Data = res.data.RegisteredData;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Family List", {
        pageSetup: {
          paperSize: 9,
          orientation: "portrait",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          horizontalCentered: true,
          margins: {
            left: 0.3,
            right: 0.3,
            top: 0.5,
            bottom: 0.5,
            header: 0.3,
            footer: 0.3,
          },
        }
      });

      // Conditionally define headers
      const headers = showTamilOnly
        ? ["Sl. No.", "Family ID", "Member ID", "Family Head Tamil Name"]
        : ["Sl. No.", "Family ID", "Member ID", "Family Head Name", "Family Head Tamil Name"];

      worksheet.addRow(headers);

      // Style the header row
      const headerRow = worksheet.getRow(1);
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

      // Add data rows
      Data.forEach((item, index) => {
        const rowValues = showTamilOnly
          ? [index + 1, item.family_id, item.member_id, item.member_tamil_name]
          : [index + 1, item.family_id, item.member_id, item.family_head_name, item.member_tamil_name];

        const row = worksheet.addRow(rowValues);

        row.eachCell((cell, colNumber) => {
          const isLeftAlign = showTamilOnly
            ? colNumber === 4 // Tamil name
            : colNumber === 4 || colNumber === 5;

          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            horizontal: isLeftAlign ? "left" : "center",
            vertical: "middle",
            wrapText: true,
          };
        });
      });

      // Adjust columns widths conditionally
      worksheet.columns = showTamilOnly
        ? [
          { width: 8 },
          { width: 15 },
          { width: 15 },
          { width: 22 },
        ]
        : [
          { width: 8 },
          { width: 15 },
          { width: 15 },
          { width: 20 },
          { width: 22 },
        ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      saveAs(blob, "Family_Report.xlsx");
    } catch (error) {
      console.error("Excel generation failed:", error);
      alert("Failed to generate Excel. Check console.");
    }
  };



  return (
    <React.Fragment>
      {isDownloading && (
        <div className="p-4 font-semibold text-center text-blue-500 bg-blue-100 rounded-md">
          Your download is in progress, please wait...
        </div>
      )}

      <div className="flex flex-col w-full p-4 mt-5 space-y-10 bg-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between space-y-5">
          <div className="inline-flex space-x-3">
            <h1 className="text-lg font-semibold text-lavender--600">
              Family List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            {/* <div className="w-full lg:w-auto">
              <Dropdown
                items={categories}
                onSelect={handleSelect}
                label="Status"
              />
            </div> */}
            <FormControlLabel control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />}
              label="Tamil Names Only" />
            <div className="">

              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Search Members
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                  <svg
                    className="w-3 h-3 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                  placeholder="Search Members..."
                  value={Search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Link
              to={`/admin/family/add/new`}
              className="px-3 py-1 space-x-2 text-sm text-white rounded bg-lavender--600 hover:bg-lavender--600 focus:ring-4 focus:ring-lavender-light-400"
            >
              <i className="fa-solid fa-plus"></i> New Family
            </Link>

            <button
              onClick={handleDownloadExcel}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>
          </div>
        </div>
        {loading ? (
          <Spinners /> // Show spinner when loading is true
        ) : Data && Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {tableHeading
                  .filter((heading) => !(showTamilOnly && heading === "Family Head Name"))
                  .map((item, index) => (
                    <th scope="col" className="px-4 py-3 text-center" key={index}>
                      {item}
                    </th>
                  ))}

              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={item.head}
                >
                  <th
                    scope="row"
                    className="px-4 py-4 text-center text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {((CurrentPage - 1) * 15) + (index + 1)}
                  </th>
                  <td className="px-4 py-4 text-sm text-center">{item.family_id}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.head}</td>
                  {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  )}
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  {/* <td className="px-4 py-4 text-sm">{item.status}</td> */}
                  <td className=" px-4 py-4 text-sm text-center">
                    <Link
                      to={`/admin/family/${item.family_id}/preview`}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye text-center"></i>
                    </Link>
 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data found</div>
        )}


        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button
            onClick={() => handlePageChange(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${CurrentPage
              ? "bg-lavender--600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            {CurrentPage}
          </button>
          <button
            onClick={() => handlePageChange(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 w-[100px] py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex space-x-2 rounded right-5 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
            </span>
            <span
              onClick={() => handlePageChange(TotalPages)}
              className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
            >
              Last Page
            </span>
          </div>
        </div>


      </div>
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </React.Fragment>
  );
}

export default List;
