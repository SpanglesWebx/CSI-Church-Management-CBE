// HarvestBiriyaniToken.jsx
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

export const HarvestBiriyaniToken = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);

  // member search states
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);

  // token price (small modal)
  const [priceDate, setPriceDate] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [priceNote, setPriceNote] = useState("");

  // token income form
  const [incomeDate, setIncomeDate] = useState("");
  const [harvestDayDate, setHarvestDayDate] = useState("");

  const [numTokens, setNumTokens] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");

  // listing data
  const [incomeList, setIncomeList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payRecordId, setPayRecordId] = useState(null);// pagination (shared)
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");



  // debounce helper
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
        setDropdownById(res.data || []);
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
        setDropdownByName(res.data || []);
      } catch {
        setDropdownByName([{ member_id: "none", member_name: "No Members Found" }]);
      }
    }, 300)
  ).current;

  // =============== Fetch listing ===============
  const fetchIncomeList = async () => {
    try {
      const res = await axios.get(
        `${URL}/harvest-biriyani-token-income/list`,
        {
          headers: { Authorization: token },
          params: {
            page: CurrentPage,
            limit: rowsPerPage,
            search: searchTerm,
            startDate,
            endDate,
          },
        }
      );

      setIncomeList(res.data.incomes || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("fetchIncomeList error:", err);
      setIncomeList([]);
      setTotalPages(1);
    }
  };

useEffect(() => {
  fetchIncomeList();
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  // =============== Save Token Price ===============
  const savePrice = async () => {
    if (!priceDate || pricePerToken === "") {
      triggerToast("Failed", "Date and Price are required");
      return;
    }

    const year = new Date(priceDate).getFullYear();

    try {
      await axios.post(
        `${URL}/harvest-biriyani-token-price/add`,
        {
          date: priceDate,
          price_per_token: Number(pricePerToken),
          note: priceNote,
        },
        { headers: { Authorization: token } }
      );

      triggerToast("Success", `Price for ${year} saved`);
      setIsTokenModalOpen(false);
      setPriceDate("");
      setPricePerToken("");
      setPriceNote("");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save price";
      triggerToast("Failed", message);
    }
  };

  // =============== Fetch price by year ===============
  const fetchPriceForYear = async (dateStr) => {
    if (!dateStr) {
      setAmount("");
      return null;
    }

    const year = new Date(dateStr).getFullYear();

    try {
      const res = await axios.get(
        `${URL}/harvest-biriyani-token-price/get-by-year`,
        {
          headers: { Authorization: token },
          params: { year },
        }
      );
      return res.data.data;
    } catch {
      return null;
    }
  };

  // when income date or numTokens changes:
  useEffect(() => {
    const loadAndCompute = async () => {
      if (!incomeDate) {
        setAmount("");
        return;
      }

      const priceDoc = await fetchPriceForYear(incomeDate);
      if (!priceDoc) {
        setAmount("");
        triggerToast(
          "Failed",
          `Token price not set for year ${new Date(incomeDate).getFullYear()}`
        );
        return;
      }

      const price = Number(priceDoc.price_per_token);
      if (numTokens && /^\d+$/.test(numTokens)) {
        setAmount(String(Number(numTokens) * price));
      } else {
        setAmount("");
      }
    };

    loadAndCompute();
  }, [incomeDate, numTokens]);

  // =============== Save Income ===============
  const saveIncome = async () => {
    if (!memberVerified || !memberIdSearch || !memberNameSearch || !incomeDate || !harvestDayDate || numTokens === "") {

      triggerToast("Failed", "All fields are required");
      return;
    }

    const priceDoc = await fetchPriceForYear(incomeDate);
    if (!priceDoc) {
      triggerToast(
        "Failed",
        `Token price not set for year ${new Date(incomeDate).getFullYear()}`
      );
      return;
    }

    const payload = {
      member_id: memberIdSearch,
      member_name: memberNameSearch,
      phone,
      date_of_issue: incomeDate,
      harvest_day_date: harvestDayDate,
      num_tokens: Number(numTokens),
      description: incomeDescription || "",
      created_by: "",
      payment_status: "Unpaid",
    };


    try {
      await axios.post(
        `${URL}/harvest-biriyani-token-income/add`,
        payload,
        { headers: { Authorization: token } }
      );

      triggerToast("Success", "Token income saved");
      setIsModalOpen(false);

      // reset
      setMemberIdSearch("");
      setMemberNameSearch("");
      setPhone("");
      setIncomeDate("");
      setNumTokens("");
      setAmount("");
      setIncomeDescription("");
      setHarvestDayDate("");


      fetchIncomeList();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save income";
      triggerToast("Failed", message);
    }
  };

  // =============== Toast ===============
  const triggerToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // =============== View single ===============
  const openView = async (item) => {
    try {
      if (item?._id) {
        const res = await axios.get(
          `${URL}/harvest-biriyani-token-income/${item._id}`,
          { headers: { Authorization: token } }
        );
        setSelectedRecord(res.data.data || item);
      } else setSelectedRecord(item);
      setIsViewOpen(true);
    } catch {
      setSelectedRecord(item);
      setIsViewOpen(true);
    }
  };

  const markAsPaid = async () => {
  if (!payRecordId) return;

  try {
    await axios.put(
      `${URL}/harvest-biriyani-token-income/mark-paid/${payRecordId}`,
      {},
      { headers: { Authorization: token } }
    );

    triggerToast("Success", "Marked as Paid");
    setIsPayModalOpen(false);
    setPayRecordId(null);
    fetchIncomeList();
  } catch (err) {
    triggerToast("Failed", "Could not update payment");
  }
};

  return (
    <>
      {/* --- SAME UI EXACTLY --- */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Harvest Sunday Biriyani Token</h1>

        {/* Search + Filters + Buttons */}
        <div className="flex items-center justify-between p-2">

          {/* Search */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" fill="none"
                  stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>

              <input
                type="search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Date filters */}
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label>From</label>
            <input type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 w-40 bg-gray-50 border border-gray-300 rounded" />

            <label>To</label>
            <input type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 w-40 bg-gray-50 border border-gray-300 rounded" />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
              <FaPlus /> Token Price
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
              <FaPlus /> Token Income
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Tokens</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {incomeList.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {incomeList.map((it, idx) => (
                <tr key={it._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="p-2 text-left">{it.member_name}</td>
                  <td className="p-2">{it.num_tokens}</td>
                  <td className="p-2">₹{it.amount}</td>
                  <td className="p-2">{moment(it.date).format("DD/MM/YYYY")}</td>
                  <td className="p-2 text-center flex justify-center gap-3">

                    {/* View */}
                    <FaEye
                      size={18}
                      className="cursor-pointer text-lavender--600"
                      onClick={() => openView(it)}
                    />

                    {/* Mark as Paid icon (only show if unpaid) */}
                    {it.payment_status !== "Paid" && (
                      <FaAmazonPay
                        size={20}
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

      {/* ---------------- Token Price Modal ---------------- */}
      <SmallModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        title="Add Price Per Token">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label>Date</label>
            <input
              type="date"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              value={priceDate}
              onChange={(e) => setPriceDate(e.target.value)}
            />
          </div>

          <div>
            <label>Price Per Token</label>
            <input
              type="text"
              value={pricePerToken}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setPricePerToken(v);
              }}
              placeholder="Enter Amount"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label>Note (optional)</label>
          <input
            type="text"
            value={priceNote}
            onChange={(e) => setPriceNote(e.target.value)}
            placeholder="Note"
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={savePrice}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md">
            Save
          </button>
        </div>
      </SmallModal>

      {/* ---------------- Income Modal ---------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Token Income">

        {/* Member Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

          {/* ID */}
          <div>
            <label>Member ID</label>
            <input
              type="text"
              placeholder="Search by ID"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              value={memberIdSearch}
              onChange={(e) => {
                const v = e.target.value;
                setMemberIdSearch(v);
                debouncedSearchById(v);
                setDropdownByName([]);
                setMemberVerified(false);
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label>Member Name</label>
            <input
              type="text"
              placeholder="Search by Name"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              value={memberNameSearch}
              onChange={(e) => {
                const v = e.target.value;
                setMemberNameSearch(v);
                debouncedSearchByName(v);
                setDropdownById([]);
                setMemberVerified(false);
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              readOnly
              placeholder="Phone Number"
              className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Dropdown */}
          {(dropdownById.length > 0 || dropdownByName.length > 0) && (
            <ul className="absolute left-1/2 -translate-x-1/2
              mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg
              z-50 max-h-60 overflow-y-auto">

              {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                <li
                  key={m.member_id}
                  className={`flex px-3 py-2 text-sm ${m.member_id === "none"
                      ? "text-gray-500 cursor-default"
                      : "hover:bg-indigo-50 cursor-pointer"
                    }`}
                  onClick={() => {
                    if (m.member_id === "none") return;

                    setMemberIdSearch(m.member_id);
                    setMemberNameSearch(m.member_name);
                    setPhone(m.mobile_number || "");

                    setDropdownById([]);
                    setDropdownByName([]);
                    setMemberVerified(true);
                  }}
                >
                  <span className="w-[250px] font-medium">{m.member_id}</span>
                  <span className="flex-1">{m.member_name}</span>
                  <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Income form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 mt-4">

          <div>
            <label>Date of Token Issued</label>
            <input
              type="date"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label>Harvest Day Date</label>
            <input
              type="date"
              value={harvestDayDate}
              onChange={(e) => setHarvestDayDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>


          <div>
            <label>No. of Tokens</label>
            <input
              type="text"
              value={numTokens}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setNumTokens(v);
              }}
              placeholder="Enter number of tokens"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              type="text"
              value={amount}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
            />
          </div>



        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2 mt-4">
          <div>
            <label>Description</label>
            <input
              type="text"
              value={incomeDescription}
              onChange={(e) => setIncomeDescription(e.target.value)}
              placeholder="Enter Description"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={saveIncome}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md">
            Save
          </button>
        </div>

      </Modal>

      <SmallSizedModal
  isOpen={isPayModalOpen}
  onClose={() => setIsPayModalOpen(false)}
  title="Confirm Payment"
>
  <p className="text-gray-700 mb-4">
    Are you sure you want to mark this entry as <b>Paid</b>?
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


      {/* ---------------- View Modal ---------------- */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Harvest Token Income Details"
      >
        {selectedRecord && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">

            {[
              { label: "Member Name", value: selectedRecord.member_name },
              { label: "Phone", value: selectedRecord.phone || "-" },
              { label: "Tokens", value: selectedRecord.num_tokens },
              { label: "Price Per Token", value: `₹ ${selectedRecord.price_per_token}` },
              { label: "Amount", value: `₹ ${selectedRecord.amount}` },
              { label: "Date of Token Issued", value: moment(selectedRecord.date_of_issue).format("DD-MM-YYYY") },
              { label: "Harvest Day Date", value: moment(selectedRecord.harvest_day_date).format("DD-MM-YYYY") },
              { label: "Payment Status", value: selectedRecord.payment_status },
              selectedRecord.payment_status === "Paid" && {
                label: "Payment Date",
                value: moment(selectedRecord.payment_date).format("DD-MM-YYYY"),
              },

              { label: "Description", value: selectedRecord.description || "-" },
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

      {/* Toasts */}
      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};
