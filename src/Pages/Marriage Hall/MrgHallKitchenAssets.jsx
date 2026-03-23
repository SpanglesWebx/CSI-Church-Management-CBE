import React, { useState } from 'react'
import { FaEye, FaPlus, FaPrint } from 'react-icons/fa6'
import { FiDownload } from 'react-icons/fi'
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import Modal from '../../Components/Expense/ExpenseFormModal';
import axios from "axios";
import { URL } from "../../App";
import { useEffect } from "react";
import Pagination from '../../Components/Helpers/Pagination';

export const MrgHallKitchenAssets = () => {

  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [newItem, setNewItem] = useState("");
  const [viewAsset, setViewAsset] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  const fetchKitchenAssets = async () => {
    try {
      const res = await axios.get(`${URL}/kitchen-assets`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined,
        }
      });

      setRows(res.data.data || []);
const pages = res.data.totalPages || 1;
setTotalPages(pages);

// page overflow safety
if (CurrentPage > pages) {
  setCurrentPage(1);
}
    } catch (err) {
      setRows([]);
      setTotalPages(1);
    }
  };

useEffect(() => {
  fetchKitchenAssets();
}, [CurrentPage, rowsPerPage, searchTerm]);
  const handleNewItemKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();   // stop form reload
      saveNewItem();
    }
  };


  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };


  const saveKitchenAsset = async () => {
    if (!selectedItem || !quantity) {
      showToast("Failed", "Select item & quantity");
      return;
    }

    try {
      await axios.post(
        `${URL}/kitchen-assets`,
        {
          item_name: selectedItem,
          quantity: Number(quantity),
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Stock added successfully");

      setSelectedItem("");   // clear item
      setQuantity("");       // clear qty
      fetchKitchenAssets();  // refresh table & dropdown
      // ❌ Do NOT close modal anymore

    } catch (err) {
      showToast("Failed", "Save failed");
    }
  };



  const saveNewItem = async () => {
    if (!newItem.trim()) {
      showToast("Failed", "Item name required");
      return;
    }

    try {
      await axios.post(
        `${URL}/kitchen-assets`,
        {
          item_name: newItem.trim(),
          quantity: 0,
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Item added successfully");

      setNewItem("");
      fetchKitchenAssets();

    } catch (err) {
      showToast("Failed", "Item add failed");
    }
  };




  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Assets</h1>
          <div className="flex items-center justify-between gap-3">
            <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" />
            <FaPrint size={20} className="text-lavender--600 cursor-pointer" title="Print" />
          </div>
        </div>
        <div className="flex items-center justify-between p-2">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              id="shop-search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search Assets"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Assets
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Items</th>
                <th className="p-2 text-center">Total Quantity</th>
                <th className="p-2 text-center">Available Quantity</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id} className="border-b text-center">
                  <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + i + 1}</td>
                  <td className="p-2 text-center">{r.item_name}</td>
                  <td className="p-2 text-center">{r.total_quantity}</td>
                  <td className="p-2 text-center">{r.available_quantity}</td>
                  <td className="p-2 text-center">
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto" onClick={() => {
                      setViewAsset(r);
                      setIsViewModalOpen(true);
                    }} />
                  </td>
                </tr>
              ))}
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


        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Assets">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Item
                </label>

                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600 flex items-center gap-2"
                >
                  <FaPlus /> Item
                </button>
              </div>
              <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                <option value="">-- Select Item --</option>
                {rows.map(r => (
                  <option key={r._id} value={r.item_name}>{r.item_name}</option>
                ))}
              </select>

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="text"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value.replace(/\D/g, ""))}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={saveKitchenAsset}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Add Assets
            </button>
          </div>
        </Modal>

        <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Add Items">
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              <input
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Enter Items"
                onKeyDown={handleNewItemKeyDown}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={saveNewItem}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Add Items
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Kitchen Asset Register"
        >
          {viewAsset && (
            <div className="flex flex-col w-full max-w-3xl space-y-3 max-h-[650px] overflow-y-auto">

              {[
                { label: "Item Name", value: viewAsset.item_name },
                { label: "Total Quantity", value: viewAsset.total_quantity },
                { label: "Available Quantity", value: viewAsset.available_quantity, className: "text-green-700 font-semibold" },
                { label: "Damaged", value: viewAsset.damaged },
                { label: "Missing", value: viewAsset.missed, className: "text-red-600 font-semibold" },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 last:border-none">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className={`col-span-12 sm:col-span-8 text-base ${item.className || "text-gray-800"}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>

      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
