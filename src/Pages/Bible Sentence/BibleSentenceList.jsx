
import React, { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import DetailsModal from "../../Components/Expense/detailsModal";
import { CiEdit } from "react-icons/ci";

const BibleSentence = () => {
     const token = sessionStorage.getItem("token");

    const [sentences, setSentences] = useState([]);
    const [search, setSearch] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [Response, setResponse] = useState({ status: null, message: "" });

    const [book, setBook] = useState("");
    const [chapter, setChapter] = useState("");
    const [verse, setVerse] = useState("");
    const [sentence, setSentence] = useState("");

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSentence, setSelectedSentence] = useState(null);
    const [saving, setSaving] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [statusFilter, setStatusFilter] = useState("");
    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState(null);


    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState(true);

    const [confirmInactiveOpen, setConfirmInactiveOpen] = useState(false);

    const resetForm = () => {
        setBook("");
        setChapter("");
        setVerse("");
        setSentence("");
        setStatus(true);
        setEditId(null);
        setIsEditMode(false);
    };

    // Fetch
    const fetchSentences = async (page = CurrentPage, term = search) => {
        try {
            const res = await axios.get(`${URL}/bible-sentences`, {
                headers: { Authorization: token },
                params: {
                    page,
                    limit: rowsPerPage,
                    search: term || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    status: statusFilter || undefined
                },
            });

            setSentences(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            setSentences([]);
        }
    };

    useEffect(() => {
        fetchSentences(CurrentPage, search);
    }, [CurrentPage, search, rowsPerPage, startDate, endDate, statusFilter]);

    useEffect(() => {
        const blockRefresh = (e) => {
            if (saving) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", blockRefresh);
        return () => window.removeEventListener("beforeunload", blockRefresh);
    }, [saving]);

    // Save
    const handleSave = async () => {
        if (saving) return;

        if (!book || !chapter || !verse || !sentence) {
            setResponse({
                status: "Failed",
                message: "All fields are required",
            });
            return;
        }

        try {
            setSaving(true);

            let res;

            if (isEditMode) {

                res = await axios.put(
                    `${URL}/bible-sentences/${editId}`,
                    { book, chapter, verse, sentence, status },
                    { headers: { Authorization: token } }
                );

                setSentences((prev) =>
                    prev.map((s) =>
                        s._id === editId ? res.data.data : s
                    )
                );

            } else {

                res = await axios.post(
                    `${URL}/bible-sentences`,
                    { book, chapter, verse, sentence },
                    { headers: { Authorization: token } }
                );

                setSentences((prev) => [res.data.data, ...prev]);
            }

            setResponse({ status: "Success", message: res.data.message });

            setIsModalOpen(false);
            resetForm();

        } catch (err) {

            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });

        } finally {
            setSaving(false);
        }
    };


    const validateMaxLength = (name, value, max = 100) => {
        if (value.length > max) {
            setErrors(prev => ({
                ...prev,
                [name]: `Maximum ${max} characters allowed`,
            }));

            setTimeout(() => {
                setErrors(prev => {
                    const copy = { ...prev };
                    delete copy[name];
                    return copy;
                });
            }, 4000);

            return false;
        }

        setErrors(prev => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });

        return true;
    };

    const RequiredLabel = ({ children }) => (
        <label className="block text-sm font-medium text-gray-700">
            {children}
            <span className="text-red-500 ml-1">*</span>
        </label>
    );

    const CharCounter = ({ value = "", max = 100, show }) => {
        if (!show || !value.length) return null;

        return (
            <span
                className={`absolute bottom-1 right-2 text-[10px]
            ${value.length > max ? "text-red-500" : "text-gray-400"}`}
            >
                {value.length}/{max}
            </span>
        );
    };

    return (
        <>
            {/* Main Container */}
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                {/* Header */}

                <div className="p-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">

                        {/* Heading */}
                        <div>
                              <h1 className="text-lg font-semibold">
                                Bible Verse
                            </h1>
                        </div>

                        {/* Search */}
                        <div>
                            <input
                                type="search"
                                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                From
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                To
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                            />
                        </div>


                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50
    border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                            >
                                <option value="">All</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>



                        {/* Add Button */}
                        <div className="flex justify-start lg:justify-end">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white 
               bg-lavender--600 rounded-md whitespace-nowrap"
                            >
                                <FaPlus className="text-xs" />
                                Add Verse
                            </button>
                        </div>

                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">S.No</th>
                                <th className="p-2 text-center">Bible Verse</th>
                                <th className="p-2 text-center">Date & Time</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sentences.length > 0 ? (
                                sentences.map((item, index) => (
                                    <tr key={item._id} className="border-b">
                                        <td className="p-2 text-center">
                                            {(CurrentPage - 1) * rowsPerPage + index + 1}
                                        </td>
                                        <td className="p-2 text-left">
                                            {item.book} {item.chapter}:{item.verse} -{" "}
                                            {item.sentence.length > 50
                                                ? item.sentence.substring(0, 50) + "..."
                                                : item.sentence}
                                        </td>
                                        <td className="p-2 text-center">
                                            {moment(item.createdAt).format("DD-MM-YYYY hh:mm A")}
                                        </td>
                                        <td className="p-2 text-center">
                                            {item.status ? (
                                                <span className="text-green-600 font-medium">Active</span>
                                            ) : (
                                                <span className="text-red-500 font-medium">Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-3">

                                                <FaEye
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedSentence(item);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                />

                                                {item.status && (
                                                    <CiEdit
                                                        size={20}
                                                        className="text-blue-600 cursor-pointer"
                                                        title="Edit Bible Verse"
                                                        onClick={() => {
                                                            setIsEditMode(true);
                                                            setEditId(item._id);

                                                            setBook(item.book);
                                                            setChapter(item.chapter);
                                                            setVerse(item.verse);
                                                            setSentence(item.sentence);
                                                            setStatus(item.status);

                                                            setIsModalOpen(true);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No sentences found
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

            {/* Add Sentence Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={isEditMode ? "Edit Bible Verse" : "Add Bible Verse"}
            >
                <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                            <RequiredLabel>Book</RequiredLabel>
                            <input
                                type="text"
                                value={book}
                                onFocus={() => setActiveField("book")}
                                onBlur={() => setActiveField(null)}

                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (validateMaxLength("book", val, 50)) {
                                        setBook(val);
                                    }
                                }}

                                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
            ${errors.book ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter a Book Name"
                            />
                            <CharCounter value={book} max={50} show={activeField === "book"} />

                            {errors.book && (
                                <p className="text-xs text-red-500 mt-1">{errors.book}</p>
                            )}
                        </div>

                        <div className="relative">
                            <RequiredLabel>Chapter</RequiredLabel>

                            <input
                                type="text"
                                value={chapter}
                                onFocus={() => setActiveField("chapter")}
                                onBlur={() => setActiveField(null)}


                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    if (validateMaxLength("chapter", val, 10)) {
                                        setChapter(val);
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"


                                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
            ${errors.chapter ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter a Chapter"
                            />

                            {/* <CharCounter value={chapter} max={6} show={activeField === "chapter"} /> */}

                            {/* {errors.chapter && (
                                <p className="text-xs text-red-500 mt-1">{errors.chapter}</p>
                            )} */}
                        </div>

                        <div>

                            <RequiredLabel>Verse</RequiredLabel>

                            <input
                                type="text"
                                value={verse}
                                onFocus={() => setActiveField("verse")}
                                onBlur={() => setActiveField(null)}


                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    if (validateMaxLength("verse", val, 3)) {
                                        setVerse(val);
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"

                                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
            ${errors.verse ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter a Verse"
                            />
                            {/* <CharCounter value={verse} max={3} show={activeField === "verse"} />

                            {errors.verse && (
                                <p className="text-xs text-red-500 mt-1">{errors.verse}</p>
                            )} */}
                        </div>
                    </div>

                    <div className="mt-4 relative">
                        <RequiredLabel>Bible Verse</RequiredLabel>
                        <textarea
                            rows={4}
                            value={sentence}
                            onFocus={() => setActiveField("sentence")}
                            onBlur={() => setActiveField(null)}
                            // onChange={(e) => setSentence(e.target.value)}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (validateMaxLength("sentence", val, 250)) {
                                    setSentence(val);
                                }
                            }}

                            className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
            ${errors.sentence ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter a Verse..."
                        />
                        <CharCounter value={sentence} max={250} show={activeField === "sentence"} />

                        {errors.sentence && (
                            <p className="text-xs text-red-500 mt-1">{errors.sentence}</p>
                        )}
                    </div>


                    {isEditMode && (
                        <div className="mt-4 flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <button
                                // onClick={() => setStatus(!status)}
                                onClick={() => {
                                    if (status) {
                                        setConfirmInactiveOpen(true);
                                    } else {
                                        setStatus(true);
                                    }
                                }}
                                className={`px-3 py-1 text-sm rounded-md 
                ${status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
            `}
                            >
                                {status ? "Active" : "Inactive"}
                            </button>
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
        `}
                        >
                            {saving && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>




            {/* View Sentence Modal */}
            {/* <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="View Bible Verse"
            >
                {selectedSentence && (
                    <div
                        className="p-8 text-center"
                        style={{ fontFamily: "Times New Roman, serif" }}
                    >


                 
                        <div className="text-2xl italic leading-relaxed mb-4">
                            {selectedSentence.sentence}
                        </div>

                        <div className="text-xl font-semibold ">
                            {selectedSentence.book?.trim()}{" "}
                            {selectedSentence.chapter}:{selectedSentence.verse}
                        </div>
                    </div>
                )}
            </Modal> */}


            {/* View Sentence Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="View Bible Verse"
            >
                {selectedSentence && (
                    (() => {
                        const isTamil = /[\u0B80-\u0BFF]/.test(selectedSentence.sentence);

                        return (
                            <div
                                className="p-8 text-center"
                                style={{
                                    fontFamily: isTamil
                                        ? "'Noto Sans Tamil', sans-serif"
                                        : "Times New Roman, serif",
                                }}
                            >
                                {/* Sentence */}
                                <div
                                    className={`text-2xl leading-relaxed mb-4 ${isTamil ? "italic" : ""
                                        }`}
                                >
                                    {selectedSentence.sentence}
                                </div>

                                {/* Reference */}
                                <div
                                    className={`text-xl ${isTamil ? "font-semibold" : "italic font-semibold"
                                        }`}
                                >
                                    {selectedSentence.book?.trim()}{" "}
                                    {selectedSentence.chapter}:{selectedSentence.verse}
                                </div>
                            </div>
                        );
                    })()
                )}
            </Modal>




            <DetailsModal
                isOpen={confirmInactiveOpen}
                onClose={() => setConfirmInactiveOpen(false)}
                title="Confirm Inactive"
            >
                <div className="text-center space-y-4">

                    <p className="text-gray-700">
                        Do you want to inactive this verse?
                    </p>

                    <div className="text-lg font-semibold text-gray-700">
                        {book?.trim()} {chapter}:{verse}
                    </div>

                    <div className="flex justify-center gap-4 mt-4">

                        <button
                            onClick={() => {
                                setStatus(false);
                                setConfirmInactiveOpen(false);
                            }}
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Yes
                        </button>

                        <button
                            onClick={() => setConfirmInactiveOpen(false)}
                            className="px-4 py-2 bg-gray-300 rounded-md"
                        >
                            No
                        </button>

                    </div>

                </div>
            </DetailsModal>
            {Response.status &&
                (Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                ))}
        </>
    );
};

export default BibleSentence;