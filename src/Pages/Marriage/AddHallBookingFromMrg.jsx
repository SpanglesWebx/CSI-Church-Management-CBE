import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomCalendar from "../Marriage Hall/CustomCalendar";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";

export const AddHallBookingFromMrg = ({ prefName = "", prefPhone = "", prefDate = null, onBooked = () => {} }) => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

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
  const [advanceError, setAdvanceError] = useState("");

  const [bookingStatus, setBookingStatus] = useState("Reserved");

  const [hallBookings, setHallBookings] = useState([]);

  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);

  // AUTO-FILL FROM MARRIAGE FORM
  useEffect(() => {
    setCustomerName(prefName || "");
  }, [prefName]);

  useEffect(() => {
    setCustomerPhone(prefPhone || "");
  }, [prefPhone]);

  useEffect(() => {
    if (prefDate) {
      const d = prefDate instanceof Date ? prefDate : new Date(prefDate);
      setCalendarDate(d);
    }
  }, [prefDate]);

  // Fetch halls once
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

  // Hall change → load categories + bookings
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

    if (!selectedHallId) return setHallBookings([]);

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

  // Category → Amount
  useEffect(() => {
    if (!selectedCategoryId) return setAmount("");

    const cat = categories.find((c) => c.category._id === selectedCategoryId);
    setAmount(cat?.price || "");
  }, [selectedCategoryId, categories]);

  // Normalize date
  const dayStr = (d) => (d ? new Date(d).toISOString().split("T")[0] : null);

  const dayBookings = calendarDate
    ? hallBookings.filter(
      (b) =>
        dayStr(b.date) === dayStr(calendarDate) &&
        b.booking_status !== "Cancelled"
    )
    : [];

  const morningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("morning"));
  const eveningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("evening"));

  const toggle = (time) => {
    setSelected((prev) => ({ ...prev, [time]: !prev[time] }));
  };

  // const handleBooking = async () => {
  //   if (
  //     !selectedHallId ||
  //     !selectedCategoryId ||
  //     !calendarDate ||
  //     (!selected.morning && !selected.evening) ||
  //     !customerName.trim() ||
  //     !customerPhone.trim() ||
  //     customerPhone.length !== 10 ||
  //     advanceAmount === "" ||
  //     advanceError
  //   ) {
  //     return alert("Please fill all fields correctly.");
  //   }

  //   const sessions = ["morning", "evening"].filter((s) => selected[s]);

  //   const payload = {
  //     hall: selectedHallId,
  //     category: selectedCategoryId,
  //     date: calendarDate.toISOString(),
  //     sessions,
  //     customerName: customerName.trim(),
  //     customerPhone: customerPhone.trim(),
  //     advanceAmount: Number(advanceAmount),
  //     booking_status: bookingStatus,
  //     amount: Number(amount),
  //     payment_status: "Unpaid",
  //   };

  //   try {
  //     setLoading(true);
  //     await axios.post(`${URL}/bookings`, payload, {
  //       headers: { Authorization: token },
  //     });

  //     setResponse({ status: "Success", message: "Booking created successfully" });

  //     setTimeout(() => navigate(-1), 1000);
  //   } catch (err) {
  //     setResponse({
  //       status: "Failed",
  //       message: err.response?.data?.message || "Error creating booking",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleBooking = async () => {
    if (
      !selectedHallId ||
      !selectedCategoryId ||
      !calendarDate ||
      (!selected.morning && !selected.evening) ||
      !customerName.trim() ||
      !customerPhone.trim() ||
      customerPhone.length !== 10 ||
      advanceAmount === "" ||
      advanceError
    ) {
      return alert("Please fill all fields correctly.");
    }

    const sessions = ["morning", "evening"].filter((s) => selected[s]);

    const payload = {
      hall: selectedHallId,
      category: selectedCategoryId,
      date: calendarDate.toISOString(),
      sessions,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      advanceAmount: Number(advanceAmount),
      booking_status: bookingStatus,
      amount: Number(amount),
      payment_status: "Unpaid",
    };

    try {
      setLoading(true);
      const res = await axios.post(`${URL}/bookings`, payload, {
        headers: { Authorization: token },
      });

      const created = res.data?.data || null;

      // Build a compact booking summary to send back to parent
      const hall = halls.find(h => h._id === selectedHallId) || {};
      const catObj = (categories || []).find(c => c.category._id === selectedCategoryId) || {};

      const bookingSummary = {
        bookingId: created?._id || null,
        hallId: selectedHallId,
        hallName: hall.hall_name || "",
        categoryId: selectedCategoryId,
        categoryName: catObj?.category?.name || "",
        bookingDate: calendarDate ? new Date(calendarDate).toISOString() : null,
        sessions,
        hallAmount: Number(amount || 0),
        advanceAmount: Number(advanceAmount || 0),
        payment_status: created?.payment_status || "Unpaid",
        booking_status: created?.booking_status || bookingStatus,
        raw: created, // include raw for debugging if needed
      };

      setResponse({ status: "Success", message: "Booking created successfully" });

      // Send booking data back to parent (AddMarriage) via callback
      onBooked(bookingSummary);

      // Do NOT navigate(-1) — parent controls closing the booking UI
    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error creating booking",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold mb-3">Book Hall</h1>

      <div className="p-4">

        {/* HALL DROPDOWN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Hall</label>
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">-- Select --</option>
              {halls.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.hall_name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              disabled={!categories.length}
            >
              <option value="">-- Select --</option>
              {categories.map((c) => (
                <option key={c.category._id} value={c.category._id}>
                  {c.category.name}
                </option>
              ))}
            </select>
          </div>

          {/* AMOUNT */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="text"
              value={amount}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
            />
          </div>
        </div>

        {/* DATE + SESSION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Booking Date</label>
            <input
              type="date"
              value={calendarDate ? dayStr(calendarDate) : ""}
              onChange={(e) => setCalendarDate(new Date(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session</label>
            <div className="flex border border-gray-300 rounded-full overflow-hidden mt-1">

              <button
                disabled={!morningAvailable}
                onClick={() => toggle("morning")}
                className={`px-5 py-2 flex-1 text-white ${selected.morning ? "bg-lavender--600" : "bg-gray-300"
                  }`}
              >
                Morning
              </button>

              <button
                disabled={!eveningAvailable}
                onClick={() => toggle("evening")}
                className={`px-5 py-2 flex-1 text-white ${selected.evening ? "bg-lavender--600" : "bg-gray-300"
                  }`}
              >
                Evening
              </button>

            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Select Date</label>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
            <input
              type="number"
              value={advanceAmount}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v > Number(amount)) {
                  setAdvanceError("Advance cannot exceed total amount.");
                } else {
                  setAdvanceError("");
                }
                setAdvanceAmount(v);
              }}
              className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm ${advanceError ? "border-red-500" : "border-gray-300"
                }`}
            />
            {advanceError && (
              <p className="text-red-600 text-xs mt-1">{advanceError}</p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleBooking}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            disabled={loading || advanceError}
          >
            {loading ? "Booking..." : "Book"}
          </button>
        </div>

        {Response.status && (
          Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          )
        )}
      </div>
    </div>
  );
};
