import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import CustomCalendar from './CustomCalendar';
import { useNavigate, useParams } from "react-router-dom";

export const EditHallBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");

  // STATE
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [calendarDate, setCalendarDate] = useState(null);
  const [selected, setSelected] = useState({ morning: false, evening: false });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState(0); // FIXED DEPOSIT
  const [bookingStatus, setBookingStatus] = useState("");

  const [hallBookings, setHallBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [advanceHistory, setAdvanceHistory] = useState([]);

  // Load halls
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${URL}/marriage-halls`, {
          headers: { Authorization: token },
        });
        setHalls(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHalls();
  }, [token]);

  // Load booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/${id}`, {
          headers: { Authorization: token },
        });

        const b = res.data.data;
        if (!b) return;

        setSelectedHallId(b.hall?._id || "");
        setSelectedCategoryId(b.category?._id || "");
        setAmount(b.amount || "");
        setCalendarDate(new Date(b.date));
        setSelected({
          morning: b.sessions?.includes("morning"),
          evening: b.sessions?.includes("evening"),
        });
        setCustomerName(b.customerName);
        setCustomerPhone(b.customerPhone);
        setAdvanceAmount(b.advanceAmount || 0); // fixed original advance
        setBookingStatus(b.booking_status || "");
      } catch (err) {
        console.log("Error fetching booking:", err);
      }
    };

    fetchBooking();
  }, [id, token]);

  // Load categories + hall bookings
  useEffect(() => {
    const hall = halls.find((h) => h._id === selectedHallId);
    if (hall) {
      setCategories(hall.categoryPrices || []);
    } else {
      setCategories([]);
      return;
    }

    const fetchHallBookings = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/all?hallId=${selectedHallId}`, {
          headers: { Authorization: token },
        });
        setHallBookings(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (selectedHallId) fetchHallBookings();
  }, [selectedHallId, halls, token]);

  // Auto-update amount
  useEffect(() => {
    const obj = categories.find((c) => c.category._id === selectedCategoryId);
    setAmount(obj ? obj.price : "");
  }, [selectedCategoryId, categories]);

  // Filter out current booking for availability check
  const dayStr = (d) => new Date(d).toISOString().split("T")[0];

  const dayBookings = calendarDate
    ? hallBookings.filter(
      (b) =>
        dayStr(b.date) === dayStr(calendarDate) &&
        b._id !== id &&
        b.booking_status !== "Cancelled"
    )
    : [];

  const morningAvailable = !dayBookings.some((b) => b.sessions?.includes("morning"));
  const eveningAvailable = !dayBookings.some((b) => b.sessions?.includes("evening"));

  const toggle = (t) => setSelected((prev) => ({ ...prev, [t]: !prev[t] }));

  // Fetch advance history
  useEffect(() => {
    if (!id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/${id}/advance-history`, {
          headers: { Authorization: token },
        });
        setAdvanceHistory(res.data.data.history || []);
      } catch (err) {
        console.log("History fetch error:", err);
      }
    };

    fetchHistory();
  }, [id]);

  // UPDATE BOOKING (DOES NOT TOUCH ADVANCE)
  const handleUpdate = async () => {
    if (
      !selectedHallId ||
      !selectedCategoryId ||
      !calendarDate ||
      (!selected.morning && !selected.evening) ||
      !customerName.trim() ||
      !customerPhone.trim() ||
      customerPhone.length !== 10 ||
      !bookingStatus
    ) {
      return alert("All fields are required & phone must be 10 digits.");
    }

    const sessions = ["morning", "evening"].filter((s) => selected[s]);

    // FIXED: Do NOT send advanceAmount or payment_status
    const payload = {
      hall: selectedHallId,
      category: selectedCategoryId,
      date: calendarDate.toISOString(),
      sessions,
      customerName,
      customerPhone,
      booking_status: bookingStatus,
      amount: Number(amount),
    };

    try {
      setLoading(true);
      await axios.put(`${URL}/bookings/${id}`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Booking updated successfully" });
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error(err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Update failed",
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
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-lg font-semibold">Edit Hall Booking</h1>
          </div>
        </div>

        <div className="p-4">
          {/* HALL / CATEGORY / AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Hall</label>
              <select
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md"
              >
                <option value="">-- Select a Hall --</option>
                {halls.map((hall) => (
                  <option key={hall._id} value={hall._id}>
                    {hall.hall_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hall Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="text"
                value={amount}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* DATE + SESSION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Date</label>
              <input
                type="date"
                value={calendarDate ? calendarDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setCalendarDate(e.target.value ? new Date(e.target.value) : null)
                }
                className="block w-full mt-1 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Session</label>
              <div className="flex justify-center w-full">
                <div className="flex border border-gray-300 rounded-full overflow-hidden">
                  <button
                    disabled={!morningAvailable}
                    onClick={() => toggle("morning")}
                    className={`px-5 h-[40px] text-white ${selected.morning ? "bg-lavender--600" : "bg-gray-300"
                      } rounded-l-full`}
                  >
                    Morning
                  </button>

                  <div className="w-[1px] bg-gray-400"></div>

                  <button
                    disabled={!eveningAvailable}
                    onClick={() => toggle("evening")}
                    className={`px-5 h-[40px] text-white ${selected.evening ? "bg-lavender--600" : "bg-gray-300"
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

          {/* CUSTOMER DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
              <input
                type="text"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                className="block w-full mt-1 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
              <input
                type="number"
                min={0}
                value={advanceAmount}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Status</label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md"
              >
                <option value="">-- Select Status --</option>
                <option value="Completed">Completed</option>
                <option value="Reserved">Reserved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>






          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md">
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              {loading ? "Updating..." : "Update Booking"}
            </button>
          </div>
        </div>
        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}
      </div>
    </>
  );
};
