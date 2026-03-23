import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";

export const OtherIncomeDonation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [donations, setDonations] = useState([]);

  // member search (existing)
  const [isMember, setIsMember] = useState(true);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");

  // non-member fields
  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");

  // donation fields
  const [donationDate, setDonationDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Title search dropdown (Other Income Title)
  const [titleSearch, setTitleSearch] = useState("");
  const [titleDropdown, setTitleDropdown] = useState([]);
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const [selectedTitleName, setSelectedTitleName] = useState("");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // loading
  const [loading, setLoading] = useState(false);

  // fetch donation list (other income donations)
  const fetchDonations = async () => {
    try {
      const res = await axios.get(
        `${URL}/other-income-donations/list`,
        {
          headers: { Authorization: token },
          params: {
            page: CurrentPage,
            limit: 10,
            search: searchTerm,
            startDate,
            endDate,
          },
        }
      );

      setDonations(res.data.donations || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch other income donations error:", err);
      setDonations([]);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CurrentPage, searchTerm, startDate, endDate]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedTitleSearch = useRef(
    debounce(async (val) => {
      if (!val) return setTitleDropdown([]);
      try {
        const res = await axios.get(`${URL}/other-income/search`, {
          headers: { Authorization: token },
          params: { search: val, limit: 20 },
        });
        setTitleDropdown(res.data.data || []);
      } catch (err) {
        setTitleDropdown([{ _id: "none", title: "No titles found" }]);
      }
    }, 300)
  ).current;

  // Save other income donation
  const handleSaveDonation = async () => {
    // minimal validation
    if (!selectedTitleId || !selectedTitleName) {
      setResponse({ status: "Failed", message: "Please select a Title" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    if (!amount || isNaN(amount)) {
      setResponse({ status: "Failed", message: "Valid amount required" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    // build payload
    const payload = {
      other_income_title_id: selectedTitleId,
      other_income_title_name: selectedTitleName,
      amount: Number(amount),
      date: donationDate || new Date(),
      description: description || "",
    };

    try {
      setLoading(true);
      await axios.post(`${URL}/other-income-donations/add`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Donation saved" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);


      // Title fields
      setSelectedTitleId(null);
      setSelectedTitleName("");
      setTitleSearch("");
      setTitleDropdown([]);

      // Donation fields
      setDonationDate("");
      setAmount("");
      setDescription("");

      // Close modal AFTER resetting fields
      setIsModalOpen(false);

      // Refresh table
      setCurrentPage(1);
      fetchDonations();
    } catch (err) {
      console.error("Save other income donation error:", err);
      const message = err.response?.data?.message || "Failed to save";
      setResponse({ status: "Failed", message });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // pagination controls
  const goPrev = () => {
    if (CurrentPage > 1) setCurrentPage((p) => p - 1);
  };
  const goNext = () => {
    if (CurrentPage < TotalPages) setCurrentPage((p) => p + 1);
  };
  const goLast = () => {
    if (TotalPages > 0) setCurrentPage(TotalPages);
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Add Other Income Donation</h1>

        {/* top filters */}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>

          <div>
            <button onClick={() => { setIsModalOpen(true); /* open modal */ }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Donation</button>
          </div>
        </div>

        {/* donations table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Other Income Title</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-3 text-gray-500">No donations found</td>
                </tr>
              ) : (
                donations.map((d, i) => (
                  <tr key={d._id} className="border-b">
                    <td className="text-center p-2">{(CurrentPage - 1) * 10 + i + 1}</td>
                    <td className="text-center p-2">{d.other_income_title_name || d.help_title_name}</td>
                    <td className="text-center p-2">₹{d.amount}</td>
                    <td className="text-center p-2">{moment(d.date).format("DD-MM-YYYY")}</td>
                    <td className="text-center p-2">
                      <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto"
                        onClick={() => {
                          setSelectedRecord(d);
                          setIsViewOpen(true);
                        }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="relative flex items-center justify-center mt-4 space-x-3 select-none">
          <button onClick={() => setCurrentPage(CurrentPage - 1)} disabled={CurrentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-lavender--600 text-white rounded">{CurrentPage}</button>
          <button onClick={() => setCurrentPage(CurrentPage + 1)} disabled={CurrentPage === TotalPages || TotalPages === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>

          <div className="absolute right-2 flex space-x-2 px-4">
            <span className="px-4 py-2 bg-gray-100 rounded">Total Pages: {TotalPages}</span>
            <span onClick={() => setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? "opacity-50 cursor-not-allowed bg-gray-100 px-4 py-2" : "px-4 py-2 text-blue-600 bg-gray-100 rounded cursor-pointer"}`}>Last Page</span>
          </div>
        </div>

        {/* Modal for add donation */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Other Income Donation">
          
          {/* Title search + donation details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Other Income Title</label>
              <input
                type="text"
                placeholder="Search Other Income Title"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={titleSearch}
                onChange={(e) => {
                  setTitleSearch(e.target.value);
                  setSelectedTitleId(null);
                  setSelectedTitleName("");
                  debouncedTitleSearch(e.target.value);
                }}
              />
              {titleDropdown.length > 0 && (
                <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                  {titleDropdown.map(t => (
                    <li key={t._id}
                      className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${t._id === "none" ? "text-gray-400 cursor-default" : ""}`}
                      onClick={() => {
                        if (t._id === "none") return;
                        setSelectedTitleId(t._id);
                        setSelectedTitleName(t.title);
                        setTitleSearch(t.title);
                        setTitleDropdown([]);
                      }}>
                      <div className="font-medium">{t.title}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={donationDate} onChange={(e) => setDonationDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Description" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleSaveDonation} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Add</button>
          </div>
        </Modal>

        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={selectedRecord?.other_income_title_name || "Donation Details"}
        >
          {selectedRecord && (
            <div className="flex flex-col ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
              {[
                { label: "Amount", value: `₹ ${selectedRecord.amount}` },
                {
                  label: "Date",
                  value: moment(selectedRecord.date).format("DD-MM-YYYY"),
                },
                { label: "Description", value: selectedRecord.description || "-" },

              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
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
  );
};
