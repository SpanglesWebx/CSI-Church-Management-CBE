import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaEye, FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import moment from 'moment';
import { CiEdit } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import Pagination from '../../Components/Helpers/Pagination';

export const MarriageHallList = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isViewModalOpen, setViewIsModalOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState(null);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [search, setSearch] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const token = window.sessionStorage.getItem("token");
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState("");
    // Incharge (member) search state
    const [inchargeIdSearch, setInchargeIdSearch] = useState("");
    const [inchargeNameSearch, setInchargeNameSearch] = useState("");
    const [inchargeDropdownById, setInchargeDropdownById] = useState([]);
    const [inchargeDropdownByName, setInchargeDropdownByName] = useState([]);
    const [inchargePhone, setInchargePhone] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const [regNo, setRegNo] = useState("");
    const [hallName, setHallName] = useState("");
    const [address, setAddress] = useState("");
    const [hallCapacity, setHallCapacity] = useState("");
    const [diningCapacity, setDiningCapacity] = useState("");
    const [halls, setHalls] = useState([]);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingHallId, setEditingHallId] = useState(null);

    const [bookedDate, setBookedDate] = useState("");
    const [selectedHallId, setSelectedHallId] = useState("");

    const [categories, setCategories] = useState([]); // current hall’s categories
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryPrice, setCategoryPrice] = useState("");

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [globalCategories, setGlobalCategories] = useState([]);
    const [addedPrices, setAddedPrices] = useState([]);


    const [newlyAddedPrices, setNewlyAddedPrices] = useState([]); // only newly added rows
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHallName, setSelectedHallName] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [selectedRow, setSelectedRow] = useState(null); // store hallId + categoryId

    const [editingRowId, setEditingRowId] = useState(null); // track which row is being edited
    const [editPriceValue, setEditPriceValue] = useState(""); // temporary input value
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false); // modal for confirming edit
    const [rowBeingEdited, setRowBeingEdited] = useState(null); // store the row object for modal
    const [editedRows, setEditedRows] = useState([]); // track rows that were edited
    const [deletedRows, setDeletedRows] = useState([]); // store hallId-categoryId of deleted rows

    // reusable pagination states
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");









    useEffect(() => {
        if (!selectedHallId) {
            setAddedPrices([]);
            setNewlyAddedPrices([]);
            return;
        }

        const hall = halls.find((h) => h._id === selectedHallId);
        if (!hall) return;

        const prices = hall.categoryPrices.map((cp) => ({
            hallId: hall._id,
            hallName: hall.hall_name,
            categoryId: cp.category._id,
            categoryName: cp.category.name,
            price: cp.price,
        }));

        setAddedPrices(prices); // load existing
        setNewlyAddedPrices([]); // reset newly added
    }, [selectedHallId]);





    const fetchHalls = async (page = CurrentPage, term = search) => {
        try {
            const res = await axios.get(`${URL}/marriage-halls`, {
      headers: { Authorization: token },
      params: {
        page,
        limit: rowsPerPage,          // ✅ dynamic
        search: term || undefined,
      },
    });
            setHalls(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error(err);
            setHalls([]);
        }
    };

useEffect(() => {
  fetchHalls(CurrentPage, search);
}, [CurrentPage, search, rowsPerPage]);


    const handleSave = async () => {
        try {
            const payload = {
                reg_no: regNo,
                hall_name: hallName,
                address,
                facilities: tags,
                hall_capacity: hallCapacity,
                dining_capacity: diningCapacity,
            };

            const res = await axios.post(`${URL}/marriage-halls`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message });
            setIsModalOpen(false);
            fetchHalls(); // refresh list
            // reset form
            setRegNo("");
            setHallName("");
            setAddress("");
            setHallCapacity("");
            setDiningCapacity("");
            setTags([]);
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                reg_no: regNo,
                hall_name: hallName,
                address,
                facilities: tags,
                hall_capacity: hallCapacity,
                dining_capacity: diningCapacity,
            };

            const res = await axios.put(`${URL}/marriage-halls/${editingHallId}`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message });
            setIsModalOpen(false);
            setIsEditMode(false);
            fetchHalls();
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        }
    };





    const handleKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
            e.preventDefault();

            const newTag = input.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // simple debounce utility
    const debounce = (fn, delay = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };



    useEffect(() => {
        if (selectedHallId) {
            const hall = halls.find(h => h._id === selectedHallId);
            setCategories(hall?.categories || []);
        }
    }, [selectedHallId, halls]);



    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${URL}/marriage-hall-categories`, {
                headers: { Authorization: token },
            });
            setGlobalCategories(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
            setGlobalCategories([]);
        }
    };

    // fetch global categories when modal opens or component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        try {
            const res = await axios.post(
                `${URL}/marriage-hall-categories`, // ✅ global endpoint
                { name: newCategory },
                { headers: { Authorization: token } }
            );

            setResponse({
                status: "Success",
                message: "Category added successfully!",
            });

            setIsCategoryModalOpen(false);
            setNewCategory("");
            fetchCategories(); // ✅ refresh global categories list
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        }
    };





    const handleAddRow = () => {
        if (!selectedHallId || !selectedCategory || !categoryPrice) return;

        const hall = halls.find((h) => h._id === selectedHallId);
        const category = globalCategories.find((c) => c._id === selectedCategory);

        const newRow = {
            hallId: hall._id,
            hallName: hall.hall_name,
            categoryId: category._id,
            categoryName: category.name,
            price: Number(categoryPrice),
        };

        setAddedPrices((prev) => [...prev, newRow]);
        setNewlyAddedPrices((prev) => [...prev, newRow]); // track only newly added

        // reset inputs
        setSelectedCategory("");
        setCategoryPrice("");
    };







    const handleSavePrice = async () => {
    try {
        // 1️⃣ Group newly added prices by hall
        const newGrouped = newlyAddedPrices.reduce((acc, row) => {
            if (!acc[row.hallId]) acc[row.hallId] = [];
            acc[row.hallId].push({ category: row.categoryId, price: row.price });
            return acc;
        }, {});

        // 2️⃣ Group edited prices by hall
        const editedGrouped = addedPrices
            .filter(row => row.edited)
            .reduce((acc, row) => {
                if (!acc[row.hallId]) acc[row.hallId] = [];
                acc[row.hallId].push({ category: row.categoryId, price: row.price });
                return acc;
            }, {});

        // 3️⃣ Process deletions
        const deletedGrouped = deletedRows.reduce((acc, row) => {
            if (!acc[row.hallId]) acc[row.hallId] = [];
            acc[row.hallId].push(row.categoryId);
            return acc;
        }, {});

        // 4️⃣ Combine new + edited by hall
        const hallsToUpdate = { ...newGrouped };
        for (const hallId in editedGrouped) {
            if (!hallsToUpdate[hallId]) hallsToUpdate[hallId] = [];
            hallsToUpdate[hallId] = [...hallsToUpdate[hallId], ...editedGrouped[hallId]];
        }

        // 5️⃣ Send API requests per hall
        for (const hallId in hallsToUpdate) {
            await axios.put(
                `${URL}/marriage-halls/${hallId}/add-prices`,
                { categoryPrices: hallsToUpdate[hallId] },
                { headers: { Authorization: token } }
            );
        }

        // 6️⃣ Send deletions
        for (const hallId in deletedGrouped) {
            for (const categoryId of deletedGrouped[hallId]) {
                await axios.delete(
                    `${URL}/marriage-halls/${hallId}/delete-category/${categoryId}`,
                    { headers: { Authorization: token } }
                );
            }
        }

        // Clear local trackers
        setNewlyAddedPrices([]);
        setDeletedRows([]);
        setAddedPrices(prev => prev.map(row => ({ ...row, edited: false })));
        setIsPriceModalOpen(false);

        // Optionally refresh hall data
        fetchHalls();

    } catch (err) {
        console.error(err);
    }
};



    const handleConfirmDelete = () => {
        // Remove from local addedPrices or newlyAddedPrices
        setAddedPrices(prev => prev.filter(r => r !== selectedRow));
        setNewlyAddedPrices(prev => prev.filter(r => r !== selectedRow));
        setShowDeleteModal(false);
    };




    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Marriage Halls</h1>
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
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex items-center justify-between p-4 gap-3'>
                        <button
                            onClick={() => setIsPriceModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Add Hall Price
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Add Hall
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Hall Name</th>
                                <th className="p-2 text-center">Reg No.</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {halls.length > 0 ? (
                                halls.filter((hall) =>
                                    hall.hall_name.toLowerCase().includes(search.toLowerCase()) ||
                                    hall.incharge_name.toLowerCase().includes(search.toLowerCase())
                                ).map((hall, index) => (
                                    <tr key={hall._id} className="border-b">
                                        <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                                        <td className="p-2 text-center">{hall.hall_name}</td>
                                        <td className="p-2 text-center">{hall.reg_no}</td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <CiEdit
                                                    size={20}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setIsEditMode(true);
                                                        setEditingHallId(hall._id);
                                                        setRegNo(hall.reg_no);
                                                        setHallName(hall.hall_name);
                                                        setAddress(hall.address);
                                                        setTags(hall.facilities || []);
                                                        setHallCapacity(hall.hall_capacity);
                                                        setDiningCapacity(hall.dining_capacity);
                                                        setIsModalOpen(true);
                                                    }}
                                                />
                                                <FaEye
                                                    size={18}
                                                    onClick={() => {
                                                        setSelectedHall(hall);
                                                        setViewIsModalOpen(true);
                                                    }}
                                                    className="text-lavender--600 cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No halls found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
  currentPage={CurrentPage}
  totalPages={TotalPages}
  rowsPerPage={rowsPerPage}
  rowsInput={rowsInput}
  jumpInput={jumpInput}
  setCurrentPage={setCurrentPage}
  setRowsPerPage={setRowsPerPage}
  setRowsInput={setRowsInput}
  setJumpInput={setJumpInput}
  defaultRows={25}
/>

            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Hall">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Register Number</label>
                        <input
                            type="text"
                            placeholder="Enter Hall Reg Number"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Marrige Hall Name</label>
                        <input
                            type="text"
                            placeholder="Enter Hall Name"
                            value={hallName}
                            onChange={(e) => setHallName(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            rows={4}
                            placeholder="Enter Hall Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                </div>
                

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Facilities</label>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            className="ml-2 text-gray-600 hover:text-red-500"
                                            onClick={() => removeTag(tag)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <input
                                type="text"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                placeholder="+ Add new Facility"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hall Seat Capacity</label>
                        <input
                            type="number"
                            placeholder="Enter Seat Capacity"
                            min={0}
                            value={hallCapacity}
                            onChange={(e) => setHallCapacity(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dining Seat Capacity</label>
                        <input
                            type="number"
                            placeholder="Enter Dining Seat Capacity"
                            min={0}
                            value={diningCapacity}
                            onChange={(e) => setDiningCapacity(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Update
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Add
                        </button>
                    )}
                </div>


            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setViewIsModalOpen(false)} title="View Hall">
                {selectedHall && (
                    <div className='space-y-3 max-h-[650px] overflow-y-auto'>
                        <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                            {[
                                { label: "Register No", value: selectedHall.reg_no },
                                { label: "Hall Name", value: selectedHall.hall_name },
                                { label: "Address", value: selectedHall.address },
                                { label: "Hall Capacity", value: selectedHall.hall_capacity },
                                { label: "Dining Capacity", value: selectedHall.dining_capacity },
                                {
                                    label: "Facilities",
                                    value: selectedHall.facilities?.length
                                        ? selectedHall.facilities.join(", ")
                                        : "N/A",
                                },
                                {
                                    label: "Date Added",
                                    value: moment(selectedHall.createdAt).format("DD-MM-YYYY"),
                                },
                            ].map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2">
                                    <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                                        {item.label}
                                    </div>
                                    <div
                                        className={`col-span-12 sm:col-span-8 text-base ${item.value
                                            ? "text-gray-800 dark:text-gray-300"
                                            : "text-yellow-500 font-semibold"
                                            }`}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                                    Categories
                                </div>
                                <div className="col-span-12 sm:col-span-8 text-base text-gray-800 dark:text-gray-300">
                                    {selectedHall.categoryPrices?.length ? (
                                        <ul className="space-y-2">
                                            {selectedHall.categoryPrices.map((cat) => (
                                                <li
                                                    key={cat._id}
                                                    className="flex justify-between border-b border-gray-200 pb-1"
                                                >
                                                    <span>{cat.category?.name}</span> {/* ✅ name comes from populated category */}
                                                    <span className="font-medium text-lavender--600">
                                                        ₹{cat.price.toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-yellow-500 font-semibold">No categories</span>
                                    )}
                                </div>
                            </div>
                        </div>

                       


                    </div>




                )}
            </Modal>

            <Modal isOpen={isPriceModalOpen} onClose={() => {
                setIsPriceModalOpen(false);
                setSelectedHallId("");   // reset hall selection
                setSelectedCategory("");      // reset category
                setCategoryPrice("");         // reset price
            }} title="Add Hall Price">
                <div className='space-y-3 max-h-[650px] overflow-y-auto'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Hall</label>
                            <select
                                value={selectedHallId} // <-- state to track selected hall
                                onChange={(e) => setSelectedHallId(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            >
                                <option value="">-- Select a Hall --</option>
                                {halls.map((hall) => (
                                    <option key={hall._id} value={hall._id}>
                                        {hall.hall_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <button
                                    className="text-sm text-lavender--600 font-medium"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                >
                                    Add Category
                                </button>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            >
                                <option value="">-- Select Category --</option>
                                {globalCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>


                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Price</label>
                            <input
                                type="number"
                                value={categoryPrice}
                                onChange={(e) => setCategoryPrice(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleAddRow}
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Add
                        </button>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-500">
                            <thead className="text-base text-gray-700">
                                <tr>
                                    <th className="p-2 text-center">Sl No.</th>
                                    <th className="p-2 text-center">Hall Name</th>
                                    <th className="p-2 text-center">Category Name</th>
                                    <th className="p-2 text-center">Category Price</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addedPrices.map((row, idx) => {
                                    const isNew = newlyAddedPrices.some(
                                        (n) => n.hallId === row.hallId && n.categoryId === row.categoryId
                                    );

                                    const isEditing = editingRowId === row.hallId + "-" + row.categoryId;
                                    const isDeleted = deletedRows.some(
                                        (d) => d.hallId === row.hallId && d.categoryId === row.categoryId
                                    );

                                    return (
                                        <tr key={idx} className={`border-b ${isDeleted ? "line-through text-gray-400" : ""}`}>
                                            <td className="p-2 text-center">{idx + 1}</td>
                                            <td className="p-2 text-center">{row.hallName}</td>
                                            <td className="p-2 text-center flex items-center justify-between gap-2">
                                                {row.categoryName}
                                                {isNew && !isDeleted && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">New</span>
                                                )}
                                                {row.edited && !isDeleted && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Edited</span>
                                                )}
                                                {isDeleted && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Deleted</span>
                                                )}
                                            </td>
                                            <td className="p-2 text-center">
                                                {isEditing && !isDeleted ? (
                                                    <input
                                                        type="number"
                                                        value={editPriceValue}
                                                        onChange={(e) => setEditPriceValue(e.target.value)}
                                                        className="w-20 border border-gray-300 rounded px-1 py-0.5 text-center"
                                                    />
                                                ) : (
                                                    <>₹{row.price.toLocaleString()}</>
                                                )}
                                            </td>
                                        
                                            <td className="p-2 text-center flex items-center justify-center gap-2">
                                                {isEditing ? (
                                                    <FaCheckCircle
                                                        size={20}
                                                        className="text-green-600 cursor-pointer"
                                                        onClick={() => {
                                                            setRowBeingEdited(row);
                                                            setShowEditConfirmModal(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <CiEdit
                                                        size={20}
                                                        className="text-lavender--600 cursor-pointer"
                                                        onClick={() => {
                                                            setEditingRowId(row.hallId + "-" + row.categoryId);
                                                            setEditPriceValue(row.price);
                                                        }}
                                                    />
                                                )}

                                                <MdDelete
                                                    size={20}
                                                    className="text-red-500 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedHallName(row.hallName);
                                                        setSelectedCategoryName(row.categoryName);
                                                        setSelectedRow(row);
                                                        setShowDeleteModal(true);
                                                    }}
                                                />
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>


                        </table>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSavePrice}
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add Category">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category Name</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                    >
                        Save
                    </button>
                </div>
            </Modal>

            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}
            {/* Delete Confirmation Modal */}
            
            {showEditConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
                    <div className="relative w-full max-w-md max-h-full p-4 z-50">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowEditConfirmModal(false)}
                                className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            >
                                ×
                            </button>
                            <div className="p-4 text-center md:p-5">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-[#DB7B7B]"
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

                                <h3 className="mb-5 text-lg font-normal text-gray-500">
                                    Do you want to save the updated price ₹{editPriceValue} for category: <strong>{rowBeingEdited.categoryName}</strong> in <strong>{rowBeingEdited.hallName}</strong>?
                                </h3>

                                <button
                                    onClick={() => setShowEditConfirmModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        // Update the price in addedPrices
                                        setAddedPrices(prev =>
                                            prev.map(r =>
                                                r.hallId === rowBeingEdited.hallId &&
                                                    r.categoryId === rowBeingEdited.categoryId
                                                    ? { ...r, price: Number(editPriceValue), edited: true }
                                                    : r
                                            )
                                        );
                                        setEditedRows(prev => [
                                            ...prev,
                                            rowBeingEdited.hallId + "-" + rowBeingEdited.categoryId,
                                        ]);
                                        setEditingRowId(null);
                                        setShowEditConfirmModal(false);
                                    }}
                                    className="text-white ms-3 bg-lavender--600 hover:bg-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
                    <div className="relative w-full max-w-md max-h-full p-4 z-50">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            >
                                ×
                            </button>

                            <div className="p-4 text-center md:p-5">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-[#DB7B7B]"
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

                                <h3 className="mb-5 text-lg font-normal text-gray-500">
                                    Do you want to delete category: <strong>{selectedCategoryName}</strong> from <strong>{selectedHallName}</strong>?
                                </h3>

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        // Remove the row from table
                                        setAddedPrices(prev =>
                                            prev.filter(
                                                (row) =>
                                                    !(row.hallId === selectedRow.hallId && row.categoryId === selectedRow.categoryId)
                                            )
                                        );
                                        // Track deleted rows for backend
                                        setDeletedRows(prev => [
                                            ...prev,
                                            { hallId: selectedRow.hallId, categoryId: selectedRow.categoryId },
                                        ]);
                                        setShowDeleteModal(false);
                                    }}
                                    className="text-white ms-3 bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}




        </>
    )
}
