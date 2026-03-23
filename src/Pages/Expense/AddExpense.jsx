import React, { useEffect, useRef, useState } from 'react'
import { FaAmazonPay, FaEye, FaPlus } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { URL } from "../../App";
import { jwtDecode } from "jwt-decode";
import { MdOutlinePayment } from 'react-icons/md';
import moment from 'moment';

export const AddExpense = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [regularOptions, setRegularOptions] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const token = window.sessionStorage.getItem("token");
    const [showTextarea, setShowTextarea] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [memberIdSearch, setMemberIdSearch] = useState("");
    const [memberNameSearch, setMemberNameSearch] = useState("");
    const [dropdownById, setDropdownById] = useState([]);
    const [dropdownByName, setDropdownByName] = useState([]);
    const [isMember, setIsMember] = useState(true); // ✅ default true = member


    const [user, setUser] = useState({ memberId: "", roles: [] });
    const [currentRole, setCurrentRole] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    memberId: decoded.member_id,
                    roles: decoded.roles || [],
                });

                const storedRole = sessionStorage.getItem("role");
                if (storedRole && decoded.roles.includes(storedRole)) {
                    setCurrentRole(storedRole);
                } else {
                    const defaultRole = decoded.roles?.[0] || "";
                    setCurrentRole(defaultRole);
                    sessionStorage.setItem("role", defaultRole);
                }
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);



    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedSearchById = useRef(
        debounce(async (val) => {
            if (!val) return setDropdownById([]);
            try {
                const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
                    headers: { Authorization: token },
                });
                setDropdownById(res.data || []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setDropdownById([{ member_id: "none", member_name: "No members found", mobile_number: "" }]);
                } else {
                    setDropdownById([]);
                }
            }
        }, 300)
    ).current;

    const debouncedSearchByName = useRef(
        debounce(async (val) => {
            if (!val) return setDropdownByName([]);
            try {
                const res = await axios.get(`${URL}/member-search?name=${val}`, {
                    headers: { Authorization: token },
                });
                setDropdownByName(res.data || []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setDropdownByName([{ member_id: "none", member_name: "No members found", mobile_number: "" }]);
                } else {
                    setDropdownByName([]);
                }
            }
        }, 300)
    ).current;

    useEffect(() => {
        if (watch("type_of_expense") === "regular_expense") {
            const fetchRegularOptions = async () => {
                try {
                    const res = await axios.get(`${URL}/regular-expenses/active-regular`, {
                        headers: { Authorization: token },
                    });
                    setRegularOptions(res.data.data || []);
                } catch (err) {
                    console.error("Failed to load active regular expenses:", err);
                    setRegularOptions([]);
                }
            };
            fetchRegularOptions();
        } else {
            setRegularOptions([]);
            setSelectedExpense(null);
        }
    }, [watch("type_of_expense")]);



    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${URL}/expenses/all`, {
                headers: { Authorization: token },
            });
            setExpenses(res.data.data || []);
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to fetch expenses",
            });
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const onSubmit = async (data) => {
        try {
            if (watch("type_of_expense") === "regular_expense" && selectedExpense) {
                data.regularExpense = {
                    id: selectedExpense._id,
                    name: selectedExpense.expensename,
                };
                data.expensename = selectedExpense.expensename;
                data.expenseamount = selectedExpense.expenseamount;
            }

            if (!user.memberId || !currentRole) {
                setResponse({ status: "Failed", message: "User ID or role missing" });
                return;
            }

            data.addedBy = user.memberId;
            data.addedByRole = currentRole;

            const res = await axios.post(`${URL}/expenses/add`, data, {
                headers: { Authorization: token },
            });

            setResponse({ status: res.data.status, message: res.data.message });

            if (res.data.status === "Success") {
                setIsModalOpen(false);
                reset();
                fetchExpenses();
            }
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to add expense",
            });
        }
    };
    const handlePayExpense = async (expenseId, formData) => {
  try {
    const res = await axios.put(`${URL}/expenses/pay/${expenseId}`, formData, {
                headers: { Authorization: token },
            });

    if (res.data.status === "Success") {
    //   SuccessMessage("Expense marked as paid ✅");
      setIsPayModalOpen(false);
      // optionally refresh expenses
      fetchExpenses();
    } else {
    //   FailedMessage(res.data.message || "Failed to mark expense as paid ❌");
    }
  } catch (error) {
    console.error("Pay Expense Error:", error);
    // FailedMessage(error.response?.data?.message || "Server error");
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
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                        >
                            <option value="All">All</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Approval Status:</label>
                        <select
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                        >
                            <option value="All">All</option>
                            <option value="accepted">Accepted</option>
                            <option value="waiting">Waiting</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Expense
                    </button>

                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Expense Name</th>
                                <th className="p-2 text-center">Amount</th>
                                <th className="p-2 text-center">Expense Type</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Approval Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? expenses.map((exp, idx) => (
                                <tr key={exp._id} className="text-center border-t">
                                    <td className="p-2">{idx + 1}</td>
                                    <td className="p-2">{exp.expensename}</td>
                                    <td className="p-2">₹ {exp.expenseamount}</td>
                                    <td className="p-2">{exp.type_of_expense.replace("_", " ")}</td>
                                    <td className="p-2">{exp.status}</td>
                                    <td className="p-2">{exp.approval_status}</td>
                                    <td className="p-2 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            {/* View Icon */}
                                            <FaEye
                                                size={18}
                                                className="text-lavender--600 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedExpense(exp);   // 👈 set the clicked expense
                                                    setIsViewModalOpen(true);  // 👈 open the modal
                                                }}
                                            />

                                            {exp.approval_status === "accepted" && exp.status !== "paid" && (
                                                <FaAmazonPay
                                                    size={24}
                                                    title="Pay"
                                                    className="text-green-600 cursor-pointer hover:scale-110 transition"
                                                    onClick={() => {
                                                        setSelectedExpense(exp);   // store the current expense
                                                        setIsPayModalOpen(true);   // open the pay modal
                                                    }}
                                                />
                                            )}


                                        </div>
                                    </td>

                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-2 text-center">No expenses found</td>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                        {/* Expense Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expense Type
                            </label>
                            <select
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                {...register("type_of_expense", { required: "Expense type is required" })}
                            >
                                <option value="">-- Select Expense Type --</option>
                                <option value="regular_expense">Regular</option>
                                <option value="irregular_expense">Irregular</option>
                            </select>
                            {errors.type_of_expense && (
                                <p className="text-sm text-red-500">{errors.type_of_expense.message}</p>
                            )}
                        </div>

                        {/* Expense Name (conditional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expense Name
                            </label>

                            {watch("type_of_expense") === "regular_expense" ? (
                                <select
                                    value={selectedExpense?._id || ""}
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    onChange={(e) => {
                                        const selected = regularOptions.find(
                                            (opt) => opt._id === e.target.value
                                        );
                                        setSelectedExpense(selected);
                                        setValue("expensename", selected?.expensename || "");
                                        setValue("expenseamount", selected?.expenseamount || "");
                                        setValue("regularExpenseId", selected?._id || "");
                                    }}
                                >
                                    <option value="">-- Select Regular Expense --</option>
                                    {regularOptions.length > 0 ? (
                                        regularOptions.map((exp) => (
                                            <option key={exp._id} value={exp._id}>
                                                {exp.expensename}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No active expenses</option>
                                    )}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Enter expense name"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    {...register("expensename", { required: "Expense name is required" })}
                                />
                            )}


                            {errors.expensename && (
                                <p className="text-sm text-red-500">{errors.expensename.message}</p>
                            )}
                        </div>

                        {/* Amount (auto-filled if regular) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                placeholder="₹ Enter amount"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                {...register("expenseamount", { required: "Amount is required" })}
                                value={watch("expenseamount") || ""}
                                readOnly={watch("type_of_expense") === "regular_expense"} // lock amount for regular
                            />
                            {errors.expenseamount && (
                                <p className="text-sm text-red-500">{errors.expenseamount.message}</p>
                            )}
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


            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="View Expense"
            >
                {selectedExpense && (
                    <div className="flex flex-col  ps-5 w-full max-w-4xl space-y-4">
                        {[
                            { label: "Expense Name", value: selectedExpense.expensename },
                            { label: "Amount", value: `₹${selectedExpense.expenseamount}` },
                            { label: "Description", value: selectedExpense.expensedesc || "N/A" },
                            { label: "Type of Expense", value: selectedExpense.type_of_expense },
                            { label: "Status", value: selectedExpense.status },
                            { label: "Approval Status", value: selectedExpense.approval_status },
                            { label: "Added By", value: selectedExpense.addedBy },
                            { label: "Added By Role", value: selectedExpense.addedByRole },
                            {
                                label: "Created At",
                                value: moment(selectedExpense.createdAt).format("DD-MM-YYYY"),
                            },
                        ].map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 ">
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
                )}
            </Modal>


            {/* Pay Modal */}
            <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Add Expense Payment">
                {selectedExpense && (
                    <>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = {
                                paidAmount: e.target.expense_pay_amount.value,
                            };

                            if (isMember) {
                                formData.memberId = watch("memberId");
                                formData.memberName = watch("memberName");
                                formData.memberPhone = watch("phone");
                            } else {
                                formData.nonMemberName = watch("nonMemberName");
                                formData.nonMemberPhone = watch("nonMemberPhone");
                                formData.nonMemberPlace = watch("nonMemberPlace");
                            }

                            handlePayExpense(selectedExpense._id, formData);
                        }}>
                            <div className="flex flex-col   w-full max-w-4xl space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { label: "Expense Name", value: selectedExpense.expensename },
                                        { label: "Amount", value: `₹${selectedExpense.expenseamount}` },
                                        { label: "Type of Expense", value: selectedExpense.type_of_expense },
                                        { label: "Approval Status", value: selectedExpense.approval_status },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-2 items-center gap-2   border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="text-lg font-semibold text-gray-700 dark:text-white">
                                                {item.label}
                                            </div>
                                            <div
                                                className={`text-base ${item.value
                                                    ? "text-gray-800 dark:text-gray-300"
                                                    : "text-yellow-500 font-semibold"
                                                    }`}
                                            >
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg bg-gray-50 mt-4">

                                {/* Toggle */}
                                <div className="mb-4 flex justify-between">
                                    <h4>Spend By</h4>
                                    <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                                        {/* Highlight background */}
                                        <div
                                            className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                            style={{
                                                width: "calc(50% - 0.25rem)",
                                                transform: isMember ? "translateX(0)" : "translateX(100%)",
                                            }}
                                        />
                                        {/* Member button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMember(true);
                                                reset({
                                                    memberId: "",
                                                    memberName: "",
                                                    phone: "",
                                                });
                                                setMemberIdSearch("");
                                                setMemberNameSearch("");
                                                setDropdownById([]);
                                                setDropdownByName([]);
                                            }}

                                            className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
                                            ${isMember ? "text-white" : "text-gray-700"}`}
                                        >
                                            Member
                                        </button>
                                        {/* Non-Member button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMember(false);
                                                reset({
                                                    nonMemberName: "",
                                                    nonMemberPhone: "",
                                                    nonMemberAadhar: "",
                                                });
                                                setMemberIdSearch("");
                                                setMemberNameSearch("");
                                                setDropdownById([]);
                                                setDropdownByName([]);
                                            }}
                                            className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
                                            ${!isMember ? "text-white" : "text-gray-700"}`}
                                        >
                                            Non-Member
                                        </button>
                                    </div>
                                </div>

                                {/* Conditional form fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                                    {isMember ? (
                                        <>
                                            {/* Member ID */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Member ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search by ID"
                                                    value={memberIdSearch}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setMemberIdSearch(val);
                                                        debouncedSearchById(val);
                                                    }}
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>

                                            {/* Member Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Member Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search by Name"
                                                    value={memberNameSearch}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setMemberNameSearch(val);
                                                        debouncedSearchByName(val);
                                                    }}
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>

                                            {/* Phone (auto-filled) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    {...register("phone")}
                                                    value={watch("phone") || ""}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>


                                            {/* Dropdown */}
                                            {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                                                <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                                    {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                                                        <li
                                                            key={m.member_id}
                                                            className={`flex px-3 py-2 text-sm text-gray-700 ${m.member_id === "none"
                                                                ? "text-gray-500 cursor-default"
                                                                : "hover:bg-indigo-50 cursor-pointer transition"
                                                                }`}
                                                            onClick={() => {
                                                                if (m.member_id === "none") return;
                                                                setMemberIdSearch(m.member_id);
                                                                setMemberNameSearch(m.member_name);
                                                                setValue("memberId", m.member_id);
                                                                setValue("memberName", m.member_name);
                                                                setValue("phone", m.mobile_number);

                                                                setValue("present_address", m.present_address?.address || "");
                                                                setValue("aadhar_number", m.aadhar_number || "");

                                                                setDropdownById([]);
                                                                setDropdownByName([]);
                                                            }}
                                                        >
                                                            <span className="w-[250px] font-medium">
                                                                {m.member_id === "none" ? m.member_name : m.member_id}
                                                            </span>
                                                            {m.member_id !== "none" && (
                                                                <>
                                                                    <span className="flex-1">{m.member_name}</span>
                                                                    <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                                                                </>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        </>
                                    ) : (
                                        <>
                                            {/* Non-Member Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    {...register("nonMemberName")}
                                                    placeholder="Enter full name"
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>

                                            {/* Non-Member Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input
                                                    type="text"
                                                    {...register("nonMemberPhone", {
                                                        required: "Phone number is required",
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: "Phone number must be exactly 10 digits",
                                                        },
                                                    })}
                                                    placeholder="Enter 10-digit phone number"
                                                    maxLength={10}
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/\D/g, ""); // only digits
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Place</label>
                                                <input
                                                    type="text"
                                                    {...register("nonMemberPlace")}
                                                    placeholder="Enter place"
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>


                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-3 mt-6">
                                <input
                                    type="number"
                                    name="expense_pay_amount"
                                    placeholder="Enter amount"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-lavender--600 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-lavender--600 text-white rounded-md hover:bg-lavender--700"
                                >
                                    Pay
                                </button>
                            </div>
                            </form>
                    </>
                )}
            </Modal>
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
