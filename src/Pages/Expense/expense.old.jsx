import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoIosEye } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Dropdown from "../../Components/Helpers/DropDown";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoMdPrint } from "react-icons/io";
import Modal from "../../Components/Expense/ExpenseFormModal";
import ExpenseTable from "../../Components/Expense/ExpenseTable";
import Pagination from "../../Components/Helpers/Pagination"; // Import Pagination component
import { useForm } from "react-hook-form";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useNavigate } from "react-router-dom";

export default function Expense() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();
  const token = window.sessionStorage.getItem("token");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseImg, setExpenseImg] = useState();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [date, setDate] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(null);

  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    // setFromDate(today);
    // setToDate(today);
  }, [date]);

  const [formCategory, setFormCategory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const categoryData = await fetchCategories();
      const expenseData = await fetchExpenses(
        currentPage,
        searchQuery,
        fromDate,
        toDate,
        selectedCategory
      );

      setCategories(["All", ...categoryData]);
      setExpenses(expenseData.Expenses);
      setTotalPages(expenseData.pages);
      setFormCategory(categoryData);
      setTotalAmount(expenseData.totalAmount);
    };
    fetchData();
  }, [currentPage, searchQuery, fromDate, toDate, selectedCategory]);

  const [newCategory, setNewCategory] = useState(false);
  // API for fetching categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${URL}/expense/categories`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({
            status: null,
            message: "",
          });
        }, 5000);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchExpenses = async (
    page,
    searchQuery,
    fromDate,
    toDate,
    category
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${URL}/expense/category?page=${page}&limit=15&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&category=${
          category !== "All" ? category : ""
        }`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({
            status: null,
            message: "",
          });
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedCategory(item);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewCategory(false);
    reset();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewCategory(false);
    reset();
  };

  // new expense post form functions
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("date", data.date);
    formData.append("amount", data.amount);
    formData.append("description", data.description);
    formData.append("image", expenseImg);

    try {
      const res = await axios.post(`${URL}/expense/add`, formData, {
        headers: {
          Authorization: token,
        },
      });
      setNewCategory(false);
      reset();
      setExpenseImg("");
      setIsModalOpen(false);
      // setIsSuccess()
      const expenseData = await fetchExpenses(
        currentPage,
        searchQuery,
        fromDate,
        toDate,
        selectedCategory
      );

      // console.log(expenseData);
      setExpenses(expenseData.Expenses);
      setTotalPages(expenseData.pages); // Update total pages if necessary
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
    }
  };

  // image
  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.id = "imageUpload";
    input.accept = "image/*";
    input.className = "hidden";
    input.onchange = handleImageChange;
    input.click();
  };
  // image on change function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpenseImg(file);
    }
  };

  const [today, setToday] = useState("");

  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    setToday(`${year}-${month}-${day}`);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      {isSuccess && <SuccessMessage Message="New Expenses added" />}
      <div className="flex items-end justify-between px-3 space-x-11">
        <div className="text-xl font-bold">Expense</div>
        {/* download and print */}
        {/* <div className="flex space-x-5">
          <MdOutlineFileDownload
            size={25}
            className="text-lavender--600 cursor-pointer"
          />
          <IoMdPrint size={25} className="text-lavender--600 cursor-pointer" />
        </div> */}
      </div>

      {/* filter options and table */}
      <div className="mx-1 mt-3 h-full bg-white rounded-xl shadow-md p-2">
        <div className="flex flex-wrap items-center justify-between space-x-3 space-y-3 p-4 lg:space-y-0 lg:space-x-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-0 border rounded-lg px-1 w-full lg:w-auto">
            <label htmlFor="from-date" className="text-gray-700">
              From:
            </label>
            <input
              type="date"
              id="from-date"
              className="border-0 focus:ring-0 rounded px-2 py-1"
              max={today}
              value={fromDate}
              onChange={handleFromDateChange}
            />
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-0 border rounded-lg px-1 w-full lg:w-auto">
            <label htmlFor="to-date" className="text-gray-700">
              To:
            </label>
            <input
              type="date"
              id="to-date"
              className="border-0 focus:ring-0 rounded px-2 py-1"
              max={today}
              value={toDate}
              onChange={handleToDateChange}
            />
          </div>

          <div className="w-full lg:w-auto">
            <Dropdown
              items={categories}
              onSelect={handleSelect}
              label="Category"
            />
          </div>

          {/* <span className="flex items-center border rounded-lg px-1 w-full lg:w-auto">
            <IoIosSearch />
            <input
              type="text"
              placeholder={`Search....`}
              className="border-0 flex-grow focus:ring-0"
              value={searchQuery}
              onChange={handleSearch}
            />
          </span> */}

          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
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
              className="block w-54 py-1 ps-8 text-sm text-gray-900 rounded bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="w-full lg:w-auto">
            <button
              onClick={handleOpenModal}
              className="bg-purple-500 flex items-center gap-2 text-white rounded-lg px-5 py-2 w-full lg:w-auto"
            >
              <FaPlus /> Add Expense
            </button>
          </div>
        </div>

        <ExpenseTable expenses={expenses} loading={loading} />

        {totalAmount ? (
          <div className="w-1/2 mx-auto pt-10">
            <h6 className="text-end lg:text-xl font-bold">
              Total Amount :{" "}
              <span className="text-lavender--600 text-2xl">{totalAmount}</span>
            </h6>
          </div>
        ) : null}
        {/* <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        /> */}
        
<div className="flex items-center  justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${
              currentPage
                ? "bg-lavender--600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {currentPage}
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-3 space-x-2 rounded right-10 ">
  <span  className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{totalPages}</span>
 </span>
 <span
  onClick={() => setCurrentPage(totalPages)}
  className={`${totalPages === currentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
>
  Last Page
</span>
 </div>
        </div>
      </div>

      {/* NEW EXPENSE FORM MODAL */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Date
              </label>
              <input
                defaultValue={date}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="flex items-center justify-between text-lg font-medium text-gray-700">
                Category{" "}
                <span
                  className="text-sm underline text-purple-500 cursor-pointer"
                  onClick={() => setNewCategory(true)}
                >
                  Add category
                </span>
              </label>
              {newCategory || formCategory.length === 0 ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register("category", {
                    required: "Category is required",
                  })}
                />
              ) : (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register("category", {
                    required: "Category is required",
                  })}
                >
                  <option value="">Select a category</option>
                  {formCategory.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Amount
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message:
                      "Amount should be a number with up to two decimal places",
                  },
                })}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Image
              </label>
              <div
                className={`w-full border border-dashed border-lavender--600 p-2 rounded-md text-center underline  cursor-pointer ${
                  expenseImg
                    ? "border-green-500 text-green-500"
                    : "border-lavender--600  text-lavender--600"
                }`}
                onClick={handleUploadClick}
              >
                {expenseImg ? "Uploaded" : " Upload Image"}
              </div>
              <input
                id="imageUpload"
                type="file"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="">
            <label className="block text-lg font-medium text-gray-700 my-3">
              Description
            </label>
            <textarea
              className="border w-full h-32 rounded-lg"
              {...register("description")}
            />
          </div>
          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={handleCloseModal}
            >
              Discard
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-lavender--600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  );
}
