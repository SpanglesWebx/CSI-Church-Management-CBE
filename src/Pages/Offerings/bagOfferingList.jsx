/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal";
import OfferingTable from "../../Components/Offerings/BagOfferingsTable";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function BagOfferingList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [response, setResponse] = useState({ status: null, message: "" });

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  // ===== Pagination (carbon copy – default 25) =====
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  // Helpers
  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getDayFromDate = (dateStr) =>
    new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      new Date(dateStr)
    );

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: getCurrentDate(),
      day: getDayFromDate(getCurrentDate()),
    },
  });

  const selectedDate = watch("date");
  useEffect(() => {
    if (selectedDate) {
      setValue("day", getDayFromDate(selectedDate));
      trigger("day");
    }
  }, [selectedDate, setValue, trigger]);

  // Fetch offerings
  const fetchOfferings = async (page, search, from, to) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await axios.get(`${URL}/bagOfferings/category`, {
        params: {
          category,
          page,
          limit: rowsPerPage,
          search,
          fromdate: from,
          todate: to
        },

        headers: { Authorization: token },
        signal: abortControllerRef.current.signal,
      });

      return res.data;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Error fetching offerings:", err);
        setOfferings([]);
        setTotalAmount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchOfferings(page, query, from, to).then((data) => {
        setOfferings(data?.bagOfferings || []);
        setTotalPages(data?.totalPages || 1);
        setTotalAmount(data?.totalAmount || 0);
      });
    }, 200);
  };

  // Initial fetch + re-fetch
useEffect(() => {
  debounceFetch(currentPage, searchQuery, fromDate, toDate);
}, [currentPage, rowsPerPage]);


  useEffect(() => {
    setCurrentPage(1);
    debounceFetch(1, searchQuery, fromDate, toDate);
  }, [searchQuery, fromDate, toDate]);

  // Modal handlers
  const handleOpenModal = () => {
    reset({ date: getCurrentDate(), day: getDayFromDate(getCurrentDate()) });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    reset();
    setIsModalOpen(false);
  };

  // Add new offering
  // const onSubmit = async (formData) => {
  //   formData.category = category;
  //   try {
  //     await axios.post(`${URL}/bagOfferings/add`, formData, {
  //       headers: { Authorization: token },
  //     });

  //     setResponse({ status: "Success", message: "Offering added successfully" });
  //     // setIsModalOpen(false);

  //     const updated = await fetchOfferings(currentPage, searchQuery, fromDate, toDate);
  //     setOfferings(updated.bagOfferings);
  //     setTotalAmount(updated.totalAmount);
  //     setTotalPages(updated.totalPages);
  //   } catch (error) {
  //     console.error(error);
  //     setResponse({ status: "Failed", message: error?.response?.data?.message || "Error saving offering" });
  //     if (error.response?.status === 401) {
  //       window.sessionStorage.clear();
  //       navigate("/");
  //     }
  //   }
  // };

  const onSubmit = async (formData) => {
  formData.category = category;
  try {
    await axios.post(`${URL}/bagOfferings/add`, formData, {
      headers: { Authorization: token },
    });

    // ✅ Always reset first, then show toast
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Success", message: "Offering added successfully" });
    }, 10);
    setIsModalOpen(false);

    const updated = await fetchOfferings(currentPage, searchQuery, fromDate, toDate);
    setOfferings(updated.bagOfferings);
    setTotalAmount(updated.totalAmount);
    setTotalPages(updated.totalPages);
  } catch (error) {
    console.error(error);

    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({ status: "Failed", message: error?.response?.data?.message || "Error saving offering" });
    }, 10);

    if (error.response?.status === 401) {
      window.sessionStorage.clear();
      navigate("/");
    }
  } finally {
    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  }
};


  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const res = await axios.get(
        `${URL}/bagOfferings/category?category=${category}&fromdate=${fromDate}&todate=${toDate}&download=true`,
        { headers: { Authorization: token } }
      );

      const data = res.data.bagOfferings;
      const doc = new jsPDF();

      const addTitle = () => {
        doc.setFontSize(18);
        doc.text(category, doc.internal.pageSize.width / 2, 15, { align: "center" });
        doc.setFontSize(12);
        const text = `Total Amount : ${totalAmount}`;
        const textWidth = doc.getTextWidth(text);
        doc.text(text, doc.internal.pageSize.width - textWidth - 10, 25);
      };

      const headers = [["SI.No.", "Date", "Day", "Amount", "Description"]];
      const rows = data.map((item, idx) => [
        idx + 1,
        moment(item.date).format("YYYY-MM-DD"),
        moment(item.date).format("dddd"),
        item.amount,
        item.description,
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        styles: { halign: "center" },
        margin: { top: 35, left: 10, right: 10 },
        didDrawPage: addTitle,
      });

      doc.save(`${category} Report.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const today = getCurrentDate();

  const getPaginationPages = () => {
  const pages = [];
  const range = 2;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (currentPage > range + 2) pages.push("ellipsis-left");

  const start = Math.max(2, currentPage - range);
  const end = Math.min(totalPages - 1, currentPage + range);

  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - (range + 1)) pages.push("ellipsis-right");

  pages.push(totalPages);

  return pages;
};

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex flex-col items-center justify-between px-3 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-11">
        <div className="text-xl font-bold capitalize">{category}</div>
      </div>

      {/* Filters + Actions */}
      <div className="h-full p-5 mx-1 mt-3 bg-white shadow-md rounded-xl">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center space-x-3 space-y-3 lg:space-y-0">
            {/* From Date */}
            <div className="flex items-center px-1 space-x-2 border rounded-lg">
              <label className="text-gray-700">From:</label>
              <input type="date" max={today} value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1 border-0 rounded focus:ring-0" />
            </div>

            {/* To Date */}
            <div className="flex items-center px-1 space-x-2 border rounded-lg">
              <label className="text-gray-700">To:</label>
              <input type="date" max={today} value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1 border-0 rounded focus:ring-0" />
            </div>
          </div>

          <div className="flex w-full gap-x-4 lg:w-auto">
            {fromDate && toDate && (
              <button onClick={handleDownloadPDF} className="mr-4 text-blue-600 hover:text-blue-800">
                <img src={down} alt="Download" />
              </button>
            )}
            <button onClick={handleOpenModal} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
              <FaPlus /> Add Offering
            </button>
          </div>
        </div>

        {/* Table */}
        <OfferingTable offerings={offerings} loading={loading} CurrentPage={currentPage} />

        {/* Total */}
        {totalAmount > 0 && (
          <div className="w-1/2 pt-10 mx-auto">
            <h6 className="font-bold text-end lg:text-xl">
              Total Amount : <span className="text-2xl text-lavender--600">{totalAmount.toLocaleString("en-IN")}</span>
            </h6>
          </div>
        )}

        {/* Pagination */}
        {/* Pagination */}
<div className="relative flex items-center justify-center mt-4 space-x-2 select-none">

  {/* LEFT – Rows Per Page */}
  <div className="absolute left-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        No. of Rows
      </span>

      <div className="relative w-24">
        <div
          className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
          onClick={() => {
            setRowsPerPage(rowsInput || 25);
            setCurrentPage(1);
          }}
        >
          <svg
            className="w-4 h-4 text-gray-500"
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
          type="text"
          inputMode="numeric"
          placeholder="25"
          value={rowsInput}
          onChange={(e) =>
            setRowsInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          className="block w-full py-1 pr-8 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

  {/* CENTER – Pagination */}
  <div className="flex items-center space-x-2">

    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronLeft />
    </button>

    {getPaginationPages().map((page, index) => {
      if (typeof page === "string") {
        return (
          <span key={index} className="px-3 py-2 text-gray-500">
            …
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium
            ${
              page === currentPage
                ? "bg-lavender--600 text-white"
                : "hover:border-2 border-gray-300"
            }`}
        >
          {page}
        </button>
      );
    })}

    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
    >
      <FaChevronRight />
    </button>

  </div>

  {/* RIGHT – Jump to Page */}
  <div className="absolute right-2">
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        Jump to Page
      </span>

      <div className="relative w-20">
        <input
          type="text"
          inputMode="numeric"
          placeholder={`1-${totalPages}`}
          value={jumpInput}
          onChange={(e) =>
            setJumpInput(e.target.value.replace(/[^0-9]/g, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = Number(jumpInput);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setJumpInput("");
              }
            }
          }}
          className="block w-full py-1 pr-2 pl-2 text-sm bg-gray-100 rounded outline-none"
        />
      </div>
    </div>
  </div>

</div>

      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Offering">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            {/* Day */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Day</label>
              <input
                type="text"
                readOnly
                value={watch("day")}
                {...register("day")}
                className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Amount</label>
              <input
                type="number"
                min={0}
                placeholder="Rs"
                {...register("amount", {
                  required: "Amount is required",
                  pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter a valid amount" },
                })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-lg font-medium text-gray-700">Description</label>
            <input
              type="text"
              placeholder="Enter Description"
              {...register("description")}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-base font-medium text-red-500 rounded-md"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-base font-medium text-white bg-lavender--600 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {response.status === "Success" && <SuccessMessage Message={response.message} />}
      {response.status === "Failed" && <FailedMessage Message={response.message} />}
    </div>
  );
}
