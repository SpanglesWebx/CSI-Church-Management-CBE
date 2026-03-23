import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/Pagination";

export const ShopRentalList = () => {
  const navigate = useNavigate();
  // modal + toasts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const token = window.sessionStorage.getItem("token");

  // listing states
  const [rentals, setRentals] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // dropdown shop search states
  const [shopNameSearch, setShopNameSearch] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopId, setShopId] = useState(null);
  const [dropdownShops, setDropdownShops] = useState([]);

  // form fields for adding rental
  const [keeperName, setKeeperName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [typeBusiness, setTypeBusiness] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [rentalAmount, setRentalAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [months, setMonths] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [description, setDescription] = useState("");
  const [lesseId, setLesseId] = useState("");
  const [address, setAddress] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [selectedShopId, setSelectedShopId] = useState(null);
  // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");






  // view selected rental
  const [selectedRental, setSelectedRental] = useState(null);

  // debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // numeric-only helper
  const onlyNumbers = (v) => v.replace(/[^0-9]/g, "");

  // --- Debounced shop search (Vacant shops only) ---
  const debouncedShopSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setDropdownShops([]);
        return;
      }
      try {
        // endpoint expected: GET /shops/by-name?name=<val>
        const res = await axios.get(`${URL}/shops/by-name`, {
          headers: { Authorization: token },
          params: { name: val },
        });
        // ensure array
        const data = Array.isArray(res.data) ? res.data : [];
        // if empty send friendly message element
        if (data.length === 0) {
          setDropdownShops([{ shop_name: "none", location: "No vacant shops found" }]);
        } else {
          setDropdownShops(data);
        }
      } catch (err) {
        setDropdownShops([{ shop_name: "none", location: "No vacant shops found" }]);
      }
    }, 300)
  ).current;

  // --- Fetch rentals list (pagination + search + status) ---
  const fetchRentals = async (page = CurrentPage) => {
    try {
      setLoading(true);
       const res = await axios.get(`${URL}/rentals/list`, {
      headers: { Authorization: token },
      params: {
        page,
        limit: rowsPerPage,                     // ✅ dynamic
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      },
    });
      setRentals(res.data.rentals || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || page);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch rentals", err);
      setLoading(false);
    }
  };

useEffect(() => {
  fetchRentals(CurrentPage);
}, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);


  const openAddRentalModal = async () => {
    const res = await axios.get(`${URL}/rentals/new-id`, {
      headers: { Authorization: token }
    });
    setLesseId(res.data.lesse_id);
    setIsModalOpen(true);
  };



  // calculate renewal date when start date or months change
  useEffect(() => {
    if (!rentalStartDate || !months) {
      setRenewalDate("");
      return;
    }
    const start = new Date(rentalStartDate);
    if (isNaN(start.getTime())) {
      setRenewalDate("");
      return;
    }
    const renewal = new Date(start);
    renewal.setMonth(start.getMonth() + Number(months));
    // format yyyy-mm-dd for date input
    setRenewalDate(renewal.toISOString().slice(0, 10));
  }, [rentalStartDate, months]);

  // --- Reset form ---
  const resetRentalForm = () => {
    setKeeperName("");
    setMobileNumber("");
    setAadharNumber("");
    setAddress("");
    setShopId(null);
    setShopNameSearch("");
    setShopLocation("");
    setDropdownShops([]);
    setTypeBusiness("");
    setAdvanceAmount("");
    setRentalAmount("");
    setBillingCycle("");
    setRentalStartDate("");
    setMonths("");
    setRenewalDate("");
    setDescription("");
  };

  // --- Add rental (Book) ---
  const handleAddRental = async () => {
  // VALIDATION
  if (!keeperName.trim() || !mobileNumber.trim() || !aadharNumber.trim()) {
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Shopkeeper name, mobile and aadhar are required",
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
        message: "Please select a valid Vacant shop from dropdown",
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
        message: "Advance and Rental amounts are required",
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
        message: "Billing cycle, start date and number of months are required",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  try {
    const payload = {
      shopkeeper_name: keeperName,
      mobile_number: mobileNumber,
      aadhar_number: aadharNumber,
      address: address,
      shop_id: shopId,
      shop_name: shopNameSearch,
      shop_location: shopLocation,
      type_of_business: typeBusiness,
      advance_amount: Number(advanceAmount || 0),
      rental_amount: Number(rentalAmount || 0),
      billing_cycle_date: billingCycle,
      rental_start_date: rentalStartDate,
      number_of_months: Number(months || 0),
      renewal_date: renewalDate || null,
      description,
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

    // Auto-clear
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);

    // Close modal + reset form
    resetRentalForm();
    setIsModalOpen(false);

    // Refresh list
    fetchRentals(CurrentPage);

  } catch (err) {
    console.error("Add rental error", err);

    // 🔴 ERROR TOAST — force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err?.response?.data?.message || "Failed to add rental",
      });
    }, 10);

    // Auto-clear
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  }
};


  // --- open view modal ---
  const openView = (rental) => {
    setSelectedRental(rental);
    setIsViewOpen(true);
  };

  // --- handlers for dropdown selection ---
  const handleShopSelect = (s) => {
    if (!s || s.shop_name === "none") return;
    setShopNameSearch(s.shop_name);
    setShopLocation(s.location);
    setShopId(s._id || s.id || s.shop_id || null); // accept common id names
    setDropdownShops([]);
  };

  const confirmDeactivate = (rentalId, shopId) => {
  setSelectedRentalId(rentalId);
  setSelectedShopId(shopId);
  setIsConfirmOpen(true);
};

const inactivateRental = async () => {
  if (!selectedRentalId) return;

  try {
    await axios.put(
      `${URL}/rentals/update-status/${selectedRentalId}`,
      { status: "Inactive", shopId: selectedShopId },
      { headers: { Authorization: token } }
    );

    // 🟢 SUCCESS TOAST — force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Rental marked Inactive",
      });
    }, 10);

    // Close modal
    setIsConfirmOpen(false);

    // Refresh table
    fetchRentals(CurrentPage);

  } catch (err) {
    console.error("Inactivate rental error:", err);

    // 🔴 ERROR TOAST — force re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to update status",
      });
    }, 10);

  } finally {
    // ⏱ Auto-hide toast after 3 seconds
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};





  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Rented Shops</h1>

        <div className="flex items-center justify-between p-2">
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Rental Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={openAddRentalModal}
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Rental
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Shop Keeper</th>
                <th className="p-2 text-center">Shop Name</th>
                <th className="p-2 text-center">Rental Status</th>
                <th className="p-2 text-center">Rental Period</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-3">Loading...</td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-3">No rentals found</td>
                </tr>
              ) : (
                rentals.map((r, idx) => (
                  <tr key={r._id || idx} className="border-b text-center">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td className="p-2">{r.shopkeeper_name}</td>
                    <td className="p-2">{r.shop_name}</td>
                    <td className={`p-2 font-semibold ${r.rental_status === "Active" ? "text-green-600" : "text-red-600"}`}>{r.rental_status}</td>
                    <td className="p-2">
                      {r.rental_start_date ? moment(r.rental_start_date).format("DD-MM-YYYY") : "-"}{" "}
                      to{" "}
                      {r.renewal_date ? moment(r.renewal_date).format("DD-MM-YYYY") : "-"}
                    </td>
                    <td className="p-2 flex justify-center items-center gap-2">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => navigate(`/admin/shoprentallist/view/${r._id}`)}
                      />

                      {/* If ACTIVE → show lock-open icon → clickable */}
                      {r.rental_status === "Active" ? (
                        <FaLockOpen
                          size={18}
                          className="cursor-pointer text-green-600"
                          title="Mark Inactive"
                          onClick={() => confirmDeactivate(r._id, r.shop_id)}
                        />
                      ) : (
                        /* If INACTIVE → show lock icon → NOT clickable */
                        <FaLock
                          size={18}
                          className="text-red-600 cursor-not-allowed"
                          title="Inactive"
                        />
                      )}
                    </td>
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


        {/* Add Rental Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Rentals">
          <div className="max-h-[600px] overflow-y-auto">
            <h1 className="text-[22px] font-semibold mb-4">
              Lesse ID: <span className="font-semibold text-lavender--600">{lesseId}</span>
            </h1>

            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              {/* FLOATING TITLE */}
              <span className="absolute -top-3 left-4 bg-white px-2 text-[18px] font-semibold text-lavender--600">
                Lessee Details
              </span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                {/* LEFT SIDE */}
                <div className="flex flex-col space-y-4">

                  <div>
                    <label className="text-sm font-medium text-gray-700">Lessee Name</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={keeperName}
                      onChange={(e) => setKeeperName(e.target.value)}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Enter Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(onlyNumbers(e.target.value))}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="Enter Aadhar Number"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(onlyNumbers(e.target.value))}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                </div>

                {/* RIGHT SIDE */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    placeholder="Enter Address"
                    rows={9}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm overflow-y-auto resize-none"
                    style={{ maxHeight: "12.5rem" }}
                  ></textarea>
                </div>

              </div>

            </div>

            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              <span className="absolute -top-3 left-4 bg-white px-2 text-[18px] font-semibold text-lavender--600">
                Shop Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 relative">
                {/* Shop Name Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Name</label>
                  <input
                    type="text"
                    placeholder="Search shop name"
                    value={shopNameSearch}
                    onChange={(e) => {
                      setShopNameSearch(e.target.value);
                      // clear chosen id when user edits search
                      setShopId(null);
                      debouncedShopSearch(e.target.value);
                    }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* Auto-filled Location */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Location</label>
                  <input
                    type="text"
                    placeholder="Shop location"
                    value={shopLocation}
                    readOnly
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* Dropdown */}
                {dropdownShops.length > 0 && (
                  <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {dropdownShops.map((s, i) => (
                      <li
                        key={i}
                        className={`flex px-3 py-2 text-sm ${s.shop_name === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                        onClick={() => handleShopSelect(s)}
                      >
                        <span className="w-1/2 font-medium">{s.shop_name}</span>
                        <span className="flex-1 text-gray-600">{s.location}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Type of Business</label>
                  <input
                    type="text"
                    placeholder="Enter Type of Business"
                    value={typeBusiness}
                    onChange={(e) => setTypeBusiness(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Advance Amount</label>
                  <input
                    type="text"
                    placeholder="Enter Advance Amount"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(onlyNumbers(e.target.value))}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="relative p-4 border rounded-lg bg-gray-50 mb-4">
              <span className="absolute -top-3 left-4 bg-white px-2 text-[18px] font-semibold text-lavender--600">
                Rental Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Rental Amount</label>
                  <input
                    type="text"
                    placeholder="Enter Rental Amount"
                    value={rentalAmount}
                    onChange={(e) => setRentalAmount(onlyNumbers(e.target.value))}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
                  <input
                    type="date"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Rental Start Date</label>
                  <input
                    type="date"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Number of Months</label>
                  <input
                    type="text"
                    placeholder="Enter the Renewal Months"
                    value={months}
                    onChange={(e) => setMonths(onlyNumbers(e.target.value))}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Renewal Period</label>
                  <input
                    type="date"
                    value={renewalDate}
                    readOnly
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleAddRental} className="px-4 py-2 bg-lavender--600 text-white rounded-md">
              Book
            </button>
          </div>
        </Modal>
      </div>

      {/* View Modal (same style as donation view) */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Rental Details">
        {selectedRental && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3 max-h-[650px] overflow-y-auto">
            {[
              { label: "Lesse ID", value: selectedRental.lesse_id || "-" },
              { label: "Shop Keeper Name", value: selectedRental.shopkeeper_name || "-" },
              { label: "Mobile Number", value: selectedRental.mobile_number || "-" },
              { label: "Aadhar Number", value: selectedRental.aadhar_number || "-" },
              { label: "Address", value: selectedRental.address || "-" },
              { label: "Shop Name", value: selectedRental.shop_name || "-" },
              { label: "Shop Location", value: selectedRental.shop_location || "-" },
              { label: "Type of Business", value: selectedRental.type_of_business || "-" },
              { label: "Advance Amount", value: `₹ ${selectedRental.advance_amount || 0}` },
              { label: "Rental Amount", value: `₹ ${selectedRental.rental_amount || 0}` },
              {
                label: "Billing Cycle",
                value: selectedRental.billing_cycle_date
                  ? moment(selectedRental.billing_cycle_date).format("DD-MM-YYYY")
                  : "-"
              },
              {
                label: "Rental Start Date",
                value: selectedRental.rental_start_date
                  ? moment(selectedRental.rental_start_date).format("DD-MM-YYYY")
                  : "-"
              },
              { label: "Number of Months", value: selectedRental.number_of_months || "-" },
              {
                label: "Renewal Period",
                value: selectedRental.renewal_date
                  ? moment(selectedRental.renewal_date).format("DD-MM-YYYY")
                  : "-"
              },
              { label: "Description", value: selectedRental.description || "-" },
              { label: "Status", value: selectedRental.rental_status || "-" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">{item.label}</span>
                <span
                  className={
                    item.label === "Status"
                      ? item.value === "Active"
                        ? "text-green-600 font-semibold"
                        : item.value === "Inactive"
                          ? "text-red-600 font-semibold"
                          : "text-gray-800"
                      : "text-gray-800"
                  }
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <SmallSizedModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Action"
      >
        <p className="text-gray-700 text-center my-4">
          Do you really want to mark this rental as <b>Inactive</b>?<br />
          The shop will become <b>Vacant</b>.
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setIsConfirmOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            No
          </button>

          <button
            onClick={inactivateRental}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Yes
          </button>
        </div>
      </SmallSizedModal>


      {/* Toast messages */}
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
