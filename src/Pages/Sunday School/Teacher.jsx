import React, { useEffect, useState, useRef } from 'react'
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
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
import './DashSundayschool.css'


export const Teacher = () => {

  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [memberError, setMemberError] = useState("");
  const [checkingMember, setCheckingMember] = useState(false);
  // const [checking_NO_Name_MemberID, setChecking_NO_Name_MemberID] = useState(true);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = window.sessionStorage.getItem("token");
  const [teachers, setTeachers] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  console.log(category);

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


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
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${URL}/sunday-classes`, {
        headers: { Authorization: token }
      });
      setTeachers(res.data.map(c => ({
        teacherName: c.teacher?.name,
        teacherTamilName: c.teacher?.tamil_name,
        memberId: c.teacher?.member_id,
        className: c.class_name,
        sectionName: c.section_name
      })));
    };
    fetchData();
  }, []);




  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setValue("date", today);
  }, [setValue]);


  const fetchTeachers = async (page, search) => {
    try {
      const res = await axios.get(
        `${URL}/sunday-classes/teachers/details?page=${page}&limit=${rowsPerPage}&search=${search}`,
        { headers: { Authorization: token } }
      );

      setTeachers(res.data.teachers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
    }
  };

  const debounceFetch = (page, query) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchTeachers(page, query);
    }, 300);
  };

  useEffect(() => {
    debounceFetch(CurrentPage, searchQuery);
  }, [CurrentPage, searchQuery, rowsPerPage]);



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
    setCurrentPage(1);

  };

  const today = new Date().toISOString().split("T")[0];




  // const handleDownloadExcel = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${URL}/offerings/category?category=${category}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&download=true`,
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );

  //     const Data = response.data.offerings || [];

  //     if (!Data.length) {
  //       console.error("No data available to export.");
  //       return;
  //     }

  //     const totalAmount = Data.reduce((sum, item) => sum + (item.amount || 0), 0);

  //     const workbook = new ExcelJS.Workbook();
  //     const worksheet = workbook.addWorksheet(`${category} Report`, {
  //       pageSetup: {
  //         paperSize: 9,
  //         orientation: "portrait",
  //         fitToPage: true,
  //         fitToWidth: 1,
  //         horizontalCentered: true,
  //         margins: {
  //           left: 0.4,
  //           right: 0.4,
  //           top: 0.6,
  //           bottom: 0.6,
  //           header: 0.3,
  //           footer: 0.3,
  //         },
  //       },
  //     });

  //     worksheet.views = [{ state: "frozen", ySplit: 4 }];

  //     // 🔷 Title Row
  //     const titleRow = worksheet.addRow([`${category} Report`]);
  //     titleRow.font = { size: 14, bold: true };
  //     titleRow.alignment = { horizontal: "center" };

  //     const colCount = category === "NO_Name_Offerings"
  //       ? (showTamilOnly ? 4 : 5)
  //       : (showTamilOnly ? 5 : 6);
  //     const mergeEnd = String.fromCharCode(64 + colCount);
  //     worksheet.mergeCells(`A1:${mergeEnd}1`);

  //     // 🔷 Total Row
  //     const totalRow = worksheet.addRow([
  //       "Total Amount:",
  //       ...Array(colCount - 2).fill(""),
  //       totalAmount,
  //     ]);
  //     totalRow.font = { bold: true };
  //     totalRow.alignment = { horizontal: "right" };
  //     worksheet.mergeCells(`A2:${String.fromCharCode(64 + colCount - 1)}2`);

  //     worksheet.addRow([]); // spacer

  //     // 🔷 Header Row
  //     const tableHeading = category !== "NO_Name_Offerings"
  //       ? [
  //         "SI.No.",
  //         "Member ID",
  //         !showTamilOnly ? "Member Name" : null,
  //         "Member Tamil Name",
  //         "Date",
  //         "Amount",
  //       ]
  //       : [
  //         "SI.No.",
  //         !showTamilOnly ? "Member Name" : null,
  //         "Member Tamil Name",
  //         "Date",
  //         "Amount",
  //       ];
  //     worksheet.addRow(tableHeading.filter(Boolean));

  //     const headerRow = worksheet.getRow(4);
  //     headerRow.eachCell((cell) => {
  //       cell.font = { bold: true };
  //       cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  //       cell.border = {
  //         top: { style: "thin" },
  //         left: { style: "thin" },
  //         bottom: { style: "thin" },
  //         right: { style: "thin" },
  //       };
  //     });

  //     // 🔷 Data Rows
  //     Data.forEach((item, index) => {
  //       const rowData =
  //         category !== "NO_Name_Offerings"
  //           ? [
  //             index + 1,
  //             item.member_id,
  //             !showTamilOnly ? item.member_name : null,
  //             item.member_tamil_name,
  //             moment(item.date).format("YYYY-MM-DD"),
  //             item.amount,
  //           ]
  //           : [
  //             index + 1,
  //             !showTamilOnly ? item.member_name : null,
  //             item.member_tamil_name,
  //             moment(item.date).format("YYYY-MM-DD"),
  //             item.amount,
  //           ];

  //       const row = worksheet.addRow(rowData.filter((v) => v !== null));
  //       row.height = 30;

  //       row.eachCell((cell, colNumber) => {
  //         cell.alignment = {
  //           horizontal: colNumber === rowData.length ? "right" : "center",
  //           vertical: "middle",
  //           wrapText: true,
  //         };
  //         cell.border = {
  //           top: { style: "thin" },
  //           left: { style: "thin" },
  //           bottom: { style: "thin" },
  //           right: { style: "thin" },
  //         };
  //       });
  //     });

  //     // 🔷 Column Widths
  //     const widths =
  //       category !== "NO_Name_Offerings"
  //         ? showTamilOnly
  //           ? [8, 16, 28, 18, 14] // without Member Name
  //           : [8, 16, 22, 28, 18, 14]
  //         : showTamilOnly
  //           ? [8, 28, 18, 14]
  //           : [8, 22, 28, 18, 14];

  //     worksheet.columns = widths.map((w) => ({ width: w }));

  //     // 🔷 Export
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     saveAs(blob, `${category}_Report_${fromDate}_to_${toDate}.xlsx`);
  //     console.log("Excel generated successfully!");
  //   } catch (error) {
  //     console.error("Error generating Excel report:", error);
  //   }
  // };

  const auctionData = [
    {
      slNo: 1,
      teacher: "Joesph",
      phoneNum: 9876543210,
      classsteach: "Intermediate",
      clsection: "II",
    },
    {
      slNo: 2,
      teacher: "Joesph",
      phoneNum: 9876543210,
      classsteach: "Beginner",
      clsection: "I",
    },
  ];
  return (
    <>
      <div className="">
        <div className="flex flex-col items-center justify-between   sm:flex-row ">
          {/* <div className="flex space-x-5">
              <MdOutlineFileDownload
                size={25}
                className="cursor-pointer text-lavender--600"
              />
              <IoMdPrint size={25} className="cursor-pointer text-lavender--600" />
            </div> */}
        </div>

        <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <h3>Teachers</h3>
            <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

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

            </div>
          </div>

          <div className="overflow-x-auto mt-8">
            <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
              <thead className='text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center'>
                <tr>
                  <th className="p-2  text-center">Sl No</th>
                  <th className="p-2  text-center">Teacher ID</th>
                  <th className="p-2  text-center">Teacher Name</th>
                  <th className="p-2  text-center">Mobile Number</th>
                  <th className="p-2  text-center">Class</th>
                  <th className="p-2  text-center">Section</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  teachers.map((t, idx) => (
                    <tr key={t.class_id} className="bg-white border-b">
                      <td className="p-2 text-center">
                        {(CurrentPage - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="p-2 text-center">{t.teacher_id}</td>
                      <td className="p-2 text-center">{t.teacher_name}</td>
                      <td className="p-2 text-center">{t.mobile_number || "-"}</td>
                      <td className="p-2 text-center">{t.class_name}</td>
                      <td className="p-2 text-center">{t.section_name}</td>
                    </tr>
                  ))
                )}
              </tbody>


            </table>
          </div>

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
          />
        </div>




        {Response.status !== null ? (
          Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : Response.status === "Failed" ? (
            <FailedMessage Message={Response.message} />
          ) : null
        ) : null}
      </div>
    </>

  )
}
