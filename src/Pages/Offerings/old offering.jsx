import React, { useEffect, useState } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoIosSearch, IoMdPrint } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Dropdown from "../../Components/Helpers/DropDown";
import OfferingTable from "../../Components/Offerings/OfferingTable";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import Pagination from "../../Components/Helpers/Pagination";
import { MdVerified } from "react-icons/md";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import moment from "moment";


export default function OfferingList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [Offerings, setOfferings] = useState([]);
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [memberError, setMemberError] = useState("");
  const [checkingMember, setCheckingMember] = useState(false);
  // const [checking_NO_Name_MemberID, setChecking_NO_Name_MemberID] = useState(true);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(null);
  const token = window.sessionStorage.getItem("token");
  console.log(category);
  

 
  const checking_NO_Name_MemberID = category === "NO_Name_Offerings" ?  false:true ;
  // console.log(checking_NO_Name_MemberID);

const MemberDisable= checking_NO_Name_MemberID===false?true:false;
// console.log(MemberDisable);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: getCurrentDate(),
    },
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      const offeringData = await fetchOfferings(
        CurrentPage,
        searchQuery,
        fromDate,
        toDate
      );
      setOfferings(offeringData?.offerings);
      setTotalPages(offeringData.pages);
      setTotalAmount(offeringData.totalAmount);
    };
    fetchData();
  }, [category, CurrentPage, searchQuery, fromDate, toDate]);

  useEffect(() => {
    const memberId = watch("member_id");
    if (memberId) {
      checkMember(memberId);
    }
  }, [watch("member_id")]);

  const checkMember = async (memberId) => {
    if (memberId.length > 11) {
      setCheckingMember(true);
      setMemberError("");
      try {
        const response = await axios.get(
          `${URL}/offerings/member/verify/${memberId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        if (response.data) {
          setValue("member_name", response.data.member.member_name);
          setMemberDetails(response.data);
        } else {
          setMemberError("Member ID does not exist.");
          setValue("member_name", "");
          setMemberDetails(null);
        }
      } catch (error) {
        setMemberError("Member not found.");
        setValue("member_name", "");
        setMemberDetails(null);
        // if (error.response.status === 401) {
        //   window.sessionStorage.clear();
        //   navigate("/");
        // }
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
        setCheckingMember(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  
  const fetchOfferings = async (page, searchQuery, fromDate, toDate) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${URL}/offerings/category?category=${category}&page=${page}&limit=${15}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}`,
        {
          headers: {
            Authorization: token,
          },
        },
       
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching offerings:", error);
      setOfferings([]);
      // if (error.response.status === 401) {
      //   window.sessionStorage.clear();
      //   navigate("/");
      // }
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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setValue("date", today);
  }, [setValue]);

  const handleOpenModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);
    setIsModalOpen(true);
    reset();
  };

  const handleCloseModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setMemberDetails(null);
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (formData) => {
    formData.category = category;

    try {
      const res = await axios.post(`${URL}/offerings/add`, formData, {
        headers: {
          Authorization: token,
        },
      });
      console.log(res);
      reset();
      setIsModalOpen(false);
      const offeringData = await fetchOfferings(
        CurrentPage,
        searchQuery,
        fromDate,
        toDate
      );
      setOfferings(offeringData.offerings);
      setTotalAmount(offeringData.totalAmount);
      setTotalPages(offeringData.pages);
    } catch (error) {
      console.log(error);
      setServerError(error?.response?.data?.message);
      if (error.response.status === 401) {
        window.sessionStorage.clear();
        navigate("/");
      }
    }
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    
  };

  const today = new Date().toISOString().split("T")[0];


const handleDownloadPDF = async () => {
  try {
    const response = await axios.get(
      `${URL}/offerings/category?category=${category}&search=${searchQuery}&fromdate=${fromDate}&todate=${toDate}&download=true`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    
    const Data = response.data.offerings;

    // Handle table headers based on conditions
    const tableHeading = [
      "SI.No.",
      category !== "NO_Name_Offerings" ? "Member ID" : "", // Add empty string for Member ID when not needed
      category !== "NO_Name_Offerings" ? "Member Name" : "Name", 
      "Member Tamil Name",
      "Date",
      "Amount",
      "Description",
    ];

    const doc = new jsPDF();

    const headers = [tableHeading];

    // Handle table rows based on conditions
    const rows = Data.map((item, index) => [
      index + 1,
      category !== "NO_Name_Offerings" ? item.member_id : "", // Always provide a column, use empty string if Member ID is not needed
      item.member_name,
      item.member_tamil_name,
      moment(item.date).format('YYYY-MM-DD'),
      item.amount,
      item.description,
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      styles: { halign: 'center' }, // Horizontally align text to center
      startY: 20, // Starting Y position for the table
    });

    doc.save(`${category} Reports.pdf`);

    console.log("PDF generated successfully!");

  } catch (error) {
    console.error("Error during API call:", error);
  }
};

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 space-y-4 sm:space-y-0 sm:space-x-11">
        <div className="text-xl font-bold capitalize">{category}</div>
        {/* <div className="flex space-x-5">
          <MdOutlineFileDownload
            size={25}
            className="text-lavender--600 cursor-pointer"
          />
          <IoMdPrint size={25} className="text-lavender--600 cursor-pointer" />
        </div> */}
      </div>

      <div className="mx-1 mt-3 h-full p-5 bg-white rounded-xl shadow-md ">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center space-x-3 space-y-3 p-4 lg:space-y-0 lg:space-x-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 border rounded-lg px-1 w-full lg:w-auto">
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

            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 border rounded-lg px-1 w-full lg:w-auto">
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

            {/* <span className="flex items-center border rounded-lg px-1 w-full lg:w-auto">
              <IoIosSearch />
              <input
                type="text"
                placeholder="Search...."
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
          </div>
          <div className="w-full flex gap-x-4 lg:w-auto">
         { fromDate && toDate? <button
              onClick={handleDownloadPDF}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>:null}
            <button
              onClick={handleOpenModal}
              className="bg-purple-500 flex items-center gap-2 text-white rounded-lg px-5 py-2 w-full lg:w-auto"
            >
              <FaPlus /> Add Offering
            </button>
          </div>
        </div>

        <OfferingTable offerings={Offerings} loading={loading} Data={MemberDisable} />

        {totalAmount && (
          <div className="w-1/2 mx-auto pt-10">
            <h6 className="text-end lg:text-xl font-bold">
              Total Amount :{" "}
              <span className="text-lavender--600 text-2xl">{totalAmount}</span>
            </h6>
          </div>
        )}

        {/* <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      
        /> */}

<div className="flex items-center  justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${
              CurrentPage
                ? "bg-lavender--600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {CurrentPage}
          </button>
          <button
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-3 space-x-2 rounded right-10 ">
  <span  className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
 </span>
 <span
  onClick={() => setCurrentPage(TotalPages)}
  className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
>
  Last Page
</span>
 </div>
        </div>
      </div>


      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Offering"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {memberDetails?.member?.member_photo && (
            <div className="flex justify-end">
              <img
                src={`data:image/*;base64,${memberDetails?.member?.member_photo}`}
                alt="Profile Image"
                className="w-[50px] h-[50px] rounded"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={MemberDisable ? 'hidden' : ''}>
              <label
                htmlFor="member_id"
                className="block text-lg font-medium text-gray-700"
              >
                Member Id
              </label>
              <input
  id="member_id"
  type="text"
  placeholder="Enter Member Id"
  disabled={MemberDisable}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
  {...(!MemberDisable && register("member_id", {
    required: "Member Id is required",
  }))}
/>
            
              {checkingMember && (
                <p className="text-blue-500 text-sm">Checking...</p>
              )}
              {errors.member_id && (
                <p className="text-red-500 text-sm">
                  {errors.member_id.message}
                </p>
              )}
              {memberDetails?.message && (
                <p className="text-green-500 text-sm flex items-center gap-2">
                  {memberDetails?.message} <MdVerified />
                </p>
              )}
              {!errors.member_id && memberError && (
                <p className="text-red-500 text-sm">{memberError}</p>
              )}
              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="member_name"
                className="block text-lg font-medium text-gray-700"
              >
              {MemberDisable ? 'Name' : ' Member Name'}  
              </label>
              <input
                id="member_name"
                type="text"
                disabled={checking_NO_Name_MemberID}
                placeholder= {MemberDisable ? 'Enter Name' : 'Enter Member Name '}  
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("member_name", {
                  required: "Invalid member ID. Please check and try again.",
                })}
              />
              {errors.member_name && (
                <p className="text-red-500 text-sm">
                  {errors.member_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-lg font-medium text-gray-700"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-lg font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                id="amount"
                type="text"
                placeholder="Rs"
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
          </div>

          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-lg font-medium text-gray-700"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="Enter Description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              {...register("description")}
            />
          </div>

          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-red-500 focus:outline-none focus:ring-0 sm:text-sm"
              onClick={handleCloseModal}
            >
              Discard
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-0 sm:text-sm"
            >
              Save
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
