import React, { useEffect, useState } from 'react'
import { FaEye, FaLock, FaLockOpen, FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from 'react-hook-form';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import { IoMdCloseCircle } from 'react-icons/io';
import moment from 'moment';
import { jwtDecode } from "jwt-decode";

export const RegularExpense = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTextarea, setShowTextarea] = useState(false);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [expenses, setExpenses] = useState([]);
    const token = window.sessionStorage.getItem("token");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isInactiveOpen, setIsInactiveOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusAction, setStatusAction] = useState(null);
    const [user, setUser] = useState({ memberId: "", roles: [] });



    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    memberId: decoded.member_id,
                    roles: decoded.roles || [],
                });
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, [token]);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(
                `${URL}/regular-expenses/all?page=${CurrentPage}&limit=10&search=${searchTerm}`,
                { headers: { Authorization: token } }
            );
            setExpenses(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [CurrentPage, searchTerm]); // refetch when page or search changes



    // ✅ Form submit handler
    const onSubmit = async (data) => {
        try {
            const res = await axios.post(`${URL}/regular-expenses/add`, data, {
                headers: { Authorization: token },
            });
            setResponse({ status: "Success", message: res.data.message });
            fetchExpenses(); // refresh table
            reset(); // clear form
            setIsModalOpen(false);
        } catch (error) {
            setResponse({
                status: "Failed",
                message: error.response?.data?.message || "Something went wrong",
            });
        }
    };
    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Regular Expense</h1>
                    <div className="">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search
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
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // reset to page 1 on new search
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Regular Expense
                    </button>
                    {/* {user.roles.includes("accountant") && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Add Regular Expense
                        </button>
                    )} */}


                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Expense Name</th>
                                <th className="p-2 text-center">Amount</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? (
                                expenses.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td className="p-2 text-center">{(CurrentPage - 1) * 10 + (index + 1)}</td>
                                        <td className="p-2 text-center">{item.expensename}</td>
                                        <td className="p-2 text-center">₹ {item.expenseamount}</td>
                                        <td className="p-2 text-center">
                                            <span
                                                className={`text-l font-bold ${item.status === "active" ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {item.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>


                                        <td className="p-2 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                {/* 👁 View Icon */}
                                                <FaEye
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedExpense(item);
                                                        setIsViewOpen(true);
                                                    }}
                                                />

                                                {/* 🔒 Lock / Unlock based on status */}
                                                {/* {item.status === "active" ? (
                                                    <FaLock
                                                        size={18}
                                                        className="text-red-500 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedExpense(item);
                                                            setStatusAction("inactive");  // tell modal what action
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <FaLockOpen
                                                        size={18}
                                                        className="text-green-600 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedExpense(item);
                                                            setStatusAction("active"); // tell modal what action
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                    />
                                                )} */}
                                                {/* 🔒 Lock / Unlock based on status */}
                                                {item.status === "active" ? (
                                                    <FaLock
                                                        size={18}
                                                        className={`${user.roles.includes("accountant")
                                                            ? "text-red-500 cursor-pointer"
                                                            : "text-gray-400 cursor-not-allowed"
                                                            }`}
                                                        onClick={() => {
                                                            if (!user.roles.includes("accountant")) return; // prevent action
                                                            setSelectedExpense(item);
                                                            setStatusAction("inactive");
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <FaLockOpen
                                                        size={18}
                                                        className={`${user.roles.includes("accountant")
                                                            ? "text-green-600 cursor-pointer"
                                                            : "text-gray-400 cursor-not-allowed"
                                                            }`}
                                                        onClick={() => {
                                                            if (!user.roles.includes("accountant")) return; // prevent action
                                                            setSelectedExpense(item);
                                                            setStatusAction("active");
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                    />
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-4">
                                        No expenses found
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
                    <button
                        onClick={() => setCurrentPage(CurrentPage - 1)}
                        disabled={CurrentPage === 1}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${CurrentPage
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
                    <div className="absolute flex px-5 space-x-2 rounded right-1 ">
                        <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Regular Expense">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="hidden"
                        value="regular_expense"
                        {...register("type_of_expense")}
                    />
                    <input
                        type="hidden"
                        value="active"
                        {...register("status")}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expense Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                {...register("expensename", { required: "Item is required" })}
                            />
                            {errors.expensename && <p className="text-sm text-red-500">{errors.expensename.message}</p>}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                placeholder="₹ Enter amount"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                {...register("expenseamount", { required: "Date is required" })}
                            />
                            {errors.expenseamount && <p className="text-sm text-red-500">{errors.expenseamount.message}</p>}
                        </div>


                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="text-lg fw-medium text-gray-700">
                                {showTextarea && <label className="mb-0">Description</label>}
                            </div>

                            <div className="form-check mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="showDesc"
                                    checked={showTextarea}
                                    onChange={() => setShowTextarea(!showTextarea)}
                                />
                                <label className="form-check-label" htmlFor="showDesc">
                                    Add Description
                                </label>
                            </div>
                        </div>

                        {showTextarea && (
                            <textarea
                                rows={4}
                                className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                                placeholder="Enter your description here..."
                                {...register("expensedesc")}
                            />
                        )}
                    </div>

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

            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Expense Details"
            >
                {selectedExpense ? (
                    <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                        {[
                            { label: "Expense Name", value: selectedExpense.expensename },
                            { label: "Amount", value: `₹ ${selectedExpense.expenseamount}` },
                            { label: "Description", value: selectedExpense.expensedesc || "N/A" },
                            {
                                label: "Type",
                                value:
                                    selectedExpense.type_of_expense === "regular_expense"
                                        ? "Regular Expense"
                                        : selectedExpense.type_of_expense,
                            },

                            {
                                label: "Status",
                                value: (
                                    <span
                                        className={
                                            selectedExpense.status === "active"
                                                ? "text-green-600 font-semibold"
                                                : "text-red-600 font-semibold"
                                        }
                                    >
                                        {selectedExpense.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                ),
                            },

                            {
                                label: "Created Date",
                                value: moment(selectedExpense.createdAt).format("DD-MM-YYYY "),
                            },
                            {
                                label: "Updated Date",
                                value: moment(selectedExpense.updatedAt).format("DD-MM-YYYY"),
                            },
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
                ) : (
                    <p className="p-4">Loading...</p>
                )}
            </Modal>

            {isStatusModalOpen && selectedExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>

                    {/* Modal content */}
                    <div className="relative w-full max-w-md max-h-full p-4 z-50">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setIsStatusModalOpen(false)}
                                className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                ✕
                            </button>

                            <div className="p-4 text-center md:p-5">
                                {/* Icon */}
                                <svg
                                    className={`w-12 h-12 mx-auto mb-4 ${statusAction === "inactive" ? "text-red-500" : "text-green-600"
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>

                                {/* Message */}
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    Do you want to{" "}
                                    <span
                                        className={`font-semibold ${statusAction === "inactive" ? "text-red-500" : "text-green-600"
                                            }`}
                                    >
                                        {statusAction}
                                    </span>{" "}
                                    this expense:
                                    <span className="font-semibold"> {selectedExpense.expensename}</span>?
                                </h3>

                                {/* Buttons */}
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                                >
                                    No
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            await axios.put(
                                                `${URL}/regular-expenses/update/${selectedExpense._id}`,
                                                { status: statusAction }, // toggle status
                                                { headers: { Authorization: token } }
                                            );
                                            setIsStatusModalOpen(false);
                                            fetchExpenses(); // refresh list
                                            setResponse({
                                                status: "Success",
                                                message: `Expense ${statusAction}d successfully`,
                                            });
                                        } catch (error) {
                                            setResponse({
                                                status: "Failed",
                                                message: error.response?.data?.message || "Something went wrong",
                                            });
                                        }
                                    }}
                                    className={`text-white ms-3 ${statusAction === "inactive"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                        } font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5`}
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}





            {Response.status && (
                Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                )
            )}
        </>
    )
}
