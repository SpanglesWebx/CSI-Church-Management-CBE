import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";

export const Donation = () => {
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

  // Title search dropdown
  const [titleSearch, setTitleSearch] = useState("");
  const [titleDropdown, setTitleDropdown] = useState([]);
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const [selectedTitleName, setSelectedTitleName] = useState("");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);


  // loading
  const [loading, setLoading] = useState(false);

  // fetch donation list
  const fetchDonations = async () => {
    try {
      const res = await axios.get(
        `${URL}/donations/list`,
        {
          headers: { Authorization: token },
          params: {
            page: CurrentPage,
            limit: 10,
            search: searchTerm,
            startDate,
            endDate
          }
        }
      );

      setDonations(res.data.donations || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch donations error:", err);
      setDonations([]);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [CurrentPage, searchTerm, startDate, endDate]);

  // debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id`, {
          headers: { Authorization: token },
          params: { id: val }
        });
        setDropdownById(res.data || []);
      } catch (err) {
        setDropdownById([{ member_id: "none", member_name: "No members found" }]);
      }
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search`, {
          headers: { Authorization: token },
          params: { name: val }
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        setDropdownByName([{ member_id: "none", member_name: "No members found" }]);
      }
    }, 300)
  ).current;

  const debouncedTitleSearch = useRef(
    debounce(async (val) => {
      if (!val) return setTitleDropdown([]);
      try {
        const res = await axios.get(`${URL}/poor-help/search`, {
          headers: { Authorization: token },
          params: { search: val, limit: 20 }
        });
        setTitleDropdown(res.data.data || []);
      } catch (err) {
        setTitleDropdown([{ _id: "none", title: "No titles found" }]);
      }
    }, 300)
  ).current;

  // Save donation
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
      isMember,
      help_title_id: selectedTitleId,
      help_title_name: selectedTitleName,
      amount: Number(amount),
      date: donationDate || new Date(),
      description: description || ""
    };

    if (isMember) {
      if (!memberId || !memberName) {
        setResponse({ status: "Failed", message: "Select a member first" });
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
        return;
      }

      payload.member_id = memberId;
      payload.member_name = memberName;
      payload.member_phone = phone;

    } else {
      if (!nonMemberName) {
        setResponse({ status: "Failed", message: "Enter non-member name" });
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
        return;
      }

      payload.non_member_name = nonMemberName;
      payload.non_member_phone = nonMemberPhone;
    }

    try {
      setLoading(true);
      await axios.post(`${URL}/donations/add`, payload, { headers: { Authorization: token } });

      setResponse({ status: "Success", message: "Donation saved" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setIsMember(true);

      // Member fields
      setMemberId("");
      setMemberName("");
      setPhone("");
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);

      // Non member fields
      setNonMemberName("");
      setNonMemberPhone("");

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
      console.error("Save donation error:", err);
      const message = err.response?.data?.message || "Failed to save";
      setResponse({ status: "Failed", message });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };


  // pagination controls
  const goPrev = () => { if (CurrentPage > 1) setCurrentPage(p => p - 1); };
  const goNext = () => { if (CurrentPage < TotalPages) setCurrentPage(p => p + 1); };
  const goLast = () => { if (TotalPages > 0) setCurrentPage(TotalPages); };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Add Donation</h1>

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

          <div>
            <button onClick={() => { setIsModalOpen(true);  }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Donation</button>
          </div>
        </div>

        {/* donations table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Help Title</th>
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
                    <td className="text-center p-2">{d.isMember ? d.member_name : d.non_member_name}</td>
                    <td className="text-center p-2">{d.help_title_name}</td>
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
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Donation">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="mb-4 flex justify-end">
              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(50% - 0.25rem)",
                    transform: isMember ? "translateX(0)" : "translateX(100%)",
                  }}
                />
                <button type="button" onClick={() => {
                  setIsMember(true); setMemberIdSearch(""); setMemberNameSearch(""); setDropdownById([]); setDropdownByName([]);
                }} className={`relative flex-1 py-1 text-center rounded-full ${isMember ? "text-white" : "text-gray-700"}`}>Member</button>
                <button type="button" onClick={() => {
                  setIsMember(false); setMemberIdSearch(""); setMemberNameSearch(""); setDropdownById([]); setDropdownByName([]);
                }} className={`relative flex-1 py-1 text-center rounded-full ${!isMember ? "text-white" : "text-gray-700"}`}>Non-Member</button>
              </div>
            </div>

            {isMember ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Member ID</label>
                  <input type="text" placeholder="Search ID" value={memberIdSearch}
                    onChange={(e) => { setMemberIdSearch(e.target.value); debouncedSearchById(e.target.value); }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Member Name</label>
                  <input type="text" placeholder="Search Name" value={memberNameSearch}
                    onChange={(e) => { setMemberNameSearch(e.target.value); debouncedSearchByName(e.target.value); }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" value={phone} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100" />
                </div>

                {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                  <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[85%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {(dropdownById.length > 0 ? dropdownById : dropdownByName).map(m => (
                      <li key={m.member_id}
                        className={`flex px-3 py-2 text-sm ${m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                        onClick={() => {
                          if (m.member_id === "none") return;
                          setMemberIdSearch(m.member_id);
                          setMemberNameSearch(m.member_name);
                          setPhone(m.mobile_number || "");
                          setMemberId(m.member_id);
                          setMemberName(m.member_name);
                          setDropdownById([]); setDropdownByName([]);
                        }}>
                        <span className="w-[250px] font-medium">{m.member_id}</span>
                        <span className="flex-1">{m.member_name}</span>
                        <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input type="text" placeholder="Enter Name" value={nonMemberName} onChange={(e) => setNonMemberName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" placeholder="Enter Phone" maxLength={10} value={nonMemberPhone} onChange={(e) => setNonMemberPhone(e.target.value.replace(/\D/g, ""))} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
              </div>
            )}


          </div>
          {/* Title search + donation details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                placeholder="Search Poor Help Title"
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
          title="Donation Details"
        >
          {selectedRecord && (
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">
              {[
                { label: "Member Type", value: selectedRecord.isMember ? "Member" : "Non-Member" },
                {
                  label: "Name",
                  value: selectedRecord.isMember
                    ? selectedRecord.member_name
                    : selectedRecord.non_member_name,
                },
                {
                  label: "Phone",
                  value: selectedRecord.isMember
                    ? selectedRecord.member_phone || "-"
                    : selectedRecord.non_member_phone || "-",
                },
                { label: "Title", value: selectedRecord.help_title_name },
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