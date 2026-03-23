
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaPlus, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import { URL } from "../../App";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import DetailsModal from "../../Components/Expense/detailsModal";
import { CiEdit } from "react-icons/ci";

export const Notification = () => {

    const token = sessionStorage.getItem("token");

    const [notifications, setNotifications] = useState([]);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState(null);

    const [heading, setHeading] = useState("");

    const [rows, setRows] = useState([
        { message: "", date: new Date().toISOString().slice(0, 10) }
    ]);

    const [statusFilter, setStatusFilter] = useState("");

    const [inactiveModal, setInactiveModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [editId, setEditId] = useState(null);

    const lastRowRef = useRef(null);


    const fetchNotifications = async () => {
        const res = await axios.get(`${URL}/notifications/list`, {
            headers: { Authorization: token },
            params: {
                page: CurrentPage,
                limit: rowsPerPage,
                search: searchTerm,
                startDate,
                endDate,
                status: statusFilter
            }
        });

        setNotifications(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
    };

    useEffect(() => {
        fetchNotifications();
    }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate, statusFilter]);

    const addRow = () => {
        setRows([
            ...rows,
            { message: "", date: new Date().toISOString().slice(0, 10) }
        ]);

        setTimeout(() => {
            lastRowRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 100);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        const copy = [...rows];
        copy[index][field] = value;
        setRows(copy);
    };


    const resetRows = () => {
        setHeading("");
        setRows([
            { message: "", date: new Date().toISOString().slice(0, 10) }
        ]);
    };



    const validRows = rows.filter(
        r => r.message && r.date
    );

    const saveNotification = async () => {

        if (!heading || validRows.length === 0) return;

        setSaving(true);

        try {

            if (editId) {

                await axios.put(
                    `${URL}/notifications/update/${editId}`,
                    {
                        heading,
                        items: validRows
                    },
                    { headers: { Authorization: token } }
                );

            } else {

                await axios.post(
                    `${URL}/notifications/add`,
                    {
                        heading,
                        items: validRows
                    },
                    { headers: { Authorization: token } }
                );

            }

            setIsModalOpen(false);
            setEditId(null);
            resetRows();
            fetchNotifications();

        } catch (err) {

            console.log(err);

        } finally {

            setSaving(false);

        }

    };

    const openView = (item) => {
        setSelectedNotification(item);
        setIsViewOpen(true);
    };



    const openEdit = (item) => {

        setEditId(item._id);

        setHeading(item.heading);

        const mappedRows = item.items.map(i => ({
            message: i.message,
            date: new Date(i.date).toISOString().slice(0, 10)
        }));

        setRows(mappedRows);

        setIsModalOpen(true);

    };


    useEffect(() => {
        if (isModalOpen && !editId) {
            resetRows();
        }
    }, [isModalOpen, editId]);

    const validateMaxLength = (key, value, max) => {

        if (value.length > max) {

            setErrors(prev => ({
                ...prev,
                [key]: `Maximum ${max} characters allowed`
            }));

            setTimeout(() => {
                setErrors(prev => {
                    const copy = { ...prev };
                    delete copy[key];
                    return copy;
                });
            }, 3000);

            return false;
        }

        setErrors(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });

        return true;
    };


    const CharCounter = ({ value = "", max = 100, show }) => {

        if (!show) return null;

        return (
            <span
                className={`absolute bottom-1 right-2 text-[10px] 
            ${value.length > max ? "text-red-500" : "text-gray-400"}`}
            >
                {value.length}/{max}
            </span>
        );
    };


    const updateStatus = async (id, status) => {

        try {

            await axios.put(
                `${URL}/notifications/status/${id}`,
                { status },
                { headers: { Authorization: token } }
            );

            fetchNotifications();

        } catch (err) {
            console.log(err);
        }

    };

    const confirmInactive = async () => {

        if (!selectedItem) return;

        try {

            await axios.put(
                `${URL}/notifications/status/${selectedItem._id}`,
                { status: "Inactive" },
                { headers: { Authorization: token } }
            );

            setInactiveModal(false);
            setSelectedItem(null);

            fetchNotifications();

        } catch (err) {
            console.log(err);
        }

    };


    const openInactiveModal = (item) => {
        setSelectedItem(item);
        setInactiveModal(true);
    };

    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                <h1 className="text-lg font-semibold">Notification</h1>

                <div className="flex items-center justify-between p-2">

                    {/* SEARCH */}
                    <div>
                        <div className="relative">
                            <input
                                type="search"
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* DATE FILTER */}
                    <div className="flex flex-wrap items-center space-x-3">

                        <label className="text-l font-medium text-gray-600">From</label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block py-1 text-sm rounded w-40 px-3 bg-gray-50 border border-gray-300"
                        />

                        <label className="text-l font-medium text-gray-600">To</label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block py-1 text-sm rounded w-40 px-3 bg-gray-50 border border-gray-300"
                        />

                    </div>


                    <label className="text-l font-medium text-gray-600">Status</label>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block py-1 text-sm rounded w-32 px-3 bg-gray-50 border border-gray-300"
                    >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {/* ADD BUTTON */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Notification
                    </button>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto mt-4">

                    <table className="w-full text-sm text-gray-500">

                        <thead className="text-base text-gray-700 border-b">
                            <tr>
                                <th className="p-2 text-center">S.No</th>
                                <th className="p-2 text-left">Notification</th>
                                <th className="p-2 text-center">No of Notification</th>
                                <th className="p-2 text-center">Date</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-3 text-center text-gray-500">
                                        No notifications found
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((item, index) => (
                                    <tr key={item._id} className="border-b">

                                        <td className="p-2 text-center">
                                            {(CurrentPage - 1) * rowsPerPage + index + 1}
                                        </td>
                                        <td className="p-2 text-left">
                                            {item.heading}

                                        </td>

                                        <td className="p-2 text-center">
                                            {item.items?.length || 0}
                                        </td>

                                        <td className="p-2 text-center">
                                            {item.items?.length > 0 &&
                                                new Date(item.items[0].date).toLocaleDateString("en-GB")}
                                        </td>

                                        <td className="p-2 text-center">

                                            {item.status === "Active" ? (

                                                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                                                    Active
                                                </span>

                                            ) : (

                                                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                                                    Inactive
                                                </span>

                                            )}

                                        </td>
                                        <td className="p-2 text-center flex justify-center gap-3">

                                            <FaEye
                                                size={18}
                                                className="text-lavender--600 cursor-pointer"
                                                onClick={() => openView(item)}
                                                title="View Notificaion"
                                            />

                                            {item.status === "Active" && (
                                                <>
                                                    <CiEdit
                                                        size={18}
                                                        className="text-blue-500 cursor-pointer hover:scale-110"
                                                        title="Edit"
                                                        onClick={() => openEdit(item)}
                                                    />


                                                    <FaTimesCircle
                                                        size={18}
                                                        className="text-red-500 cursor-pointer hover:scale-110"
                                                        title="Inactive"
                                                        // onClick={() => updateStatus(item._id, "Inactive")}
                                                        onClick={() => openInactiveModal(item)}
                                                    />
                                                </>
                                            )}

                                        </td>

                                    </tr>
                                ))
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



            {/* ADD MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (!saving) {
                        setIsModalOpen(false);
                        setEditId(null);
                    }
                }}
                title={editId ? "Edit Notification" : "Add Notification"}
            >

                <div className="max-h-[600px] overflow-y-auto">

                    {/* HEADING */}
                    <div className=" p-4 border rounded-lg bg-blue-50 mb-3">

                        <div className="relative">

                            <label className="block text-sm font-medium text-gray-700">
                                Heading
                            </label>

                            <input
                                type="text"
                                placeholder="Enter notification heading"
                                value={heading}
                                onFocus={() => setActiveField(`heading-main`)}
                                onBlur={() => setActiveField(null)}
                                onChange={(e) => {

                                    const val = e.target.value;

                                    if (validateMaxLength(`heading-main`, val, 80)) {
                                        setHeading(val);
                                    }

                                }}
                                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
${errors[`heading-main`] ? "border-red-500" : "border-gray-300"}`}
                            />

                            <CharCounter
                                value={heading}
                                max={80}
                                show={activeField === `heading-main`}
                            />

                            {errors[`heading-main`] && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors[`heading-main`]}
                                </p>
                            )}

                        </div>

                    </div>


                    {/* MESSAGE ROWS */}
                    {rows.map((row, index) => (

                        // <div key={index} className="p-4 border rounded-lg bg-blue-50 mb-3">
                        <div
                            key={index}
                            ref={index === rows.length - 1 ? lastRowRef : null}
                            className="p-4 border rounded-lg bg-blue-50 mb-3"
                        >

                            {/* HEADER */}
                            <div className="flex items-center justify-between">

                                {/* LEFT */}
                                <label className="text-sm font-medium text-gray-700">
                                    Notification Message
                                </label>

                                {/* RIGHT */}
                                <div className="flex items-center gap-3">

                                    <label className="text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={row.date}
                                        onChange={(e) => updateRow(index, "date", e.target.value)}
                                        className="border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-0 focus:border-gray-300 px-2 py-1"
                                    />

                                    {index === rows.length - 1 ? (

                                        <button
                                            onClick={addRow}
                                            disabled={!heading || !row.message || !row.date}
                                            className={`px-3 py-2 text-white rounded ${row.message && row.date
                                                ? "bg-lavender--600"
                                                : "bg-gray-300 cursor-not-allowed"
                                                }`}
                                        >
                                            <FaPlus />
                                        </button>

                                    ) : (

                                        <button
                                            onClick={() => removeRow(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded"
                                        >
                                            <MdDelete />
                                        </button>

                                    )}

                                </div>

                            </div>


                            {/* TEXTAREA */}
                            <div className="relative">

                                <textarea
                                    rows="4"
                                    placeholder="Type the notification message here..."
                                    value={row.message}
                                    onFocus={() => setActiveField(`message-${index}`)}
                                    onBlur={() => setActiveField(null)}
                                    onChange={(e) => {

                                        const val = e.target.value;

                                        if (validateMaxLength(`message-${index}`, val, 300)) {
                                            updateRow(index, "message", val);
                                        }

                                    }}
                                    className={`block w-full mt-2 border rounded-md shadow-sm sm:text-sm resize-none min-h-[50px] pr-10
${errors[`message-${index}`] ? "border-red-500" : "border-gray-300"}`}
                                />

                                <CharCounter
                                    value={row.message}
                                    max={300}
                                    show={activeField === `message-${index}`}
                                />

                                {errors[`message-${index}`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors[`message-${index}`]}
                                    </p>
                                )}

                            </div>

                        </div>

                    ))}


                    {/* SAVE BUTTON */}
                    <div className="flex justify-end mt-2">

                        <button
                            onClick={saveNotification}
                            disabled={saving}
                            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${saving ? "bg-gray-400" : "bg-lavender--600"
                                }`}
                        >

                            {saving && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}

                            {saving ? "Saving..." : "Save"}

                        </button>

                    </div>

                </div>

            </Modal>


            {/* VIEW MODAL */}

            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title={selectedNotification?.heading || "Notification"}
            >


                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">


                    {selectedNotification?.items?.map((n, i) => (

                        <div key={i} className="border-b pb-3">

                            <div className="text-sm text-gray-500">
                                {new Date(n.date).toLocaleDateString("en-GB")}
                            </div>

                            <div className="text-gray-800 whitespace-pre-line mt-1">
                                {n.message}
                            </div>

                        </div>

                    ))}

                </div>

            </Modal>


            <DetailsModal
                isOpen={inactiveModal}
                onClose={() => setInactiveModal(false)}
                title="Confirm Inactive"
            >

                <p className="text-gray-700 text-sm mb-4">
                    Are you sure you want to inactive
                    <span className="text-lavender--600 font-semibold">
                        {" "}{selectedItem?.heading}
                    </span> ?
                </p>

                <div className="flex justify-end gap-3">



                    <button
                        onClick={confirmInactive}
                        className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Confirm
                    </button>

                </div>

            </DetailsModal>
        </>
    );
};