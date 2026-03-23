import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
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
import { FaEye } from "react-icons/fa";
import Pagination from "../../Components/Helpers/Pagination";
import { jwtDecode } from "jwt-decode";



export const HarvestAuction = () => {
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
  const [userRole, setUserRole] = useState("");
  const [Response, setResponse] = useState({ status: null, message: "" });

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
  const [harvestItems, setHarvestItems] = useState([]);

  const [itemSearch, setItemSearch] = useState("");
  const [itemDropdown, setItemDropdown] = useState([]);

  // Item search states
  const [itemCodeSearch, setItemCodeSearch] = useState("");
  const [itemNameSearch, setItemNameSearch] = useState("");

  const [itemDropdownByCode, setItemDropdownByCode] = useState([]);
  const [itemDropdownByName, setItemDropdownByName] = useState([]);

  const [selectedItemName, setSelectedItemName] = useState("");
  const itemDebounceRef = useRef(null);
  // Pagination (shared component)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  // Buyer (Creditor) search states
  const [buyerIdSearch, setBuyerIdSearch] = useState("");
  const [buyerNameSearch, setBuyerNameSearch] = useState("");
  const [buyerPhoneSearch, setBuyerPhoneSearch] = useState("");

  const [buyerDropdownById, setBuyerDropdownById] = useState([]);
  const [buyerDropdownByName, setBuyerDropdownByName] = useState([]);


  const resetAuctionFormExceptDate = () => {
    const currentDate = watch("date"); // 👈 preserve date

    reset({
      date: currentDate,          // ✅ keep date
      sellerId: "",
      sellerName: "",
      sellerPhone: "",
      buyerId: "",
      buyerName: "",
      buyerPhone: "",
      itemCode: "",
      item: "",
      amount: "",
      payment_status: "Unpaid",
    });

    // 🔹 Reset ALL search UI states
    setSellerSearch("");
    setSellerIdSearch("");
    setSellerDropdown([]);
    setSellerDropdownById([]);

    setBuyerSearch("");
    setBuyerIdSearch("");
    setBuyerNameSearch("");
    setBuyerPhoneSearch("");
    setBuyerDropdownById([]);
    setBuyerDropdownByName([]);

    resetItemSelection(); // clears itemCodeSearch + itemNameSearch + dropdowns
  };

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


  const debouncedSearchBuyerById = useRef(
    debounce(async (val) => {
      if (!val) return setBuyerDropdownById([]);

      try {
        const res = await axios.get(`${URL}/creditor-search/id`, {
          params: { query: val },
          headers: { Authorization: token },
        });
        setBuyerDropdownById(res.data.data || []);
      } catch {
        setBuyerDropdownById([]);
      }
    }, 300)
  ).current;

  // Debounced Buyer ID search
  const debouncedSearchBuyerByName = useRef(
    debounce(async (val) => {
      if (!val) return setBuyerDropdownByName([]);

      try {
        const res = await axios.get(`${URL}/creditor-search/name`, {
          params: { query: val },
          headers: { Authorization: token },
        });
        setBuyerDropdownByName(res.data.data || []);
      } catch {
        setBuyerDropdownByName([]);
      }
    }, 300)
  ).current;

  const debouncedSearchBuyerByPhone = useRef(
    debounce(async (val) => {
      if (!val) return setBuyerDropdownByName([]);

      try {
        const res = await axios.get(`${URL}/creditor-search/phone`, {
          params: { query: val },
          headers: { Authorization: token },
        });
        setBuyerDropdownByName(res.data.data || []);
      } catch {
        setBuyerDropdownByName([]);
      }
    }, 300)
  ).current;


  const debouncedSearchItemByCode = useRef(
    debounce(async (val) => {
      if (!val) return setItemDropdownByCode([]);

      try {
        const res = await axios.get(
          `${URL}/harvest-auctions/search/by-code`,
          {
            params: { query: val },
            headers: { Authorization: token },
          }
        );
        setItemDropdownByCode(res.data.data || []);
      } catch {
        setItemDropdownByCode([]);
      }
    }, 300)
  ).current;

  const debouncedSearchItemByName = useRef(
    debounce(async (val) => {
      if (!val) return setItemDropdownByName([]);

      try {
        const res = await axios.get(
          `${URL}/harvest-auctions/search/by-name`,
          {
            params: { query: val },
            headers: { Authorization: token },
          }
        );
        setItemDropdownByName(res.data.data || []);
      } catch {
        setItemDropdownByName([]);
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




  // fetching auctions
  // const fetchHarvestAuctions = async (page, search, fromDate, toDate) => {
  //   try {
  //     const res = await axios.get(
  //       `${URL}/harvest-auctions?page=${page}&limit=15&search=${search}&fromdate=${fromDate}&todate=${toDate}`,
  //       { headers: { Authorization: token } }
  //     );

  //     const data = Array.isArray(res.data) ? res.data : res.data.auctions || [];
  //     setAuctions(data);
  //   } catch (error) {
  //     console.error("Failed to fetch harvest auctions:", error);
  //     setAuctions([]);
  //   }
  // };

  const fetchHarvestAuctions = async (page, search, fromDate, toDate) => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/harvest-auctions`, {
        params: {
          page,
          limit: rowsPerPage,
          search: search || "",
          fromdate: fromDate || "",
          todate: toDate || "",
        },
        headers: { Authorization: token },
      });

      const data = res.data.auctions || [];
      setAuctions(data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch harvest auctions:", error);
      setAuctions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };



  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchHarvestAuctions(page, query, from, to);
    }, 200);
  };

  useEffect(() => {
    debounceFetch(CurrentPage, searchQuery, fromDate, toDate);
  }, [CurrentPage, searchQuery, fromDate, toDate, rowsPerPage]);

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };


  /** Form Submit */
  const onSubmit = async (formData) => {
    try {
      // Mark non-members explicitly
      if (!isMember) formData.sellerId = "";
      if (!isBuyerMember) formData.buyerId = "";

      await axios.post(
        `${URL}/harvest-auctions`,
        formData,
        { headers: { Authorization: token } }
      );

      resetAuctionFormExceptDate();
      fetchHarvestAuctions(CurrentPage, searchQuery, fromDate, toDate);

      showToast("Success", "Auction added successfully");
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to add auction";

      setServerError(msg);
      showToast("Failed", msg);
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
    resetAuctionFormExceptDate();
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetAuctionFormExceptDate();
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
    // { label: "Item Code", key: "itemCode" },
    { label: "Buyer ID", key: "buyerId" },
    { label: "Buyer Name", key: "buyerName" },
    { label: "Item", key: "item" },
    // { label: "Buyer Phone", key: "buyerPhone" },
    { label: "Amount", key: "amount" },
    { label: "Action", key: "action" },
  ];

  useEffect(() => {
    if (isModalOpen) {
      axios
        .get(`${URL}/harvest-items`, { headers: { Authorization: token } })
        .then((res) => {
          setHarvestItems(res.data.items || []);
        })
        .catch((err) => {
          console.error("Failed to fetch harvest items:", err);
        });
    }
  }, [isModalOpen]);

  const debouncedSearchItems = (val) => {
    if (itemDebounceRef.current) {
      clearTimeout(itemDebounceRef.current);
    }
    itemDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${URL}/harvest-items?search=${val}`, {
          headers: { Authorization: token },
        });
        // 🔹 Filter only by code
        const filtered = (res.data.items || []).filter((i) =>
          i.code.toLowerCase().includes(val.toLowerCase())
        );
        setItemDropdown(filtered);
      } catch (err) {
        console.error("Error searching items:", err);
        setItemDropdown([]);
      }
    }, 500);
  };
  useEffect(() => {
    if (isModalOpen) {
      reset({
        item: "",
        itemCode: "",
        amount: "",
        payment_status: "Unpaid",
        buyerId: "",
        buyerName: "",
        buyerPhone: ""
      });
      setItemSearch("");
      setSelectedItemName("");
      setBuyerIdSearch("");
      setBuyerSearch("");
    }
  }, [isModalOpen]);
  const resetItemSelection = () => {
    setItemCodeSearch("");
    setItemNameSearch("");

    setValue("itemCode", "");
    setValue("item", "");

    setItemDropdownByCode([]);
    setItemDropdownByName([]);
  };


  return (
    <div className="">

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Auction</h1>
          <div className="flex gap-3 mt-3 lg:mt-0">
            {["admin", "churchofficeworker"].includes(userRole) && (
              <button onClick={() => navigate("/admin/addharvestauction/addharvestitem")} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
                <FaPlus /> Add Item
              </button>
            )}
            {["admin", "treasurer", "churchofficeworker"].includes(userRole) && (
              <button onClick={() => navigate("/admin/addharvestauction/harvestaucreport")} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
                <FaEye /> Report
              </button>
            )}
            {["admin", "churchofficeworker"].includes(userRole) && (
              <button onClick={handleOpenModal} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
                <FaPlus /> Add Auction
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-l font-medium text-gray-600 mb-1">From:</label>
              <input type="date" max={new Date().toISOString().split("T")[0]} value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-l font-medium text-gray-600 mb-1">To:</label>
              <input type="date" max={new Date().toISOString().split("T")[0]} value={toDate} onChange={(e) => setToDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>
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
                placeholder="Search"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                      className={`px-4  text-center ${col.key === "sellerName" || col.key === "buyerName"
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

                      if (col.key === "slNo") value = (CurrentPage - 1) * rowsPerPage + index + 1;
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
                            className="cursor-pointer text-lavender--600 inline-block"
                            onClick={() => handleOpenEdit(row)}
                          />
                        );
                      else value = row[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`py-2 text-sm ${col.key === "sellerName" || col.key === "buyerName" || col.key === "buyerPhone" || col.key === "item"
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


            {/* ---------- OTHER FIELDS ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Code
                </label>
                <input
                  type="text"
                  placeholder="Search Item Code"
                  value={itemCodeSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemCodeSearch(val);
                    if (!val) {
                      resetItemSelection();
                      return;
                    }
                    debouncedSearchItemByCode(val);
                    setItemDropdownByName([]); // clear other
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="Search Item Name"
                  value={itemNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemNameSearch(val);
                    if (!val) {
                      resetItemSelection();
                      return;
                    }
                    debouncedSearchItemByName(val);
                    setItemDropdownByCode([]); // clear other
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {(itemDropdownByCode.length > 0 || itemDropdownByName.length > 0) && (
                <ul className="absolute left-0 right-0 mt-[75px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">

                  {(itemDropdownByCode.length > 0
                    ? itemDropdownByCode
                    : itemDropdownByName
                  ).map((item) => (
                    <li
                      key={item.code}
                      className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
                      onClick={() => {
                        // Fill inputs
                        setItemCodeSearch(item.code);
                        setItemNameSearch(item.name);

                        // Set form values
                        setValue("itemCode", item.code);
                        setValue("item", item.name);

                        // Clear dropdowns
                        setItemDropdownByCode([]);
                        setItemDropdownByName([]);
                      }}
                    >
                      <span className="w-1/2 font-medium">{item.code}</span>
                      <span className="w-1/2">{item.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              <input type="hidden" {...register("itemCode", { required: true })} />
              <input type="hidden" {...register("item", { required: true })} />*/}


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Item Code"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  {...register("itemCode", {
                    required: "Item Code is required",
                  })}
                />
                {errors.itemCode && (
                  <p className="text-sm text-red-500">{errors.itemCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Item Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  {...register("item", {
                    required: "Item Name is required",
                  })}
                />
                {errors.item && (
                  <p className="text-sm text-red-500">{errors.item.message}</p>
                )}
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
                    onChange: (e) => {
                      const value = e.target.value;
                      // allow numbers and only one decimal
                      if (!/^\d*\.?\d{0,2}$/.test(value)) {
                        e.target.value = value.slice(0, -1);
                      }
                    },
                  })}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>

              { }
              <div>
                {/* Hidden Payment Status - default Unpaid */}
                <input
                  type="hidden"
                  value="Unpaid"
                  {...register("payment_status")}
                />

              </div>

            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>
              </div>

              {/* Buyer Section - Only Members */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

                {/* Buyer ID */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Buyer ID</label>
                  <input
                    type="text"
                    placeholder="Search ID"
                    value={buyerIdSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBuyerIdSearch(val);
                      debouncedSearchBuyerById(val);
                      setBuyerDropdownByName([]);
                    }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* Buyer Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Buyer Name</label>
                  <input
                    type="text"
                    placeholder="Search Name"
                    value={buyerNameSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBuyerNameSearch(val);
                      debouncedSearchBuyerByName(val);
                      setBuyerDropdownById([]);
                    }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* Buyer Phone */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Buyer Phone</label>
                  <input
                    type="text"
                    placeholder="Search Phone"
                    value={buyerPhoneSearch}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setBuyerPhoneSearch(val);
                      debouncedSearchBuyerByPhone(val);
                      setBuyerDropdownById([]);
                    }}
                    maxLength={10}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* ✅ Unified Dropdown */}
                {(buyerDropdownById.length > 0 || buyerDropdownByName.length > 0) && (
                  <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                    {(buyerDropdownById.length > 0
                      ? buyerDropdownById
                      : buyerDropdownByName
                    ).map((item) => (
                      <li
                        key={item.id}
                        className="flex px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                        onClick={() => {
                          setBuyerIdSearch(item.id);
                          setBuyerNameSearch(item.name);
                          setBuyerPhoneSearch(item.phone);

                          setValue("buyerId", item.id);
                          setValue("buyerName", item.name);
                          setValue("buyerPhone", item.phone);

                          setBuyerDropdownById([]);
                          setBuyerDropdownByName([]);
                        }}
                      >
                        <span className="w-1/3 font-medium">{item.id}</span>
                        <span className="w-1/3">{item.name}</span>
                        <span className="w-1/3 text-gray-500">{item.phone}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <input type="hidden" {...register("buyerId")} />
                <input type="hidden" {...register("buyerName")} />
                <input type="hidden" {...register("buyerPhone")} />

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
                { label: "Item Code", value: selectedAuction.itemCode },
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



          </form>
        )}
      </Modal>

      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> :
          <FailedMessage Message={Response.message} />
      )}
    </div>
  )
}
