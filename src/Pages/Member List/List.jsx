import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { URL } from "../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../../Components/Spinners";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import Dropdown from "../../Components/Helpers/DropDown";
import { notoSansTamil } from '../../../NotoSansTamil';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function List() {
  const token = window.sessionStorage.getItem("token");
  const [categories, setCategories] = useState(["All", "Active", "Inactive"]);
  const navigate = useNavigate();
  const location = useLocation();
  const [Data, setData] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use a ref to store the AbortController
  const abortControllerRef = useRef(null);

  // Load search and status from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const pageParam = parseInt(params.get("page")) || 1;
    const statusParam = params.get("status") || "All";

    setSearch(searchParam);
    setCurrentPage(pageParam);
    setSelectedCategory(statusParam);

    fetchData(pageParam, searchParam, statusParam);
  }, [location.search]);



  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false; // Skip on the first render
      return;
    }

    const params = new URLSearchParams();
    if (Search) {
      params.append("search", Search);
    }
    if (CurrentPage) {
      params.append("page", CurrentPage);
    }
    if (selectedCategory) {
      params.append("status", selectedCategory);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [Search, CurrentPage, selectedCategory, navigate]);



  const fetchData = async (page, search, status) => {

    // Abort the previous request if one exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for the current request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    setLoading(true);
    try {
      const statusQuery = status === "All" ? "" : status;
      const response = await axios.get(
        `${URL}/member/list?search=${search}&page=${page}&limit=15&status=${statusQuery}`,
        {
          headers: {
            Authorization: token,
          },
          signal, // Pass the signal to Axios
        }
      );

      setData(response.data.RegisteredData);
      setTotalPages(response.data.TotalPages);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error(error);
        if (error.response) {
          if (error.response.status === 401) {
            setResponse({
              status: "Failed",
              message: "Unauthorized! Please Login Again.",
            });
            setTimeout(() => {
              window.sessionStorage.clear();
              navigate("/");
            }, 1000);
          }
          if (error.response.status === 500) {
            setResponse({
              status: "Failed",
              message: "Server Unavailable!",
            });
            setTimeout(() => {
              setResponse({
                status: null,
                message: "",
              });
            }, 1000);
          }
        } else {
          setResponse({
            status: "Failed",
            message: "An unexpected error occurred",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedCategory(item); // Update selected category (status)
  };












  const handleDownloadExcel = async () => {
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;

      const res = await axios.get(
        `${URL}/member/download-list?status=${statusQuery}`,
        { headers: { Authorization: token } }
      );

      const Data = res.data.RegisteredData;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Member List", {
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
        },
      });

      // Freeze header row
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      // Title row
      const title =
        selectedCategory === "All"
          ? "Member List"
          : `${selectedCategory} Member List`;
      const titleRow = worksheet.addRow([title]);
      titleRow.font = { size: 14, bold: true };
      titleRow.alignment = { horizontal: "center" };
      const totalCols = showTamilOnly ? 5 : 7;
      worksheet.mergeCells(`A${titleRow.number}:${String.fromCharCode(64 + totalCols)}${titleRow.number}`);
      worksheet.addRow([]); // Spacer

      // Headers
      const headers = showTamilOnly
        ? ["SI.No.", "Member ID", "Member Tamil Name", "Family ID", "Status"]
        : [
          "SI.No.",
          "Member ID",
          "Member Name",
          "Member Tamil Name",
          "Family ID",
          "Family Head Name",
          "Status",
          "Email",
        ];

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
      Data.forEach((item, index) => {
        const rowData = showTamilOnly
          ? [
            index + 1,
            item.member_id,
            item.member_tamil_name,
            item.family_id,
            item.status,
            item.email,
          ]
          : [
            index + 1,
            item.member_id,
            item.member_name,
            item.member_tamil_name,
            item.family_id,
            item.family_head_name,
            item.status,
            item.email,
          ];

        const row = worksheet.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            horizontal: [1, 2, 4, 5].includes(colNumber) ? "center" : "left",
            vertical: "middle",
            wrapText: true,
          };
        });
      });

      // Adjusted column widths
      worksheet.columns = showTamilOnly
        ? [
          { width: 8 },   // SI.No.
          { width: 15 },  // Member ID
          { width: 25 },  // Member Tamil Name
          { width: 15 },  // Family ID
          { width: 15 },  // Status
          { width: 25 },
        ]
        : [
          { width: 8 },   // SI.No.
          { width: 15 },  // Member ID
          { width: 22 },  // Member Name
          { width: 25 },  // Member Tamil Name
          { width: 15 },  // Family ID
          { width: 22 },  // Family Head Name
          { width: 15 },  // Status
          { width: 25 },
        ];

      // Generate and download Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = `${title.replace(/\s+/g, "_")}.xlsx`;
      saveAs(blob, filename);
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
              Member List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <FormControlLabel control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />}
              label="Tamil Names Only" />
            <div className="w-full lg:w-auto">
              <Dropdown
                items={categories}
                onSelect={handleSelect}
                label="Status"
                selected={selectedCategory}  // Ensure the dropdown reflects the selected status
              />
            </div>

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
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleDownloadExcel}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>
          </div>
        </div>

        {loading ? (
          <Spinners />
        ) : Data && Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center">
              <tr>
                {[
                  "Sl.No",
                  "Member Id",
                  "Member Name",
                  "Member Tamil Name",
                  "Family Id",
                  "Family Head Name",
                  "Status",
                  "Action",
                ].filter((heading) => {
                  if (showTamilOnly && (heading === "Member Name" || heading === "Family Head Name")) {
                    return false;
                  }
                  return true;
                })
                  .map((item, index) => (
                    <th scope="col" className="px-4 py-3" key={index}>
                      {item}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => (
                <tr
                  key={item.member_id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-4 py-4 text-sm text-center">{((CurrentPage - 1) * 15) + (index + 1)}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.member_id}</td>
                  {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  )}
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.family_id}</td>

                  {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{item.family_head_name}</td>
                  )}
                  <td
                    className={`${item.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                      } px-4 py-4 text-sm font-semibold text-center`}
                  >
                    {item.status}
                  </td>
                  <td className=" px-4 py-4 text-sm text-center">
                    <Link
                      to={`/admin/member/${item.member_id}/preview`}
                      className="px-1.5 py-1  rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye "></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <tbody>
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400"
                >
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
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
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
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
