import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal";
import OfferingTable from "../../Components/Offerings/BagOfferingsTable"; // ✅ reuse same table
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";

export const MinistryOfferingList = () => {
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
      const res = await axios.get(`${URL}/ministryOfferings/category`, {
        params: {
          category,
          page,
          limit: 15,
          search,
          fromdate: from,
          todate: to,
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
        setOfferings(data?.ministryOfferings || []);
        setTotalPages(data?.totalPages || 1);
        setTotalAmount(data?.totalAmount || 0);
      });
    }, 200);
  };

  // Initial + re-fetch
  useEffect(() => {
    debounceFetch(currentPage, searchQuery, fromDate, toDate);
  }, [currentPage]);

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
  const onSubmit = async (formData) => {
    formData.category = category;
    try {
      await axios.post(`${URL}/ministryOfferings/add`, formData, {
        headers: { Authorization: token },
      });

      // Reset + toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Offering added successfully",
        });
      }, 10);

      const updated = await fetchOfferings(
        currentPage,
        searchQuery,
        fromDate,
        toDate
      );
      setOfferings(updated.ministryOfferings);
      setTotalAmount(updated.totalAmount);
      setTotalPages(updated.totalPages);
    } catch (error) {
      console.error(error);
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message:
            error?.response?.data?.message || "Error saving offering",
        });
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
        `${URL}/ministryOfferings/category?category=${category}&fromdate=${fromDate}&todate=${toDate}&download=true`,
        { headers: { Authorization: token } }
      );

      const data = res.data.ministryOfferings;
      const doc = new jsPDF();

      const addTitle = () => {
        doc.setFontSize(18);
        doc.text(category, doc.internal.pageSize.width / 2, 15, {
          align: "center",
        });
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

      doc.save(`${category} Ministry Report.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const today = getCurrentDate();
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
              <input
                type="date"
                max={today}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1 border-0 rounded focus:ring-0"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center px-1 space-x-2 border rounded-lg">
              <label className="text-gray-700">To:</label>
              <input
                type="date"
                max={today}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1 border-0 rounded focus:ring-0"
              />
            </div>
          </div>

          <div className="flex w-full gap-x-4 lg:w-auto">
            {fromDate && toDate && (
              <button
                onClick={handleDownloadPDF}
                className="mr-4 text-blue-600 hover:text-blue-800"
              >
                <img src={down} alt="Download" />
              </button>
            )}
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Add Offering
            </button>
          </div>
        </div>

        {/* Table */}
        <OfferingTable
          offerings={offerings}
          loading={loading}
          CurrentPage={currentPage}
        />

        {/* Total */}
        {totalAmount > 0 && (
          <div className="w-1/2 pt-10 mx-auto">
            <h6 className="font-bold text-end lg:text-xl">
              Total Amount :{" "}
              <span className="text-2xl text-lavender--600">
                {totalAmount.toLocaleString("en-IN")}
              </span>
            </h6>
          </div>
        )}

        {/* Pagination */}
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button className="px-4 py-2 bg-lavender--600 text-white rounded">
            {currentPage}
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-5 space-x-2 right-10">
            <span className="px-4 py-2 bg-gray-100 rounded">
              Total Page: {totalPages}
            </span>
            <span
              onClick={() => setCurrentPage(totalPages)}
              className={`${totalPages === currentPage
                  ? "opacity-50 cursor-not-allowed"
                  : "text-blue-400 hover:cursor-pointer"
                } px-4 py-2 bg-gray-100 rounded`}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Offering">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Day */}
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Day
              </label>
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
              <label className="block text-lg font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                min={0}
                placeholder="Rs"
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a valid amount",
                  },
                })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-lg font-medium text-gray-700">
              Description
            </label>
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
      {response.status === "Success" && (
        <SuccessMessage Message={response.message} />
      )}
      {response.status === "Failed" && (
        <FailedMessage Message={response.message} />
      )}
    </div>
  )
}
