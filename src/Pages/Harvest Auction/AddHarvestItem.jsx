import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import axios from "axios";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Helpers/Pagination";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const AddHarvestItem = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    code: "",
    name: "",
    amount: "",
    description: "",
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const token = window.sessionStorage.getItem("token");
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // pagination (same as Subscribers)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");


  const [Response, setResponse] = useState({ status: null, message: "" });

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${URL}/harvest-items`, {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
        },
        headers: { Authorization: token },
      });

      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
    }
  };


  useEffect(() => {
    fetchItems();
  }, [searchQuery, currentPage, rowsPerPage]);



  const handleOpen = () => {
    setFormData({
      code: "",
      name: "",
      amount: "",
      description: ""
    });
    setIsModalOpen(true)
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setFormData({ code: "", name: "", amount: "", description: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const handleAdd = async () => {
    if (!formData.code || !formData.name) {
      showToast("Failed", "Code and Name are required");
      return;
    }

    try {
      await axios.post(
        `${URL}/harvest-items`,
        formData,
        { headers: { Authorization: token } }
      );

      showToast("Success", "Item added successfully");

      fetchItems(currentPage);
      handleClose();
    } catch (err) {
      console.error("Error adding item:", err);
      showToast("Failed", "Failed to add item");
    }
  };


  // ➤ Open View/Edit Modal
  const handleView = (item) => {
    setSelectedItem(item);
    setFormData(item); // preload form with item values
    setIsEditMode(false); // ✅ always open in read-only mode
    setIsViewOpen(true);
  };

  // ➤ Update Item
  const handleUpdate = async () => {
    if (!formData.code || !formData.name) {
      showToast("Failed", "Code and Name are required");
      return;
    }

    try {
      await axios.put(
        `${URL}/harvest-items/${selectedItem._id}`,
        formData,
        { headers: { Authorization: token } }
      );

      showToast("Success", "Item updated successfully");

      fetchItems(currentPage);
      setIsEditMode(false); // ✅ back to readonly after updating
      setIsViewOpen(false);
    } catch (err) {
      console.error("Error updating item:", err);
      showToast("Failed", "Failed to update item");
    }
  };


  const navigate = useNavigate();

  return (
    <div className="">
      <FaArrowLeft
        size={18}
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      />
      <div className="p-4 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Harvest Items</h2>
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to first page when searching
                }}

              />
            </div>
          </div>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 bg-lavender--600 text-white px-4 py-2 rounded-lg "
          >
            <FaPlus /> Add Item
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center">
            <tr className="text-center">
              <th className="p-2 ">Sl. No.</th>
              <th className="p-2 ">Code</th>
              <th className="p-2 ">Item Name</th>
              <th className="p-2 ">Amount</th>
              <th className="p-2 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id} className="border-b text-center">
                  <td className="p-2 ">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2 ">{item.code}</td>
                  <td className="p-2 ">{item.name}</td>
                  <td className="p-2 ">{item.amount}</td>
                  <td className="p-2 ">
                    <FaEye
                      size={18}
                      className="cursor-pointer text-lavender--600 inline-block"
                      onClick={() => handleView(item)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No items added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
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
      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <h3 className="text-lg text-lavender--600 font-semibold mb-4">Add Harvest Item</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobileNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              maxLength={10}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              placeholder="Enter mobile number"
            />
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Enter Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Enter Code"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Item Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          {/* Checkbox to toggle description */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.hasDescription || false}
                onChange={(e) =>
                  setFormData({ ...formData, hasDescription: e.target.checked })
                }
                className="rounded border-gray-300 text-lavender--600 focus:ring-lavender--600"
              />
              <span className="ml-2 text-sm text-gray-700">Add Description</span>
            </label>
          </div>

          {/* Conditionally render description */}
          {formData.hasDescription && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter description here..."
                rows="3"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}
        </div>

        {/* Add button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAdd}
            className="bg-lavender--600 text-white px-4 py-2 rounded hover:bg-lavender--700"
          >
            Add
          </button>
        </div>
      </Modal>

      {/* ➤ View/Edit Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Harvest Item Details"
      >
        {selectedItem && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">

            {[
              { label: "Name", value: selectedItem.fullName },
              { label: "Mobile Number", value: selectedItem.mobileNumber },
              { label: "Item Code", value: selectedItem.code },
              { label: "Item Name", value: selectedItem.name },
              { label: "Amount", value: selectedItem.amount ? `₹ ${selectedItem.amount}` : "-" },
              { label: "Description", value: selectedItem.description || "-" },
            ].map((itm, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 pb-2">
                <div className="col-span-12 sm:col-span-4 font-semibold text-gray-700">
                  {itm.label}
                </div>
                <div className="col-span-12 sm:col-span-8 text-gray-800">
                  {itm.value}
                </div>
              </div>
            ))}

          </div>
        )}
      </Modal>

      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> :
          <FailedMessage Message={Response.message} />
      )}
    </div>
  );
};
