import React, { useEffect, useState } from 'react'
import { FaEye } from 'react-icons/fa';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';

export const ChurchExpense = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const token = window.sessionStorage.getItem("token");
    const [expenses, setExpenses] = useState([]);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusAction, setStatusAction] = useState(""); // "accepted" or "rejected"



    // Fetch expenses on component mount
    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${URL}/expenses/all`, {
                headers: { Authorization: token }
            });

            if (res.data.status === "Success") {
                setExpenses(res.data.data || []);
            } else {
                setResponse({ status: "Failed", message: res.data.message });
            }
        } catch (err) {
            setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to fetch expenses" });
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Function to open modal with selected expense
    const openExpenseModal = (expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleAction = async (status) => {
        try {
            const res = await axios.patch(
                `${URL}/expenses/action/${selectedExpense._id}`,
                { approval_status: status },
                { headers: { Authorization: token } }
            );

            if (res.data.status === "Success") {
                setResponse({ status: "Success", message: res.data.message });
                setIsModalOpen(false);
                fetchExpenses();
            } else {
                setResponse({ status: "Failed", message: res.data.message });
            }
        } catch (err) {
            setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update approva status" });
        }
    };

    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Expense</h1>
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
                            />
                        </div>
                    </div>


                </div>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Expense Name</th>
                                <th className="p-2 text-center">Amount</th>
                                <th className="p-2 text-center">Expense Type</th>
                                <th className="p-2 text-center">Expense From</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Approval Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? (
                                expenses.map((exp, index) => (
                                    <tr key={exp._id}>
                                        <td className="p-2 text-center">{index + 1}</td>
                                        <td className="p-2 text-center">{exp.expensename}</td>
                                        <td className="p-2 text-center">₹ {exp.expenseamount}</td>
                                        <td className="p-2 text-center">{exp.type_of_expense}</td>
                                        <td className="p-2 text-center">
                                            {exp.addedBy ? `${exp.addedBy} (${exp.addedByRole || "N/A"})` : "N/A"}
                                        </td>
                                        <td className="p-2 text-center">{exp.status}</td>
                                        <td className="p-2 text-center">{exp.approval_status}</td>
                                        <td className="p-2 text-center">
                                            <FaEye
                                                size={18}
                                                className="text-lavender--600 cursor-pointer m-auto"
                                                onClick={() => openExpenseModal(exp)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-2 text-center text-gray-500">
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
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Expense Details"
            >
                {selectedExpense ? (
                    <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                        {[
                            { label: "Name", value: selectedExpense.expensename },
                            { label: "Amount", value: `₹${selectedExpense.expenseamount}` },
                            {
                                label: "Type",
                                value:
                                    selectedExpense.type_of_expense === "regular_expense"
                                        ? "Regular Expense"
                                        : "Irregular Expense",
                            },
                            {
                                label: "Status",
                                value: (
                                    <span
                                        className={
                                            selectedExpense.status === "unpaid"
                                                ? "text-red-600 font-semibold"
                                                : "text-green-600 font-semibold"
                                        }
                                    >
                                        {selectedExpense.status === "unpaid" ? "Unpaid" : "Paid"}
                                    </span>
                                ),
                            },

                            { label: "Description", value: selectedExpense.expensedesc || "N/A" },
                            {
                                label: "Created Date",
                                value: moment(selectedExpense.createdAt).format("DD/MM/YYYY")
                            },

                            { label: "Added By (ID)", value: selectedExpense.addedBy || "N/A" },
                            {
                                label: "Role",
                                value: selectedExpense.addedByRole
                                    ? selectedExpense.addedByRole === "accountant" ? "Accountant" :
                                        selectedExpense.addedByRole === "treasurer" ? "Treasurer" :
                                            selectedExpense.addedByRole.charAt(0).toUpperCase() + selectedExpense.addedByRole.slice(1)
                                    : "N/A"
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
                    <p>Loading...</p>
                )}

                {selectedExpense && (
                    <div className="flex justify-end mt-4 gap-3">
                        {selectedExpense.approval_status === "waiting" ? (
                            <>
                                <button
                                    onClick={() => {
                                        setStatusAction("accepted");
                                        setIsStatusModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusAction("rejected");
                                        setIsStatusModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                                >
                                    Reject
                                </button>
                            </>
                        ) : (
                            <span
                                className={`px-4 py-2 rounded-md font-semibold ${selectedExpense.approval_status === "accepted"
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                    }`}
                            >
                                {selectedExpense.approval_status.charAt(0).toUpperCase() + selectedExpense.approval_status.slice(1)}
                            </span>
                        )}
                    </div>
                )}


                {isStatusModalOpen && selectedExpense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>

                        <div className="relative w-full max-w-md max-h-full p-4 z-50">
                            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    ✕
                                </button>

                                <div className="p-4 text-center md:p-5">
                                    <svg
                                        className={`w-12 h-12 mx-auto mb-4 ${statusAction === "rejected" ? "text-red-500" : "text-green-600"
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

                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                        Do you want to{" "}
                                        <span
                                            className={`font-semibold ${statusAction === "rejected" ? "text-red-500" : "text-green-600"
                                                }`}
                                        >
                                            {statusAction}
                                        </span>{" "}
                                        this expense: <span className="font-semibold">{selectedExpense.expensename}</span>?
                                    </h3>

                                    <button
                                        onClick={() => setIsStatusModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        No
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                await handleAction(statusAction);
                                                setIsStatusModalOpen(false);
                                            } catch (err) {
                                                setIsStatusModalOpen(false);
                                            }
                                        }}
                                        className={`text-white ms-3 ${statusAction === "rejected"
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



            </Modal>


            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}

        </>
    )
}
