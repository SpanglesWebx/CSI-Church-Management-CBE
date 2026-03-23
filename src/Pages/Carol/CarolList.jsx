import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";

export const CarolList = () => {
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });

  // ------------------- List + filters -------------------
  const [teamsList, setTeamsList] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------- Add Teams modal -------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");

  // ------------------- View modal -------------------
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // { team: {...}, payments: [...] }

  // ------------------- Add Payment nested modal -------------------
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  // Add payment form state
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentItems, setPaymentItems] = useState([]); // [{team, amount}]
  const [savingPayment, setSavingPayment] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




  // ------------------- Helpers -------------------
  const onlyNumbers = (v) => (v || "").toString().replace(/[^0-9]/g, "");

  // debounce - same pattern you used
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // ------------------- Fetch list -------------------
  const fetchList = async (page = CurrentPage) => {
    try {
      setLoading(true);
      const res = await axios.get(`${URL}/carols/list`, {
      headers: { Authorization: token },
      params: {
        page,
        limit: rowsPerPage,            // ✅ dynamic
        search: searchTerm || undefined,
      },
    });
      if (res.data && res.data.success) {
        setTeamsList(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || page);
      } else {
        setTeamsList([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("fetchList error:", err);
      setTeamsList([]);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchList(CurrentPage);
}, [CurrentPage, searchTerm, rowsPerPage]);


  // ------------------- Create Teams (modal) -------------------
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateTeams = async () => {
    if (!tags.length) {
      // validation toast (force re-render pattern)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Add at least one team" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      const payload = {
        year: new Date().getFullYear(),
        teams: tags,
      };
      const res = await axios.post(`${URL}/carols/create-teams`, payload, {
        headers: { Authorization: token },
      });

      if (res.data && res.data.success) {
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Success", message: "Teams created successfully" });
        }, 10);

        setIsCreateModalOpen(false);
        setTags([]);
        setInput("");

        // refresh list
        fetchList(1);
      } else {
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Failed", message: res.data.message || "Failed to create teams" });
        }, 10);
      }
    } catch (err) {
      console.error("handleCreateTeams err:", err);
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Server error while creating teams" });
      }, 10);
    } finally {
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  // ------------------- Open view modal -------------------
  const handleOpenView = async (group) => {
    try {
      // fetch latest details for this group
      const res = await axios.get(`${URL}/carols/details/${group._id}`, { headers: { Authorization: token } });
      if (res.data && res.data.success) {
        setSelectedGroup(res.data.data);
        setIsViewOpen(true);
      } else {
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Failed", message: res.data.message || "Failed to load group details" });
        }, 10);
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      }
    } catch (err) {
      console.error("handleOpenView err:", err);
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Server error while loading group" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  // ------------------- Open Add Payment modal (prepare items) -------------------
  const handleOpenAddPayment = (teamObj) => {
    // teamObj is team object (team group)
    if (!teamObj || !teamObj.teams) return;
    // prepare payment items
    const items = (teamObj.teams || []).map((t) => ({ team: t, amount: 0, receipt_from: "", receipt_to: "" }));
    setPaymentItems(items);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setSavingPayment(false);
    setIsAddPaymentOpen(true);
  };

  // ------------------- Update amount input -------------------
  const updatePaymentAmount = (idx, val) => {
    const copy = [...paymentItems];
    // allow only numbers
    const normalized = onlyNumbers(val);
    copy[idx].amount = normalized === "" ? "" : Number(normalized);
    setPaymentItems(copy);
  };

  const dayTotal = paymentItems.reduce((s, it) => s + (Number(it.amount || 0)), 0);

  const updateReceiptFrom = (idx, val) => {
    const copy = [...paymentItems];
    copy[idx].receipt_from = onlyNumbers(val);
    setPaymentItems(copy);
  };

  const updateReceiptTo = (idx, val) => {
    const copy = [...paymentItems];
    copy[idx].receipt_to = onlyNumbers(val);
    setPaymentItems(copy);
  };


  // ------------------- Add Payment (prevent duplicate date) -------------------
  const handleSavePayment = async () => {
    // validations: at least one non-zero amount? (you can allow zero if needed)
    const anyEntered = paymentItems.some(p => Number(p.amount || 0) > 0);
    if (!anyEntered) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Enter at least one amount" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    // check duplicate for the selected date by fetching latest payments for this group
    if (!selectedGroup || !selectedGroup.team || !selectedGroup.team._id) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Invalid team group" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      setSavingPayment(true);
      // fetch latest details to verify duplicate
      const latest = await axios.get(`${URL}/carols/details/${selectedGroup.team._id}`, { headers: { Authorization: token } });
      if (!(latest.data && latest.data.success)) {
        throw new Error("Failed to validate existing payments");
      }
      const existingPayments = latest.data.data.payments || [];
      const exists = existingPayments.find(p => p.date === paymentDate);
      if (exists) {
        // duplicate - prevent (choice 3 = B)
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Failed", message: "Payment already added for this date" });
        }, 10);
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
        setSavingPayment(false);
        return;
      }

      // prepare payload
      const payload = {
        team_group_id: selectedGroup.team._id,
        date: paymentDate,
        payments: paymentItems.map(p => ({
          team: p.team,
          amount: Number(p.amount || 0),
          receipt_from: Number(p.receipt_from || 0),
          receipt_to: Number(p.receipt_to || 0),
        }))
      };

      const res = await axios.post(`${URL}/carols/add-payment`, payload, { headers: { Authorization: token } });

      if (res.data && res.data.success) {
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Success", message: "Payment saved successfully" });
        }, 10);

        // close add payment and refresh view & list
       setIsAddPaymentOpen(false);
setShowAddPayment(false);
setPaymentItems([]);

        // refresh view modal details
        try {
          const refreshed = await axios.get(`${URL}/carols/details/${selectedGroup.team._id}`, { headers: { Authorization: token } });
          if (refreshed.data && refreshed.data.success) setSelectedGroup(refreshed.data.data);
        } catch (err) { /* ignore */ }

        // refresh list
        fetchList(CurrentPage);
      } else {
        setResponse({ status: null, message: "" });
        setTimeout(() => {
          setResponse({ status: "Failed", message: res.data.message || "Failed to save payment" });
        }, 10);
      }
    } catch (err) {
      console.error("handleSavePayment err:", err);
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: err?.response?.data?.message || "Server error while saving payment" });
      }, 10);
    } finally {
      setSavingPayment(false);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Carols</h1>

        {/* Search + Add */}
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="carol-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by year or team"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4">
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
              <FaPlus /> Team
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Teams</th>
                <th className="p-2 text-center">Created</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-3">Loading...</td></tr>
              ) : teamsList.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-3">No records</td></tr>
              ) : (
                teamsList.map((g, index) => (
                  <tr key={g._id} className="border-b text-center">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2">{(g.teams || []).join(", ")}</td>
                    <td className="p-2">
                      {g.created_at
                        ? moment(g.created_at).format("DD-MMM-YYYY")
                        : "-"}
                    </td>
                    <td className="p-2">₹ {g.total_amount || 0}</td>
                    <td className="p-2 flex justify-center gap-3 items-center">
                      <FaEye size={18} className="text-lavender--600 cursor-pointer"
                        onClick={() => handleOpenView(g)} />
                    </td>
                  </tr>
                ))
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


        {/* Create Teams Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Teams">
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Teams</label>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {tags.map((tag, i) => (
                  <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                    {tag}
                    <button type="button" className="ml-2 text-gray-600 hover:text-red-500" onClick={() => removeTag(tag)}>✕</button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                placeholder="+ Add the teams"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleCreateTeams} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Add</button>
          </div>
        </Modal>

        <Modal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedGroup(null);
            setShowAddPayment(false);
          }}
          title="Team Details"
        >
          {selectedGroup && selectedGroup.team && (
            <div className="flex flex-col ps-5  space-y-3 max-h-[650px] overflow-y-auto">

              {[
                { label: "Year", value: selectedGroup.team.year },
                { label: "Teams", value: (selectedGroup.team.teams || []).join(", ") },
                {
                  label: "Created",
                  value: selectedGroup.team.created_at
                    ? moment(selectedGroup.team.created_at).format("DD-MMM-YYYY")
                    : "-"
                },
                { label: "Total Amount", value: `₹ ${selectedGroup.team.total_amount || 0}` }
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">{item.label}</div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">{item.value}</div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-2">
                <h3 className="text-sm font-semibold">Payments (Recent)</h3>

                {!showAddPayment && (
                  <button
                    onClick={() => {
                      handleOpenAddPayment(selectedGroup.team);
                      setShowAddPayment(true);
                    }}
                    className="px-3 py-1 text-white bg-lavender--600 rounded"
                  >
                    Add Payment
                  </button>
                )}
              </div>
              {showAddPayment && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">

                  {/* Date */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Select Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="block mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Inputs for each team */}
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Enter amount for each team</div>
                    <div className="space-y-2">
                      {paymentItems.map((p, i) => (
                        <div className="flex items-center gap-4">
                          <div className="w-40">{p.team}</div>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={p.amount}
                            onChange={(e) => updatePaymentAmount(i, e.target.value)}
                            className="border px-2 py-1 rounded w-28"
                            placeholder="Amount"
                          />

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Receipt No:</span>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={p.receipt_from}
                              onChange={(e) => updateReceiptFrom(i, e.target.value)}
                              className="border px-2 py-1 rounded w-20"
                              placeholder="From"
                            />

                            <span>to</span>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={p.receipt_to}
                              onChange={(e) => updateReceiptTo(i, e.target.value)}
                              className="border px-2 py-1 rounded w-20"
                              placeholder="To"
                            />
                          </div>
                        </div>

                      ))}
                    </div>
                  </div>

                  {/* Total + Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm">
                      Total for {moment(paymentDate).format("DD-MMM-YYYY")}: <span className="font-semibold">₹ {dayTotal}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowAddPayment(false)}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSavePayment}
                        disabled={savingPayment}
                        className="px-3 py-1 bg-lavender--600 text-white rounded"
                      >
                        {savingPayment ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>

                </div>
              )}

              <div className=" mt-2">
                {(!selectedGroup.payments || selectedGroup.payments.length === 0) ? (
                  <div className="text-sm text-gray-500">No payments yet</div>
                ) : (
                  selectedGroup.payments.map((p) => (
                    <div key={p._id} className="border rounded-md p-3 mb-3 bg-gray-50">

                      {/* Date Title */}
                      <h3 className="text-sm font-semibold mb-2 text-lavender--700">
                        {moment(p.date, "YYYY-MM-DD").format("DD-MMM-YYYY")}
                      </h3>

                      {/* Table */}
                      <table className="w-full text-sm border">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="text-left p-2 border-r w-1/3">Team</th>
                            <th className="text-center p-2 border-r w-1/3">Receipt No.</th>
                            <th className="text-right p-2 w-1/3">Amount</th>
                          </tr>
                        </thead>


                        <tbody>
                          {(p.payments || []).map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2 border-r">{item.team}</td>
                              <td className="p-2 text-center border-r">
                                {item.receipt_from && item.receipt_to
                                  ? `${item.receipt_from} - ${item.receipt_to}`
                                  : "-"}
                              </td>
                              <td className="p-2 text-right">₹ {item.amount}</td>
                            </tr>

                          ))}
                        </tbody>
                      </table>

                      {/* Total */}
                      <div className="text-right font-semibold text-sm mt-2">
                        Total: ₹ {p.day_total || 0}
                      </div>

                    </div>
                  ))
                )}
              </div>



            </div>
          )}
        </Modal>


      </div>

      {/* Toast messages */}
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
