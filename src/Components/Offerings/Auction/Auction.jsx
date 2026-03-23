/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Modal from "../../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { URL } from "../../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../../Components/ToastMessage";
import down from "../../../assets/downloade.svg";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import { FaEye } from "react-icons/fa";
import Pagination from "../../../Components/Helpers/Pagination.jsx";


export default function Auction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(null);
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Member toggles
  const [isMember, setIsMember] = useState(true);
  const [isBuyerMember, setIsBuyerMember] = useState(true);

  // Live search dropdowns
  const [sellerDropdown, setSellerDropdown] = useState([]);
  const [buyerDropdown, setBuyerDropdown] = useState([]);

  // extra states for search text
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");

  // ref for debounce timers
  const sellerDebounceRef = useRef(null);
  const buyerDebounceRef = useRef(null);
  const [sellerIdSearch, setSellerIdSearch] = useState("");
  const [sellerDropdownById, setSellerDropdownById] = useState([]);
  // Buyer ID search input
  const [buyerIdSearch, setBuyerIdSearch] = useState("");

  // Dropdown results for Buyer ID search
  const [buyerDropdownById, setBuyerDropdownById] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  const handleOpenEdit = (auction) => {
    setSelectedAuction(auction);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedAuction(null);
  };
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced search
  const debouncedSearchSeller = debounce(async (val) => {
    if (!val || !isMember) return setSellerDropdown([]);
    try {
      const res = await axios.get(`${URL}/member-search?name=${val}`, {
        headers: { Authorization: token },
      });
      setSellerDropdown(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, 400);
  const debouncedSearchSellerById = useRef(
    debounce(async (val) => {
      if (!val || !isMember) return setSellerDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setSellerDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;


  const debouncedSearchBuyer = debounce(async (val) => {
    if (!val || !isBuyerMember) return setBuyerDropdown([]);
    try {
      const res = await axios.get(`${URL}/member-search?name=${val}`, {
        headers: { Authorization: token },
      });
      setBuyerDropdown(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, 400);
  // Debounced Buyer ID search
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

  // handle seller search with debounce
  const handleSellerSearch = (val) => {
    setSellerSearch(val);
    if (!val) return setSellerSuggestions([]);
    clearTimeout(sellerDebounceRef.current);
    sellerDebounceRef.current = setTimeout(() => {
      axios.get(`${URL}/member/search?name=${val}`, { headers: { Authorization: token } })
        .then((res) => setSellerSuggestions(res.data))
        .catch(() => setSellerSuggestions([]));
    }, 300);
  };

  const handleBuyerSearch = (val) => {
    setBuyerSearch(val);
    if (!val) return setBuyerSuggestions([]);
    clearTimeout(buyerDebounceRef.current);
    buyerDebounceRef.current = setTimeout(() => {
      axios.get(`${URL}/member/search?name=${val}`, { headers: { Authorization: token } })
        .then((res) => setBuyerSuggestions(res.data))
        .catch(() => setBuyerSuggestions([]));
    }, 300);
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0], sellerId: "",
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

  console.log("Seller watch:", watch("sellerName"), watch("sellerPhone"));
  const navigate = useNavigate();

  /** Fetch Auctions */
  // const fetchAuctions = async (page, searchQuery, fromDate, toDate) => {
  //   if (abortControllerRef.current) abortControllerRef.current.abort();
  //   abortControllerRef.current = new AbortController();

  //   setLoading(true);
  //   try {
  //     const response = await axios.get(`${URL}/auctions`, {
  //       params: { page, limit: 15, search: searchQuery, fromdate: fromDate, todate: toDate },
  //       headers: { Authorization: token },
  //       signal: abortControllerRef.current.signal,
  //     });

  //     setAuctions(response.data.auctions || []);
  //     setTotalPages(response.data.totalPages || 1);
  //     setTotalAmount(response.data.total || 0);
  //   } catch (error) {
  //     if (!axios.isCancel(error)) {
  //       console.error("Error fetching auctions:", error);
  //       setAuctions([]);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchAuctions = async (page, search, fromDate, toDate) => {
    try {
      const res = await axios.get(
        `${URL}/auctions?page=${page}&limit=${rowsPerPage}&search=${search}&fromdate=${fromDate}&todate=${toDate}`,
        { headers: { Authorization: token } }
      );

      console.log("Fetched auctions:", res.data);

      // Handle both array and object response
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.auctions || [];

      setAuctions(data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
      setAuctions([]);
      setTotalPages(1);
    }
  };

  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAuctions(page, query, from, to);
    }, 200);
  };

useEffect(() => {
  debounceFetch(CurrentPage, searchQuery, fromDate, toDate);
}, [CurrentPage, searchQuery, fromDate, toDate, rowsPerPage]);


  /** Form Submit */
  // const onSubmit = async (formData) => {
  //   try {
  //     // Mark non-members explicitly
  //     if (!isMember) formData.sellerId = "";
  //     if (!isBuyerMember) formData.buyerId = "";

  //     const res = await axios.post(`${URL}/auctions`, formData, {
  //       headers: { Authorization: token },
  //     });
  //     reset();
  //     setSellerSearch("");
  //     setSellerIdSearch("");
  //     setBuyerSearch("");
  //     setBuyerIdSearch("");
  //     setSellerDropdown([]);
  //     setSellerDropdownById([]);
  //     setBuyerDropdown([]);
  //     setBuyerDropdownById([]);
  //     fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
  //     setResponse({ status: "Success", message: "Auction added successfully" });
  //   } catch (error) {
  //     setServerError(error?.response?.data?.message || "Failed to save auction");
  //     setResponse({ status: "Failed", message: "Failed to add auction" });
  //   }
  // };


  const onSubmit = async (formData) => {
  try {
    // Mark non-members explicitly
    if (!isMember) formData.sellerId = "";
    if (!isBuyerMember) formData.buyerId = "";

    const res = await axios.post(`${URL}/auctions`, formData, {
      headers: { Authorization: token },
    });

    // ✅ Always reset first, then trigger toast cleanly
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Success", message: "Auction added successfully" });
    }, 10);

    // Reset form & dropdowns
    reset();
    setSellerSearch("");
    setSellerIdSearch("");
    setBuyerSearch("");
    setBuyerIdSearch("");
    setSellerDropdown([]);
    setSellerDropdownById([]);
    setBuyerDropdown([]);
    setBuyerDropdownById([]);

    // Refetch auctions
    fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
  } catch (error) {
    console.error(error);
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message:
          error?.response?.data?.message || "Failed to add auction",
      });
    }, 10);
  } finally {
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};

  /** Export Excel */
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

  /** Live search for seller */
  const searchSeller = async (val, type = "name") => {
    setSellerDropdown([]);
    // setValue("sellerId", "");
    // setValue("sellerName", "");
    // setValue("sellerPhone", "");
    if (!val || !isMember) return;
    try {
      const res = await axios.get(`${URL}/member-search?name=${val}`, {
        params: { query: val, type },
        headers: { Authorization: token }
      });
      setSellerDropdown(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /** Live search for buyer */
  // Live search for buyer
  const searchBuyer = async (val, type = "name") => {
    setBuyerDropdown([]);
    // setValue("buyerId", "");
    // setValue("buyerName", "");
    // setValue("buyerPhone", "");
    if (!val || !isBuyerMember) return;
    try {
      const res = await axios.get(`${URL}/member-search?name=${val}`, {
        params: { query: val, type },
        headers: { Authorization: token }
      });
      setBuyerDropdown(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };




  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset(); // clear form when opening
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset(); // clear form when closing
  };

  const watchSellerInput = watch("sellerName");
  const watchBuyerInput = watch("buyerName");

  useEffect(() => {
    searchSeller(watchSellerInput);
  }, [watchSellerInput]);

  useEffect(() => {
    searchBuyer(watchBuyerInput);
  }, [watchBuyerInput]);

  const columns = [
    { label: "Sl No", key: "slNo" },
    { label: "Date", key: "date" },
    // { label: "Seller Name", key: "sellerName" },
    // { label: "Seller Phone", key: "sellerPhone" },
    { label: "Item", key: "item" },
    { label: "Buyer Name", key: "buyerName" },
    { label: "Buyer Phone", key: "buyerPhone" },
    { label: "Amount", key: "amount" },
    // { label: "Status", key: "payment_status" },
    { label: "Action", key: "action" },
  ];
  return (
    <div className="p-4">
      <div className="flex justify-between px-3">
        <div className="text-xl font-bold">Auction</div>
      </div>

      <div className="h-full p-4 mx-1 mt-3 bg-white rounded-xl">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label>From</label>
              <input type="date" max={new Date().toISOString().split("T")[0]} value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>
            <div className="flex items-center gap-2">
              <label>To</label>
              <input type="date" max={new Date().toISOString().split("T")[0]} value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>
            <div className="">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Search
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
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-3 lg:mt-0">
            {fromDate && toDate && (
              <button onClick={handleDownloadExcel} className="text-blue-600 hover:text-blue-800">
                <img src={down} alt="Download" />
              </button>
            )}
            <button onClick={handleOpenModal} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
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
              <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-center ${col.key === "sellerName" || col.key === "buyerName"
                          ? "text-left"
                          : "text-center"
                        }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auctions.map((row, index) => (
                  <tr
                    key={row._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {columns.map((col) => {
                      let value;

                      if (col.key === "slNo") value = (CurrentPage - 1) * 10 + index + 1;
                      else if (col.key === "date")
                        value = moment(row.date).format("DD-MM-YYYY");
                      else if (col.key === "payment_status")
                        value = (
                          <span
                            className={
                              row.payment_status === "Paid"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {row.payment_status}
                          </span>
                        );
                      else if (col.key === "action")
                        value = (
                          <FaEye
                            size={18}
                            className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"
                            onClick={() => handleOpenEdit(row)}
                          />
                        );
                      else value = row[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-4 text-sm ${col.key === "sellerName" || col.key === "buyerName"
                              ? "text-left"
                              : "text-center"
                            }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

          )}
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

      {/* Auction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Auction"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6">
            {/* ---------- SELLER SECTION ---------- */}
            {/* <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Seller Details</h3>

              
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                  
                  <div
                    className={`absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300`}
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isMember ? "translateX(0)" : "translateX(100%)",
                    }}
                  ></div>

                  
                  <button
                    type="button"
                    onClick={() => setIsMember(true)}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${isMember ? "text-white" : "text-gray-700"
                      }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMember(false)}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${!isMember ? "text-white" : "text-gray-700"
                      }`}
                  >
                    Non-Member
                  </button>
                </div>




              </div>

              {isMember ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller ID</label>
                    <input
                      type="text"
                      placeholder="Search by ID"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      value={sellerIdSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSellerIdSearch(val);
                        debouncedSearchSellerById(val);
                      }}
                    />
                    {sellerDropdownById.length > 0 && (
                      <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                        {sellerDropdownById.map((m) => (
                          <li
                            key={m.member_id}
                            className="p-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSellerIdSearch(`${m.member_id}`);
                              setSellerSearch(`${m.member_name} - ${m.member_id}`);
                              setValue("sellerId", m.member_id);
                              setValue("sellerName", m.member_name);
                              setValue("sellerPhone", m.mobile_number);
                              setSellerDropdownById([]);
                            }}
                          >
                            {m.member_id} - {m.member_name} - {m.mobile_number}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Name</label>
                    <input
                      type="text"
                      placeholder="Search by Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      value={sellerSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSellerSearch(val);   
                        debouncedSearchSeller(val); 
                      }}
                    />
                    {sellerDropdown.length > 0 && (
                      <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                        {sellerDropdown.map((m) => (
                          <li
                            key={m.member_id}
                            className="p-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSellerSearch(`${m.member_name}`);
                              setSellerIdSearch(m.member_id);
                              setValue("sellerId", m.member_id);
                              setValue("sellerName", m.member_name);
                              setValue("sellerPhone", m.mobile_number);
                              setSellerDropdown([]);
                            }}
                          >
                            {m.member_name} - {m.member_id} - {m.mobile_number}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Phone</label>
                    <input
                      type="text"
                      readOnly
                      value={watch("sellerPhone") || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>


                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Name</label>
                    <input
                      type="text"
                      placeholder="Enter Seller Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("sellerName", { required: "Seller Name is required" })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Phone</label>
                    <input
                      type="text"
                      placeholder="Enter Seller Phone"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("sellerPhone", { required: "Seller Phone is required" })}
                    />
                  </div>
                </div>
              )}

            </div> */}




            {/* ---------- OTHER FIELDS ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item Name */}
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  id="item"
                  type="text"
                  placeholder="Enter Item"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                  {...register("item", { required: "Item is required" })}
                />
                {errors.item && <p className="text-sm text-red-500">{errors.item.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                  {...register("date", { required: "Date is required" })}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  id="amount"
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
                {/* Hidden Payment Status - default Unpaid */}
<input
  type="hidden"
  value="Unpaid"
  {...register("payment_status")}
/>

              </div>

            </div>
            {/* ---------- BUYER SECTION ---------- */}
            {/* <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>

                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                  
                  <div
                    className={`absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300`}
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isBuyerMember ? "translateX(0)" : "translateX(100%)",
                    }}
                  ></div>

                  
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
                    {buyerDropdownById.length > 0 && (
                      <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                        {buyerDropdownById.map((m) => (
                          <li
                            key={m.member_id}
                            className="p-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setBuyerIdSearch(m.member_id);
                              setBuyerSearch(`${m.member_name} - ${m.member_id}`);
                              setValue("buyerId", m.member_id);
                              setValue("buyerName", m.member_name);
                              setValue("buyerPhone", m.mobile_number);
                              setBuyerDropdownById([]);
                            }}
                          >
                            {m.member_id} - {m.member_name} - {m.mobile_number}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


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
                    {buyerDropdown.length > 0 && (
                      <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                        {buyerDropdown.map((m) => (
                          <li
                            key={m.member_id}
                            className="p-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setBuyerSearch(`${m.member_name} - ${m.member_id}`);
                              setBuyerIdSearch(m.member_id);
                              setValue("buyerId", m.member_id);
                              setValue("buyerName", m.member_name);
                              setValue("buyerPhone", m.mobile_number);
                              setBuyerDropdown([]);
                            }}
                          >
                            {m.member_name} - {m.member_id} - {m.mobile_number}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Phone</label>
                    <input
                      type="text"
                      readOnly
                      className="block w-full mt-1  border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("buyerPhone", { required: "Buyer Phone is required" })}
                    />
                  </div>
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Phone</label>
                    <input
                      type="text"
                      placeholder="Enter Buyer Phone"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("buyerPhone", { required: "Buyer Phone is required" })}
                    />
                  </div>
                </div>
              )}


            </div> */}
<div className="p-4 border rounded-lg bg-gray-50">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>
  </div>

  {/* Buyer Section - Only Members */}
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
        {...register("buyerPhone")}
      />
    </div>

    {/* ✅ Unified Dropdown */}
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
</div>



          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-red-500 border rounded-md"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>

      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="View Auction"
      >
        {selectedAuction && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(
                  `${URL}/auctions/${selectedAuction._id}`,
                  { payment_status: selectedAuction.payment_status },
                  { headers: { Authorization: token } }
                );
                fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
                setResponse({ status: "Success", message: "Payment status updated!" });
                handleCloseEdit();
              } catch (error) {
                setResponse({ status: "Failed", message: "Update failed" });
              }
            }}
            className="space-y-4"
          >
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
              {[
                { label: "Date", value: moment(selectedAuction.date).format("DD-MM-YYYY") },
                
                { label: "Item", value: selectedAuction.item },
                { label: "Buyer Name", value: selectedAuction.buyerName },
                { label: "Buyer Number", value: selectedAuction.buyerPhone },
                { label: "Buyer ID", value: selectedAuction.buyerId },
                { label: "Amount", value: `₹${selectedAuction.amount}` },
                
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
                    {item.value || "None"}
                  </div>

                </div>
              ))}
            </div>


            {/* <div>
              <label className="block text-gray-700">Payment Status</label>
              <select
                value={selectedAuction.payment_status}
                onChange={(e) =>
                  setSelectedAuction({ ...selectedAuction, payment_status: e.target.value })
                }
                className="w-full border rounded px-2 py-1"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div> */}

            {/* <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-4 py-2 text-red-500"
              >
                Close
              </button>
              
            </div> */}
          </form>
        )}
      </Modal>

      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> :
          <FailedMessage Message={Response.message} />
      )}
    </div>
  );
}
