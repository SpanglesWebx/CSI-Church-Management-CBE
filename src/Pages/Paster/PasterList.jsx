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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTamilOnly, setShowTamilOnly] = useState(false);

  // ===== Pagination States (Carbon copy from NewFamilyList) =====
const [rowsPerPage, setRowsPerPage] = useState(15); // default matches backend
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");



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
    isInitialRender.current = false;
    return;
  }

  const params = new URLSearchParams();

  if (Search) params.append("search", Search);
  if (CurrentPage) params.append("page", CurrentPage);
  if (selectedCategory) params.append("status", selectedCategory);
  if (rowsPerPage) params.append("limit", rowsPerPage);

  navigate(`?${params.toString()}`, { replace: true });
}, [Search, CurrentPage, selectedCategory, rowsPerPage, navigate]);


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
        `${URL}/pastor/list?search=${search}&page=${page}&limit=${rowsPerPage}&status=${statusQuery}`,
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
      `${URL}/pastor/download-list?status=${statusQuery}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const Data = res.data.RegisteredData;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pastor List", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        horizontalCentered: true,
      },
    });

    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const title =
      selectedCategory === "All"
        ? "Pastor List"
        : `${selectedCategory} Pastor List`;

    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: "Arial", size: 14, bold: true }; // Arial supports Tamil Unicode
    titleRow.alignment = { horizontal: "center" };
    worksheet.mergeCells(`A1:${showTamilOnly ? "E" : "F"}1`);
    worksheet.addRow([]); // Spacer row

    // 🔁 Header Row
    const headers = showTamilOnly
      ? ["Sl.No", "Pastor Id", "Tamil Name", "Family Id", "Status"]
      : ["Sl.No", "Pastor Id", "Pastor Name", "Tamil Name", "Family Id", "Status"];

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

    // 🔁 Data Rows
    Data.forEach((item, index) => {
      const rowData = showTamilOnly
        ? [
            index + 1,
            item.member_id,
            item.member_tamil_name,
            item.familyId,
            item.status,
          ]
        : [
            index + 1,
            item.member_id,
            item.member_name,
            item.member_tamil_name,
            item.familyId,
            item.status,
          ];

      const row = worksheet.addRow(rowData);
      row.height = 24;
      row.eachCell((cell) => {
        cell.font = { name: "Arial Unicode MS", size: 11 }; // Unicode font for Tamil
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // 🔁 Adjust column widths
    worksheet.columns = (
      showTamilOnly
        ? [8, 15, 28, 18, 15]
        : [8, 15, 22, 28, 18, 15]
    ).map((w) => ({ width: w }));

    // 🔁 Save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${title.replace(/\s/g, "_")}.xlsx`);
    console.log("Excel generated successfully!");
  } catch (error) {
    console.error("Error generating Excel:", error);
  }
};

const getPaginationPages = () => {
  const pages = [];
  const range = 2;

  if (TotalPages <= 7) {
    for (let i = 1; i <= TotalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (CurrentPage > range + 2) pages.push("ellipsis-left");

  const start = Math.max(2, CurrentPage - range);
  const end = Math.min(TotalPages - 1, CurrentPage + range);

  for (let i = start; i <= end; i++) pages.push(i);

  if (CurrentPage < TotalPages - (range + 1)) pages.push("ellipsis-right");

  pages.push(TotalPages);

  return pages;
};


  return (
    <React.Fragment>
      {isDownloading && (
        <div className="p-2 font-semibold text-center text-blue-500 bg-blue-100 rounded-md">
          Your download is in progress, please wait...
        </div>
      )}

      <div className="flex flex-col w-full p-5 mt-5 space-y-10 bg-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between space-y-5">
          <div className="inline-flex space-x-3">
            <h1 className="text-lg font-semibold text-lavender--600">
              Pastor List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tamilOnly"
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="tamilOnly" className="text-sm">
                Tamil Names Only
              </label>
            </div>


            <div className="w-full lg:w-auto">
              <Dropdown
                items={categories}
                onSelect={handleSelect}
                label="Status"
                selected={selectedCategory} // Ensure the dropdown reflects the selected status
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
                  "Pastor Id",
                  !showTamilOnly && "Pastor Name",
                  "Tamil Name",
                  "Pastor Family Id",
                  "Status",
                  "Action",
                ]
                  .filter(Boolean)
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
                  <td className="px-4 py-4 text-sm text-center">
                    {(CurrentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">{item.member_id}</td>
                  {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  )}

                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.familyId}</td>
                  <td
                    className={`${item.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                      } px-4 py-4 text-sm font-semibold text-center`}
                  >
                    {item.status}
                  </td>
                  <td className="text-center px-4 py-4 text-sm">
                    <Link
                      to={`/admin/pastor/${item.member_id}/preview`}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye"></i>
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

        {/* Pagination */}
<div className="flex items-center justify-center space-x-2">

            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={CurrentPage === 1}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>

            {/* Page Numbers */}
            {getPaginationPages().map((page, index) => {
              if (typeof page === "string") {
                return (
                  <span key={page + index} className="px-3 py-2 text-gray-500">
                    …
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={` w-10 h-10 flex items-center justify-center rounded-full font-medium  ${page === CurrentPage
                    ? "bg-lavender--600 text-white"
                    : " hover:border-2 border-gray-300"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(TotalPages, p + 1))}
              disabled={CurrentPage === TotalPages}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>

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
