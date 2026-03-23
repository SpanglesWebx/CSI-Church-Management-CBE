import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";

export const ShopList = () => {
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });

  // ------------------- Shop list + filters -------------------
  const [shops, setShops] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // ------------------- Add Shop states -------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");

  // ------------------- View shop -------------------
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // ------------------- Rental modal states -------------------
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Lessee details
  const [lesseId, setLesseId] = useState("");
  const [keeperName, setKeeperName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [address, setAddress] = useState("");

  // Shop selection inside rental modal
  const [shopId, setShopId] = useState(null);
  const [shopNameSearch, setShopNameSearch] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [dropdownShops, setDropdownShops] = useState([]);
  const [disableShopSearch, setDisableShopSearch] = useState(false); // when modal opened from a row

  // Shop business & advance
  const [typeBusiness, setTypeBusiness] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");

  // Rental details
  const [rentalAmount, setRentalAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [months, setMonths] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [rentDescription, setRentDescription] = useState("");
  // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  // ------------------- Helpers -------------------
  const onlyNumbers = (v) => (v || "").toString().replace(/[^0-9]/g, "");

  // debounce utility
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // ------------------- Fetch shops (list api) -------------------
  const fetchShops = async (page = CurrentPage) => {
    try {
      setLoading(true);
      const res = await axios.get(`${URL}/shops/list`, {
      headers: { Authorization: token },
      params: {
        page,
        limit: rowsPerPage,          // ✅ dynamic
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      },
    });
      setShops(res.data.shops || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || page);
      setLoading(false);
    } catch (err) {
      console.error("fetchShops error:", err);
      setLoading(false);
    }
  };

useEffect(() => {
  fetchShops(CurrentPage);
}, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);


  // ------------------- Add Shop -------------------
  const handleAddShop = async () => {
  if (!shopName || !location) {
    // ❗ Force toast refresh (validation error)
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Shop name and location are required",
      });
    }, 10);

    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);

    return;
  }

  try {
    const payload = {
      shop_name: shopName,
      location,
      area,
      description,
    };

    await axios.post(`${URL}/shops/add`, payload, {
      headers: { Authorization: token },
    });

    // 🟢 Success toast (forced re-render)
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Shop added successfully",
      });
    }, 10);

    // Close modal + reset
    setIsModalOpen(false);
    setShopName("");
    setLocation("");
    setArea("");
    setDescription("");

    fetchShops();

  } catch (error) {
    console.error("Add shop error:", error);

    // 🔴 Error toast (forced re-render)
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Failed to add shop",
      });
    }, 10);
  } finally {
    // ⏱ Auto-hide after 3s
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};


  // ------------------- Debounced shop search for rental modal (only when enabled) -------------------
  const debouncedShopSearch = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownShops([]);
      try {
        const res = await axios.get(`${URL}/shops/by-name`, {
          headers: { Authorization: token },
          params: { name: val }
        });
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) setDropdownShops([{ shop_name: "none", location: "No vacant shops found" }]);
        else setDropdownShops(data);
      } catch (err) {
        setDropdownShops([{ shop_name: "none", location: "No vacant shops found" }]);
      }
    }, 300)
  ).current;

  const handleShopSelect = (s) => {
    if (!s || s.shop_name === "none") return;
    setShopId(s._id || s.id || s.shop_id);
    setShopNameSearch(s.shop_name);
    setShopLocation(s.location || s.loc);
    setDropdownShops([]);
  };

  // ------------------- Compute renewal date (simple add-months) -------------------
  useEffect(() => {
    if (!rentalStartDate || !months) {
      setRenewalDate("");
      return;
    }
    const start = new Date(rentalStartDate);
    if (isNaN(start.getTime())) { setRenewalDate(""); return; }
    const renewal = new Date(start);
    renewal.setMonth(start.getMonth() + Number(months || 0));
    setRenewalDate(renewal.toISOString().slice(0, 10)); // yyyy-mm-dd
  }, [rentalStartDate, months]);

  // ------------------- Reset rental form -------------------
  const resetRentalForm = () => {
    setLesseId("");
    setKeeperName("");
    setMobileNumber("");
    setAadharNumber("");
    setAddress("");

    setShopId(null);
    setShopNameSearch("");
    setShopLocation("");
    setDropdownShops([]);
    setDisableShopSearch(false);

    setTypeBusiness("");
    setAdvanceAmount("");
    setRentalAmount("");
    setBillingCycle("");
    setRentalStartDate("");
    setMonths("");
    setRenewalDate("");
    setRentDescription("");
  };

  // ------------------- Open rental modal from a specific shop row (no search) -------------------
  const handleOpenRentalFromShop = async (shop) => {
    try {
      const res = await axios.get(`${URL}/rentals/new-id`, { headers: { Authorization: token } });
      setLesseId(res?.data?.lesse_id || "");

      // pre-fill shop fields & disable live search
      setShopId(shop._id);
      setShopNameSearch(shop.shop_name);
      setShopLocation(shop.location);
      setDropdownShops([]);
      setDisableShopSearch(true);

      // open modal
      setIsRentalModalOpen(true);
    } catch (err) {
      console.error("handleOpenRentalFromShop:", err);
    }
  };

  // ------------------- Optionally open rental modal normally (with search) ---------------
  // (Not used from your ShopList rows but useful if you later add an "Add Rental" button)
  const openRentalModalNormally = async () => {
    try {
      const res = await axios.get(`${URL}/rentals/new-id`, { headers: { Authorization: token } });
      setLesseId(res?.data?.lesse_id || "");
      resetRentalForm(); // ensure clean
      setIsRentalModalOpen(true);
    } catch (err) {
      console.error("openRentalModalNormally:", err);
    }
  };

  // ------------------- Add rental (Book) -------------------
  const handleAddRental = async () => {
  // ❗ VALIDATION
  if (!keeperName.trim() || !mobileNumber.trim() || !aadharNumber.trim()) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Lessee name, mobile & aadhar are required",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (!shopId) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Please select a valid shop",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (!typeBusiness.trim()) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Type of business is required",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (!advanceAmount.trim() || !rentalAmount.trim()) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Advance and rental amounts are required",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  if (!billingCycle || !rentalStartDate || !months.trim()) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Billing cycle, rental start and months are required",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  try {
    const payload = {
      lesse_id: lesseId,
      shopkeeper_name: keeperName,
      mobile_number: mobileNumber,
      aadhar_number: aadharNumber,
      address,
      shop_id: shopId,
      shop_name: shopNameSearch,
      shop_location: shopLocation,
      type_of_business: typeBusiness,
      advance_amount: Number(advanceAmount || 0),
      rental_amount: Number(rentalAmount || 0),
      billing_cycle_date: billingCycle || null,
      rental_start_date: rentalStartDate || null,
      number_of_months: Number(months || 0),
      renewal_date: renewalDate || null,
      description: rentDescription || "",
    };

    await axios.post(`${URL}/rentals/add`, payload, {
      headers: { Authorization: token },
    });

    // 🟢 SUCCESS TOAST — force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Rental added successfully",
      });
    }, 10);

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);

    // Close modal + reset form
    setIsRentalModalOpen(false);
    resetRentalForm();

    // Refresh shops list
    fetchShops(CurrentPage);

  } catch (err) {
    console.error("handleAddRental err:", err);

    // 🔴 ERROR TOAST — force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err?.response?.data?.message || "Failed to add rental",
      });
    }, 10);

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  }
};



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Shops</h1>

        {/* Search + Add */}
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Availability Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Vacant">Vacant</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Shop
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Shop Name</th>
                <th className="p-2 text-center">Location</th>
                <th className="p-2 text-center">Availability</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-3">Loading...</td></tr>
              ) : shops.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-3">No shops found</td></tr>
              ) : (
                shops.map((shop, index) => (
                  <tr key={shop._id} className="border-b text-center">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2">{shop.shop_name}</td>
                    <td className="p-2">{shop.location}</td>
                    <td className={`p-2 font-semibold ${shop.availability === "Vacant" ? "text-green-600" : "text-red-600"}`}>
                      {shop.availability}
                    </td>
                    <td className="p-2 flex justify-center gap-3 items-center">
                      <FaEye size={18} className="text-lavender--600 cursor-pointer"
                        onClick={() => { setSelectedShop(shop); setIsViewOpen(true); }} />
                      {shop.availability === "Vacant" && (
                        <FaPlus size={18} className="text-lavender--600 cursor-pointer"
                          onClick={() => handleOpenRentalFromShop(shop)} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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


        {/* Add Shop Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Shop">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Shop Name</label>
              <input type="text" value={shopName} placeholder="Enter shop name" onChange={(e) => setShopName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input type="text" value={location} placeholder="Enter Location" onChange={(e) => setLocation(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Area (sq.ft)</label>
              <input type="text" value={area} placeholder="Enter Area" onChange={(e) => setArea(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={description} placeholder="Enter Description" onChange={(e) => setDescription(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleAddShop} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Add</button>
          </div>
        </Modal>

        {/* View Shop Modal */}
        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Shop Details">
          {selectedShop && (
            <div className="flex flex-col ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
              {[
                { label: "Shop Name", value: selectedShop.shop_name },
                { label: "Location", value: selectedShop.location },
                { label: "Area (sq.ft)", value: selectedShop.area || "-" },
                { label: "Description", value: selectedShop.description || "-" },
                { label: "Availability", value: selectedShop.availability },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">{item.label}</div>
                  <div className={`col-span-12 sm:col-span-8 text-base ${item.label === "Availability" ? (item.value === "Vacant" ? "text-green-600 font-semibold" : "text-red-600 font-semibold") : "text-gray-800"}`}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>

        {/* Rental Modal */}
        <Modal isOpen={isRentalModalOpen} onClose={() => { setIsRentalModalOpen(false); setDisableShopSearch(false); }} title="Add Rentals">
          <div className="max-h-[600px] overflow-y-auto">
            <h1 className="text-[22px] font-semibold mb-4">Lesse ID: <span className="font-semibold text-lavender--600">{lesseId}</span></h1>

            {/* Lessee Details */}
            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              <span className="absolute -top-3 left-4 bg-gray-50 px-2 text-[18px] font-semibold text-lavender--600">Lessee Details</span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Lessee Name</label>
                    <input type="text" placeholder="Enter Name" value={keeperName} onChange={(e) => setKeeperName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="text" placeholder="Enter Number" value={mobileNumber} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      onChange={(e) => {
                        const val = onlyNumbers(e.target.value);
                        if (val.length <= 10) setMobileNumber(val);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="Enter Aadhar Number"
                      value={aadharNumber}
                      onChange={(e) => {
                        // Remove all non-digits
                        let val = e.target.value.replace(/\D/g, "");

                        // Limit to 12 digits
                        if (val.length > 12) val = val.slice(0, 12);

                        // Auto-insert spaces (1234 5678 9012)
                        let formatted = val.match(/.{1,4}/g)?.join(" ") || "";

                        setAadharNumber(formatted);
                      }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <textarea placeholder="Enter Address" rows={9} value={address} onChange={(e) => setAddress(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm overflow-y-auto resize-none" style={{ maxHeight: "12.5rem" }} />
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              <span className="absolute -top-3 left-4 bg-gray-50 px-2 text-[18px] font-semibold text-lavender--600">Shop Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 relative">
                {/* Shop name: read-only when opened from row */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Name</label>
                  <input
                    type="text"
                    placeholder="Search shop name"
                    value={shopNameSearch}
                    onChange={(e) => {
                      setShopNameSearch(e.target.value);
                      setShopId(null);
                      if (!disableShopSearch) debouncedShopSearch(e.target.value);
                    }}
                    readOnly={disableShopSearch}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm ${disableShopSearch ? " " : ""}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Location</label>
                  <input type="text" placeholder="Shop location" value={shopLocation} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm " />
                </div>

                {/* Dropdown only when search is allowed */}
                {!disableShopSearch && dropdownShops.length > 0 && (
                  <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {dropdownShops.map((s, i) => (
                      <li key={i} className={`flex px-3 py-2 text-sm ${s.shop_name === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`} onClick={() => handleShopSelect(s)}>
                        <span className="w-1/2 font-medium">{s.shop_name}</span>
                        <span className="flex-1 text-gray-600">{s.location}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Type of Business</label>
                  <input type="text" placeholder="Enter Type of Business" value={typeBusiness} onChange={(e) => setTypeBusiness(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Advance Amount</label>
                  <input type="text" placeholder="Enter Advance Amount" value={advanceAmount} onChange={(e) => setAdvanceAmount(onlyNumbers(e.target.value))} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              <span className="absolute -top-3 left-4 bg-gray-50 px-2 text-[18px] font-semibold text-lavender--600">Rental Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Rental Amount</label>
                  <input type="text" placeholder="Enter Rental Amount" value={rentalAmount} onChange={(e) => setRentalAmount(onlyNumbers(e.target.value))} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
                  <input type="date" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Rental Start Date</label>
                  <input type="date" value={rentalStartDate} onChange={(e) => setRentalStartDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Number of Months</label>
                  <input type="text" placeholder="Enter the Renewal Months" value={months} onChange={(e) => setMonths(onlyNumbers(e.target.value))} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Renewal Period</label>
                  <input type="date" value={renewalDate} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <input type="text" placeholder="Enter description" value={rentDescription} onChange={(e) => setRentDescription(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleAddRental} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Book</button>
          </div>
        </Modal>

      </div>

      {/* Toast messages */}
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
