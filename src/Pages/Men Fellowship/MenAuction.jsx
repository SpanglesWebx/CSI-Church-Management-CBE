import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { URL } from "../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";

export const MenAuction = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [Response, setResponse] = useState({ status: null, message: "" });

    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    // Buyer toggle
    const [isBuyerMember, setIsBuyerMember] = useState(true);

    // Seller (always male member)
    const [maleIdSearch, setMaleIdSearch] = useState("");
    const [maleNameSearch, setMaleNameSearch] = useState("");
    const [maleDropdownById, setMaleDropdownById] = useState([]);
    const [maleDropdownByName, setMaleDropdownByName] = useState([]);

    // Buyer (member search)
    const [buyerIdSearch, setBuyerIdSearch] = useState("");
    const [buyerNameSearch, setBuyerNameSearch] = useState("");
    const [buyerDropdownById, setBuyerDropdownById] = useState([]);
    const [buyerDropdownByName, setBuyerDropdownByName] = useState([]);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);

    const handleView = (auction) => {
        setSelectedAuction(auction);
        setIsViewOpen(true);
    };

    const handleCloseView = () => {
        setIsViewOpen(false);
        setSelectedAuction(null);
    };


    const token = window.sessionStorage.getItem("token");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            sellerId: "",
            sellerName: "",
            sellerTamilName: "",
            sellerPhone: "",
            buyerId: "",
            buyerName: "",
            buyerTamilName: "",
            buyerPhone: "",
            item: "",
            amount: "",
            payment_status: "Unpaid",
            date: new Date().toISOString().split("T")[0], // today's date in YYYY-MM-DD
        },
    });


    // Debounce utility
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    // 🔎 Seller search (only male members)
    const debouncedSearchMaleById = useRef(
        debounce(async (val) => {
            if (!val) return setMaleDropdownById([]);
            try {
                const res = await axios.get(`${URL}/member-search/men-fellowship/by-id?id=${val}`, {
                    headers: { Authorization: token },
                });
                setMaleDropdownById(res.data || []);
            } catch (err) {
                setMaleDropdownById([{ member_id: "none", member_name: "No Fellow Members found" }]);
            }
        }, 300)
    ).current;

    const debouncedSearchMaleByName = useRef(
        debounce(async (val) => {
            if (!val) return setMaleDropdownByName([]);
            try {
                const res = await axios.get(`${URL}/member-search/men-fellowship?name=${val}`, {
                    headers: { Authorization: token },
                });
                setMaleDropdownByName(res.data || []);
            } catch (err) {
                setMaleDropdownByName([{ member_id: "none", member_name: "No Fellow Members found" }]);
            }
        }, 300)
    ).current;

    // 🔎 Buyer search (all members)
    const debouncedSearchBuyerById = useRef(
        debounce(async (val) => {
            if (!val) return setBuyerDropdownById([]);
            try {
                const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
                    headers: { Authorization: token },
                });
                setBuyerDropdownById(res.data || []);
            } catch (err) {
                setBuyerDropdownById([{ member_id: "none", member_name: "No member found" }]);
            }
        }, 300)
    ).current;

    const debouncedSearchBuyerByName = useRef(
        debounce(async (val) => {
            if (!val) return setBuyerDropdownByName([]);
            try {
                const res = await axios.get(`${URL}/member-search?name=${val}`, {
                    headers: { Authorization: token },
                });
                setBuyerDropdownByName(res.data || []);
            } catch (err) {
                setBuyerDropdownByName([{ member_id: "none", member_name: "No member found" }]);
            }
        }, 300)
    ).current;

    // 📥 Fetch auctions
    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${URL}/men-auctions`, {
                headers: { Authorization: token },
                params: {
                    page: CurrentPage,
                    limit: 10,
                    search,
                    startDate,
                    endDate,
                },
            });

            setAuctions(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
        } catch (err) {
            console.error("❌ Fetch Men Auction error:", err);
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, [CurrentPage, search, startDate, endDate]);


    useEffect(() => {
        fetchAuctions();
    }, []);

    const handleCloseModal = () => {
  setIsModalOpen(false);
  reset({
    sellerId: "",
    sellerName: "",
    sellerTamilName: "",
    sellerPhone: "",
    buyerId: "",
    buyerName: "",
    buyerTamilName: "",
    buyerPhone: "",
    item: "",
    amount: "",
    payment_status: "Unpaid",
    date: new Date().toISOString().split("T")[0],
  });

  // Clear dropdowns and search inputs
  setMaleIdSearch("");
  setMaleNameSearch("");
  setBuyerIdSearch("");
  setBuyerNameSearch("");
  setMaleDropdownById([]);
  setMaleDropdownByName([]);
  setBuyerDropdownById([]);
  setBuyerDropdownByName([]);
};


    // 📤 Submit
    // const onSubmit = async (formData) => {
    //     try {
    //         await axios.post(`${URL}/men-auctions/add`, formData, {
    //             headers: { Authorization: token },
    //         });
    //         setResponse({ status: "Success", message: "Auction created" });
    //         fetchAuctions();
    //         reset();
    //         setIsModalOpen(false);
    //     } catch (err) {
    //         setResponse({ status: "Failed", message: err.response?.data?.message || "Error creating auction" });
    //     }
    // };

    const onSubmit = async (formData) => {
  try {
    await axios.post(`${URL}/men-auctions/add`, formData, {
      headers: { Authorization: token },
    });

    // ✅ Reset modal and form
    reset({
  sellerId: "",
  sellerName: "",
  sellerTamilName: "",
  sellerPhone: "",
  buyerId: "",
  buyerName: "",
  buyerTamilName: "",
  buyerPhone: "",
  item: "",
  amount: "",
  payment_status: "Unpaid",
  date: new Date().toISOString().split("T")[0], // reset with today’s date
});

setMaleIdSearch("");
    setMaleNameSearch("");
    setBuyerIdSearch("");
    setBuyerNameSearch("");
    setMaleDropdownById([]);
    setMaleDropdownByName([]);
    setBuyerDropdownById([]);
    setBuyerDropdownByName([]);

    setIsModalOpen(false);
    fetchAuctions();

    // ✅ Force toast re-render for same messages
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Auction created successfully",
      });
    }, 10);
  } catch (err) {
    console.error("❌ Men Auction Error:", err.response?.data || err);

    // ✅ Re-trigger failure toast too
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error creating auction",
      });
    }, 10);
  } finally {
    // ⏳ Auto-hide toast after 3 seconds
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};


    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Men’s Auction</h1>
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

                        <label className="text-l font-medium text-gray-600 mb-1">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />

                        <label className="text-l font-medium text-gray-600 mb-1">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />


                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Auction
                    </button>

                </div>

                {/* Auction Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Date</th>
                                <th className="p-2 text-center">Seller</th>
                                <th className="p-2 text-center">Item</th>
                                <th className="p-2 text-center">Buyer</th>
                                <th className="p-2 text-center">Amount</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-4 text-center">Loading...</td>
                                </tr>
                            ) : auctions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-4 text-center">No auctions found</td>
                                </tr>
                            ) : (
                                auctions.map((a, i) => (
                                    <tr key={a._id} className="border-b">
                                        <td className="p-2 text-center">{i + 1}</td>
                                        <td className="p-2 text-center">{moment(a.date).format("DD-MM-YYYY")}</td>
                                        <td className="p-2 text-left">{a.sellerName}</td>
                                        <td className="p-2 text-left">{a.item}</td>
                                        <td className="p-2 text-left">{a.buyerName}</td>
                                        <td className="p-2 text-center">{a.amount}</td>
                                        <td className="p-2 text-center">
                                            <FaEye size={18} className="text-lavender--600 cursor-pointer mx-auto" onClick={() => handleView(a)} />
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>

                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
                    <button
                        onClick={() => setCurrentPage(CurrentPage - 1)}
                        disabled={CurrentPage === 1}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 bg-lavender--600 text-white rounded">
                        {CurrentPage}
                    </span>

                    <button
                        onClick={() => setCurrentPage(CurrentPage + 1)}
                        disabled={CurrentPage === TotalPages}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>

                    <div className="absolute flex px-5 space-x-2 rounded right-1">
                        <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">
                            Total Pages: {TotalPages}
                        </span>
                        <span
                            onClick={() => setCurrentPage(TotalPages)}
                            className={`${TotalPages === CurrentPage
                                ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                                : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"
                                }`}
                        >
                            Last Page
                        </span>
                    </div>
                </div>

            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Men Auction">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-6">

                        {/* ---------- SELLER SECTION ---------- */}
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-700">Seller (Men Fellow Member)</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                                {/* Seller ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seller ID</label>
                                    <input
                                        type="text"
                                        placeholder="Search by ID"
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        value={maleIdSearch}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setMaleIdSearch(val);
                                            debouncedSearchMaleById(val);
                                        }}
                                    />
                                </div>

                                {/* Seller Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seller Name</label>
                                    <input
                                        type="text"
                                        placeholder="Search by Name"
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        value={maleNameSearch}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setMaleNameSearch(val);
                                            debouncedSearchMaleByName(val);
                                        }}
                                    />
                                </div>

                                {/* Seller Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seller Phone</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={watch("sellerPhone") || ""}
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    />
                                </div>

                                {/* ✅ Unified Dropdown */}
                                {(maleDropdownById.length > 0 || maleDropdownByName.length > 0) && (
                                    <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                        {(maleDropdownById.length > 0 ? maleDropdownById : maleDropdownByName).map((m) => (
                                            <li
                                                key={m.member_id}
                                                className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                                                onClick={() => {
                                                    setMaleIdSearch(m.member_id);
                                                    setMaleNameSearch(m.member_name);
                                                    setValue("sellerId", m.member_id);
                                                    setValue("sellerName", m.member_name);
                                                    setValue("sellerPhone", m.mobile_number);
                                                    setMaleDropdownById([]);
                                                    setMaleDropdownByName([]);
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

                        {/* ---------- OTHER FIELDS ---------- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Item */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item</label>
                                <input
                                    type="text"
                                    placeholder="Enter Item"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    {...register("item", { required: "Item is required" })}
                                />
                                {errors.item && <p className="text-sm text-red-500">{errors.item.message}</p>}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    {...register("date", { required: "Date is required" })}
                                />
                                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="text"
                                    placeholder="₹"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    {...register("amount", {
                                        required: "Amount is required",
                                        pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter valid number" },
                                    })}
                                />
                                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                            </div>

                            {/* Hidden Payment Status */}
                            <input type="hidden" value="Unpaid" {...register("payment_status")} />
                        </div>

                        {/* ---------- BUYER SECTION ---------- */}
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>

                                {/* Member / Non-member toggle */}
                                {/* <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
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
                                </div> */}
                            </div>

                            {/* Buyer - Member Search */}
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
                                            value={buyerNameSearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setBuyerNameSearch(val);
                                                debouncedSearchBuyerByName(val);
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
                                    {(buyerDropdownById.length > 0 || buyerDropdownByName.length > 0) && (
                                        <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                            {(buyerDropdownById.length > 0 ? buyerDropdownById : buyerDropdownByName).map((m) => (
                                                <li
                                                    key={m.member_id}
                                                    className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                                                    onClick={() => {
                                                        setBuyerIdSearch(m.member_id);
                                                        setBuyerNameSearch(m.member_name);
                                                        setValue("buyerId", m.member_id);
                                                        setValue("buyerName", m.member_name);
                                                        setValue("buyerPhone", m.mobile_number);
                                                        setBuyerDropdownById([]);
                                                        setBuyerDropdownByName([]);
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
                        </div>
                    </div>

                    {/* ---------- BUTTONS ---------- */}
                    <div className="flex justify-end gap-3 mt-6">
                        
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>


            {/* View Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={handleCloseView}
                title="View Auction"
            >
                {selectedAuction && (
                    <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                        {[
                            { label: "Date", value: moment(selectedAuction.date).format("DD-MM-YYYY") },
                            { label: "Seller", value: selectedAuction.sellerName },
                            { label: "Seller ID", value: selectedAuction.sellerId || "N/A" },
                            { label: "Item", value: selectedAuction.item },
                            { label: "Buyer", value: selectedAuction.buyerName },
                            {
                                label: "Buyer ID",
                                value: selectedAuction.buyerId || selectedAuction.buyerPhone || "N/A"
                            },
                            { label: "Amount", value: `₹${selectedAuction.amount}` },
                        ].map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 py-2">
                                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                                    {item.label}
                                </div>
                                <div
                                    className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"
                                        }`}
                                >
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>



            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}
        </>
    );
};
