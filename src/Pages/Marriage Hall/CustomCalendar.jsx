import React, { useState } from "react";
import dayjs from "dayjs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const CustomCalendar = ({ hallBookings = [], selectedHallId, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Calendar structure
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day(); // 0 = Sunday

  const handleSelect = (date, session, available) => {
    if (!available) return;
    onSelect(date.toDate(), session);
  };

  const renderDay = (day) => {
    const date = startOfMonth.date(day);
    const dateStr = date.format("YYYY-MM-DD");

    // Same logic as your react-calendar tileContent
    const dayBookings = hallBookings.filter(
      (b) =>
        b.hall?._id === selectedHallId &&
        new Date(b.date).toDateString() === date.toDate().toDateString()
    );

    const morningAvailable = !dayBookings.some((b) =>
      b.sessions?.includes("morning")
    );
    const eveningAvailable = !dayBookings.some((b) =>
      b.sessions?.includes("evening")
    );

    return (
      <div key={day} className="relative aspect-square border rounded-lg overflow-hidden">
        {/* Morning half */}
        <div
          onClick={() => handleSelect(date, "morning", morningAvailable)}
          className={`absolute top-0 left-0 w-full h-1/2 flex items-center justify-center text-xs font-medium
            ${
              morningAvailable
                ? "bg-green-100 text-green-700 "
                : "bg-red-100 text-red-700 "
            }
          `}
        >
          M
        </div>

        {/* Evening half */}
        <div
          onClick={() => handleSelect(date, "evening", eveningAvailable)}
          className={`absolute bottom-0 left-0 w-full h-1/2 flex items-center justify-center text-xs font-medium 
            ${
              eveningAvailable
                ? "bg-green-100 text-green-700 "
                : "bg-red-100 text-red-700 "
            }
          `}
        >
          E
        </div>

        {/* Date number in the center */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-semibold pointer-events-none">
          {day}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <IoIosArrowBack />
        </button>
        <h2 className="font-semibold text-base text-gray-800">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <IoIosArrowForward />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Blank days before month start */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </div>
    </div>
  );
};

export default CustomCalendar;
