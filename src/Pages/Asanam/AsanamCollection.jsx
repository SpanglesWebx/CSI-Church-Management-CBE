import React, { useEffect, useRef, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Pagination from '../../Components/Helpers/Pagination';
import SmallSizedModal from '../../Components/Expense/SmallSizedModal';

export const AsanamCollection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoatRiceModalOpen, setIsGoatRiceModalOpen] = useState(false);
  const [isGoatRiceViewModalOpen, setIsGoatRiceViewModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [amount, setAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [description, setDescription] = useState("");
  const [isAsanamZoneModalOpen, setIsAsanamZoneModalOpen] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [newZone, setNewZone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [asanamAmount, setAsanamAmount] = useState("");

const [chequeDate, setChequeDate] = useState("");
const [upiId, setUpiId] = useState("");

const [memberTitle, setMemberTitle] = useState("");
const [memberTamilName, setMemberTamilName] = useState("");
const [memberTamilTitle, setMemberTamilTitle] = useState("");

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${URL}/asanam-zone/list`, {
        headers: { Authorization: token },
      });
      setZones(res.data.data || []);
    } catch (err) {
      console.error("Zone fetch failed", err);
      showToast("Failed", "Zone fetch failed");
    }
  };


  useEffect(() => {
    fetchZones();
  }, []);

  const handleAddZone = async () => {
    if (!newZone.trim()) {
      showToast("Failed", "Enter zone name");
      return;
    }

    try {
      await axios.post(
        `${URL}/asanam-zone/add`,
        { zone_name: newZone },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Zone added successfully");

      // ✅ reset only input
      setNewZone("");

      // ❌ do NOT close modal
      fetchZones();
    } catch (err) {
      console.error("Add zone failed", err);
      showToast("Failed", "Add zone failed");
    }
  };




  // ------------------ MEMBER SEARCH STATES ------------------
  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  const [isMember, setIsMember] = useState(true);

  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");

  const [goatPrice, setGoatPrice] = useState("");
  const [ricePrice, setRicePrice] = useState("");
  const [goatCount, setGoatCount] = useState("");
  const [riceCount, setRiceCount] = useState("");

  const [goatTotal, setGoatTotal] = useState("");
  const [riceTotal, setRiceTotal] = useState("");

  const [priceDescription, setPriceDescription] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [receiptNo, setReceiptNo] = useState("");




  const [pricePage, setPricePage] = useState(1);
  const [priceTotalPages, setPriceTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearList, setYearList] = useState([]);
  // pagination (standard)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("25");
  const [jumpInput, setJumpInput] = useState("");


  const fetchYears = async () => {
    try {
      const res = await axios.get(`${URL}/asanam-price/years`, {
        headers: { Authorization: token }
      });

      setYearList(res.data.years || []);
    } catch (err) {
      console.log("Year fetch error:", err);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);



  const fetchPriceList = async (page = 1, year = selectedYear) => {
    try {
      const res = await axios.get(`${URL}/asanam-price/list`, {
        params: {
          page,
          limit: 10,
          year
        },
        headers: { Authorization: token }
      });

      setPriceList(res.data.data || []);
      setPricePage(res.data.currentPage);
      setPriceTotalPages(res.data.totalPages);

    } catch (err) {
      console.error("Error loading price list:", err);

      setResponse({
        status: "Failed",
        message: "Failed to load price list",
      });

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };
  useEffect(() => {
    fetchPriceList(1, selectedYear);
  }, [selectedYear]);




  const loadLatestPrice = async () => {
    try {
      const res = await axios.get(`${URL}/asanam-price/latest`, {
        headers: { Authorization: token }
      });

      if (res.data.data) {
        setGoatPrice(res.data.data.goat_price);
        setRicePrice(res.data.data.rice_price);
      }
    } catch (err) {
      console.error("Error fetching latest price:", err);
    }
  };

  useEffect(() => {
    if (goatPrice && goatCount) {
      setGoatTotal(goatPrice * goatCount);
    } else {
      setGoatTotal("");
    }
  }, [goatCount, goatPrice]);

  useEffect(() => {
    if (ricePrice && riceCount) {
      setRiceTotal(ricePrice * riceCount);
    } else {
      setRiceTotal("");
    }
  }, [riceCount, ricePrice]);

  useEffect(() => {
    const g = Number(goatTotal) || 0;
    const r = Number(riceTotal) || 0;
    const a = Number(asanamAmount) || 0;

    if (g === 0 && r === 0 && a === 0) {
      setAmount("");
    } else {
      setAmount(g + r + a);
    }
  }, [goatTotal, riceTotal, asanamAmount]);





  const handlePriceSave = async () => {
    if (!goatPrice || !ricePrice) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Goat Price & Rice Bag Price required",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return;
    }

    try {
      const payload = {
        goat_price: goatPrice,
        rice_price: ricePrice,
        description: priceDescription,
      };

      await axios.post(
        `${URL}/asanam-price/add`,
        payload,
        { headers: { Authorization: token } }
      );

      // Success Toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Price saved successfully",
        });
      }, 10);

      // Clear Fields
      setGoatPrice("");
      setRicePrice("");
      setPriceDescription("");

      // Close Modal
      setIsGoatRiceModalOpen(false);
      fetchPriceList();

    } catch (err) {
      console.error("Price Save Error:", err);

      // Error Toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save price",
        });
      }, 10);
    } finally {
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // 🔎 Search by ID
  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);

      try {
        const res = await axios.get(`${URL}/asanam-search/id`, {
          params: { query: val },
          headers: { Authorization: token },
        });

        setDropdownById(res.data.data || []);
      } catch {
        setDropdownById([{ id: "none", name: "No results found" }]);
      }
    }, 300)
  ).current;

  // 🔎 Search by name
  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);

      try {
        const res = await axios.get(`${URL}/asanam-search/name`, {
          params: { query: val },
          headers: { Authorization: token },
        });

        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([{ id: "none", name: "No results found" }]);
      }
    }, 300)
  ).current;

  // 🔎 Search by phone
  const debouncedSearchByPhone = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);

      try {
        const res = await axios.get(`${URL}/asanam-search/phone`, {
          params: { query: val },
          headers: { Authorization: token },
        });

        setDropdownByName(res.data.data || []);
      } catch {
        setDropdownByName([{ id: "none", name: "No results found" }]);
      }
    }, 300)
  ).current;


  const PAGE_LIMIT = 10;

  const fetchDonations = async (page = CurrentPage) => {
    try {
      const params = { page, limit: rowsPerPage,search: searchTerm, };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${URL}/asanam-collection/list`, {
        params,
        headers: { Authorization: token },
      });

      setDonations(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);

    } catch (err) {
      setResponse({ status: "Failed", message: "Failed to load donations" });
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [CurrentPage, startDate, endDate, rowsPerPage,searchTerm]);



  const handleSave = async () => {

    // VALIDATIONS -----------------------------
    if (!receiptNo) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Receipt Number required" });
      }, 10);
      return;
    }

    if (!donationDate) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Date required" });
      }, 10);
      return;
    }

 

    if (!goatCount && !riceCount && !asanamAmount) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Either Goat Count OR Rice Bag Count is required",
        });
      }, 10);
      return;
    }

    if (!amount) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Grand Total required",
        });
      }, 10);
      return;
    }
    if (!paymentMethod) {
      setResponse({ status: "Failed", message: "Select payment method" });
      return;
    }

    if (paymentMethod === "Cheque" && !chequeNumber.trim()) {
      setResponse({ status: "Failed", message: "Cheque number required" });
      return;
    }
    if (isMember) {
      if (!memberId || !memberName) {
        showToast("Failed", "Select a member");
        return;
      }
    } else {
      if (!nonMemberName || !nonMemberPhone) {
        showToast("Failed", "Enter non-member details");
        return;
      }
    }


    // PAYLOAD --------------------------------
    try {
      const payload = {
        receipt_no: receiptNo,
        date: donationDate,

        member_id: isMember ? memberId : "Non-Member",
        member_name: isMember ? memberName : nonMemberName,
        member_phone: isMember ? memberPhone : nonMemberPhone,

member_title: memberTitle,
member_tamil_name: memberTamilName,
member_tamil_title: memberTamilTitle,

        zone_name: selectedZone || "",

        goat_price: goatPrice || 0,
        goat_count: goatCount || "",
        goat_total: goatTotal || 0,

        rice_price: ricePrice || 0,
        rice_count: riceCount || "",
        rice_total: riceTotal || 0,

        asanam_amount: Number(asanamAmount) || 0,

        payment_method: paymentMethod,
        cheque_number: paymentMethod === "Cheque" ? chequeNumber : "",
        cheque_date: paymentMethod === "Cheque" ? chequeDate : "",

        upi_id: paymentMethod === "UPI" ? upiId : "",

        amount, // 🔥 final grand total (goat + rice + asanam)
        description,
      };


      await axios.post(`${URL}/asanam-collection/add`, payload, {
        headers: { Authorization: token },
      });

      // SUCCESS MESSAGE -----------------------
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Donation saved successfully",
        });
      }, 10);

      // RESET ONLY SOME FIELDS ----------------
      setReceiptNo("");        // reset
      // donationDate remains unchanged ❌ DO NOT RESET

      // member fields reset
      setMemberId("");
      setMemberName("");
      setMemberPhone("");

      // counts reset
      setGoatCount("");
      setRiceCount("");
      setGoatTotal("");
      setRiceTotal("");
      setAsanamAmount("");

      // total reset
      setAmount("");
      setChequeDate("");

      setUpiId("");

      setPaymentMethod("");
      setChequeNumber("");

      // description reset
      setDescription("");

      // search inputs reset
      setIdSearch("");
      setNameSearch("");
      setPhoneSearch("");

setMemberTitle("");
setMemberTamilName("");
setMemberTamilTitle("");

      // ❌ DO NOT CLOSE MODAL
      // ❌ DO NOT RESET goatPrice & ricePrice

      // Refresh list
      fetchDonations(1);

    } catch (err) {
      console.error("Save error:", err);

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err?.response?.data?.message || "Failed to save donation",
        });
      }, 10);

    } finally {
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };





  const openView = async (donation) => {
    setIsViewOpen(true);

    try {
      const res = await axios.get(`${URL}/asanam-collection/${donation._id}`, {
        headers: { Authorization: token },
      });
      setSelectedDonation(res.data.data);

    } catch (err) {
      setResponse({ status: "Failed", message: "Failed to load details" });
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Asanam Collection</h1>
<div className="flex items-center justify-between p-2">

  {/* SEARCH BOX */}
  <div>
    <label className="sr-only">Search</label>

    <div className="relative">

      <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
        <svg
          className="w-3 h-3 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>

      <input
        type="search"
        placeholder="Search Name / ID"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="block py-1 text-sm text-gray-900 rounded w-56 ps-8 bg-gray-50"
      />

    </div>
  </div>


  {/* DATE FILTER */}
  <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

    <label className="text-l font-medium text-gray-600 mb-1">
      From
    </label>

    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
    />

    <label className="text-l font-medium text-gray-600 mb-1">
      To
    </label>

    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
    />

  </div>


  {/* BUTTONS */}
  <div className="flex gap-2">

    <button
      onClick={() => {
        fetchPriceList(1);
        setIsGoatRiceViewModalOpen(true);
      }}
      className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
    >
      <FaEye /> Price List
    </button>


    <button
      onClick={() => setIsGoatRiceModalOpen(true)}
      className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
    >
      <FaPlus /> Price
    </button>


    <button
      onClick={() => {
        loadLatestPrice();
        setIsModalOpen(true);
      }}
      className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
    >
      <FaPlus /> Donation
    </button>

  </div>

</div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">ID</th>
                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.length > 0 ? (
                donations.map((d, i) => (
                  <tr key={d._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + (i + 1)}
                    </td>

                    <td className="p-2 text-center">{d.member_id}</td>

                    <td className="p-2 text-center">{d.member_name}</td>

                    <td className="p-2 text-center">₹ {d.amount}</td>

                    <td className="p-2 text-center">
                      {moment(d.date).format("DD-MM-YYYY")}
                    </td>

                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        onClick={() => openView(d)}
                        className="text-lavender--600 cursor-pointer mx-auto"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
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



        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Donation">
          <div className="space-y-3 max-h-[650px] overflow-y-auto">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="Enter Receipt Number"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div className="border rounded-lg bg-gray-50 p-3">
              <div className="mb-4 flex justify-end">
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                  {/* Highlight */}
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isMember ? "translateX(0)" : "translateX(100%)",
                    }}
                  />

                  {/* Member */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMember(true);

                      // reset non-member
                      setNonMemberName("");
                      setNonMemberPhone("");

                      // reset member fields
                      setMemberId("");
                      setMemberName("");
                      setMemberPhone("");
                      setIdSearch("");
                      setNameSearch("");
                      setPhoneSearch("");

                      setDropdownById([]);
                      setDropdownByName([]);
                    }}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
        ${isMember ? "text-white" : "text-gray-700"}`}
                  >
                    Member
                  </button>

                  {/* Non-Member */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMember(false);

                      // reset member fields
                      setMemberId("");
                      setMemberName("");
                      setMemberPhone("");
                      setIdSearch("");
                      setNameSearch("");
                      setPhoneSearch("");

                      setDropdownById([]);
                      setDropdownByName([]);
                    }}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
        ${!isMember ? "text-white" : "text-gray-700"}`}
                  >
                    Non-Member
                  </button>
                </div>
              </div>
              {isMember ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 relative">

                    {/* ID Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID</label>
                      <input
                        type="text"
                        placeholder="Search ID"
                        value={idSearch}
                        onChange={(e) => {
                          setIdSearch(e.target.value);
                          debouncedSearchById(e.target.value);
                          setDropdownByName([]);
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Name Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        placeholder="Search Name"
                        value={nameSearch}
                        onChange={(e) => {
                          setNameSearch(e.target.value);
                          debouncedSearchByName(e.target.value);
                          setDropdownById([]);
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* Phone Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        placeholder="Search Phone"
                        value={phoneSearch}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setPhoneSearch(val);
                          debouncedSearchByPhone(val);

                          setDropdownById([]);
                          setDropdownByName([]);
                        }}
                        maxLength={10}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    {/* DROPDOWN RESULTS */}
                    {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                      <ul className="absolute mt-[80px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                        {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((item) => (
                          <li
                            key={item.id}
                            className={`flex px-3 py-2 text-sm ${item.id === "none"
                              ? "text-gray-500 cursor-default"
                              : "hover:bg-indigo-50 cursor-pointer"
                              }`}
                            onClick={() => {
                              if (item.id === "none") return;

                              setIdSearch(item.id);
                              setNameSearch(item.name);
                              setPhoneSearch(item.phone || "");

                              setMemberId(item.id);
                              setMemberName(item.name);
                              setMemberPhone(item.phone || "");

  // ⭐ Future fields
  setMemberTitle(item.member_title || "");
  setMemberTamilName(item.member_tamil_name || "");
  setMemberTamilTitle(item.member_tamil_title || "");

                              setDropdownById([]);
                              setDropdownByName([]);
                            }}
                          >
                            <span className="w-1/3 font-medium">{item.id}</span>
                            <span className="w-1/3">{item.name}</span>
                            <span className="w-1/3 text-gray-500">{item.phone}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Name"
                        value={nonMemberName}
                        onChange={(e) => setNonMemberName(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Phone"
                        value={nonMemberPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setNonMemberPhone(val);
                        }}
                        maxLength={10}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </>

              )}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1 p-3 border rounded-lg bg-gray-50">

              <div>
                <label className="block text-sm font-medium text-gray-700">No. of Goat(s)</label>
                <input
    type="text"
    value={goatCount}
    onChange={(e) => {
      const val = e.target.value;

      // Allow empty
      if (val === "") {
        setGoatCount("");
        return;
      }

      // Allow only digits and dot
      if (!/^[0-9.]+$/.test(val)) return;

      // 1️⃣ Allow "." while typing
      if (val === ".") {
        setGoatCount(".");
        return;
      }

      // 2️⃣ Allow ".5"
      if (val === ".5") {
        setGoatCount(val);
        return;
      }

      // 3️⃣ Allow whole numbers
      if (/^\d+$/.test(val)) {
        setGoatCount(val);
        return;
      }

      // 4️⃣ Allow "digit." while typing (like "1.")
      if (/^\d+\.$/.test(val)) {
        setGoatCount(val);
        return;
      }

      // 5️⃣ Allow "digit.5"
      if (/^\d+\.5$/.test(val)) {
        setGoatCount(val);
        return;
      }

      // ❌ Reject all other decimals
    }}
    placeholder="Enter no. of Goat"
    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
  />

              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <input
                  type="text"
                  value={goatTotal}
                  readOnly
                  placeholder='Amount'
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">No. of Rice Bag(s)</label>
                <input
                  type="text"
                  value={riceCount}
                  onChange={(e) => {
                    const val = e.target.value;

                    // Allow empty
                    if (val === "") {
                      setRiceCount("");
                      return;
                    }

                    // Allow only digits and dot
                    if (!/^[0-9.]+$/.test(val)) return;

                    // 1️⃣ Allow "." while typing
                    if (val === ".") {
                      setRiceCount(".");
                      return;
                    }

                    // 2️⃣ Allow ".5"
                    if (val === ".5") {
                      setRiceCount(val);
                      return;
                    }

                    // 3️⃣ Allow whole numbers
                    if (/^\d+$/.test(val)) {
                      setRiceCount(val);
                      return;
                    }

                    // 4️⃣ Allow "digit." while typing (like "1.")
                    if (/^\d+\.$/.test(val)) {
                      setRiceCount(val);
                      return;
                    }

                    // 5️⃣ Allow "digit.5"
                    if (/^\d+\.5$/.test(val)) {
                      setRiceCount(val);
                      return;
                    }

                    // ❌ Reject all other decimals
                  }}
                  placeholder="Enter no. of Rice Bag"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />


              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <input
                  type="text"
                  value={riceTotal}
                  readOnly
                  placeholder='Amount'
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asanam Amount
                </label>
                <input
                  type="text"
                  placeholder="Enter Donation Amount"
                  value={asanamAmount}
                  onChange={(e) => {
                    const val = e.target.value;

                    // allow empty
                    if (val === "") {
                      setAsanamAmount("");
                      return;
                    }

                    // allow only numbers
                    if (/^\d+$/.test(val)) {
                      setAsanamAmount(val);
                    }
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grand Total</label>
                <input
                  type="text"
                  value={amount}
                  readOnly
                  placeholder="Grand Total"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  placeholder='Enter Description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Zone
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsAsanamZoneModalOpen(true)}
                    className="block mb-1 font-semibold text-sm text-lavender--600"
                  >
                    + Add Zone
                  </button>
                </div>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">-- Select Zone --</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z.zone_name}>
                      {z.zone_name}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setChequeNumber(""); // reset when switching
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              {paymentMethod === "Cheque" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Cheque Number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              )}
{paymentMethod === "Cheque" && (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Cheque Date
    </label>
    <input
      type="date"
      value={chequeDate}
      onChange={(e) => setChequeDate(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>
)}

{paymentMethod === "UPI" && (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      UPI ID
    </label>
    <input
      type="text"
      placeholder="Enter UPI ID"
      value={upiId}
      onChange={(e) => setUpiId(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>
)}
            </div>


            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>

        </Modal>
        <SmallSizedModal isOpen={isAsanamZoneModalOpen} onClose={() => { setIsAsanamZoneModalOpen(false); }} title="Add New Zone">
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone</label>
            <input
              type="text"
              placeholder='Enter Zone'
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();   // ⛔ avoid any default behavior
                  handleAddZone();      // ✅ save on Enter
                }
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleAddZone}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </SmallSizedModal>
        <Modal isOpen={isGoatRiceModalOpen} onClose={() => setIsGoatRiceModalOpen(false)} title="Add Price for Goat and Rice">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goat Price</label>
              <input
                type="text"
                placeholder="Enter Price per Goat"
                value={goatPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setGoatPrice(val);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rice Price (Per Bag)</label>
              <input
                type="text"
                placeholder="Enter Price per Rice Bag"
                value={ricePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setRicePrice(val);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Enter Description"
                value={priceDescription}
                onChange={(e) => setPriceDescription(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handlePriceSave}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </Modal>
        <Modal isOpen={isGoatRiceViewModalOpen} onClose={() => setIsGoatRiceViewModalOpen(false)} title="Price List" >
          <div className="mb-3 flex justify-end items-center gap-3">

            <label className="block text-sm font-medium text-gray-700">
              Yearly
            </label>

            {/* LEFT ARROW – Previous Year */}
            <button
              onClick={() => {
                const currentIdx = yearList.indexOf(Number(selectedYear));
                if (currentIdx < yearList.length - 1) {
                  const newYear = yearList[currentIdx + 1];
                  setSelectedYear(newYear);
                  fetchPriceList(1, newYear);
                }
              }}
              disabled={yearList.indexOf(Number(selectedYear)) === yearList.length - 1}
              className={`p-2 rounded ${yearList.indexOf(Number(selectedYear)) === yearList.length - 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <FaChevronLeft size={14} />
            </button>

            {/* Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                fetchPriceList(1, Number(e.target.value));
              }}
              className="border border-gray-300 rounded-md w-[100px] px-3 py-1 text-sm text-gray-700"
            >
              {yearList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* RIGHT ARROW – Next Year */}
            <button
              onClick={() => {
                const currentIdx = yearList.indexOf(Number(selectedYear));
                if (currentIdx > 0) {
                  const newYear = yearList[currentIdx - 1];
                  setSelectedYear(newYear);
                  fetchPriceList(1, newYear);
                }
              }}
              disabled={yearList.indexOf(Number(selectedYear)) === 0}
              className={`p-2 rounded ${yearList.indexOf(Number(selectedYear)) === 0
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <FaChevronRight size={14} />
            </button>

          </div>



          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-base text-gray-700 border-b">
                <tr>
                  <th className="p-2 text-center">Sl No.</th>
                  <th className="p-2 text-center">Date</th>
                  <th className="p-2 text-center">Goat Price</th>
                  <th className="p-2 text-center">Rice Bag Price</th>
                </tr>
              </thead>

              <tbody>
                {priceList.length > 0 ? (
                  priceList.map((item, index) => (
                    <tr key={item._id} className="border-b">
                      <td className="p-2 text-center">{(pricePage - 1) * 10 + index + 1}</td>
                      <td className="p-2 text-center">
                        {moment(item.date).format("DD-MM-YYYY")}
                      </td>
                      <td className="p-2 text-center">₹ {item.goat_price}</td>
                      <td className="p-2 text-center">₹ {item.rice_price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-400">
                      No price records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {priceTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">

                <button
                  onClick={() => fetchPriceList(pricePage - 1)}
                  disabled={pricePage === 1}
                  className={`px-4 py-1 rounded 
        ${pricePage === 1
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
      `}
                >
                  Previous
                </button>

                <span className="px-3 py-1 bg-lavender--600 text-white rounded">
                  {pricePage} / {priceTotalPages}
                </span>

                <button
                  onClick={() => fetchPriceList(pricePage + 1)}
                  disabled={pricePage === priceTotalPages}
                  className={`px-4 py-1 rounded 
        ${pricePage === priceTotalPages
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
      `}
                >
                  Next
                </button>

              </div>
            )}

          </div>
        </Modal>
        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Donation Details">
          {selectedDonation && (
            <div className="flex flex-col w-full max-w-4xl ps-3 space-y-3 max-h-[650px] overflow-y-auto">

              {[
                { label: "Receipt Number", value: selectedDonation.receipt_no },
                { label: "Member ID", value: selectedDonation.member_id },
                { label: "Member Name", value: selectedDonation.member_name },
                { label: "Member Phone", value: selectedDonation.member_phone || "-" },
                { label: "Zone", value: selectedDonation.zone_name || "-" },

                { label: "Goat Price", value: selectedDonation.goat_price ? `₹ ${selectedDonation.goat_price}` : "-" },
                { label: "Rice Price", value: selectedDonation.rice_price ? `₹ ${selectedDonation.rice_price}` : "-" },
                { label: "No. of Goats", value: selectedDonation.goat_count || "-" },
                { label: "No. of Rice Bags", value: selectedDonation.rice_count || "-" },

                { label: "Goat Total", value: selectedDonation.goat_total ? `₹ ${selectedDonation.goat_total}` : "-" },
                { label: "Rice Total", value: selectedDonation.rice_total ? `₹ ${selectedDonation.rice_total}` : "-" },
                { label: "Asanam Amount", value: selectedDonation.asanam_amount ? `₹ ${selectedDonation.asanam_amount}` : "-" },

                { label: "Grand Total", value: `₹ ${selectedDonation.amount}` },

{ label: "Payment Method", value: selectedDonation.payment_method || "-" },

...(selectedDonation.payment_method === "Cheque"
 ? [
     {
       label: "Cheque Number",
       value: selectedDonation.cheque_number || "-"
     },
     {
       label: "Cheque Date",
       value: selectedDonation.cheque_date
         ? moment(selectedDonation.cheque_date).format("DD-MM-YYYY")
         : "-"
     }
   ]
 : []),

...(selectedDonation.payment_method === "UPI"
 ? [
     {
       label: "UPI ID",
       value: selectedDonation.upi_id || "-"
     }
   ]
 : []),

                { label: "Date", value: moment(selectedDonation.date).format("DD-MM-YYYY") },
                { label: "Description", value: selectedDonation.description || "-" },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 pb-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

            </div>
          )}
        </Modal>

      </div>
      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  )
}
