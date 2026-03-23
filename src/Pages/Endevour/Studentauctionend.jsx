import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";


export const Studentauctionend = () => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Filters & table
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Toasts
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [serverError, setServerError] = useState("");

  // Member toggles
  const [isMember, setIsMember] = useState(true);
  const [isBuyerMember, setIsBuyerMember] = useState(true);

  // Live search dropdowns
  const [sellerDropdown, setSellerDropdown] = useState([]);
  const [buyerDropdown, setBuyerDropdown] = useState([]);

  // Extra states for text in the inputs
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");

  // ID search inputs & dropdowns
  const [sellerIdSearch, setSellerIdSearch] = useState("");
  const [sellerDropdownById, setSellerDropdownById] = useState([]);
  const [buyerIdSearch, setBuyerIdSearch] = useState("");
  const [buyerDropdownById, setBuyerDropdownById] = useState([]);

  const debounceTimeoutRef = useRef(null);
  const token = window.sessionStorage.getItem("token");

  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [classes, setClasses] = useState([]);

  const [auctionDate, setAuctionDate] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();

  // RHF
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sellerId: "",
      sellerName: "",
      sellerPhone: "",
      buyerId: "",
      buyerName: "",
      buyerPhone: "",
      item: "",
      amount: "",
      payment_status: "",
    },
  });

  // Utility: debounce
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };



  const fetchAuctions = async (page = 1, query = "", from = "", to = "") => {
    try {
      const res = await axios.get(`${URL}/endeavour-auctions`, {
        params: { page, query, from, to },
        headers: { Authorization: token },
      });

      const data = res.data;
      const auctionsList = data.auctions || [];

      const formatted = auctionsList.map((auction, index) => ({
        slNo: (page - 1) * 10 + (index + 1),  // keeps serial across pages
        sellerName: auction.seller?.name || "-",
        sellerId: auction.seller?.member_id || "-",
        item: auction.item,
        amount: auction.amount,
        buyerName: auction.buyer?.name || "-",
        buyerId: auction.buyer?.member_id ? auction.buyer.member_id : "Non-member",
        paymentStatus: auction.paymentStatus,
        action: auction._id,
      }));

      setAuctions(formatted);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);

    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };



  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
    }, 400); // debounce for typing smoothness

    return () => clearTimeout(delayDebounce);
  }, [CurrentPage, searchQuery, fromDate, toDate]);





  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAuctions(page, query, from, to);
    }, 200);
  };

  useEffect(() => {
    debounceFetch(CurrentPage, searchQuery, fromDate, toDate);
  }, [CurrentPage, searchQuery, fromDate, toDate]);

  // ===== Debounced live searches (same endpoints as Auction.jsx) =====
  // Search seller (student) by name
  const debouncedSearchSeller = useRef(
    debounce(async (val) => {
      if (!val) return setSellerDropdown([]);
      try {
        const res = await axios.get(`${URL}/student-auctions/search-students?query=${val}`, {
          headers: { Authorization: token },
        });
        setSellerDropdown(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400)
  ).current;

  // Search seller (student) by ID
  const debouncedSearchSellerById = useRef(
    debounce(async (val) => {
      if (!val) return setSellerDropdownById([]);
      try {
        const res = await axios.get(`${URL}/student-auctions/search-students?query=${val}`, {
          headers: { Authorization: token },
        });
        setSellerDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;


  const debouncedSearchBuyer = useRef(
    debounce(async (val) => {
      if (!val || !isBuyerMember) return setBuyerDropdown([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setBuyerDropdown(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400)
  ).current;

  const debouncedSearchBuyerById = useRef(
    debounce(async (val) => {
      if (!val || !isBuyerMember) return setBuyerDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setBuyerDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;

  // const onSubmit = async (formData) => {
  //   try {
  //     const payload = {
  //       date: formData.date || new Date(), // default today if not picked

  //       seller: {
  //         member_id: selectedStudent?.member_id,
  //         name: selectedStudent?.member_name,
  //         tamil_name: selectedStudent?.tamil_name || "",
  //         class_name: selectedClass?.class_name,   // now available
  //         section_name: selectedClass?.section_name, // now available
  //       },


  //       buyer: {
  //         isMember: isBuyerMember,
  //         member_id: isBuyerMember ? formData.buyerId : undefined,
  //         name: formData.buyerName,
  //         tamil_name: formData.buyerTamilName || "",
  //         phone: formData.buyerPhone || "",
  //       },

  //       item: formData.item,
  //       amount: Number(formData.amount),

  //       paymentStatus: "Unpaid", // always default Unpaid
  //     };

  //     await axios.post(`${URL}/endeavour-auctions`, payload, {
  //       headers: { Authorization: token },
  //     });

  //     reset();
  //     setSelectedStudent(null);
  //     setSelectedClass(null);
  //     setBuyerSearch("");
  //     setResponse({ status: "Success", message: "Auction added successfully" });
  //     setIsModalOpen(false);

  //     fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
  //   } catch (error) {
  //     setServerError(error?.response?.data?.message || "Failed to save auction");
  //     setResponse({ status: "Failed", message: "Failed to add auction" });
  //   }
  // };



  // ===== Excel Export (same structure as Auction.jsx) =====
  
  
  const onSubmit = async (formData) => {
  try {
    const payload = {
      date: formData.date || new Date(), // default today if not picked
      seller: {
        member_id: selectedStudent?.member_id,
        name: selectedStudent?.member_name,
        tamil_name: selectedStudent?.tamil_name || "",
        class_name: selectedClass?.class_name,
        section_name: selectedClass?.section_name,
      },
      buyer: {
        isMember: isBuyerMember,
        member_id: isBuyerMember ? formData.buyerId : undefined,
        name: formData.buyerName,
        tamil_name: formData.buyerTamilName || "",
        phone: formData.buyerPhone || "",
      },
      item: formData.item,
      amount: Number(formData.amount),
      paymentStatus: "Unpaid", // always default Unpaid
    };

    await axios.post(`${URL}/endeavour-auctions`, payload, {
      headers: { Authorization: token },
    });

    // ✅ Reset response first to force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Success", message: "Auction added successfully" });
    }, 10);

    reset();
    setSelectedStudent(null);
    setSelectedClass(null);
    setBuyerSearch("");
    setIsModalOpen(false);

    // Refresh data
    fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
  } catch (error) {
    console.error(error);
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Failed to add auction",
      });
    }, 10);
  } finally {
    // ⏳ Auto-clear toast after 3 seconds
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};

  
  
  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${URL}/auctions`, {
        params: { search: searchQuery, fromdate: fromDate, todate: toDate },
        headers: { Authorization: token },
      });

      const Data = response.data.auctions || [];
      if (!Data.length) return;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Auction Report");
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      worksheet.addRow(["Auction Report"]).font = { size: 14, bold: true };
      worksheet.mergeCells("A1:J1");

      worksheet.addRow([
        "Sl No", "Date", "Seller", "Seller Phone", "Item",
        "Buyer", "Buyer Phone", "Amount", "Payment Status", "Type"
      ]);

      Data.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          moment(item.date).format("YYYY-MM-DD"),
          item.sellerName,
          item.sellerPhone,
          item.item,
          item.buyerName,
          item.buyerPhone,
          item.amount,
          item.payment_status,
          item.sellerId ? "Member" : "Non-Member",
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Auction_Report_${fromDate}_to_${toDate}.xlsx`);
    } catch (err) {
      console.error("Excel error:", err);
    }
  };

  // ===== Open/Close modals =====
  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  //   reset({
  //     payment_status: "Unpaid",   // 👈 enforce Unpaid on modal open
  //   });
  // };
  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   reset();
  // };

  const handleOpenModal = () => {
  setIsModalOpen(true);
  reset({
    payment_status: "Unpaid",
    date: new Date().toISOString().split("T")[0],
    item: "",
    amount: "",
    buyerPhone: "",
  });
  setSelectedStudent(null);
  setSelectedClass(null);
  setBuyerSearch("");
  setBuyerIdSearch("");
  setBuyerDropdown([]);
  setBuyerDropdownById([]);
  setIsBuyerMember(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  reset();
  setSelectedStudent(null);
  setSelectedClass(null);
  setBuyerSearch("");
  setBuyerIdSearch("");
  setBuyerDropdown([]);
  setBuyerDropdownById([]);
  setIsBuyerMember(true);
};

  const handleOpenEdit = (auction) => {
    setSelectedAuction(auction);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedAuction(null);
  };

  // Watchers to trigger live search by name
  const watchSellerInput = watch("sellerName");
  const watchBuyerInput = watch("buyerName");

  useEffect(() => {
    if (isMember) debouncedSearchSeller(watchSellerInput);
  }, [watchSellerInput, isMember]);

  useEffect(() => {
    if (isBuyerMember) debouncedSearchBuyer(watchBuyerInput);
  }, [watchBuyerInput, isBuyerMember]);

  // Table columns (same as Auction.jsx)
  const columns = [
    { label: "Sl No", key: "slNo", align: "center" },
    { label: "Seller Name", key: "sellerName", align: "left" },
    { label: "Item", key: "item", align: "center" },
    { label: "Amount", key: "amount", align: "center" },
    { label: "Buyer Name", key: "buyerName", align: "left" },
    { label: "Action", key: "action", align: "center" }
  ];


  // ✅ Fetch classes (only with students)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes`, {
          headers: { Authorization: token },
        });

        // Adjust depending on your backend response format
        setClasses(res.data.classes || res.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [token]);



  const studentDropdownRef = useRef(null);

  const handleClassChange = async (classId) => {
    try {
      const res = await axios.get(`${URL}/endeavour-classes/${classId}/details`, {
        headers: { Authorization: token },
      });
      const students = res.data?.students || [];
      setStudentOptions(students);
      setSelectedClass(classId);

      // 👇 automatically open dropdown after data loads
      setTimeout(() => {
        if (studentDropdownRef.current) {
          studentDropdownRef.current.focus();
          studentDropdownRef.current.size = students.length; // expands like a listbox
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };



  // ✅ Handle student change
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    const student = students.find(s => s.member_id === studentId);
    setSelectedStudent(student || null);
  };
  return (
    <div className="p-4">
      <div className="flex justify-between px-3">
        <div className="text-xl font-bold">Endeavour Auction</div>
      </div>

      <div className="h-full p-4 mx-1 mt-3 bg-white rounded-xl">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex flex-wrap items-center gap-3">
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
                value={searchQuery}                // 🔹 controlled input
                onChange={(e) => {
                  setSearchQuery(e.target.value);  // 🔹 update state
                  setCurrentPage(1);               // 🔹 reset to page 1 on new search
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-3 lg:mt-0">
            {fromDate && toDate && (
              <button onClick={handleDownloadExcel} className="text-blue-600 hover:text-blue-800">
                <img src={down} alt="Download" />
              </button>
            )}
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Add Auction
            </button>
          </div>
        </div>

        {/* Auction Table */}
        <div className="overflow-x-auto mt-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading auctions...</p>
          ) : auctions.length === 0 ? (
            <p className="text-center text-gray-500">No auctions found</p>
          ) : (

            <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
              <thead className="text-base text-gray-700 bg-gray dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key} style={{ textAlign: col.align || "center" }}
                      className="px-4 py-2 text-center text-sm font-semibold"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {auctions.map((row) => (
                  <tr key={row.action} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    {columns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align || "center" }} className="px-4 py-2 text-sm  text-gray-700">
                        {col.key === "action" ? (
                          <FaEye
                            size={18}
                            className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"
                            onClick={() => {
                              setSelectedAuction(row);   // set auction data
                              setIsEditOpen(true);       // open modal
                            }}
                          />
                        ) : col.key === "amount" ? (
                          `₹${row[col.key]}`
                        ) : col.key === "paymentStatus" ? (
                          <span
                            className={
                              row[col.key] === "Paid"
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {row[col.key]}
                          </span>
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          )}
        </div>

        {/* Simple pagination footer (optional) */}
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"}`}>
            {CurrentPage}
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-3 space-x-2 rounded right-10 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">
              Total Page: <span>{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage
                ? "disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer"
                } `}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>

      {/* ===== Add Auction Modal (YOUR Modal component) ===== */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Auction">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6">
            {/* ---------- SELLER SECTION ---------- */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Seller Details</h3>


              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Class Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-800 dark:text-white">Select Class</label>
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    onChange={(e) => {
                      const cls = classes.find((c) => c._id === e.target.value);
                      setSelectedClass(cls || null);   // save the full class
                      setStudentOptions(cls?.students || []);
                      setTimeout(() => {
                        document.getElementById("studentDropdown")?.focus();
                      }, 100);
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name} - {cls.section_name}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Student Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-800 dark:text-white">Seller (Student)</label>
                  <select
                    value={selectedStudent?.member_id || ""}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    onChange={(e) => {
                      const student = studentOptions.find(
                        (s) => s.member_id === e.target.value
                      );
                      setSelectedStudent(student || null);
                    }}
                  >
                    <option value="">Select Student</option>
                    {studentOptions.map((student) => (
                      <option key={student.member_id} value={student.member_id}>
                        {student.member_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student ID */}
                <div>
                  <label className="block mb-2 text-sm font-semibold">Student ID</label>
                  <input
                    type="text"
                    value={selectedStudent?.member_id || ""}
                    readOnly
                    className="w-full border rounded p-2 bg-gray-100"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                    defaultValue={new Date().toISOString().split("T")[0]}  // ✅ auto-load today
                    {...register("date", { required: "Date is required" })}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                </div>

              </div>


            </div>

            {/* ---------- CORE FIELDS ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  placeholder="Enter Item"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                  {...register("item", { required: "Item is required" })}
                />
                {errors.item && <p className="text-sm text-red-500">{errors.item.message}</p>}
              </div>

              {/* Date */}


              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="text"
                  placeholder="₹"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                  {...register("amount", {
                    required: "Amount is required",
                    pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Amount should be a valid number" },
                  })}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <div className="flex gap-4 mt-2">
                  {/* Hidden Payment Status (always Unpaid) */}
                  <input
                    type="hidden"
                    value="Unpaid"
                    {...register("payment_status")}
                  />

                </div>
                {errors.payment_status && <p className="text-sm text-red-500">{errors.payment_status.message}</p>}
              </div>
            </div>

            {/* ---------- BUYER SECTION ---------- */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>

                {/* Toggle */}
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{ width: "calc(50% - 0.25rem)", transform: isBuyerMember ? "translateX(0)" : "translateX(100%)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsBuyerMember(true)}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${isBuyerMember ? "text-white" : "text-gray-700"
                      }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBuyerMember(false)}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${!isBuyerMember ? "text-white" : "text-gray-700"
                      }`}
                  >
                    Non-Member
                  </button>
                </div>
              </div>

              {isBuyerMember ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  {/* Buyer ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer ID</label>
                    <input
                      type="text"
                      placeholder="Search by ID"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      value={buyerIdSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBuyerIdSearch(val);
                        debouncedSearchBuyerById(val);
                      }}
                    />
                  </div>

                  {/* Buyer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                    <input
                      type="text"
                      placeholder="Search by Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      value={buyerSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBuyerSearch(val);
                        debouncedSearchBuyer(val);
                      }}
                    />
                  </div>

                  {/* Buyer Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Phone</label>
                    <input
                      type="text"
                      readOnly
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("buyerPhone", { required: "Buyer Phone is required" })}
                    />
                  </div>

                  {/* ✅ Unified Dropdown (ID + Name) */}
                  {(buyerDropdownById.length > 0 || buyerDropdown.length > 0) && (
                    <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {(buyerDropdownById.length > 0 ? buyerDropdownById : buyerDropdown).map((m) => (
                        <li
                          key={m.member_id}
                          className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                          onClick={() => {
                            setBuyerIdSearch(m.member_id);
                            setBuyerSearch(m.member_name);
                            setValue("buyerId", m.member_id);
                            setValue("buyerName", m.member_name);
                            setValue("buyerPhone", m.mobile_number);
                            setBuyerDropdownById([]);
                            setBuyerDropdown([]);
                          }}
                        >
                          <span className="w-[250px] font-medium">{m.member_id}</span>
                          <span className="flex-1">{m.member_name}</span>
                          <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                    <input
                      type="text"
                      placeholder="Enter Buyer Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("buyerName", { required: "Buyer Name is required" })}
                    />
                    {errors.buyerName && <p className="text-sm text-red-500">{errors.buyerName.message}</p>}
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-700">Buyer Phone</label>
  <input
    type="text"
    placeholder="Enter Buyer Phone"
    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    maxLength={10}
    {...register("buyerPhone", {
      required: "Buyer Phone is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Enter a valid 10-digit phone number",
      },
      onChange: (e) => {
        // Allow only digits
        e.target.value = e.target.value.replace(/\D/g, "");
      },
    })}
  />
  {errors.buyerPhone && (
    <p className="text-sm text-red-500">{errors.buyerPhone.message}</p>
  )}
</div>

                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-red-500 border rounded-md">
              Discard
            </button>
            <button type="submit" className="px-4 py-2 bg-lavender--600 text-white rounded-md">
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="View Student Auction"
      >
        {selectedAuction && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
            {[
              // { label: "Sl No", value: selectedAuction.slNo },
              { label: "Date", value: moment(selectedAuction.date).format("DD-MM-YYYY") },
              { label: "Seller Name", value: selectedAuction.sellerName },
              { label: "Seller Member ID", value: selectedAuction.sellerId },
              { label: "Item", value: selectedAuction.item },
              { label: "Amount", value: `₹${selectedAuction.amount}` },
              { label: "Buyer Name", value: selectedAuction.buyerName },
              {
                label: "Buyer ID",
                value: selectedAuction.buyerId ? selectedAuction.buyerId : "Non-Member",
              },

            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                  {item.label}
                </div>
                <div
                  className={`col-span-12 sm:col-span-8 text-base ${item.value
                      ? "text-gray-800 dark:text-gray-300"
                      : "text-yellow-500 font-semibold"
                    }`}
                >
                  {item.value}
                </div>
              </div>
            ))}


          </div>
        )}
      </Modal>



      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </div>
  );
}
