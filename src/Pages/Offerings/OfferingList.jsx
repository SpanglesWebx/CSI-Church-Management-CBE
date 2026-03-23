/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoIosSearch, IoMdPrint } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Dropdown from "../../Components/Helpers/DropDown";
import OfferingTable from "../../Components/Offerings/OfferingTable";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import Pagination from "../../Components/Helpers/Pagination";
import { MdVerified } from "react-icons/md";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import debounce from "lodash.debounce";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function OfferingList() {
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [Offerings, setOfferings] = useState([]);
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [memberError, setMemberError] = useState("");
  const [checkingMember, setCheckingMember] = useState(false);
  // const [checking_NO_Name_MemberID, setChecking_NO_Name_MemberID] = useState(true);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(null);
  const token = window.sessionStorage.getItem("token");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberVerified, setMemberVerified] = useState(false);
  console.log(category);

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  // ===== Pagination (FamilyList style – default 25) =====
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  const checking_NO_Name_MemberID = category === "NO_Name_Offerings" ? false : true;
  // console.log(checking_NO_Name_MemberID);

  const MemberDisable = checking_NO_Name_MemberID === false ? true : false;
  // console.log(MemberDisable);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: getCurrentDate(),
    },
  });
  const navigate = useNavigate();
  useEffect(() => {
    const memberId = watch("member_id");
    if (memberId) {
      checkMember(memberId);
    }
  }, [watch("member_id")]);

  const checkMember = async (memberId) => {
    if (memberId.length > 11) {
      setCheckingMember(true);
      setMemberError("");
      try {
        const response = await axios.get(
          `${URL}/offerings/member/verify/${memberId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        if (response.data) {
          setValue("member_name", response.data.member.member_name);
          setValue("member_tamil_name", response.data.member.member_tamil_name);
          setMemberDetails(response.data);
        } else {
          setMemberError("Member ID does not exist.");
          setValue("member_name", "");
          setValue("member_tamil_name", "");
          setMemberDetails(null);
        }
      } catch (error) {
        setMemberError("Member not found.");
        setValue("member_name", "");
        setMemberDetails(null);
        // if (error.response.status === 401) {
        //   window.sessionStorage.clear();
        //   navigate("/");
        // }
        if (error.response.status === 401) {
          setResponse({
            status: "Failed",
            message: "Un Authorized! Please Login Again.",
          });
          setTimeout(() => {
            window.sessionStorage.clear();
            navigate("/");
          }, 5000);
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
          }, 5000);
        }
      } finally {
        setCheckingMember(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const fetchOfferings = async (page, searchQuery, fromDate, toDate) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel the previous request
    }
    abortControllerRef.current = new AbortController(); // Create a new AbortController

    setLoading(true);
    try {
      const response = await axios.get(`${URL}/offerings/category`, {
        params: {
          category,
          page,
          limit: rowsPerPage,
          search: searchQuery,
          fromdate: fromDate,
          todate: toDate,
        },
        headers: {
          Authorization: token,
        },
        signal: abortControllerRef.current.signal, // Pass the signal here
      });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error("Error fetching offerings:", error);
        setOfferings([]);
        handleError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchOfferings(page, query, from, to).then((data) => {
        setOfferings(data?.offerings || []);
        // setCurrentPage(page||1);
        setTotalPages(data?.totalPages || 1);
        setTotalAmount(data?.totalAmount || 0);
      });
    }, 200);
  };

useEffect(() => {
  debounceFetch(CurrentPage, searchQuery, dateRange.from, dateRange.to);
}, [CurrentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1)
    debounceFetch(CurrentPage, searchQuery, dateRange.from, dateRange.to);

  }, [searchQuery, dateRange]);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setValue("date", today);
  }, [setValue]);

  const handleOpenModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);

    // Reset search fields and verification
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);
    setMemberVerified(false);

    reset({ date: getCurrentDate() });
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);

    // Reset search fields and verification
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);
    setMemberVerified(false);

    // Reset form fields
    reset();
    setIsModalOpen(false);
  };




  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (e.target.value && toDate) {
      setDateRange({ from: e.target.value, to: toDate });
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (fromDate && e.target.value) {
      setDateRange({ from: fromDate, to: e.target.value });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

  };

  const today = new Date().toISOString().split("T")[0];
  // const onSubmit = async (formData) => {
  //   formData.category = category;

  //   try {
  //     const res = await axios.post(`${URL}/offerings/add`, formData, {
  //       headers: {
  //         Authorization: token,
  //       },
  //     });
  //     console.log(res);
  //     reset();
  //     setIsModalOpen(false);
  //     const offeringData = await fetchOfferings(
  //       CurrentPage,
  //       searchQuery,
  //       fromDate,
  //       toDate
  //     );
  //     setOfferings(offeringData.offerings);
  //     setTotalAmount(offeringData.totalAmount);

  //     setTotalPages(offeringData.pages);

  //   } catch (error) {
  //     console.log(error);
  //     setServerError(error?.response?.data?.message);
  //     if (error.response.status === 401) {
  //       window.sessionStorage.clear();
  //       navigate("/");
  //     }
  //   }
  // };

  const onSubmit = async (formData) => {
    formData.category = category;

    try {
      const res = await axios.post(`${URL}/offerings/add`, formData, {
        headers: { Authorization: token },
      });

      // ✅ Show success toast
      setResponse({
        status: "Success",
        message: "Offering added successfully!",
      });
      setIsModalOpen(false);

      // Reset only the offering-specific fields (amount, description)
      setValue("amount", "");
      setValue("description", "");
      setMemberIdSearch("");
      setMemberNameSearch("");
      setMemberDropdownById([]);
      setMemberDropdownByName([]);
      setMemberVerified(false);
      setMemberDetails(null);

      // Refresh table
      const offeringData = await fetchOfferings(CurrentPage, searchQuery, fromDate, toDate);
      setOfferings(offeringData.offerings);
      setTotalAmount(offeringData.totalAmount);
      setTotalPages(offeringData.pages);

    } catch (error) {
      console.log(error);

      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Failed to add offering",
      });

      if (error.response?.status === 401) {
        window.sessionStorage.clear();
        navigate("/");
      }
    } finally {
      // Clear toast automatically after 3 seconds
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };




  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        `${URL}/offerings/category?category=${category}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&download=true`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const Data = response.data.offerings || [];

      if (!Data.length) {
        console.error("No data available to export.");
        return;
      }

      const totalAmount = Data.reduce((sum, item) => sum + (item.amount || 0), 0);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${category} Report`, {
        pageSetup: {
          paperSize: 9,
          orientation: "portrait",
          fitToPage: true,
          fitToWidth: 1,
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

      worksheet.views = [{ state: "frozen", ySplit: 4 }];

      // 🔷 Title Row
      const titleRow = worksheet.addRow([`${category} Report`]);
      titleRow.font = { size: 14, bold: true };
      titleRow.alignment = { horizontal: "center" };

      const colCount = category === "NO_Name_Offerings"
        ? (showTamilOnly ? 4 : 5)
        : (showTamilOnly ? 5 : 6);
      const mergeEnd = String.fromCharCode(64 + colCount);
      worksheet.mergeCells(`A1:${mergeEnd}1`);

      // 🔷 Total Row
      const totalRow = worksheet.addRow([
        "Total Amount:",
        ...Array(colCount - 2).fill(""),
        totalAmount,
      ]);
      totalRow.font = { bold: true };
      totalRow.alignment = { horizontal: "right" };
      worksheet.mergeCells(`A2:${String.fromCharCode(64 + colCount - 1)}2`);

      worksheet.addRow([]); // spacer

      // 🔷 Header Row
      const tableHeading = category !== "NO_Name_Offerings"
        ? [
          "SI.No.",
          "Member ID",
          !showTamilOnly ? "Member Name" : null,
          "Member Tamil Name",
          "Date",
          "Amount",
        ]
        : [
          "SI.No.",
          !showTamilOnly ? "Member Name" : null,
          "Member Tamil Name",
          "Date",
          "Amount",
        ];
      worksheet.addRow(tableHeading.filter(Boolean));

      const headerRow = worksheet.getRow(4);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // 🔷 Data Rows
      Data.forEach((item, index) => {
        const rowData =
          category !== "NO_Name_Offerings"
            ? [
              index + 1,
              item.member_id,
              !showTamilOnly ? item.member_name : null,
              item.member_tamil_name,
              moment(item.date).format("YYYY-MM-DD"),
              item.amount,
            ]
            : [
              index + 1,
              !showTamilOnly ? item.member_name : null,
              item.member_tamil_name,
              moment(item.date).format("YYYY-MM-DD"),
              item.amount,
            ];

        const row = worksheet.addRow(rowData.filter((v) => v !== null));
        row.height = 30;

        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber === rowData.length ? "right" : "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // 🔷 Column Widths
      const widths =
        category !== "NO_Name_Offerings"
          ? showTamilOnly
            ? [8, 16, 28, 18, 14] // without Member Name
            : [8, 16, 22, 28, 18, 14]
          : showTamilOnly
            ? [8, 28, 18, 14]
            : [8, 22, 28, 18, 14];

      worksheet.columns = widths.map((w) => ({ width: w }));

      // 🔷 Export
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `${category}_Report_${fromDate}_to_${toDate}.xlsx`);
      console.log("Excel generated successfully!");
    } catch (error) {
      console.error("Error generating Excel report:", error);
    }
  };




  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownById([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownById(res.data);
          setMemberError("");
        } else {
          setMemberDropdownById([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownById([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  const debouncedSearchMemberByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownByName([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownByName(res.data);
          setMemberError("");
        } else {
          setMemberDropdownByName([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownByName([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

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
    <div className="p-1">
      <div className="flex flex-col items-center justify-between px-3 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-11">
        <div className="text-xl font-bold capitalize">{category}</div>
        {/* <div className="flex space-x-5">
          <MdOutlineFileDownload
            size={25}
            className="cursor-pointer text-lavender--600"
          />
          <IoMdPrint size={25} className="cursor-pointer text-lavender--600" />
        </div> */}
      </div>

      <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-xl ">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center  space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex flex-col items-start w-full px-1 space-y-2 border rounded-l lg:flex-row lg:items-center lg:space-y-0 lg:w-auto">
              <label htmlFor="from-date" className="text-gray-700">
                From:
              </label>
              <input
                type="date"
                id="from-date"
                className="px-2 py-1 border-0 rounded focus:ring-0"
                max={today}
                value={fromDate}
                onChange={handleFromDateChange}
              />
            </div>

            <div className="flex flex-col items-start w-full px-1 space-y-2 border rounded-lg lg:flex-row lg:items-center lg:space-y-0 lg:w-auto">
              <label htmlFor="to-date" className="text-gray-700">
                To:
              </label>
              <input
                type="date"
                id="to-date"
                className="px-2 py-1 border-0 rounded focus:ring-0"
                max={today}
                value={toDate}
                onChange={handleToDateChange}
              />
            </div>


            {/* <span className="flex items-center w-full px-1 border rounded-lg lg:w-auto">
              <IoIosSearch />
              <input
                type="text"
                placeholder="Search...."
                className="flex-grow border-0 focus:ring-0"
                value={searchQuery}
                onChange={handleSearch}
              />
            </span> */}

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
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <FormControlLabel control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />}
              label="Tamil Names Only" />
          </div>
          <div className="flex w-full lg:w-auto">
            {fromDate && toDate ? <button
              onClick={handleDownloadExcel}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button> : null}

          </div>
        </div>
        <div className="flex items-center justify-end p-2 gap-4">
          <button
            onClick={handleOpenModal}
            className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
          >
            <FaPlus /> Add Offering
          </button>
        </div>

        <OfferingTable offerings={Offerings} loading={loading} Data={MemberDisable} CurrentPage={CurrentPage} showTamilOnly={showTamilOnly} />

        {totalAmount && (
          <div className="w-1/2 pt-10 mx-auto">
            <h6 className="font-bold text-end lg:text-xl">
              Total Amount :{" "}
              <span className="text-2xl text-lavender--600">  {totalAmount.toLocaleString("en-IN")}
              </span>
            </h6>
          </div>
        )}

        {/* <Pagination
          currentPage={currentPage}
          totalPages={totalPages} 
          onPageChange={handlePageChange}
      
        /> */}

        {/* Pagination */}
<div className="relative flex items-center justify-center mt-4 space-x-2 select-none">

  {/* LEFT – Rows Per Page */}
  <div className="absolute left-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        No. of Rows
      </span>

      <div className="relative w-24">
        <div
          className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
          onClick={() => {
            setRowsPerPage(rowsInput || 25);
            setCurrentPage(1);
          }}
        >
          <svg
            className="w-4 h-4 text-gray-500"
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
          type="text"
          inputMode="numeric"
          placeholder="25"
          value={rowsInput}
          onChange={(e) =>
            setRowsInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          className="block w-full py-1 pr-8 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

  {/* CENTER – Pagination */}
  <div className="flex items-center space-x-2">

    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={CurrentPage === 1}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronLeft />
    </button>

    {getPaginationPages().map((page, index) => {
      if (typeof page === "string") {
        return (
          <span key={index} className="px-3 py-2 text-gray-500">
            …
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium
            ${
              page === CurrentPage
                ? "bg-lavender--600 text-white"
                : "hover:border-2 border-gray-300"
            }`}
        >
          {page}
        </button>
      );
    })}

    <button
      onClick={() => setCurrentPage(p => Math.min(TotalPages, p + 1))}
      disabled={CurrentPage === TotalPages}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronRight />
    </button>

  </div>

  {/* RIGHT – Jump to Page */}
  <div className="absolute right-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        Jump to Page
      </span>

      <div className="relative w-20">
        <input
          type="text"
          inputMode="numeric"
          placeholder={`1-${TotalPages}`}
          value={jumpInput}
          onChange={(e) =>
            setJumpInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = Number(jumpInput);
              if (page >= 1 && page <= TotalPages) {
                setCurrentPage(page);
                setJumpInput("");
              }
            }
          }}
          className="block w-full py-1 pr-2 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

</div>

      </div>


      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Offering"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {memberDetails?.member?.member_photo && (
            <div className="flex justify-end">
              <img
                src={`data:image/*;base64,${memberDetails?.member?.member_photo}`}
                alt="Profile Image"
                className="w-[50px] h-[50px] rounded"
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-lg font-medium text-gray-700">Member ID</label>
              <input
                type="text"
                placeholder="Search by ID"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                {...register("member_id", { required: "Member ID is required" })}
                value={memberIdSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setMemberIdSearch(val);
                  debouncedSearchMemberById(val);
                }}
              />
              {/* ✅ Verification Message */}
              {memberVerified && (
                <p className="flex items-center gap-2 text-sm text-green-600 mt-1">
                  Member verified successfully <MdVerified />
                </p>
              )}

              {!memberVerified && memberIdSearch.trim() !== "" && memberDropdownById.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Member not found</p>
              )}

              {!memberVerified && memberNameSearch.trim() !== "" && memberDropdownByName.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Member not found</p>
              )}
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Member Name</label>
              <input
                type="text"
                placeholder="Search by Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                {...register("member_name", { required: "Member Name is required" })}
                value={memberNameSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setMemberNameSearch(val);
                  debouncedSearchMemberByName(val);
                }}
              />
            </div>

            {/* ✅ Unified Dropdown */}
            {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
              <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[90%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                  <li
                    key={m.member_id}
                    className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                    onClick={() => {
                      setMemberIdSearch(m.member_id);
                      setMemberNameSearch(m.member_name);
                      setValue("member_id", m.member_id);
                      setValue("member_name", m.member_name);
                      setMemberDropdownById([]);
                      setMemberDropdownByName([]);
                      setMemberVerified(true);
                    }}
                  >
                    <span className="w-[410px] font-medium">{m.member_id}</span>
                    <span className="flex-1">{m.member_name}</span>
                    {/* <span className="w-[160px] text-gray-500">{m.mobile_number}</span> */}
                  </li>
                ))}
              </ul>
            )}

            <div>
              <label
                htmlFor="date"
                className="block text-lg font-medium text-gray-700"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-lg font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                id="amount"
                type="text"
                placeholder="Rs"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message:
                      "Amount should be a number with up to two decimal places",
                  },
                })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-lg font-medium text-gray-700"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="Enter Description"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-base font-medium text-red-500 border border-transparent rounded-md focus:outline-none focus:ring-0 sm:text-sm"
              onClick={handleCloseModal}
            >
              Discard
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-base font-medium text-white bg-lavender--600 border border-transparent rounded-md shadow-sm hover:bg-lavender--600 focus:outline-none focus:ring-0 sm:text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null} */}
      {Response.status && (
        <div className="fixed top-4 right-4 z-[9999]">
          {Response.status === "Success" ?
            <SuccessMessage Message={Response.message} /> :
            <FailedMessage Message={Response.message} />
          }
        </div>
      )}
    </div>
  );
}
