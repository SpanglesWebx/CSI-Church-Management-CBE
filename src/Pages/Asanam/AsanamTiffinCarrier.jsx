import React, { useEffect, useRef, useState } from "react";
import { FaAmazonPay, FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import SmallModal from "../../Components/Expense/SmallSizedModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/Pagination";

export const AsanamTiffinCarrier = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // add income modal
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false); // price modal
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);

  // member search states (same UX as YouthList)
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);

  // price (small modal)
  const [priceDate, setPriceDate] = useState("");
  const [pricePerCarrier, setPricePerCarrier] = useState("");
  const [priceNote, setPriceNote] = useState("");

  // income form
  const [incomeDate, setIncomeDate] = useState("");
  const [numCarriers, setNumCarriers] = useState("");
  const [amount, setAmount] = useState(""); // computed
  const [incomeDescription, setIncomeDescription] = useState("");

  // listing data
  const [incomeList, setIncomeList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [asanamDayDate, setAsanamDayDate] = useState("");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payRecordId, setPayRecordId] = useState(null);
  // pagination (standard reusable)
const [rowsPerPage, setRowsPerPage] = useState(25); // ✅ default 25
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




  // debounce utility
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // member search debounced
  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        // backend might return array in res.data.data or res.data; try both
        const data = res.data?.data || res.data;
        setDropdownById(Array.isArray(data) ? data : []);
      } catch {
        setDropdownById([{ member_id: "none", member_name: "No Members Found" }]);
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
        const data = res.data?.data || res.data;
        setDropdownByName(Array.isArray(data) ? data : []);
      } catch {
        setDropdownByName([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // ============== Fetch listing ==============
  const fetchIncomeList = async () => {
    try {
      const res = await axios.get(`${URL}/asanam-tiffin-carrier-income/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          search: searchTerm,
          startDate,
          limit: rowsPerPage,
          endDate,
        },
      });
      const incomes = res.data?.incomes || res.data?.data || [];
      setIncomeList(incomes);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("fetchIncomeList error:", err);
      setIncomeList([]);
      setTotalPages(1);
    }
  };

useEffect(() => {
  fetchIncomeList();
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  const markAsPaid = async () => {
    if (!payRecordId) return;

    try {
      await axios.put(
        `${URL}/asanam-tiffin-carrier-income/mark-paid/${payRecordId}`,
        {},
        { headers: { Authorization: token } }
      );

      triggerToast("Success", "Marked as Paid");

      setIsPayModalOpen(false);
      setPayRecordId(null);

      fetchIncomeList(); // Refresh table
    } catch (err) {
      triggerToast("Failed", "Failed to update payment status");
    }
  };


  // ============== Price: Save (Small Modal) ==============
  const savePrice = async () => {
    if (!priceDate || pricePerCarrier === "") {
      triggerToast("Failed", "Date and Price are required");
      return;
    }

    const year = new Date(priceDate).getFullYear();

    try {
      await axios.post(
        `${URL}/asanam-tiffin-carrier-price/add`,
        {
          date: priceDate,
          price_per_carrier: Number(pricePerCarrier),
          note: priceNote,
        },
        { headers: { Authorization: token } }
      );

      triggerToast("Success", `Price for ${year} saved`);
      setIsPriceModalOpen(false);
      setPriceDate("");
      setPricePerCarrier("");
      setPriceNote("");
    } catch (err) {
      console.error("savePrice error:", err);
      const message = err.response?.data?.message || "Failed to save price";
      triggerToast("Failed", message);
    }
  };

  // ============== Income: when user picks date → fetch price for that year ==============
  const fetchPriceForYear = async (dateStr) => {
    if (!dateStr) {
      setAmount("");
      return null;
    }

    const year = new Date(dateStr).getFullYear();
    try {
      const res = await axios.get(`${URL}/asanam-tiffin-carrier-price/get-by-year`, {
        headers: { Authorization: token },
        params: { year },
      });

      return res.data?.data || res.data;
    } catch (err) {
      // 404 = not found or other error
      return null;
    }
  };

  useEffect(() => {
    const loadAndCompute = async () => {
      if (!incomeDate) {
        setAmount("");
        return;
      }
      const priceDoc = await fetchPriceForYear(incomeDate);
      if (!priceDoc) {
        // price not set for that year
        setAmount("");
        triggerToast("Failed", `Price not set for year ${new Date(incomeDate).getFullYear()}`);
        return;
      }
      // set price and compute
      const price = Number(priceDoc.price_per_carrier || priceDoc.price_per_token || 0);
      if (numCarriers && /^\d+$/.test(String(numCarriers))) {
        setAmount(String(Number(numCarriers) * price));
      } else {
        setAmount("");
      }
    };

    loadAndCompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeDate, numCarriers]);

  // ============== Save Income ==============
  const saveIncome = async () => {
    if (!memberIdSearch || !memberNameSearch || !incomeDate || !asanamDayDate || numCarriers === "") {
      triggerToast("Failed", "All fields are required");
      return;
    }

    if (!memberVerified) {
      triggerToast("Failed", "Select a valid member from dropdown");
      return;
    }

    // Ensure price exists
    const priceDoc = await fetchPriceForYear(incomeDate);
    if (!priceDoc) {
      triggerToast("Failed", `Price not set for year ${new Date(incomeDate).getFullYear()}`);
      return;
    }

    const payload = {
      member_id: memberIdSearch,
      member_name: memberNameSearch,
      phone,
      date_of_issue: incomeDate,
      asanam_day_date: asanamDayDate,
      payment_status: "Unpaid",

      num_carriers: Number(numCarriers),
      description: incomeDescription || "",
      created_by: "", // optional
    };

    try {
      await axios.post(`${URL}/asanam-tiffin-carrier-income/add`, payload, {
        headers: { Authorization: token },
      });

      triggerToast("Success", "Carrier income saved");
      setIsModalOpen(false);
      // reset form
      setMemberIdSearch("");
      setMemberNameSearch("");
      setPhone("");
      setMemberVerified(false);
      setIncomeDate("");
      setNumCarriers("");
      setAmount("");
      setIncomeDescription("");
      setAsanamDayDate("");
      fetchIncomeList();

    } catch (err) {
      console.error("saveIncome error:", err);
      const message = err.response?.data?.message || "Failed to save income";
      triggerToast("Failed", message);
    }
  };

  // ============== Utility: toast ==============
  const triggerToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // ============== Single view ==============
  const openView = async (item) => {
    try {
      if (item && item._id) {
        const res = await axios.get(`${URL}/asanam-tiffin-carrier-income/${item._id}`, {
          headers: { Authorization: token },
        });
        setSelectedRecord(res.data?.data || item);
      } else setSelectedRecord(item);
      setIsViewOpen(true);
    } catch {
      setSelectedRecord(item);
      setIsViewOpen(true);
    }
  };
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Asanam Tiffin Carrier</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setIsPriceModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Price</button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Income</button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Carriers</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.length === 0 && (
                <tr><td colSpan="6" className="p-3 text-center text-gray-500">No records found</td></tr>
              )}

              {incomeList.map((it, idx) => (
                <tr key={it._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="p-2 text-left">{it.member_name}</td>
                  <td className="p-2">{it.num_carriers}</td>
                  <td className="p-2">₹{it.amount}</td>
                  <td className="p-2">{moment(it.date).format("DD/MM/YYYY")}</td>
                  <td className="p-2 text-center flex justify-center gap-3">

                    <FaEye
                      size={18}
                      title="View"
                      className="cursor-pointer text-lavender--600"
                      onClick={() => openView(it)}
                    />

                    {it.payment_status !== "Paid" && (
                      <FaAmazonPay
                        size={22}
                        title="Mark as Paid"
                        className="cursor-pointer text-green-500"
                        onClick={() => {
                          setPayRecordId(it._id);
                          setIsPayModalOpen(true);
                        }}
                      />
                    )}

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

      </div>

      {/* SmallModal: Price per carrier */}
      <SmallModal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)} title="Add Price Per Carrier">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Per Carrier</label>
            <input
              type="text"
              value={pricePerCarrier}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setPricePerCarrier(val);
              }}
              placeholder="Enter Amount"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
          <input type="text" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="Note" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={savePrice} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
        </div>
      </SmallModal>

      {/* Modal: Add Carrier Income */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Carrier Income">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
          {/* Member ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Member ID</label>
            <input type="text" placeholder="Search by ID" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={memberIdSearch}
              onChange={(e) => { const val = e.target.value; setMemberIdSearch(val); debouncedSearchById(val); setDropdownByName([]); setMemberVerified(false); }} />
          </div>

          {/* Member Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Name</label>
            <input type="text" placeholder="Search by Name" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={memberNameSearch}
              onChange={(e) => { const val = e.target.value; setMemberNameSearch(val); debouncedSearchByName(val); setDropdownById([]); setMemberVerified(false); }} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" value={phone} readOnly placeholder="Phone Number" className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>

          {/* Unified Dropdown */}
          {(dropdownById.length > 0 || dropdownByName.length > 0) && (
            <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                <li key={m.member_id}
                  className={`flex px-3 py-2 text-sm ${m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                  onClick={() => {
                    if (m.member_id === "none") return;
                    setMemberIdSearch(m.member_id);
                    setMemberNameSearch(m.member_name);
                    setPhone(m.mobile_number || "");
                    setDropdownById([]);
                    setDropdownByName([]);
                    setMemberVerified(true);
                  }}>
                  <span className="w-[250px] font-medium">{m.member_id}</span>
                  <span className="flex-1">{m.member_name}</span>
                  <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 mt-24">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Carrier Issued</label>
            <input type="date" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Asanam-Day Date</label>
            <input
              type="date"
              value={asanamDayDate}
              onChange={(e) => setAsanamDayDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">No. of Carriers</label>
            <input type="text" value={numCarriers} onChange={(e) => { const val = e.target.value; if (/^\d*$/.test(val)) setNumCarriers(val); }} placeholder="Enter number of carriers" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="text" value={amount} readOnly placeholder="Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100" />
          </div>


        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2 mt-24">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" value={incomeDescription} onChange={(e) => setIncomeDescription(e.target.value)} placeholder="Enter Description" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={saveIncome} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
        </div>
      </Modal>

      {/* View modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Carrier Income Details">
        {selectedRecord && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
            {[
              { label: "Member Name", value: selectedRecord.member_name },
              { label: "Phone", value: selectedRecord.phone || "-" },
              { label: "Carriers", value: selectedRecord.num_carriers },
              { label: "Price Per Carrier", value: `₹ ${selectedRecord.price_per_carrier}` },
              { label: "Amount", value: `₹ ${selectedRecord.amount}` },
              { label: "Date", value: moment(selectedRecord.date).format("DD-MM-YYYY") },
              { label: "Date of Issue", value: moment(selectedRecord.date_of_issue).format("DD-MM-YYYY") },
              { label: "Asanam Day Date", value: moment(selectedRecord.asanam_day_date).format("DD-MM-YYYY") },
              { label: "Payment Status", value: selectedRecord.payment_status || "Unpaid" },
              selectedRecord.payment_date && {
                label: "Payment Date",
                value: moment(selectedRecord.payment_date).format("DD-MM-YYYY"),
              },
              { label: "Description", value: selectedRecord.description || "-" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">{item.label}</div>
                <div className="col-span-12 sm:col-span-8 text-base text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <SmallSizedModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Confirm Payment"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to mark this record as <b>Paid</b>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsPayModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={markAsPaid}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Yes, Mark Paid
          </button>
        </div>
      </SmallSizedModal>


      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
