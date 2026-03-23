// AsanamUniform.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Pagination from "../../Components/Helpers/Pagination";


export const AsanamUniform = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // add items
  const [isItemViewModalOpen, setIsItemViewModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false); // add sales
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [receiptNo, setReceiptNo] = useState("");
  const [saleDescription, setSaleDescription] = useState("");

  // listing
  const [itemsList, setItemsList] = useState([]); // loaded items (for search/autocomplete)
  const [salesList, setSalesList] = useState([]); // listing of saved daily sales
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const token = window.sessionStorage.getItem("token");
  // ---- Add Items modal state ----
  const [itemDate, setItemDate] = useState(""); // date of item-set (year or actual date)
  const [itemDescription, setItemDescription] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemRate, setNewItemRate] = useState("");
  const [itemRows, setItemRows] = useState([]); // rows inside modal (temporary)
  // ---- Sales modal state ----
  const [saleDate, setSaleDate] = useState(moment().format("YYYY-MM-DD"));
  const [saleSearchTerm, setSaleSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [saleQty, setSaleQty] = useState("");
  const [saleRows, setSaleRows] = useState([]); // rows inside sales modal
  const [saleTotalAmount, setSaleTotalAmount] = useState(0);
  const [itemSets, setItemSets] = useState([]);
  const [itemYear, setItemYear] = useState(new Date().getFullYear());
  const [yearList, setYearList] = useState([]);
  // pagination (standard reusable)
const [rowsPerPage, setRowsPerPage] = useState(25); // ✅ default 25
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  async function fetchItemYears() {
    try {
      const res = await axios.get(`${URL}/asanam-uniform/item-years`, {
        headers: { Authorization: token }
      });
      setYearList(res.data.years || []);
    } catch (err) {
      console.error("Failed to load years", err);
    }
  }
  async function fetchItemSetsByYear(year) {
    try {
      const res = await axios.get(`${URL}/asanam-uniform/item-sets`, {
        params: { year },
        headers: { Authorization: token },
      });
      setItemSets(res.data.data || []);
    } catch (err) {
      console.error("Error loading item sets:", err);
    }
  }
  useEffect(() => {
    if (isItemViewModalOpen) {
      fetchItemSetsByYear(itemYear);
    }
  }, [itemYear]);


  useEffect(() => {
    if (isItemViewModalOpen) {
      fetchItemYears();
      fetchItemSetsByYear(itemYear);
    }
  }, [isItemViewModalOpen]);


  async function fetchItemSets() {
    try {
      const res = await axios.get(`${URL}/asanam-uniform/item-sets`, {
        headers: { Authorization: token },
      });
      setItemSets(res.data.data || []);
    } catch (err) {
      console.error("Failed loading item sets", err);
    }
  }

  useEffect(() => {
    if (isItemViewModalOpen) fetchItemSets();
  }, [isItemViewModalOpen]);

  // item search states
  const [itemDropdown, setItemDropdown] = useState([]);
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedItemSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setItemDropdown([]);
        return;
      }

      try {
        const res = await axios.get(
          `${URL}/asanam-uniform/items-search?name=${val}`,
          { headers: { Authorization: token } }
        );
        setItemDropdown(res.data.data || []);
      } catch (err) {
        setItemDropdown([{ name: "None", rate: "-", _id: "none" }]);
      }
    }, 300)
  ).current;

  const onSaleSearchChange = (val) => {
    setSaleSearchTerm(val);
    debouncedItemSearch(val);
    setSelectedItem(null);
  };

  const onSelectItem = (item) => {
    if (item._id === "none") return;
    setSelectedItem(item);
    setSaleSearchTerm(item.name);
    setItemDropdown([]);
  };



  // refs for search debounce
  const searchTimeout = useRef(null);

useEffect(() => {
  fetchSales();
  fetchAllItems();
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  useEffect(() => {
    // compute sale total
    const total = saleRows.reduce((acc, r) => acc + Number(r.total || 0), 0);
    setSaleTotalAmount(total);
  }, [saleRows]);

  // ------- Fetch functions -------
  async function fetchAllItems() {
    try {
      const res = await axios.get(`${URL}/asanam-uniform/items`, {
        headers: { Authorization: token },
      });
      setItemsList(res.data.data || []);
    } catch (err) {
      console.error("Failed loading items", err);
    }
  }

  async function fetchSales() {
    setLoading(true);

    try {
      const params = {
        page: CurrentPage,
        limit: rowsPerPage,
        q: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await axios.get(`${URL}/asanam-uniform/sales`, {
        params,
        headers: { Authorization: token },
      });

      setSalesList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error("Sales fetch error:", err);

      // 🔴 Error toast — force refresh
      setResponse({ status: null, message: "" });

      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to fetch sales list",
        });
      }, 10);

      // Auto-hide after 3s
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

    } finally {
      setLoading(false);
    }
  }


  // ------- Add Items modal logic -------
  const addItemRow = () => {
    if (!newItemName || !newItemRate) {
      // ❗ Validation toast — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Please enter item and rate",
        });
      }, 10);

      // Auto-hide
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return;
    }

    const newRow = {
      _id: Date.now().toString(),
      name: newItemName,
      rate: parseFloat(newItemRate),
    };

    setItemRows((prev) => [...prev, newRow]);
    setNewItemName("");
    setNewItemRate("");
  };


  const deleteItemRow = (id) => {
    setItemRows((p) => p.filter((r) => r._id !== id));
  };

  const saveItemSet = async () => {
    // ❌ Validate Date
    if (!itemDate) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Please select a date for the item set",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    // ❌ Validate at least one item
    if (itemRows.length === 0) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Add at least one item before saving",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      const payload = {
        date: itemDate,
        description: itemDescription,
        items: itemRows.map((r) => ({ name: r.name, rate: r.rate })),
      };

      await axios.post(`${URL}/asanam-uniform/items/add`, payload, {
        headers: { Authorization: token },
      });

      // 🟢 SUCCESS TOAST — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Items saved",
        });
      }, 10);

      // Auto-hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Close modal
      setIsModalOpen(false);

      // Reset state
      setItemDate("");
      setItemDescription("");
      setItemRows([]);

      // Refresh
      fetchAllItems();
    } catch (err) {
      console.error(err);

      // 🔴 ERROR TOAST — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save items",
        });
      }, 10);

      // Auto-hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };




  const onSelectItemFromList = (item) => {
    setSelectedItem(item);
    setSaleSearchTerm(item.name);
  };

  const addSaleRow = () => {
    // ❗ No item selected
    if (!selectedItem) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Select an item",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    // ❗ Invalid qty
    if (!saleQty || Number(saleQty) <= 0) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Enter valid quantity",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    // ✔ Add row
    const total = Number(saleQty) * Number(selectedItem.rate);
    const row = {
      _id: Date.now().toString(),
      itemId: selectedItem._id || selectedItem.id || null,
      name: selectedItem.name,
      rate: Number(selectedItem.rate),
      qty: Number(saleQty),
      total,
    };

    setSaleRows((p) => [...p, row]);

    // Clear inputs
    setSaleSearchTerm("");
    setSelectedItem(null);
    setSaleQty("");

    // 🟢 Optional SUCCESS toast for adding row
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Item added to sale list",
      });
    }, 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };


  const deleteSaleRow = (id) => {
    setSaleRows((p) => p.filter((r) => r._id !== id));
  };

  const saveSale = async () => {
    // VALIDATION — show proper toast
    if (!saleDate) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Pick a date for the sale" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    if (!saleRows.length) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Add at least one sale row" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      const payload = {
        receipt_no: receiptNo,
        date: saleDate,
        description: saleDescription,
        items: saleRows.map((r) => ({
          name: r.name,
          itemId: r.itemId,
          qty: r.qty,
          rate: r.rate,
          total: r.total,
        })),
        total_amount: saleRows.reduce((a, b) => a + b.total, 0),
      };


      await axios.post(`${URL}/asanam-uniform/sales/add`, payload, {
        headers: { Authorization: token },
      });

      // 🟢 SUCCESS TOAST — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Success", message: "Sale saved" });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Close modal + reset fields
      setIsSalesModalOpen(false);
      setSaleRows([]);
      setSaleTotalAmount(0);
      setSaleDate(moment().format("YYYY-MM-DD"));
      setReceiptNo("");
setSaleDescription("");


      fetchSales();

    } catch (err) {
      console.error(err);

      // 🔴 ERROR TOAST — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save sale",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Asanam Uniform</h1>

        <div className="flex items-center justify-between p-2">
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <button onClick={() => { setIsItemViewModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaEye /> Items</button>
            </div>
            <div>
              <button onClick={() => { setIsModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Items</button>
            </div>
            <div>
              <button onClick={() => { setIsSalesModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Sales</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Receipt No.</th>
                <th className="p-2 text-center">Total Amount</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : salesList && salesList.length ? (
                salesList.map((sale, idx) => (
                  <tr key={sale._id || idx} className="border-b">
                    <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td className="p-2 text-center">{moment(sale.date).format("DD-MM-YYYY")}</td>
                    <td className="p-2 text-center">{sale.receipt_no}</td>
                    <td className="p-2 text-center">{sale.total_amount}</td>
                    <td className="p-2 text-center">
                      <FaEye onClick={() => {
                        setSelectedRecord(sale);
                        setIsViewOpen(true);
                      }} size={18} className="text-lavender--600 mx-auto cursor-pointer" />
                    </td>

                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-4 text-center">No records found</td></tr>
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


        {/* -------- Add Items Modal -------- */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Items and Price">
          <div className="space-y-3 max-h-[650px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asanam Day Date</label>
                <input type="date" value={itemDate} onChange={(e) => setItemDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} type="text" placeholder="Enter Description" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
            </div>

            <div className=" p-4 border rounded-lg bg-gray-50">
              <div className="flex items-end gap-2">
                <div className="flex gap-2 flex-grow">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} type="text" placeholder="Enter Item" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Rate</label>
                    <input
                      type="text"
                      value={newItemRate}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow only numbers (and empty input)
                        if (/^\d*$/.test(val)) {
                          setNewItemRate(val);
                        }
                      }}
                      placeholder="Enter Rate"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                </div>

                <button onClick={addItemRow} className="px-4 py-2 bg-lavender--600 text-white rounded-md whitespace-nowrap">
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-gray-500">
                  <thead className="text-base text-gray-700 border-b">
                    <tr>
                      <th className="p-2 text-center">Sl No.</th>
                      <th className="p-2 text-center">Item</th>
                      <th className="p-2 text-center">Amount</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemRows.length === 0 && <tr><td colSpan={4} className="p-4 text-center">No items added</td></tr>}
                    {itemRows.map((r, idx) => (
                      <tr key={r._id} className="border-b">
                        <td className="p-2 text-center">{idx + 1}</td>
                        <td className="p-2 text-center">{r.name}</td>
                        <td className="p-2 text-center">{r.rate}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => deleteItemRow(r._id)} className="px-2 py-1 rounded border">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={saveItemSet} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Add</button>
            </div>
          </div>
        </Modal>

        {/* -------- Sales Modal -------- */}
        <Modal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} title="Add Sales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Enter Receipt Number"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
          <div className=" p-4 border rounded-lg bg-gray-50">

            <div className="flex items-end gap-4 mt-3">
              <div className="flex gap-4 flex-grow">

                {/* ITEM SEARCH FIELD */}
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700">Item</label>
                  <input
                    type="text"
                    placeholder="Search Item"
                    value={saleSearchTerm}
                    onChange={(e) => onSaleSearchChange(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />

                  {/* DROPDOWN (EXACT LIKE OFFERTORY) */}
                  {(itemDropdown.length > 0) && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                      {itemDropdown.map((item) => (
                        <li
                          key={item._id}
                          className={`px-3 py-2 flex justify-between text-sm ${item._id === "none"
                            ? "text-gray-500 cursor-default"
                            : "hover:bg-indigo-50 cursor-pointer"
                            }`}
                          onClick={() => onSelectItem(item)}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600">₹ {item.rate}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* RATE FIELD */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Rate Per Quantity</label>
                  <input
                    type="text"
                    value={selectedItem ? selectedItem.rate : ""}
                    readOnly
                    className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* QUANTITY FIELD */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
  type="text"
  value={saleQty}
  onChange={(e) => {
    const val = e.target.value;

    // Allow empty
    if (val === "") {
      setSaleQty("");
      return;
    }

    // Allow only digits and dot
    if (!/^[0-9.]+$/.test(val)) return;

    // 1️⃣ Allow "." while typing
    if (val === ".") {
      setSaleQty(".");
      return;
    }

    // 2️⃣ Allow ".5"
    if (val === ".5") {
      setSaleQty(val);
      return;
    }

    // 3️⃣ Allow whole numbers
    if (/^\d+$/.test(val)) {
      setSaleQty(val);
      return;
    }

    // 4️⃣ Allow "digit." while typing
    if (/^\d+\.$/.test(val)) {
      setSaleQty(val);
      return;
    }

    // 5️⃣ Allow "digit.5"
    if (/^\d+\.5$/.test(val)) {
      setSaleQty(val);
      return;
    }

    // ❌ Reject everything else
  }}
  placeholder="Enter no. of Quantity"
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
/>

                </div>
              </div>

              <button onClick={addSaleRow} className="px-2 py-2 bg-lavender--600 text-white rounded-md whitespace-nowrap"><FaPlus /></button>
            </div>


            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Item</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Amount</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {saleRows.length === 0 && <tr><td colSpan={5} className="p-4 text-center">No sale rows</td></tr>}
                  {saleRows.map((r, idx) => (
                    <tr key={r._id} className="border-b">
                      <td className="p-2 text-center">{idx + 1}</td>
                      <td className="p-2 text-center">{r.name}</td>
                      <td className="p-2 text-center">{r.qty}</td>
                      <td className="p-2 text-center">{r.total}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => deleteSaleRow(r._id)} className="px-2 py-1 rounded border">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Grand Total</label>
              <input type="text" value={saleTotalAmount} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={saleDescription}
                onChange={(e) => setSaleDescription(e.target.value)}
                placeholder="Enter Description"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

            </div>
          </div>


          <div className="flex justify-end gap-3 mt-6">
            <button onClick={saveSale} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
          </div>
        </Modal>
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Uniform Sales Details"
        >
          {selectedRecord && (
            <div className="flex flex-col ps-3 w-full max-w-4xl space-y-4 max-h-[650px] overflow-y-auto">

              {/* SUMMARY FIELDS */}
              {[
                { label: "Receipt No", value: selectedRecord.receipt_no },
                { label: "Date", value: moment(selectedRecord.date).format("DD-MM-YYYY") },
                { label: "Total Amount", value: `₹ ${selectedRecord.total_amount}` },
                { label: "No. of Items", value: selectedRecord.items?.length || 0 },
                { label: "Description", value: selectedRecord.description },
              ].map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 pb-2"
                >
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

              <div className="text-lg font-semibold text-gray-700 mt-4">
                Items Sold
              </div>

              {selectedRecord.items?.map((item, index) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <div className="text-base font-bold text-gray-800 mb-3">
                    Item {index + 1}: {item.name}
                  </div>

                  {[
                    { label: "Item Name", value: item.name },
                    { label: "Rate (per Qty)", value: `₹ ${item.rate}` },
                    { label: "Quantity Sold", value: item.qty },
                    { label: "Total", value: `₹ ${item.total}` },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 pb-2 last:border-none"
                    >
                      <div className="col-span-12 sm:col-span-4 text-sm font-medium text-gray-700">
                        {row.label}
                      </div>
                      <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isItemViewModalOpen}
          onClose={() => setIsItemViewModalOpen(false)}
          title="View Items"
        >
          <div className="max-h-[650px] overflow-y-auto space-y-6 p-2">
            <div className="flex justify-end mb-3 items-center gap-2">

  {/* LEFT ARROW (Previous year) */}
  <button
    onClick={() => {
      const currentIndex = yearList.indexOf(Number(itemYear));
      if (currentIndex < yearList.length - 1) {
        const newYear = yearList[currentIndex + 1];
        setItemYear(newYear);
      }
    }}
    disabled={yearList.indexOf(Number(itemYear)) === yearList.length - 1}
    className={`p-2 rounded ${yearList.indexOf(Number(itemYear)) === yearList.length - 1
        ? "opacity-40 cursor-not-allowed"
        : "hover:bg-gray-100"
      }`}
  >
    <FaChevronLeft />
  </button>

  {/* YEAR DROPDOWN */}
  <select
    value={itemYear}
    onChange={(e) => setItemYear(Number(e.target.value))}
    className="border border-gray-300 rounded-md w-[110px] px-3 py-1 text-sm text-gray-700"
  >
    {yearList.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>

  {/* RIGHT ARROW (Next year) */}
  <button
    onClick={() => {
      const currentIndex = yearList.indexOf(Number(itemYear));
      if (currentIndex > 0) {
        const newYear = yearList[currentIndex - 1];
        setItemYear(newYear);
      }
    }}
    disabled={yearList.indexOf(Number(itemYear)) === 0}
    className={`p-2 rounded ${yearList.indexOf(Number(itemYear)) === 0
        ? "opacity-40 cursor-not-allowed"
        : "hover:bg-gray-100"
      }`}
  >
    <FaChevronRight />
  </button>

</div>



            {itemSets.length > 0 ? (
              itemSets.map((set, index) => (
                <div
                  key={set._id}
                  className="border rounded-lg bg-white shadow-md"
                >
                  {/* HEADER */}
                  <div className="bg-gray-100 p-3 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <h5 className="font-semibold text-gray-700">
                        Asanam – {moment(set.date).format("YYYY")}
                      </h5>

                      <span className="text-sm text-gray-500">
                        {moment(set.date).format("DD-MM-YYYY")}
                      </span>

                    </div>

                    {set.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {set.description}
                      </p>
                    )}
                  </div>

                  {/* TABLE */}
                  <table className="w-full text-sm text-gray-600">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="p-2 text-center">Sl No.</th>
                        <th className="p-2 text-center">Item Name</th>
                        <th className="p-2 text-center">Rate (₹)</th>
                      </tr>
                    </thead>

                    <tbody>
                      {set.items.map((i, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 text-center">{idx + 1}</td>
                          <td className="p-2 text-center">{i.name}</td>
                          <td className="p-2 text-center">₹ {i.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-6">No Items Found</p>
            )}

          </div>
        </Modal>


      </div>
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
