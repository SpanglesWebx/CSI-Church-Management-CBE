import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from "axios";
import Pagination from "../../Components/Helpers/Pagination";

export const AddPlots = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const token = window.sessionStorage.getItem("token");
    const [slots, setSlots] = useState([]);
    const [columnsInput, setColumnsInput] = useState("");
    const [cemeteries, setCemeteries] = useState([]);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        cemetery_name: "",
        location: "",
    });
    const [Response, setResponse] = useState({ status: "", message: "" });
    const totalSlots = slots.reduce((sum, row) => sum + row.length, 0);
    const [editMode, setEditMode] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");








    // 🔹 Fetch cemeteries with pagination & search
    const fetchCemeteries = async () => {
        try {
            const res = await axios.get(
                `${URL}/cemeteries?page=${CurrentPage}&limit=${rowsPerPage}&search=${search || ""}`,
                { headers: { Authorization: token } }
            );
            setCemeteries(res.data.cemeteries || []);

const pages = res.data.totalPages || 1;
setTotalPages(pages);

if (CurrentPage > pages) {
  setCurrentPage(1);
}

        } catch (err) {
            console.error("Error fetching cemeteries", err);
        }
    };

    useEffect(() => {
  fetchCemeteries();
}, [CurrentPage, rowsPerPage, search]);


    // 🔹 Add row of slots
    // 🔹 Add row of slots (A1, A2, A3 then B1, B2, B3, etc.)
const addRow = () => {
  const count = parseInt(columnsInput) || 1;

  // EDIT MODE – modify existing row
  if (editMode && selectedRow !== null) {
    const rowIndex = selectedRow + 1;
    const rowLetter = getExcelColumnName(rowIndex);

    const updated = [];
    for (let i = 1; i <= count; i++) {
      updated.push(`${rowLetter}${i}`);
    }

    const copy = [...slots];
    copy[selectedRow] = updated;
    setSlots(copy);

    // KEEP ROW ACTIVE & KEEP VALUE LOADED
    setColumnsInput(count.toString());
    return;
  }

  // NORMAL ADD MODE
  const rowIndex = slots.length + 1;
  const rowLetter = getExcelColumnName(rowIndex);

  const newRow = [];
  for (let i = 1; i <= count; i++) {
    newRow.push(`${rowLetter}${i}`);
  }

  setSlots([...slots, newRow]);
  setColumnsInput("");
};





    // 🔹 Convert number → Excel column letter
    // 1 → A, 2 → B, 27 → AA
    const getExcelColumnName = (num) => {
        let str = "";
        while (num > 0) {
            let rem = (num - 1) % 26;
            str = String.fromCharCode(65 + rem) + str;
            num = Math.floor((num - 1) / 26);
        }
        return str;
    };


    // 🔹 Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔹 Save cemetery
    const handleSave = async () => {
        if (!formData.cemetery_name || !formData.location) {
            setResponse({ status: "Failed", message: "All required fields must be filled" });
            return;
        }
        const totalSlots = slots.reduce((sum, row) => sum + row.length, 0);

        try {
            const payload = {
                cemetery_name: formData.cemetery_name,
                location: formData.location,
                slots,
                number_of_available_slots: totalSlots,
            };

            const res = await axios.post(`${URL}/cemeteries/add`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message || "Cemetery added successfully" });
            setIsModalOpen(false);
            resetForm();
            fetchCemeteries();
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save cemetery",
            });
        }
    };


    // 🔹 Reset form
    const resetForm = () => {
        setFormData({
            cemetery_name: "",
            location: "",
        });
        setSlots([]);
        setColumnsInput("");
    };


    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Cemetery</h1>

                    {/* Search */}
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
                                value={search}
                                onChange={(e) => {
  setSearch(e.target.value);
  setCurrentPage(1);
}}

                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                                placeholder="Search"
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Slots
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500 ">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Cemetery Name</th>
                                <th className="p-2 text-center">Location</th>
                                <th className="p-2 text-center">Available Slots</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cemeteries.length > 0 ? (
                                cemeteries.map((cem, idx) => (
                                    <tr key={cem._id} className="border-t text-center">
                                        <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                                        <td className="p-2">{cem.cemetery_name}</td>
                                        <td className="p-2">{cem.location}</td>
                                        <td className="p-2">{cem.number_of_available_slots || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-3 text-center text-gray-400">
                                        No cemeteries found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Slots"
            >
                <div className="space-y-3 max-h-[650px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Cemetery Name
                            </label>
                            <input
                                type="text"
                                name="cemetery_name"
                                value={formData.cemetery_name}
                                onChange={handleChange}
                                placeholder="Enter Name"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Cemetery Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Add Rows
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Number of Slots per"
                                    className="block w-[75%] mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    value={columnsInput}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, ""); // remove non-digits
                                        setColumnsInput(val);
                                    }}
                                />
                                <button
                                    onClick={addRow}
                                    title="Add row"
                                    className=" w-[25%] h-[35px] text-white bg-lavender--600 rounded"
                                >
                                    Add Row
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Slots grid */}
                    {slots.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Slots</label>
                                <button
                                    onClick={() => {
                                        setEditMode(!editMode);
                                        setSelectedRow(null);
                                        setColumnsInput("");
                                    }}
                                    className="text-sm text-blue-600 "
                                >
                                    {editMode ? "Done" : "Edit"}
                                </button>
                            </div>

                            <div className="col-span-2 grid gap-2 p-2 border rounded max-h-[300px] overflow-auto bg-gray-50 mt-1">
                                {slots.map((row, rIdx) => (
                                    <div key={rIdx} className="flex items-center gap-2">
                                        {editMode && (
                                            <input
                                                type="radio"
                                                name="rowSelect"
                                                onChange={() => {
                                                    setSelectedRow(rIdx);
                                                    setColumnsInput(row.length.toString());
                                                }}
                                            />
                                        )}

                                        <div className="flex gap-2">
                                            {row.map((slot) => (
                                                <div
                                                    key={slot}
                                                    className="w-12 h-12 flex items-center justify-center border rounded bg-white text-sm font-medium"
                                                >
                                                    {slot}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Delete ONLY last row */}
                                        {editMode && rIdx === slots.length - 1 && (
                                            <button
                                                onClick={() => {
                                                    const copy = [...slots];
                                                    copy.pop();
                                                    setSlots(copy);
                                                    setSelectedRow(null);
                                                    setColumnsInput("");
                                                }}
                                                className="text-red-600 text-sm ml-2"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))}

                            </div>
                            <div className="mt-2 text-right text-gray-700 font-medium">
                                Total Available Slots: {totalSlots}
                            </div>
                        </div>

                    )}

                    {/* Save button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
            {Response.status && (
                Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                )
            )}

        </>
    );
};
