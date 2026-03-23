/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoIosSearch, IoMdPrint } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Dropdown from "../../Components/Helpers/DropDown";
import OfferingTable from "../../Components/Offerings/MarriageOffering";
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


export default function OfferingList() { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const category  = "MarriageOfferings";
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
  console.log(category);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
 
  const checking_NO_Name_MemberID = category === "NO_Name_Offerings" ?  false:true ;
  // console.log(checking_NO_Name_MemberID);

const MemberDisable= checking_NO_Name_MemberID===false?true:false;
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
          setMemberDetails(response.data);
        } else {
          setMemberError("Member ID does not exist.");
          setValue("member_name", "");
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
      const response = await axios.get(`${URL}/offerings/category/Marriage`, {
        params: {
          category,
          page,
          limit: 15,
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
    
  }, [CurrentPage]);
  useEffect(() => {
    setCurrentPage(1)
    debounceFetch(CurrentPage, searchQuery, dateRange.from, dateRange.to);
    
  }, [ searchQuery ,dateRange]);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setValue("date", today);
  }, [setValue]);

  const handleOpenModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);
    setIsModalOpen(true);
    reset();
  };

  const handleCloseModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);
    setIsModalOpen(false);
    reset();
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
  const onSubmit = async (formData) => {
    formData.category = category;

    try {
        console.log(formData );
        
        // return
      const res = await axios.post(`${URL}/offerings/add`, formData, {
        headers: {
          Authorization: token,
        },
      });
      console.log(res);
      reset();
      setIsModalOpen(false);
      const offeringData = await fetchOfferings(
        CurrentPage,
        searchQuery,
        fromDate,
        toDate
      );
      setOfferings(offeringData.offerings);
      setTotalAmount(offeringData.totalAmount);

      setTotalPages(offeringData.pages);
      
    } catch (error) {
      console.log(error);
      setServerError(error?.response?.data?.message);
      if (error.response.status === 401) {
        window.sessionStorage.clear();
        navigate("/");
      }
    }
  };

 
// const handleDownloadPDF = async () => { 
//   try {
//     const response = await axios.get(
//       `${URL}/offerings/category/Marriage?category=${category}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&download=true`,
//       {
//         headers: {
//           Authorization: token,
//         },
//       }
//     );

//     const Data = response.data.offerings;
    
//     // Calculate total amount
//     // const totalAmount = Data.reduce((sum, item) => sum + item.amount, 0);
//     // const totalAmount = totalAmount;

//     const tableHeading = [
//       "SI.No.",
//       category !== "NO_Name_Offerings" ? "Member ID" : "", 
//       category !== "NO_Name_Offerings" ? "Member Name" : "Name", 
//       "Member Tamil Name",
//       "Member Wife",
//       "Member Wife Tamil Name",
//       "Date",
//       "Amount",
//     ].filter(Boolean); // Remove empty strings

//     const doc = new jsPDF();

//     // Function to add title and total amount
//     const addTitle = (doc, title, totalAmount) => {
//       doc.setFontSize(18);
//       doc.setFont("helvetica", "bold");
//       doc.text(title, doc.internal.pageSize.width / 2, 15, { align: "center" });

//       // Add total amount on the right side
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "normal");
//       const pageWidth = doc.internal.pageSize.width; // Get page width
//       const textWidth = doc.getTextWidth(`Total Amount : ${totalAmount}`); // Measure text width
//       doc.text(`Total Amount : ${totalAmount}`, pageWidth - textWidth - 10, 25); // Align to right
//     };

//     const headers = [tableHeading];

// console.log(Data);


//     // return
//     const rows = Data.map((item, index) => [
      
//       index + 1,
//       category !== "NO_Name_Offerings" ? item.member_id : "",
//       item.member_name,
//       item.member_tamil_name,
//       item.member_wife,
//       item.member_wife_tamil_name,
//       moment(item.date).format('YYYY-MM-DD'),
//       item.amount,
//     ]);

//     doc.autoTable({
//       head: headers,
//       body: rows,
//       styles: { halign: 'center' },
//       margin: { top: 35 ,left: 10, right: 10}, // Ensure table doesn't overlap title
//       didDrawPage: function () {
//         addTitle(doc, category, totalAmount); // Add title & total amount on every page
//       },
//     });


//     doc.save(`${category} Report.pdf`);
//     console.log("PDF generated successfully!");

//   } catch (error) {
//     console.error("Error during API call:", error);
//   }
// };


const handleDownloadExcel = async () => {
  try {
    const response = await axios.get(
      `${URL}/offerings/category/Marriage?category=${category}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&download=true`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const Data = response.data?.offerings || [];

    if (!Data.length) {
      console.error("No data available to export.");
      return;
    }

    const totalAmount = Data.reduce((sum, item) => sum + (item.amount || 0), 0);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MarriageOfferings", {
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
        },
      },
    });

    worksheet.views = [{ state: "frozen", ySplit: 4 }];


    // Title row
    const title = `${category} Marriage Offerings Report`;
    const totalCols = showTamilOnly ? 6 : 8;
    const mergeEnd = String.fromCharCode(64 + totalCols);
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center" };
    worksheet.mergeCells(`A1:${mergeEnd}1`);

    // Total row
    const totalRowData = new Array(totalCols).fill("");
    totalRowData[0] = "Total Amount:";
    totalRowData[totalCols - 1] = totalAmount;
    const totalRow = worksheet.addRow(totalRowData);
    totalRow.font = { bold: true };
    totalRow.alignment = { horizontal: "right" };
    worksheet.mergeCells(`A2:${String.fromCharCode(64 + totalCols - 1)}2`);

    worksheet.addRow([]); // Spacer row

    // ✅ Headers (hide member name and wife if showTamilOnly)
    const headers = [
      "SI.No.",
      "Member ID",
      !showTamilOnly ? "Member Name" : null,
      "Member Tamil Name",
      !showTamilOnly ? "Member Wife" : null,
      "Wife Tamil Name",
      "Date",
      "Amount",
    ].filter(Boolean);
    worksheet.addRow(headers);

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

    // ✅ Data rows
    Data.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.member_id,
        !showTamilOnly ? item.member_name : null,
        item.member_tamil_name,
        !showTamilOnly ? item.member_wife : null,
        item.member_wife_tamil_name,
        moment(item.date).format("YYYY-MM-DD"),
        item.amount,
      ].filter((val) => val !== null); // remove null columns

      const row = worksheet.addRow(rowData);
      row.height = 30;
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          horizontal: [4, 6].includes(colNumber) ? "left" : "center",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    // ✅ Adjust columns based on Tamil mode
    worksheet.columns = showTamilOnly
      ? [
          { width: 8 },    // SI.No.
          { width: 16 },   // Member ID
          { width: 30 },   // Member Tamil Name
          { width: 30 },   // Wife Tamil Name
          { width: 16 },   // Date
          { width: 14 },   // Amount
        ]
      : [
          { width: 8 },    // SI.No.
          { width: 16 },   // Member ID
          { width: 22 },   // Member Name
          { width: 30 },   // Member Tamil Name
          { width: 22 },   // Member Wife
          { width: 30 },   // Wife Tamil Name
          { width: 16 },   // Date
          { width: 14 },   // Amount
        ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${category}_Marriage_Report_${fromDate}_to_${toDate}.xlsx`);
    console.log("Marriage Excel generated!");
  } catch (error) {
    console.error("Error generating Excel:", error);
  }
};









  return (
    <div className="p-4">
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

      <div className="h-full p-2 mx-1 mt-3 bg-white  rounded-l ">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex flex-col items-start w-full px-1 space-y-2 border rounded-lg lg:flex-row lg:items-center lg:space-y-0 lg:w-auto">
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
            <FormControlLabel
                        control={
                          <Checkbox
                            checked={showTamilOnly}
                            onChange={(e) => setShowTamilOnly(e.target.checked)}
                          />
                        }
                        label="Tamil Names Only"
                      />
          </div>
          <div className="flex w-full gap-x-4 lg:w-auto">
         { fromDate && toDate? <button
              onClick={handleDownloadExcel}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>:null}
            <button
              onClick={handleOpenModal}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Offering
            </button>
          </div>
        </div>

        <OfferingTable
  offerings={Offerings}
  loading={loading}
  Data={MemberDisable}
  CurrentPage={CurrentPage}
  showTamilOnly={showTamilOnly} // ✅ pass the state
/>


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

<div className="flex items-center justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${
              CurrentPage
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
          <div className="absolute flex px-3 space-x-2 rounded right-10 ">
  <span  className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
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


      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Offering"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {memberDetails?.member?.member_photo && (
            <div className="flex justify-end">
              <img
                src={`${URL}${memberDetails?.member?.member_photo}`}
                alt="Profile Image"
                className="w-[50px] h-[50px] rounded"
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={MemberDisable ? 'hidden' : ''}>
              <label
                htmlFor="member_id"
                className="block text-lg font-medium text-gray-700"
              >
                Member Id
              </label>
              {/* <input
  id="member_id"
  type="text"
  placeholder="Enter Member Id"
  disabled={MemberDisable}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
  {...(!MemberDisable && register("member_id", {
    required: "Member Id is required",
  }))}
/> */}<input
  id="member_id"
  type="text"
  placeholder="Enter Member Id"
  disabled={MemberDisable}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
  onBlur={(e) => e.target.value = e.target.value.trim()} // Trims spaces on blur
  {...(!MemberDisable && register("member_id", {
    required: "Member Id is required",
    setValueAs: (value) => value.trim() // Ensures value is trimmed before submission
  }))}
/>
            
              {checkingMember && ( 
                <p className="text-sm text-blue-500">Checking...</p>
              )}
              {errors.member_id && (
                <p className="text-sm text-red-500">
                  {errors.member_id.message}
                </p>
              )}
              {memberDetails?.message && (
                <p className="flex items-center gap-2 text-sm text-green-500">
                  {memberDetails?.message} <MdVerified />
                </p>
              )}
              {!errors.member_id && memberError && (
                <p className="text-sm text-red-500">{memberError}</p>
              )}
              {/* {serverError && (
                <p className="text-sm text-red-500">{serverError}</p>
              )} */}
            </div>

            <div>
              <label
                htmlFor="member_name"
                className="block text-lg font-medium text-gray-700"
              >
              {MemberDisable ? 'Name' : ' Member Name'}  
              </label>
              <input
                id="member_name"
                type="text"
                disabled={checking_NO_Name_MemberID}
                placeholder= {MemberDisable ? 'Enter Name' : 'Enter Member Name '}  
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("member_name", {
                  required: "Invalid member ID. Please check and try again.",
                })}
              />
              {errors.member_name && (
                <p className="text-sm text-red-500">
                  {errors.member_name.message}
                </p>
              )}
            </div>

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

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  );
}
