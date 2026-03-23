import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import 'react-calendar/dist/Calendar.css';
import CustomCalendar from './CustomCalendar';
import { useNavigate } from "react-router-dom";

export const AddHallBooking = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  // form state
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [calendarDate, setCalendarDate] = useState(null);
  const [selected, setSelected] = useState({ morning: false, evening: false });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [bookingStatus, setBookingStatus] = useState("Reserved");
  const [hallBookings, setHallBookings] = useState([]);
  const [advanceError, setAdvanceError] = useState("");


  // UI & response
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);

  // Pagination/search (if you later want to re-use fetchBookings)
  const limit = 10;

  // fetch halls on mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${URL}/marriage-halls`, {
          headers: { Authorization: token },
        });
        setHalls(res.data.data || []);
      } catch (err) {
        console.error("Error fetching halls:", err);
      }
    };
    fetchHalls();
  }, [token]);

  // when hall changes, load its categories and bookings
  useEffect(() => {
    const hall = halls.find((h) => h._id === selectedHallId);
    if (hall) {
      setCategories(hall.categoryPrices || []);
      setSelectedCategoryId("");
      setAmount("");
    } else {
      setCategories([]);
      setSelectedCategoryId("");
      setAmount("");
    }

    // fetch bookings for selected hall (for availability)
    if (!selectedHallId) {
      setHallBookings([]);
      return;
    }

    const fetchHallBookings = async () => {
      try {
        const res = await axios.get(`${URL}/bookings?hallId=${selectedHallId}&limit=1000`, {
          headers: { Authorization: token },
        });
        setHallBookings(res.data.data || []);
      } catch (err) {
        console.error("Error fetching hall bookings:", err);
      }
    };

    fetchHallBookings();
  }, [selectedHallId, halls, token]);

  // set amount automatically when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setAmount("");
      return;
    }
    const categoryObj = categories.find((c) => c.category._id === selectedCategoryId);
    if (categoryObj) setAmount(categoryObj.price ?? "");
    else setAmount("");
  }, [selectedCategoryId, categories]);

  // helper: normalize to YYYY-MM-DD
  const dayStr = (d) => (d ? new Date(d).toISOString().split("T")[0] : null);

  // compute day-specific bookings (ignore cancelled bookings)
  const dayBookings = calendarDate && hallBookings.length
    ? hallBookings.filter(
      (b) =>
        dayStr(b.date) === dayStr(calendarDate) &&
        b.booking_status !== "Cancelled"
    )
    : [];

  const morningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("morning"));
  const eveningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("evening"));

  // toggle session
  const toggle = (time) => {
    setSelected((prev) => ({ ...prev, [time]: !prev[time] }));
  };

  // reset form
  const resetForm = () => {
    setSelectedHallId("");
    setSelectedCategoryId("");
    setCalendarDate(null);
    setCustomerName("");
    setCustomerPhone("");
    setAmount("");
    setAdvanceAmount("");
    setBookingStatus("");
    setSelected({ morning: false, evening: false });
  };

  // create booking
  const handleBooking = async () => {
    // front-end validation
    if (
      !selectedHallId ||
      !selectedCategoryId ||
      !calendarDate ||
      (!selected.morning && !selected.evening) ||
      !customerName.trim() ||
      !customerPhone.trim() ||
      customerPhone.length !== 10 ||
      advanceAmount === "" ||
      !bookingStatus
    ) {
      return alert("All fields are required and phone must be 10 digits.");
    }

    const sessions = ["morning", "evening"].filter((s) => selected[s]);

    const payload = {
      hall: selectedHallId,
      category: selectedCategoryId,
      date: calendarDate instanceof Date ? calendarDate.toISOString() : calendarDate,
      sessions,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      advanceAmount: Number(advanceAmount || 0),
      booking_status: bookingStatus,
      amount: Number(amount || 0),
      payment_status: "Unpaid",
    };

    try {
      setLoading(true);
      await axios.post(`${URL}/bookings`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Booking created successfully" });
      // optionally go back or reset
      setTimeout(() => {
        navigate(-1);
      }, 1000);
      resetForm();

      // refresh hallBookings (so calendar updates)
      try {
        const res = await axios.get(`${URL}/bookings?hallId=${selectedHallId}&limit=1000`, {
          headers: { Authorization: token },
        });
        setHallBookings(res.data.data || []);
      } catch (err) {
        console.error("Error refreshing hall bookings:", err);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error creating booking",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 mx-1 mt-3 bg-white shadow-md rounded-[10px] mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200"
              aria-label="Go back"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-lg font-semibold">Add Hall Booking</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hall Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Hall</label>
              <select
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select a Hall --</option>
                {halls.map((hall) => (
                  <option key={hall._id} value={hall._id}>
                    {hall.hall_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Hall Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled={!categories.length}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.category._id} value={c.category._id}>
                    {c.category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="text"
                value={amount}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Date</label>
              <input
                type="date"
                value={calendarDate ? calendarDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setCalendarDate(new Date(e.target.value));
                  } else {
                    setCalendarDate(null);
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Session</label>
              <div className="flex justify-center w-full">

                <div className="flex border border-gray-300 rounded-full overflow-hidden">
                  <button
                    disabled={!morningAvailable}
                    onClick={() => toggle("morning")}
                    className={`px-5 h-[40px] text-white flex items-center justify-center transition-colors ${selected.morning ? "bg-lavender--600" : "bg-gray-300"
                      } rounded-l-full`}
                  >
                    Morning
                  </button>

                  <div className="w-[1px] bg-gray-400"></div>

                  <button
                    disabled={!eveningAvailable}
                    onClick={() => toggle("evening")}
                    className={`px-5 h-[40px] text-white flex items-center justify-center transition-colors ${selected.evening ? "bg-lavender--600" : "bg-gray-300"
                      } rounded-r-full`}
                  >
                    Evening
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <CustomCalendar
              hallBookings={hallBookings}
              selectedHallId={selectedHallId}
              onSelect={(date, session) => {
                setCalendarDate(date);
                setSelected({
                  morning: session === "morning",
                  evening: session === "evening",
                });
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
              <input
                type="text"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setCustomerPhone(v);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            <input type="hidden" name="payment_status" value="Unpaid" />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Advance Amount
              </label>

              <input
                type="number"
                min={0}
                value={advanceAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);

                  if (v > Number(amount)) {
                    setAdvanceError("Advance amount cannot exceed total amount.");
                    setAdvanceAmount(amount);  // lock to max allowed value
                  } else {
                    setAdvanceError("");
                    setAdvanceAmount(v);
                  }
                }}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm 
      ${advanceError ? "border-red-500" : "border-gray-300"}`}
              />

              {advanceError && (
                <p className="text-red-600 text-xs mt-1">{advanceError}</p>
              )}
            </div>



            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Booking Status</label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Status --</option>
                <option value="Completed">Completed</option>
                <option value="Reserved">Reserved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div> */}
            <input type="hidden" value="Reserved" />

          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                resetForm();
                navigate(-1);
              }}
              className="px-4 py-2 border rounded-md"
              type="button"
            >
              Cancel
            </button>

            <button
              onClick={handleBooking}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md disabled:opacity-50"
              type="button"
              disabled={loading}
            >
              {loading ? "Booking..." : "Book"}
            </button>
          </div>
        </div>

        {Response.status && (
          Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          )
        )}
      </div>
    </>
  )
}
