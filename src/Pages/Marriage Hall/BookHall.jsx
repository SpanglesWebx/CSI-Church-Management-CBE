import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CiEdit } from 'react-icons/ci';
import CustomCalendar from './CustomCalendar';
import { useNavigate } from "react-router-dom";
import { FaAmazonPay, FaMinus } from 'react-icons/fa6';
import { BsThreeDots } from "react-icons/bs";
import { createPortal } from "react-dom";
import Pagination from '../../Components/Helpers/Pagination';




export const BookHall = () => {
    const navigate = useNavigate();

    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isViewModalOpen, setViewIsModalOpen] = useState(false);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const token = window.sessionStorage.getItem("token");
    const [halls, setHalls] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState(""); // track selected hall

    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [amount, setAmount] = useState("");

    const [selected, setSelected] = useState({ morning: false, evening: false });
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [isEditing, setIsEditing] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [hallBookings, setHallBookings] = useState([]); // for availability check
    const [viewAdvanceHistory, setViewAdvanceHistory] = useState([]);

    const [issueQty, setIssueQty] = useState({});
    const [kitchenAssets, setKitchenAssets] = useState([]);
    const availableAssets = kitchenAssets.filter(a => a.available_quantity > 0);
    const unavailableAssets = kitchenAssets.filter(a => a.available_quantity === 0);
    const [openMenu, setOpenMenu] = useState(null);
    // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");






    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (startDate && endDate) {
                    params.append("startDate", startDate);
                    params.append("endDate", endDate);
                }
                params.append("page", currentPage);
                params.append("limit", rowsPerPage);
                

                const res = await axios.get(`${URL}/bookings?${params.toString()}`, {
                    headers: { Authorization: token },
                });


                setBookings(res.data.data || []);
                setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / rowsPerPage));

                // 🛑 safety: reset page if overflow
                if (currentPage > (res.data.totalPages || 1)) {
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        };

        fetchBookings();
}, [search, startDate, endDate, currentPage, rowsPerPage]);

    const toggle = (time) => {
        setSelected((prev) => ({ ...prev, [time]: !prev[time] }));
    };

    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const res = await axios.get(`${URL}/marriage-halls`, {
                    headers: { Authorization: token },
                });
                // Set the array of halls from res.data.data
                setHalls(res.data.data || []);
                console.log(res.data.data); // should log the array of halls
            } catch (error) {
                console.log(error);
            }
        };
        fetchHalls();
    }, []);


    useEffect(() => {
        const hall = halls.find((h) => h._id === selectedHallId);
        if (hall) {
            setCategories(hall.categoryPrices || []);
        } else {
            setCategories([]);
        }
    }, [selectedHallId, halls]);

    // 2️⃣ Set amount whenever category changes
    useEffect(() => {
        if (!selectedCategoryId) return;

        const categoryObj = categories.find((c) => c.category._id === selectedCategoryId);
        if (categoryObj) setAmount(categoryObj.price);
        else setAmount("");
    }, [selectedCategoryId, categories]);

    // 3️⃣ Preload fields for editing (run only once)
    useEffect(() => {
        if (isEditing && selectedBooking && categories.length) {
            setSelectedCategoryId(selectedBooking.category._id);

            const categoryObj = categories.find(
                (c) => c.category._id === selectedBooking.category._id
            );
            if (categoryObj) setAmount(categoryObj.price);
        }
    }, [isEditing, selectedBooking, categories.length]);





    useEffect(() => {
        if (!selectedHallId) return;

        const fetchHallBookings = async () => {
            try {
                const res = await axios.get(`${URL}/bookings?hallId=${selectedHallId}`, {
                    headers: { Authorization: token },
                });
                setHallBookings(res.data.data); // only for availability check
            } catch (err) {
                console.error(err);
            }
        };

        fetchHallBookings();
    }, [selectedHallId]);


    useEffect(() => {
        if (!selectedBooking?._id) return;

        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${URL}/bookings/${selectedBooking._id}/advance-history`, {
                    headers: { Authorization: token },
                });

                setViewAdvanceHistory(res.data.data.history || []);
            } catch (err) {
                console.log("Error loading history:", err);
            }
        };

        fetchHistory();
    }, [selectedBooking]);


    useEffect(() => {
        if (!isIssueModalOpen) return;

        axios.get(`${URL}/kitchen-assets/all`, { headers: { Authorization: token } })
            .then(res => setKitchenAssets(res.data.data || []));
    }, [isIssueModalOpen]);

    const incQty = (id, max) => {
        setIssueQty(prev => {
            const val = prev[id] || 0;
            if (val >= max) return prev;
            return { ...prev, [id]: val + 1 };
        });
    };

    const decQty = (id) => {
        setIssueQty(prev => {
            const val = prev[id] || 0;
            if (val <= 0) return prev;
            return { ...prev, [id]: val - 1 };
        });
    };

    const setQty = (id, value, max) => {
        const num = Number(value) || 0;
        if (num > max) return;
        setIssueQty(prev => ({ ...prev, [id]: num }));



    };

    const showToast = (status, message) => {
        setResponse({ status: null, message: "" });
        setTimeout(() => setResponse({ status, message }), 10);
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    };

    const submitIssue = async () => {
        const items = kitchenAssets
            .filter(a => issueQty[a._id] > 0)
            .map(a => ({
                asset_id: a._id,
                item_name: a.item_name,
                issued_qty: issueQty[a._id],
            }));

        if (items.length === 0) {
            showToast("Failed", "Select quantities");
            return;
        }

        try {
            await axios.post(
                `${URL}/kitchen-asset-issues/issue`,
                {
                    booking_id: selectedBooking._id,
                    hall_id: selectedBooking.hall._id,
                    customer_name: selectedBooking.customerName,
                    booking_date: selectedBooking.date,
                    items,
                },
                { headers: { Authorization: token } }
            );

            showToast("Success", "Assets issued");

            setIssueQty({});
            setIsIssueModalOpen(false);
        } catch (err) {
            showToast(
                "Failed",
                err.response?.data?.message || "Issue failed"
            );
        }
    };

    const toggleRowMenu = (e, booking) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        setOpenMenu({
            booking_id: booking._id,
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX - 140,
            booking
        });
    };

    useEffect(() => {
        const close = () => setOpenMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    

    const FloatingActionMenu = ({ booking }) => {
        if (!openMenu) return null;

        return createPortal(
            <div
                style={{
                    position: "absolute",
                    top: openMenu.top,
                    left: openMenu.left,
                    zIndex: 10000
                }}
                className="bg-white rounded-xl shadow-2xl border w-48 py-2 animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                <MenuItem icon={<FaEye />} label="View" onClick={() => {
                    setSelectedBooking(booking);
                    setViewIsModalOpen(true);
                    setOpenMenu(null);
                }} />

                {booking.booking_status !== "Cancelled" &&
                    booking.booking_status !== "Completed" && (
                        <MenuItem
                            icon={<CiEdit />}
                            label="Edit"
                            onClick={() => {
                                navigate(`/admin/mrghallbookings/edithallbookings/${booking._id}`);
                                setOpenMenu(null);
                            }}
                        />
                    )}


                <MenuItem icon={<FaPlus />} label="Issue Assets" onClick={() => {
                    setSelectedBooking(booking);
                    setIssueQty({});
                    setIsIssueModalOpen(true);
                    setOpenMenu(null);
                }} />

                <MenuItem icon={<FaAmazonPay />} onClick={() => {
                    navigate(`/admin/mrghallbookings/closehallbill/${booking._id}`);
                    setOpenMenu(null);
                }} label="Close Bill" />
            </div>,
            document.body
        );
    };


    const MenuItem = ({ icon, label, onClick }) => (
        <div onClick={onClick}
            className="flex items-center gap-3 px-4 py-2  hover:bg-gray-100 cursor-pointer">
            <span className="text-lg text-lavender--600">{icon}</span>
            <span className="text-sm font-medium text-lavender--600">{label}</span>
        </div>
    );


    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Book Halls</h1>
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
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1); // reset page when searching
                                }}
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
                        onClick={() => navigate("/admin/mrghallbookings/addhallbookings")}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> New Bookings
                    </button>

                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Booked Date</th>
                                <th className="p-2 text-center">Customer Name</th>
                                <th className="p-2 text-center">Customer Phone</th>
                                <th className="p-2 text-center">Booked Hall</th>
                                <th className="p-2 text-center">Booked Area</th>
                                <th className="p-2 text-center">Booked Session</th>
                                <th className="p-2 text-center">Payment Status</th>
                                <th className="p-2 text-center">Booking Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center p-4">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking, index) => (
                                    <tr key={booking._id} className="border-b">
                                        <td className="p-2 text-center ">{(currentPage - 1) * rowsPerPage + (index + 1)}</td>
                                        <td className="p-2 text-center ">
                                            {new Date(booking.date).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="p-2 text-center ">{booking.customerName}</td>
                                        <td className="p-2 text-center ">{booking.customerPhone}</td>
                                        <td className="p-2 text-center ">
                                            {booking.hall?.hall_name || "-"}
                                        </td>
                                        <td className="p-2 text-center ">
                                            {booking.category?.name || "-"}
                                        </td>
                                        <td className="p-2 text-center capitalize">
                                            {Array.isArray(booking.sessions) ? booking.sessions.join(", ") : booking.session}
                                        </td>

                                        <td className={`p-2 text-center  font-medium ${booking.payment_status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                                            {booking.payment_status}
                                        </td>
                                        <td className={`p-2 text-center  font-medium ${booking.booking_status === "Completed"
                                            ? "text-green-600"
                                            : booking.booking_status === "Reserved"
                                                ? "text-yellow-400"
                                                : "text-red-600"
                                            }`}>
                                            {booking.booking_status}
                                        </td>
                                        {/* <td className="p-2 text-center ">
                                            <div className="flex items-center justify-center gap-2 h-full">
                                                <FaEye size={18} title='View' className="text-lavender--600 cursor-pointer" onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setViewIsModalOpen(true);
                                                }} />
                                                {booking.booking_status !== "Cancelled" && (
                                                    <CiEdit
                                                        size={20}
                                                        title='Edit'
                                                        className="text-lavender--600 cursor-pointer"
                                                        onClick={() =>
                                                            navigate(`/admin/mrghallbookings/edithallbookings/${booking._id}`)
                                                        }
                                                    />
                                                )}
                                                <FaPlus
                                                    title="Issue Kitchen Assets"
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedBooking(booking);     // 👈 bind this booking
                                                        setIssueQty({});                 // reset previous quantities
                                                        setIsIssueModalOpen(true);       // open modal
                                                    }}
                                                />
                                                <FaAmazonPay 
                                                    title="Close Bill"
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer" 
                                                />

                                            </div>
                                        </td> */}
                                        <td className="p-2 text-center">
                                            <BsThreeDots
                                                className="text-xl text-lavender--600 cursor-pointer mx-auto"
                                                onClick={(e) => toggleRowMenu(e, booking)}
                                            />
                                        </td>



                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
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


            <Modal isOpen={isViewModalOpen} onClose={() => setViewIsModalOpen(false)} title="View Booking">
                {selectedBooking && (
                    <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
                        {[
                            { label: "Hall", value: selectedBooking.hall?.hall_name },
                            { label: "Category", value: selectedBooking.category?.name },
                            { label: "Date", value: new Date(selectedBooking.date).toLocaleDateString("en-GB") },
                            {
                                label: "Session",
                                value: Array.isArray(selectedBooking.sessions)
                                    ? selectedBooking.sessions.join(", ")
                                    : selectedBooking.session,
                            },
                            { label: "Customer Name", value: selectedBooking.customerName },
                            { label: "Customer Phone", value: selectedBooking.customerPhone },
                            { label: "Category Amount", value: `₹${selectedBooking.amount}` },
                            { label: "Advance Amount", value: `₹${selectedBooking.advanceAmount}` },
                            {
                                label: "Payment Status",
                                value: selectedBooking.payment_status,
                                className: selectedBooking.payment_status === "Paid"
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            },
                            {
                                label: "Booking Status",
                                value: selectedBooking.booking_status,
                                className:
                                    selectedBooking.booking_status === "Completed"
                                        ? "text-green-600 font-semibold"
                                        : selectedBooking.booking_status === "Reserved"
                                            ? "text-blue-600 font-semibold"
                                            : "text-red-600 font-semibold"
                            },
                        ].map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2  last:border-none">
                                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                                    {item.label}
                                </div>
                                <div
                                    className={`col-span-12 sm:col-span-8 text-base ${item.className ? item.className : "text-gray-800 dark:text-gray-300"
                                        }`}
                                >
                                    {item.value}
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 p-2 border rounded-md bg-gray-50">

                            <h2 className="text-lg font-semibold mb-2">Payment History</h2>

                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="text-gray-800 border-b bg-gray-200">
                                        <tr>
                                            <th className="p-2 border">Sl. No</th>
                                            <th className="p-2 border">Date</th>
                                            <th className="p-2 border">Amount Paid</th>
                                            <th className="p-2 border">Balance After</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {viewAdvanceHistory.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center p-3 text-gray-500">
                                                    No payments yet.
                                                </td>
                                            </tr>
                                        )}

                                        {viewAdvanceHistory.map((item, i) => {
                                            const after =
                                                Number(selectedBooking.amount) -
                                                viewAdvanceHistory
                                                    .slice(0, i + 1)
                                                    .reduce((sum, h) => sum + h.amount, 0);

                                            return (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 border">{i + 1}</td>
                                                    <td className="p-2 border">
                                                        {new Date(item.date).toLocaleDateString("en-GB")}
                                                    </td>
                                                    <td className="p-2 border">₹ {item.amount}</td>
                                                    <td className="p-2 border">₹ {after}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>
                )}

            </Modal>

            <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Assets">
                <div className="space-y-4 max-h-[650px] overflow-y-auto">

                    {/* AVAILABLE ITEMS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {availableAssets.map(a => (
                            <div key={a._id} className="border rounded-xl p-4 shadow-sm bg-gray-50">

                                <h5 className="font-semibold text-lavender--600 mb-2">{a.item_name}</h5>

                                <p className="text-sm text-gray-500 mb-2">
                                    Available: <span className="font-semibold">{a.available_quantity}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => decQty(a._id)}
                                        className="px-3 py-1 bg-lavender--600 rounded">
                                        <FaMinus className="text-white" />
                                    </button>

                                    <input
                                        value={issueQty[a._id] || ""}
                                        onChange={e => setQty(a._id, e.target.value, a.available_quantity)}
                                        className="w-16 text-center border rounded"
                                    />

                                    <button onClick={() => incQty(a._id, a.available_quantity)}
                                        className="px-3 py-1 bg-lavender--600 rounded">
                                        <FaPlus className="text-white" />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>


                    {/* UNAVAILABLE ITEMS */}
                    {unavailableAssets.length > 0 && (
                        <div className="border-t p-3">

                            <h6 className="font-semibold text-red-600 mb-2">
                                Unavailable Items
                            </h6>

                            <ul className="text-sm text-gray-700 space-y-1">
                                {unavailableAssets.map(a => (
                                    <li
                                        key={a._id}
                                        className="flex justify-between border-b  py-1"
                                    >
                                        <span>{a.item_name}</span>
                                        <span className="text-red-600 font-semibold">Out of stock</span>
                                    </li>

                                ))}
                            </ul>

                        </div>
                    )}


                    <div className="flex justify-end">
                        <button onClick={submitIssue}
                            className="bg-lavender--600 text-white px-6 py-2 rounded-lg">
                            Issue Assets
                        </button>
                    </div>

                </div>

            </Modal>

            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}
            {openMenu && <FloatingActionMenu booking={openMenu.booking} />}

        </>
    )
}